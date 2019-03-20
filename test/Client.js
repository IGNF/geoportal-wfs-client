const expect = require('expect.js');
const Client = require('../src/Client');

var apiKey  = process.env.API_KEY;

var options = {
    "apiKey":apiKey,
    // http is relative to issue #5
    "url": 'http://wxs.ign.fr/{apiKey}/geoportail/wfs'
};

describe('test Client with apiKey (provided by environment API_KEY)', function () {

if( typeof apiKey !== 'undefined' ){

    it('should return an array for getTypeNames', async function () {
        var client = new Client(options);
        let typeNames = await client.getTypeNames();
        typeNames.should.be.a.Array();
    });

    options.headers = {
        "referer": 'http://localhost'
    };

    it('should return a FeatureCollection for getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle",{"code_dep":"25","section": "ZE"})', async function () {
        var client = new Client(options);
        var featureCollection = await client.getFeatures(
            "BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle",
            {
                "code_dep":"25",
                "_limit":1
            }
        );
        featureCollection.should.have.property('type');
        featureCollection['type'].should.equal("FeatureCollection");
    });

    it('should work with a "large" geometry ', async function(){
        const filterGeom = require('./data/filter-geom-01.json');
        var client = new Client(options);
        var featureCollection = await client.getFeatures(
            "BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle",
            {
                "geom": filterGeom,
                "_limit":10
            }
        );
        
        expect(featureCollection).to.have.property('type');
        expect(featureCollection['type']).to.equal("FeatureCollection");
        expect(featureCollection).to.have.property('features');
        expect(featureCollection['features']).to.be.an('array');
        expect(featureCollection['features'].length).to.be.greaterThan(1);

        featureCollection['features'].map(feature => {
            expect(feature.properties).to.have.property('code_dep');
            expect(feature.properties).to.have.property('code_com');
            expect(feature.properties['code_dep']).to.equal('25');
            expect(feature.properties['code_com']).to.equal('349');
        });
    });


} // end if apiKey is defined


});
