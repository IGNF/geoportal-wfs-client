
const getTypeNamesFromCapabilities = require('../src/internal/getTypeNamesFromCapabilities');
const fs = require('fs');

describe('test getTypeNamesFromCapabilities', function () {

    it('should parse names', function (done) {
        var xml = fs.readFileSync(__dirname+'/data/capabilities.xml', "utf8");
        var fileNames = getTypeNamesFromCapabilities(xml);
        fileNames.length.should.equal(70);
        fileNames[0].should.equal("BDADRESSE_BDD_WLD_WGS84G:adresse");
        done();
    });

});
