# geoportal-wfs-client

[![Build Status](https://travis-ci.org/IGNF/geoportal-wfs-client.svg)](https://travis-ci.org/IGNF/geoportal-wfs-client)
[![Coverage Status](https://coveralls.io/repos/github/IGNF/geoportal-wfs-client/badge.svg?branch=master)](https://coveralls.io/github/IGNF/geoportal-wfs-client?branch=master)

## Description

Cette bibliothèque est un client d'accès spécifique aux services WFS du géoportail ([http://wxs.ign.fr/geoportail/wfs?service=WFS&request=GetCapabilities]([http://wxs.ign.fr/geoportail/wfs?service=WFS&request=GetCapabilities)) visant à simplifier l'accès aux données vectorielles. 

Ce client reprend les principes de simplification de l'utilisation des services initiés dans le cadre d'[APICARTO](https://apicarto.ign.fr) :

* Format fixe : JSON/GeoJSON
* Projection fixe : WGS84 (longitude,latitude)
* Requête spatiale et attributaire simple

Toutefois, à l'instar de [geoportal-access-lib](https://github.com/IGNF/geoportal-access-lib), ces simplifications sont disponibles côté client sans mise en oeuvre de nouveaux serveurs.

Remarque : Cette bibliothèque est réutilisable avec d'autres serveurs WFS (ex : [www.geoportail-urbanisme.gouv.fr](https://www.geoportail-urbanisme.gouv.fr)) mais fait appel à des fonctionnalités spécifiques à GeoServer (ex : `cql_filter`).

## Fonctionnement

La bibliothèque génère des requêtes WFS (GetCapabilities et GetFeatures avec cql_filter) en fixant des paramètres (outputFormat=application/json, projection=CRS:84, etc.) et parse les résultats.


## Construction du client

### En contexte NodeJS


```
var Client = require('geoportal-wfs-client');

var options = {
    "apiKey":API_KEY,
    "headers":{
        Referer: 'http://localhost.ign.fr'
    }
};
var client = new GeoportalWfsClient(options);
```

### En contexte navigateur

```
<script src="dist/geoportal-wfs-client.js"></script>
<script type="text/javascript">

var options = {
    "apiKey":API_KEY
};
var client = new GeoportalWfsClient(options);
</script>
```

Remarque : on ne peut pas forcer le referer depuis le navigateur

## client.getTypeNames() - lister les types

### Exemple d'utilisation

```
client.getTypeNames()
    .then(function(typeNames){
        console.log(typeNames);
    })
    .catch(function(err){
        console.log(err);
    })
:
```

### Exemple de résultat

```
[
    "BDADRESSE_BDD_WLD_WGS84G:adresse",
    "BDADRESSE_BDD_WLD_WGS84G:arrondissement",
    "BDADRESSE_BDD_WLD_WGS84G:chef_lieu",
    "BDADRESSE_BDD_WLD_WGS84G:commune"
]
```

## client.getFeatures(typeName,params) - récupérer les objets d'un type

### Exemple d'utilisation

```
var params = {
    bbox: [5.0,47.1,5.1,47.2],
    code_dep: "21",
    _limit: 10
};
client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad",params)
    .then(function(featureCollection){
        console.log(featureCollection);
    })
    .catch(function(err){
        console.log(err);
    })
;
```

### Exemple de résultat

```
{"type":"FeatureCollection","features":[...]}
```

### Détails sur params

*params* permet de définir des filtres cumulatifs et de gérer la pagination

* filtrage spatial
    * bbox : permet de filtrer par boite englobante
    * geom : permet de filtrer par une géométrie intersectante

* filtrage par attribut

La syntaxe ci-après permet de définir des égalités

```
{"<attributeName>":"<attributeValue>"}
```

* pagination

    * *_limit* : nombre maximum de résultats
    * *_start* : premier résultat


### Remarque sur les performances

Certains types correspondent à l'aggrégation de plusieurs schémas de données. Certaines requêtes seront sous-performantes ou en échec en l'abscence de filtre.
