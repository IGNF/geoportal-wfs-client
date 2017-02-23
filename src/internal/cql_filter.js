
var WKT = require('terraformer-wkt-parser');
var flip = require('@turf/flip');

/*
 * WARNING: Despite the use of WGS84, you need to do a flip on the coordinates
 */

/**
 * Convert a bbox on array with 4 values
 */
function parseBoundingBox(bbox){
    if ( typeof bbox !== 'string' ){
        return bbox;
    }
    return bbox.replace(/'/g, '').split(',');
}

/**
 * Convert a bbox in cql_filter fragment
 */
function bboxToFilter(bbox){
    bbox = parseBoundingBox(bbox);
    var xmin = bbox[1];
    var ymin = bbox[0];
    var xmax = bbox[3];
    var ymax = bbox[2];
    return 'BBOX(the_geom,'+xmin+','+ymin+','+xmax+','+ymax+')' ;
}

module.exports =  function(params){
    var parts = [] ;
    for ( var name in params ){
        // ignore _limit, _start, etc.
        if ( name.charAt(0) === '_' ){
            continue;
        }

        if ( name == 'bbox' ){
            parts.push(bboxToFilter(params['bbox'])) ;
        }else if ( name == 'geom' ){
            var geom = params[name] ;
            if ( typeof geom !== 'object' ){
                geom = JSON.parse(geom) ;
            }
            var wkt = WKT.convert(flip(geom));
            parts.push('INTERSECTS(the_geom,'+wkt+')');
        }else{
            parts.push(name+'=\''+ params[name]+'\'');
        }
    }
    if ( parts.length === 0 ){
        return null;
    }
    return parts.join(' and ') ;
};
