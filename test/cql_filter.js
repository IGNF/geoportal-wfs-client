
const cql_filter = require('../src/internal/cql_filter');


describe('cql_filter', function () {

    it('should return null for empty filter', function (done) {
        var input    = {};
        var result = cql_filter(input);
        ( result === null).should.be.true;
        done();
    });

    it('should ignore _start', function (done) {
        var input    = {
            _start: 10
        };
        var result = cql_filter(input);
        ( result === null).should.be.true;
        done();
    });

    it('should ignore _limit', function (done) {
        var input    = {
            _limit: 10
        };
        var result = cql_filter(input);
        ( result === null).should.be.true;
        done();
    });


    it('should encode bbox to filter with coordinate swapping', function (done) {
        var input    = {
            'bbox':[0,1,2,3]
        };
        var expected = "BBOX(the_geom,1,0,3,2)";
        var result = cql_filter(input);
        result.should.equal(expected);
        done();
    });

    it('should encode "geom" (GeoJSON) as "intersects" with coordinate swapping', function (done) {
        var input    = {
            'geom':{
                'type': 'Point',
                'coordinates':[3.0,4.0]
            }
        };
        var expected = "INTERSECTS(the_geom,POINT (4 3))";
        var result = cql_filter(input);
        result.should.equal(expected);
        done();
    });

    it('should encode "geom" (GeoJSON string) as "intersects" with coordinate swapping', function (done) {
        var input    = {
            'geom':JSON.stringify({
                'type': 'Point',
                'coordinates':[3.0,4.0]
            })
        };
        var expected = "INTERSECTS(the_geom,POINT (4 3))";
        var result = cql_filter(input);
        result.should.equal(expected);
        done();
    });



    it('should encode attribute filters with quotes', function (done) {
        var input    = {
            'code_dept': 12
        };
        var expected = "code_dept='12'";
        var result = cql_filter(input);
        result.should.equal(expected);
        done();
    });


    it('should compose filters with AND', function (done) {
        var input    = {
            'bbox':[0,1,2,3],
            'code_dept': '12'
        };
        var expected = "BBOX(the_geom,1,0,3,2) and code_dept='12'";
        var result = cql_filter(input);
        result.should.equal(expected);
        done();
    });

});
