var request = require('request');
var rp = require('request-promise');

var getTypeNamesFromCapabilities = require('./internal/getTypeNamesFromCapabilities');
var clq_filter = require('./internal/cql_filter')

/**
 * Client d'accès aux services WFS du géoportail
 */
var Client = function(apiKey,options){
    if (!apiKey) throw new Error('Required param: apiKey');
    this.apiKey = apiKey;
    this.referer = options.referer || 'http://localhost';
};

/**
 * Get WFS URL
 */
Client.prototype.getUrl = function(){
    return 'http://wxs.ign.fr/'+this.apiKey+'/geoportail/wfs';
};

/**
 *
 */
Client.prototype.getDefaultOptions = function() {
    return {
        uri: this.getUrl(),
        qs: {
            service: 'WFS',
            version: '2.0.0'
        },
        headers: {
            Referer: this.referer
        }
    };
};

/**
 * Get typenames according to apiKey
 */
Client.prototype.getTypeNames = function(){
    var options = this.getDefaultOptions();
    options.qs.request = 'GetCapabilities';
    options.transform = function(body){
        return getTypeNamesFromCapabilities(body);
    };
    return rp(options);
};

/**
 * Get features for a given type
 */
Client.prototype.getFeatures = function(typeName, params){
    var params = params || {};

    var options = this.getDefaultOptions();
    options.qs.request  = 'GetFeature' ;
    options.qs.typename = typeName ;
    options.qs.outputFormat = 'application/json';
    options.qs.srsName = 'CRS:84';

    if ( typeof params._limit !== 'undefined' ){
        options.qs.count = parseInt(params._limit);
    }
    if ( typeof params._start !== 'undefined' ){
        options.qs.startIndex = parseInt(params._start);
    }

    /*
     * bbox and attribute filter
     */
    var cql_filter = clq_filter(params);
    if ( cql_filter !== null ){
        options.qs.cql_filter = cql_filter;
    }
    return rp(options);
};

module.exports = Client ;
