# geoportal-wfs-client

![Build Status](https://github.com/IGNF/geoportal-wfs-client/actions/workflows/node.js.yml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/IGNF/geoportal-wfs-client/badge.svg?branch=master)](https://coveralls.io/github/IGNF/geoportal-wfs-client?branch=master)

## Description

Cette bibliothèque est un client d'accès spécifique aux [services WFS du géoportail](https://geoservices.ign.fr/services-web-experts) visant à simplifier l'accès aux données vectorielles.

Ce client reprend les principes de simplification de l'utilisation des services initiés dans le cadre d'[APICARTO](https://apicarto.ign.fr) :

* Format fixe : JSON/GeoJSON
* Projection fixe : WGS84 (longitude,latitude)
* Requête spatiale et attributaire simple

Toutefois, à l'instar de [geoportal-access-lib](https://github.com/IGNF/geoportal-access-lib), ces simplifications sont disponibles côté client sans mise en oeuvre de nouveaux serveurs.

Remarque : Cette bibliothèque est réutilisable avec d'autres serveurs WFS (ex : [www.geoportail-urbanisme.gouv.fr](https://www.geoportail-urbanisme.gouv.fr)) mais fait appel à des fonctionnalités spécifiques à GeoServer (ex : `cql_filter`).

## Fonctionnement

La bibliothèque génère des requêtes WFS (GetCapabilities et GetFeatures avec cql_filter) en fixant des paramètres (outputFormat=application/json, projection=CRS:84, etc.) et parse les résultats.

## Démonstration

Voir [public/parcelle.html](https://ignf.github.io/geoportal-wfs-client/public/parcelle.html) qui illustre la récupération et l'affichage d'une parcelle au clic sur une carte leaflet.

## Construction du client


### En contexte NodeJS


```js
var Client = require('geoportal-wfs-client');

var options = {
    "headers":{
        "Referer": 'https://mon-application.fr'
    }
};
var client = new GeoportalWfsClient(options);
```

### En contexte navigateur

```js
<script src="dist/geoportal-wfs-client.js"></script>
<script type="text/javascript">

var options = {};

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

```json
[
  "AOC-VITICOLES:aire_parcellaire",
  "BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:arrondissement",
  "BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:batiment",
  "BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune",
  "BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad",
  "BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant",
  "BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:arrondissement",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:batiment",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:borne_limite_propriete",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:borne_parcelle",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:commune",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:feuille",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:localisant",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle",
  "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:subdivision_fiscale",
  "DEVIATION_BDP_PCI_BDD_SYMBO_WLD_WM_20200428:parcelle_wld"
]
```

## client.getFeatures(typeName,params,method='post') - récupérer les objets d'un type

### Exemple d'utilisation

Récupération des parcelles de la section "0A" de la commune "25349" :

```js
const params = {
    code_insee: '25349',
    section: '0A'
};
client.getFeatures("CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle", params, 'get')
    .then(function(featureCollection){
        console.log(featureCollection);
    })
    .catch(function(err){
        console.log(err);
    })
;
```

Exemple de résultat : [parcelles-25349-0A.json](public/parcelles-25349-0A.json)

### Détails sur params

`params` permet de définir des filtres cumulatifs et de gérer la pagination.

* La syntaxe `{"<attributeName>":"<attributeValue>"}` permet un filtrage attributaire suivant `<attributeName> == <attributeValue>`.

* Un filtrage spatial est disponible sous deux formes :

    * `bbox` permet de filtrer par boite englobante
    * `geom` permet de filtrer par une géométrie intersectante

* La pagination est gérée via deux paramètres :

    * `_limit` : Le nombre maximum de résultats (équivalent à `COUNT` sur le WFS, définit par défaut au niveau du flux)
    * `_start` : Indexe du premier résultat (0 par défaut, équivalent à `STARTINDEX` sur le WFS)

* Récupérer seulement certain champs :

    * `_propertyNames` : La liste des propriétés demandées dans le résultat

### Remarque sur les performances

~~Certains types WFS Géoportail correspondent à l'agrégation de plusieurs schémas de données. Ceci implique qu'en l'absence de filtrage, les requêtes WFS peuvent être sous-performante ou en échec~~.

Les résultats au format GeoJSON incluent un comptage (`totalFeatures`, `numberMatched`, `numberReturned`). L'opération correspondante étant coûteuse, les requêtes WFS peuvent être sous-performante ou en échec en l'absence de filtrage.

A titre d'exemple, les requêtes `getFeatures('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle',params)` seront sous performantes ou en échec si `params` ne contient pas l'un des éléments suivants : `code_insee`, `geom` ou `bbox`.

