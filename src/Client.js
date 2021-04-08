const httpClient = require('./internal/httpClient');

var getTypeNamesFromCapabilities = require('./internal/getTypeNamesFromCapabilities');
var buildCqlFilter = require('./internal/buildCqlFilter')

/**
 * @classdesc
 * WFS access client for the geoportal
 * @constructor
 */
var Client = function (options) {
    // should be removed to allow user/password?
    if (typeof options.apiKey === 'undefined') throw new Error('Required param: apiKey');
    this.url = options.url || 'https://wxs.ign.fr/{apiKey}/geoportail/wfs';
    this.apiKey = options.apiKey || null;
    this.headers = options.headers || {};
    /* allows to use WFS with different naming convention */
    this.defaultGeomFieldName = options.defaultGeomFieldName || 'the_geom';
};

/**
 * Get WFS URL
 */
Client.prototype.getUrl = function () {
    return this.url.replace('{apiKey}', this.apiKey);
};


/**
 * @private
 * @returns {Object}
 */
Client.prototype.getDefaultParams = function () {
    return {
        service: 'WFS',
        version: '2.0.0'
    };
}

/**
 * @private
 * @returns {Object}
 */
Client.prototype.getDefaultHeaders = function () {
    return this.headers;
}

/**
 * Get typenames according to apiKey
 * @returns {Promise}
 */
Client.prototype.getTypeNames = function () {
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
};

/**
 * Get features for a given type
 *
 * @param {string} typeName - name of type
 * @param {object} params - define cumulative filters (bbox, geom) and to manage the pagination
 * @param {number} [params._start=0] index of the first result (STARTINDEX on the WFS)
 * @param {number} [params._limit] maximum number of result (COUNT on the WFS)
 * @param {object} [params.geom] search geometry intersecting the resulting features.
 * @param {object} [params.bbox] search bbox intersecting the resulting features.
 *
 * @return {Promise}
 */
Client.prototype.getFeatures = function (typeName, params) {
    var params = params || {};

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
    if (typeof params._limit !== 'undefined') {
        queryParams['count'] = params._limit;
    }
    if (typeof params._start !== 'undefined') {
        queryParams['startIndex'] = params._start;
    }

    /*
     * bbox and attribute filter as POST parameter
     */
    var cql_filter = buildCqlFilter(params,this.defaultGeomFieldName);
    var body = (cql_filter !== null) ? 'cql_filter=' + encodeURI(cql_filter) : '';
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
};

module.exports = Client;
