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

## Démonstration

Voir [demo/parcelle.html](https://ignf.github.io/geoportal-wfs-client/demo/parcelle.html) qui illustre la récupération et l'affichage d'une parcelle au clic sur une carte leaflet.

## Construction du client

En prenant par exemple `GEOPORTAL_API_KEY='choisirgeoportail'` (voir [Accéder au Géoportail sans créer de compte](https://geoservices.ign.fr/blog/2018/09/06/acces_geoportail_sans_compte.html))...

### En contexte NodeJS


```js
var Client = require('geoportal-wfs-client');

var options = {
    "apiKey": GEOPORTAL_API_KEY,
    "headers":{
        Referer: 'https://mon-application.fr'
    }
};
var client = new GeoportalWfsClient(options);
```

### En contexte navigateur

```js
<script src="dist/geoportal-wfs-client.js"></script>
<script type="text/javascript">

var options = {
    "apiKey": GEOPORTAL_API_KEY
};
var client = new GeoportalWfsClient(options);
</script>
```

Remarque : on ne peut pas forcer le referer depuis le navigateur

## client.getTypeNames() - lister les types

### Exemple d'utilisation

```js
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

```js
[
  "BDTOPO_V3:batiment",
  "BDTOPO_V3:troncon_de_route",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle"
]
```

## client.getFeatures(typeName,params) - récupérer les objets d'un type

### Exemple d'utilisation

Récupération des parcelles de la section "0A" de la commune "25349" :

```js
const params = {
    code_insee: '25349',
    section: '0A'
};
client.getFeatures("CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle",params)
    .then(function(featureCollection){
        console.log(featureCollection);
    })
    .catch(function(err){
        console.log(err);
    })
;
```

Exemple de résultat : [parcelles-25349-0A.json](demo/parcelles-25349-0A.json)

### Détails sur params

`params` permet de définir des filtres cumulatifs et de gérer la pagination.

* La syntaxe `{"<attributeName>":"<attributeValue>"}` permet un filtrage attributaire suivant `<attributeName> == <attributeValue>`.

* Un filtrage spatial est disponible sous deux formes :

    * `bbox` permet de filtrer par boite englobante
    * `geom` permet de filtrer par une géométrie intersectante

* La pagination est gérée via deux paramètres :

    * `_limit` : Le nombre maximum de résultats (équivalent à `COUNT` sur le WFS, définit par défaut au niveau du flux)
    * `_start` : Indexe du premier résultat (0 par défaut, équivalent à `STARTINDEX` sur le WFS)

### Remarque sur les performances

Certains types WFS Géoportail correspondent à l'aggrégation de plusieurs schémas de données. Ceci implique qu'en l'absence de filtrage, les requêtes WFS peuvent être sous-performante ou en échec.

A titre d'exemple, les requêtes `getFeatures('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle',params)` seront sous performantes ou en échec si `params` ne contient pas l'un des éléments suivants : `code_insee`, `geom` ou `bbox`.

