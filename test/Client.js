const expect = require('chai').expect;

const Client = require('../src/Client');



describe('test Client', function () {

    it('should replace apiKey in the generated URL', function () {
        let client = new Client({
            apiKey: 'my-api-key'
        });
        expect(client.getUrl()).to.equal('https://wxs.ign.fr/my-api-key/geoportail/wfs');
    });

    it('should use "the_geom" as default value for defaultGeomFieldName', function () {
        let client = new Client({
            apiKey: 'my-api-key'
        });
        expect(client.defaultGeomFieldName).to.equal('the_geom');
    });

    it('should use support user value for defaultGeomFieldName', function () {
        let client = new Client({
            apiKey: 'my-api-key',
            defaultGeomFieldName: 'geom'
        });
        expect(client.defaultGeomFieldName).to.equal('geom');
    });

});

