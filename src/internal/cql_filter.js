
var WKT = require('terraformer-wkt-parser');
var flip = require('turf-flip');


function bboxToFilter(bbox){
    // hack (strange "'"  added around bbox)
    bbox = bbox.replace(/'/g, '');

    var parts = bbox.split(',');
    var xmin = parts[1];
    var ymin = parts[0];
    var xmax = parts[3];
    var ymax = parts[2];

    return `BBOX(the_geom,${xmin},${ymin},${xmax},${ymax})` ;
}

module.exports =  function(params){
    var parts = [] ;
    for ( var name in params ){
        if ( name.charAt(0) === '_' ){
            continue;
        }
        if ( name == 'bbox' ){
            parts.push(bboxToFilter(params['bbox'])) ;
        }else if ( name == 'geom' ){
            var geom = JSON.parse(params[name]) ;
            var wkt = WKT.convert(flip(geom));
            parts.push(`INTERSECTS(the_geom,${wkt})`);
        }else{
            parts.push(name+'=\''+ params[name]+'\'');
        }
    }
    if ( parts.length === 0 ){
        return null;
    }
    return parts.join(' and ') ;
};
