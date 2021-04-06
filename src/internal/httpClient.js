const axios = require('axios');

const axiosGlobalConfig = {};

/*
 * NodeJS specific code to allow https throw http proxy with axios
 * (fixes https://github.com/IGNF/geoportal-wfs-client/issues/5)
 */
if (typeof window === 'undefined' ){
  const HttpProxyAgent = require('http-proxy-agent');
  if ( process.env.HTTP_PROXY ){
    axiosGlobalConfig.httpAgent = new HttpProxyAgent(process.env.HTTP_PROXY);
  }
  const HttpsProxyAgent = require('https-proxy-agent');
  if ( process.env.HTTPS_PROXY ){
    axiosGlobalConfig.httpsAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
  }
  axiosGlobalConfig.proxy = false;
}

const httpClient = axios.create(axiosGlobalConfig);
module.exports = httpClient;



