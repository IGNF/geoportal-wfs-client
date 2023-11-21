/*
 * Configuration for functional tests
 */

/* allows to switch to http */
const GEOPORTAL_WFS_URL = process.env.GEOPORTAL_WFS_URL || 'https://data.geopf.fr/wfs/ows';

const config = {
    GEOPORTAL_WFS_URL: GEOPORTAL_WFS_URL,
    GEOPORTAL_REFERER: 'http://localhost'
};

export default config;
