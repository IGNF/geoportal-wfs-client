import httpClient from './internal/httpClient.js';

import getTypeNamesFromCapabilities from './internal/getTypeNamesFromCapabilities.js';

import buildCqlFilter from './internal/buildCqlFilter.js';
// import proj4 from 'proj4';
import constants from './internal/constants.js';

/**
 * @classdesc
 * WFS access client for the geoportal
 * @constructor
 */
export default class Client {

    constructor(options) {
        // should be removed to allow user/password?
        this.url = options.url || 'https://data.geopf.fr/wfs/ows';
        this.headers = options.headers || {};
        /* allows to use WFS with different naming convention */
        this.defaultGeomFieldName = options.defaultGeomFieldName || constants.defaultGeomFieldName;
        this.defaultCRS = options.defaultCRS || constants.defaultCRS;
    }

    /**
     * Get WFS URL
     */
    getUrl() {
        return this.url;
    }


    /**
     * @private
     * @returns {Object}
     */
    getDefaultParams() {
        return {
            service: 'WFS',
            version: '2.0.0'
        };
    }

    /**
     * @private
     * @returns {Object}
     */
    getDefaultHeaders() {
        return this.headers;
    }

    /**
     * Get typenames according to apiKey
     * @returns {Promise}
     */
    getTypeNames() {
        var params = this.getDefaultParams();
        params.request = 'GetCapabilities';
        return httpClient.get(
            this.getUrl(),
            {
                'params': params,
                'headers': this.getDefaultHeaders(),
                'responseType': 'text',
                transformResponse: function (body) {
                    return getTypeNamesFromCapabilities(body);
                }
            }
        ).then(function (response) {
            return response.data;
        });
    }

    /**
	 * Get description of features for a given type
	 * @param {string} typeName - name of type
	 * 
	 * @return {Promise}
	 */
    getDescribeFeatureType(typeName) {

        var headers = this.getDefaultHeaders();
        headers['Accept'] = 'application/json';

        var queryParams = this.getDefaultParams();
        queryParams['request'] = 'DescribeFeatureType';
        queryParams['typename'] = typeName;
        queryParams['outputFormat'] = 'application/json';

        return httpClient.get(this.getUrl(), {
            params: queryParams,
            headers: headers,
            responseType: 'text',
            transformResponse: function (body) {
                try {
                    return JSON.parse(body);
                } catch (err) {
                    // forward xml errors
                    throw {
                        'type': 'error',
                        'message': body
                    };
                }
            }
        }).then(function (response) {
            return response.data;
        });
    }

    /**
    * GetCapabilities
    * @returns {Promise}
    */
    getCapabilities() {
        var headers = this.getDefaultHeaders();

        var queryParams = this.getDefaultParams();
        queryParams['request'] = 'GetCapabilities';
        return httpClient.get(this.getUrl(), {
            params: queryParams,
            headers: headers,
            responseType: 'text'
        }).then(function (response) {
            return response.data;
        });
    }

    /**
     * Get features for a given type
     *
     * @param {string} typeName - name of type
     * @param {object} params - define cumulative filters (bbox, geom) and to manage the pagination
     * @param {number} [params._start=0] index of the first result (STARTINDEX on the WFS)
     * @param {number} [params._limit] maximum number of result (COUNT on the WFS)
     * @param {array}  [params._propertyNames] restrict a GetFeature request by properties
     * @param {object} [params.geom] search geometry intersecting the resulting features.
     * @param {object} [params.bbox] search bbox intersecting the resulting features.
     * @param {string} [method="post"] request method to getFeatures
     *
     * @return {Promise}
     */
    getFeatures(typeName, params, method = 'post') {
        params = params || {};

        var headers = this.getDefaultHeaders();
        headers['Accept'] = 'application/json';

        /*
         * GetFeature params
         */
        var queryParams = this.getDefaultParams();
        queryParams['request'] = 'GetFeature';
        queryParams['typename'] = typeName;
        queryParams['outputFormat'] = 'application/json';
        queryParams['srsName'] = 'CRS:84';
        if ('undefined' !== typeof params._limit) {
            queryParams['count'] = params._limit;
        }
        if ('undefined' !== typeof params._start) {
            queryParams['startIndex'] = params._start;
        }
        if ('undefined' !== typeof params._propertyNames) {
            queryParams['propertyName'] = params._propertyNames.join();
        }
        /*
         * bbox and attribute filter as POST parameter
         */
        var cql_filter = buildCqlFilter(params, this.defaultGeomFieldName, this.defaultCRS);

        if ('post' == method.toLowerCase()) {
            var body = (null !== cql_filter) ? 'cql_filter=' + encodeURI(cql_filter) : '';
            return httpClient.post(this.getUrl(), body, {
                params: queryParams,
                headers: headers,
                responseType: 'text',
                transformResponse: function (body) {
                    try {
                        return JSON.parse(body);
                    } catch (err) {
                        // forward xml errors
                        throw {
                            'type': 'error',
                            'message': body
                        };
                    }
                }
            }).then(function (response) {
                return response.data;
            });
        }

        if ('get' == method.toLowerCase()) {
            if (null !== cql_filter) {
                queryParams['cql_filter'] = cql_filter;
            }

            return httpClient.get(this.getUrl(), {
                params: queryParams,
                headers: headers,
                responseType: 'text',
                transformResponse: function (body) {
                    try {
                        return JSON.parse(body);
                    } catch (err) {
                        // forward xml errors
                        throw {
                            'type': 'error',
                            'message': body
                        };
                    }
                }
            }).then(function (response) {
                return response.data;
            });
        }
    }
}