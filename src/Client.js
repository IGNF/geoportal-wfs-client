var axios = require('axios');
var rp = require('request-promise');
var getTypeNamesFromCapabilities = require('./internal/getTypeNamesFromCapabilities');
var clq_filter = require('./internal/cql_filter');

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
Client.prototype.getDefaultHeaders = function(){
    return this.headers;
}

/**
 * Get typenames according to apiKey
 * @returns {Promise}
 */
Client.prototype.getTypeNames = function () {
    var params = this.getDefaultParams();
    params.request = 'GetCapabilities';
    return axios.get(
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
 * @param {string} typeName - name of type
 * @param {Object} params - define cumulative filters (bbox, geom) and to manage the pagination
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
    queryParams['request']  = 'GetFeature';
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
    var cql_filter = clq_filter(params);
    var body = (cql_filter !== null) ? 'cql_filter=' + cql_filter : '';
    queryParams['cql_filter'] = cql_filter;
    var options= {
        uri:this.getUrl(),
        method:'POST',
        qs: queryParams,
        headers: headers
    };
    return rp(options)
		.then(function(result) {
			return JSON.parse(result);
		}).catch(function(err) {
            console.log("err_backend" + err);
        })
    
};

module.exports = Client;
