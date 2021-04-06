/*
 * Configuration for functional tests
 */

/* allows to switch to http */
const GEOPORTAL_WFS_URL = process.env.GEOPORTAL_WFS_URL || 'https://wxs.ign.fr/{apiKey}/geoportail/wfs';

const config = {
    GEOPORTAL_WFS_URL: GEOPORTAL_WFS_URL,
    GEOPORTAL_API_KEY: 'choisirgeoportail',
    GEOPORTAL_REFERER: 'http://localhost'
};

module.exports = config;
