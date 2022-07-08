const expect = require('chai').expect;

const buildCqlFilter = require('../../src/internal/buildCqlFilter');

describe('test buildCqlFilter', function () {

    it('should return null for null filter', function () {
        var input = null;
        var result = buildCqlFilter(input);
        expect(result).to.be.null;
    });

    it('should return null for empty filter', function () {
        var input = {};
        var result = buildCqlFilter(input);
        expect(result).to.be.null;
    });

    it('should ignore _start', function () {
        var input = {
            _start: 10
        };
        var result = buildCqlFilter(input);
        expect(result).to.be.null;
    });

    it('should ignore _limit', function () {
        var input = {
            _limit: 10
        };
        var result = buildCqlFilter(input);
        expect(result).to.be.null;
    });

    it('should encode "bbox" string to filter with coordinate swapping', function () {
        var input = {
            'bbox': '0,1,2,3'
        };
        var expected = 'BBOX(the_geom,1,0,3,2)';
        var result = buildCqlFilter(input);
        expect(result).to.equals(expected);
    });

    it('should encode "bbox" array to filter with coordinate swapping', function () {
        var input = {
            'bbox': [0, 1, 2, 3]
        };
        var expected = 'BBOX(the_geom,1,0,3,2)';
        var result = buildCqlFilter(input);
        expect(result).to.equals(expected);
    });

    /* _geomFieldName support */
    it('should encode "bbox" array to filter with coordinate swapping using geomFieldName', function () {
        var input = {
            'bbox': [0, 1, 2, 3]
        };
        var expected = 'BBOX(geom,1,0,3,2)';
        var result = buildCqlFilter(input,'geom');
        expect(result).to.equals(expected);
    });

    it('should encode "geom" (GeoJSON) as "intersects" with coordinate swapping', function () {
        var input = {
            'geom': {
                'type': 'Point',
                'coordinates': [3.0, 4.0]
            }
        };
        var expected = 'INTERSECTS(the_geom,POINT (4 3))';
        var result = buildCqlFilter(input);
        expect(result).to.equals(expected);
    });

    it('should encode "geom" (GeoJSON string) as "intersects" with coordinate swapping', function () {
        var input = {
            'geom': JSON.stringify({
                'type': 'Point',
                'coordinates': [3.0, 4.0]
            })
        };
        var expected = 'INTERSECTS(the_geom,POINT (4 3))';
        var result = buildCqlFilter(input);
        expect(result).to.equals(expected);
    });


    it('should encode "geom" (GeoJSON) as "intersects" with coordinate swapping using geomFieldName', function () {
        var input = {
            'geom': {
                'type': 'Point',
                'coordinates': [3.0, 4.0]
            }
        };
        var expected = 'INTERSECTS(geom,POINT (4 3))';
        var result = buildCqlFilter(input,'geom');
        expect(result).to.equals(expected);
    });


    /* standard attributes */

    it('should encode attribute filters with quotes', function () {
        var input = {
            'code_dept': 12
        };
        var expected = 'code_dept=\'12\'';
        var result = buildCqlFilter(input);
        expect(result).to.equals(expected);
    });


    it('should compose filters with AND', function () {
        var input = {
            'bbox': [0, 1, 2, 3],
            'code_dept': '12'
        };
        var expected = 'BBOX(the_geom,1,0,3,2) and code_dept=\'12\'';
        var result = buildCqlFilter(input);
        expect(result).to.equals(expected);
    });

});
