import { expect } from 'chai';
import Client from '../src/Client.js';


describe('test Client', function () {

    it('should replace apiKey in the generated URL', function () {
        let client = new Client({
            apiKey: 'my-api-key'
        });
        expect(client.getUrl()).to.equal('https://data.geopf.fr/wfs/ows');
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

    it('should use support user value for defaultCRS', function () {
        let client = new Client({
            apiKey: 'my-api-key',
            defaultCRS: 'urn:ogc:def:crs:EPSG::4326'
        });
        expect(client.defaultCRS).to.equal('urn:ogc:def:crs:EPSG::4326');
    });

    it('should return the description of a feature of the layer', async function () {
        let client = new Client({
            apiKey: 'my-api-key'
        });

        let featureTypeDescription = await client.getDescribeFeatureType('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle');

        expect(featureTypeDescription).to.be.an('object');
        expect(featureTypeDescription).to.have.all.keys(['targetNamespace', 'elementFormDefault', 'targetPrefix', 'featureTypes']);
        expect(featureTypeDescription.elementFormDefault).to.equal('qualified');
        expect(featureTypeDescription.targetNamespace).to.equal('http://CADASTRALPARCELS.PARCELLAIRE_EXPRESS');
        expect(featureTypeDescription.targetPrefix).to.equal('CADASTRALPARCELS.PARCELLAIRE_EXPRESS');
        expect(featureTypeDescription.featureTypes).to.be.an('array');

        expect(featureTypeDescription.featureTypes[0]).to.have.all.keys(['typeName', 'properties']);
        expect(featureTypeDescription.featureTypes[0].typeName).to.equal('parcelle');

        expect(featureTypeDescription.featureTypes[0].properties).to.be.an('array');

        expect(featureTypeDescription.featureTypes[0].properties[0]).to.be.an('object');
        expect(featureTypeDescription.featureTypes[0].properties[0]).to.have.all.keys(['name', 'maxOccurs', 'minOccurs', 'nillable', 'type', 'localType']);
    });

    it('should return xml string from getCapabilities', async function () {
        let client = new Client({
            apiKey: 'my-api-key'
        });

        let getCapabilitiesData = await client.getCapabilities();
        expect(getCapabilitiesData).to.be.an('string');
        expect(getCapabilitiesData).to.have.string('<?xml');
        expect(getCapabilitiesData).to.have.string('<wfs:WFS_Capabilities');
        expect(getCapabilitiesData).to.have.string('</wfs:WFS_Capabilities>');
    });
});

