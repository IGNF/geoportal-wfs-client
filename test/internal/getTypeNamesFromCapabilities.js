import { expect } from 'chai';
import fs from 'fs';
import getTypeNamesFromCapabilities from '../../src/internal/getTypeNamesFromCapabilities.js';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



describe('test getTypeNamesFromCapabilities', function () {

    it('should parse names', function (done) {
        var xml = fs.readFileSync(__dirname+'/../data/capabilities.xml', 'utf8');
        var fileNames = getTypeNamesFromCapabilities(xml);
        expect(fileNames.length).to.equals(70);
        expect(fileNames[0]).to.equal('BDADRESSE_BDD_WLD_WGS84G:adresse');
        done();
    });

});
