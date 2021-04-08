const Client = require('../index');

const fs = require('fs');

const GEOPORTAL_API_KEY = 'choisirgeoportail';

async function main(){
    var client = new Client({
        apiKey: GEOPORTAL_API_KEY
    });

    /* récupération des types disponibles pour la clé */
    console.log("-- client.getTypeNames() ...");
    const typeNames = await client.getTypeNames();
    console.log(JSON.stringify(typeNames,null,2));

    /* récupération parcelle de la section 0A de la commune 25349 */
    const params = {
        code_insee: '25349',
        section: '0A'
    };
    console.log(`-- client.getFeatures('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle',${JSON.stringify(params)}) -> parcelles-25349-0A.json`)
    const featureCollection = await client.getFeatures(
        'CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle',
        params
    );

    /* sauvegarde des parcelles dans parcelles-25349-0A.json */
    fs.writeFileSync(__dirname+'/parcelles-25349-0A.json',JSON.stringify(featureCollection,null,2));
}

main().catch(function(err){
    console.error(err);
});
