# geoportal-wfs-client

## Description

Client d'accès spécifique au WFS du géoportail ([http://wxs.ign.fr/geoportail/wfs?service=WFS&request=GetCapabilities]([http://wxs.ign.fr/geoportail/wfs?service=WFS&request=GetCapabilities) visant à simplifier l'utilisation de ce dernier.

## Principes

* Format fixe : JSON/GeoJSON
* Projection fixe : WGS84 (longitude,latitude)
* Requête spatiale et attributaire simple

## Construction du client

### En contexte NodeJS


```
var Client = require('geoportal-wfs-client');
var client = new GeoportalWfsClient(API_KEY,{
    referer: 'http://localhost.ign.fr'
});
```

### En contexte navigateur

```
<script src="dist/geoportal-wfs-client.js"></script>
<script type="text/javascript">
var client = new GeoportalWfsClient(API_KEY);
</script>
```

Remarque : le referer est ignoré

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

La syntaxe ci après permet de définir des égalités

```
{"<attributeName>":"<attributeValue>"}
```

* pagination

    * *_limit* : nombre maximum de résultat
    * *_start* : premier résultat


### Remarque sur les performances

Certains types correspondent à l'aggrégation de plusieurs schémas de données. Certaines requêtes seront sous performantes ou en échec en l'abscence de filtre.
