const expect = require('chai').expect;

const cql_filter = require('../../src/internal/cql_filter');

describe('testcql_filter', function () {

    it('should return null for null filter', function () {
        var input = null;
        var result = cql_filter(input);
        expect(result).to.be.null;
    });

    it('should return null for empty filter', function () {
        var input = {};
        var result = cql_filter(input);
        expect(result).to.be.null;
    });

    it('should ignore _start', function () {
        var input = {
            _start: 10
        };
        var result = cql_filter(input);
        expect(result).to.be.null;
    });

    it('should ignore _limit', function () {
        var input = {
            _limit: 10
        };
        var result = cql_filter(input);
        expect(result).to.be.null;
    });


    it('should encode bbox to filter with coordinate swapping', function () {
        var input = {
            'bbox': [0, 1, 2, 3]
        };
        var expected = "BBOX(the_geom,1,0,3,2)";
        var result = cql_filter(input);
        expect(result).to.equals(expected);
    });

    it('should encode "geom" (GeoJSON) as "intersects" with coordinate swapping', function () {
        var input = {
            'geom': {
                'type': 'Point',
                'coordinates': [3.0, 4.0]
            }
        };
        var expected = "INTERSECTS(the_geom,POINT (4 3))";
        var result = cql_filter(input);
        expect(result).to.equals(expected);
    });

    it('should encode "geom" (GeoJSON string) as "intersects" with coordinate swapping', function () {
        var input = {
            'geom': JSON.stringify({
                'type': 'Point',
                'coordinates': [3.0, 4.0]
            })
        };
        var expected = "INTERSECTS(the_geom,POINT (4 3))";
        var result = cql_filter(input);
        expect(result).to.equals(expected);
    });



    it('should encode attribute filters with quotes', function () {
        var input = {
            'code_dept': 12
        };
        var expected = "code_dept='12'";
        var result = cql_filter(input);
        expect(result).to.equals(expected);
    });


    it('should compose filters with AND', function () {
        var input = {
            'bbox': [0, 1, 2, 3],
            'code_dept': '12'
        };
        var expected = "BBOX(the_geom,1,0,3,2) and code_dept='12'";
        var result = cql_filter(input);
        expect(result).to.equals(expected);
    });

});
