import xpath from 'xpath';
import { DOMParser } from '@xmldom/xmldom';

/**
 * Get list of typeName from Capabilities
 */
var getTypeNamesFromCapabilities = function (xml) {
    var doc = new DOMParser().parseFromString(xml);
    var select = xpath.useNamespaces({ 'wfs': 'http://www.opengis.net/wfs/2.0' });
    var featureTypeNodes = select('//wfs:Name/text()', doc);
    var result = [];
    featureTypeNodes.forEach(function (featureTypeNode) {
        result.push(featureTypeNode.toString());
    });
    return result;
};

export default getTypeNamesFromCapabilities;
