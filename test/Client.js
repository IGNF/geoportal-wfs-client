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

});

