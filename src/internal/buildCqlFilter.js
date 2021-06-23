
var WKT = require('terraformer-wkt-parser');
var flip = require('@turf/flip');

/*
 * WARNING: Despite the use of WGS84, you need to do a flip on the coordinates
 */

/**
 * Convert a bbox on array with 4 values (split string if required)
 *
 * @param {string|number[]} bbox
 * @returns {number[]}
 */
function parseBoundingBox(bbox) {
    if (typeof bbox !== 'string') {
        return bbox;
    }
    return bbox.replace(/'/g, '').split(',');
}

/**
 * Convert a bbox in cql_filter fragment.
 *
 * @param {string|number[]} bbox input bbox (CRS:84)
 * @param {string} geomFieldName name of the geometry (ex : the_geom)
 * @returns {string}
 */
function bboxToFilter(bbox, geomFieldName) {
    bbox = parseBoundingBox(bbox);
    var xmin = bbox[1];
    var ymin = bbox[0];
    var xmax = bbox[3];
    var ymax = bbox[2];
    return 'BBOX(' + geomFieldName + ',' + xmin + ',' + ymin + ',' + xmax + ',' + ymax + ')';
}

/**
 * Build cql_filter parameter for GeoServer according to user params.
 *
 * @param {object} params
 * @param {object} [params.geom] search geometry intersecting the resulting features.
 * @param {object} [params.bbox] search bbox intersecting the resulting features.
 * @param {string} [geomFieldName="the_geom"] name of the geometry column
 * @param {string} [geomEPSGIn="4326"]  référentiel par défaut
 * @returns {string}
 */
function buildCqlFilter(params, geomFieldName,geomEPSGIn) {
    geomFieldName = geomFieldName || 'the_geom';
    geomEPSGIn = geomEPSGIn || '4326';

    var parts = [];
    for (var name in params) {
        // ignore _limit, _start, etc.
        if (name.charAt(0) === '_') {
            continue;
        }

        if (name == 'bbox') {
            parts.push(bboxToFilter(params['bbox'], geomFieldName));
        } else if (name == 'geom') {
            var geom = params[name];
            if (typeof geom !== 'object') {
                geom = JSON.parse(geom);
            }
            if (geomEPSGIn == "4326") { 
                var wkt = WKT.convert(flip(geom));
            } else { 
                var wkt = WKT.convert(geom);
            }
            parts.push('INTERSECTS(' + geomFieldName + ',' + wkt + ')');
        } else {
            parts.push(name + '=\'' + params[name] + '\'');
        }
    }
    if (parts.length === 0) {
        return null;
    }
    return parts.join(' and ');
};


module.exports = buildCqlFilter;

