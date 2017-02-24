
const Client = require('../src/Client');

var apiKey = process.env.API_KEY;

describe('test Client with apiKey : '+apiKey, function () {

if( typeof apiKey !== 'undefined' ){

    it('should return an array for getTypeNames', function (done) {
        var client = new Client(apiKey);
        client.getTypeNames()
            .then(function(typeNames){
                typeNames.should.be.a.Array();
                done();
            })
            .catch(function(err){
                done(new Error("getTypeNames was not supposed to fail"));
            })
        ;
    });

    it('should return a FeatureCollection for getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle",{"code_dep":"25"})', function (done) {
        var client = new Client(apiKey,{
            Referer: 'http://localhost.ign.fr'
        });
        client.getFeatures(
            "BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle",
            {
                "code_dep":"25",
                "_limit":1
            }
        ).then(function(featureCollection){
            featureCollection.should.have.property('type');
            featureCollection['type'].should.equal("FeatureCollection");
            done();
        }).catch(function(err){
            done(new Error("getFeatures was not supposed to fail"));
        }) ;
    });

} // end if apiKey is defined


});
