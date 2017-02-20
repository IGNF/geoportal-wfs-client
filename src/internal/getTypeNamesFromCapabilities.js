var xpath = require('xpath')
  , dom = require('xmldom').DOMParser;

/**
 * Get list of typeName from Capabilities
 */
var getTypeNamesFromCapabilities = function(xml){
    var doc = new dom().parseFromString(xml);
    var select = xpath.useNamespaces({"wfs": "http://www.opengis.net/wfs/2.0"});
    var featureTypeNodes = select("//wfs:Name/text()", doc);
    var result = [];
    featureTypeNodes.forEach(function(featureTypeNode){
        result.push(featureTypeNode.toString());
    });
    return result;
};

module.exports = getTypeNamesFromCapabilities;
