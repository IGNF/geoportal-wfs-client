const expect = require('chai').expect;

const getTypeNamesFromCapabilities = require('../../src/internal/getTypeNamesFromCapabilities');
const fs = require('fs');

describe('test getTypeNamesFromCapabilities', function () {

    it('should parse names', function (done) {
        var xml = fs.readFileSync(__dirname+'/../data/capabilities.xml', 'utf8');
        var fileNames = getTypeNamesFromCapabilities(xml);
        expect(fileNames.length).to.equals(70);
        expect(fileNames[0]).to.equal('BDADRESSE_BDD_WLD_WGS84G:adresse');
        done();
    });

});
