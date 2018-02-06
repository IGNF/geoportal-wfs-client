
const Client = require('../src/Client');

var apiKey  = process.env.API_KEY;

var options = {
    "apiKey":apiKey
};

describe('test Client with apiKey (provided by environment API_KEY)', function () {

if( typeof apiKey !== 'undefined' ){

    it('should return an array for getTypeNames', function (done) {
        var client = new Client(options);
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

    options.headers = {
        "referer": 'http://localhost'
    };

    it('should return a FeatureCollection for getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle",{"code_dep":"25"})', function (done) {
        var client = new Client(options);
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
            console.log(err);
            done(new Error("getFeatures was not supposed to fail"));
        }) ;
    });

} // end if apiKey is defined


});
