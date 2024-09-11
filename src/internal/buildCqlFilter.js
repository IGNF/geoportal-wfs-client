
import WKT from 'terraformer-wkt-parser';
import flip from '@turf/flip';
import constants from './constants.js';
import proj4 from 'proj4';
import { coordEach } from '@turf/meta';

proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:2154', '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');


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
    if ('string' !== typeof bbox) {
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
 * @param {string} [geomFieldName="the_geom"] name of the geometry column by default
 * @param {string} [geomDefaultCRS=constants.defaultCRS="urn:ogc:def:crs:EPSG::4326"] default data CRS (required in cql_filter)
 * @returns {string}
 */
function buildCqlFilter(params, geomFieldName, geomDefaultCRS) {
    geomFieldName = geomFieldName || constants.defaultGeomFieldName;
    geomDefaultCRS = geomDefaultCRS || constants.defaultCRS;

    var parts = [];
    for (var name in params) {
        // ignore _limit, _start, etc.
        if ('_' === name.charAt(0)) {
            continue;
        }

        if ('bbox' == name) {
            parts.push(bboxToFilter(params['bbox'], geomFieldName));
        } else if ('geom' == name) {
            var geom = params[name];
            if ('object' !== typeof geom) {
                geom = JSON.parse(geom);
            }
            if (geomDefaultCRS != constants.defaultCRS) {
                const input = geom;

                const transform = proj4('EPSG:4326', geomDefaultCRS);

                coordEach(input, function (c) {
                    let newC = transform.forward(c);
                    c[0] = newC[0];
                    c[1] = newC[1];
                });
                geom = input;
            }
            // flip coordinate as EPSG:4326 is lat,lon for GeoServer
            if (geomDefaultCRS == constants.defaultCRS) {
                geom = flip(geom);
            }
            let wkt = WKT.convert(geom);
            parts.push('INTERSECTS(' + geomFieldName + ',' + wkt + ')');
        } else {
            if (Array.isArray(params[name])) {
                parts.push(name + ' IN (\'' + params[name].join('\',\'') + '\')');
            } else {
                parts.push(name + '=\'' + params[name] + '\'');

            }
        }
    }
    if (0 === parts.length) {
        return null;
    }
    return parts.join(' and ');
}

export default buildCqlFilter;
