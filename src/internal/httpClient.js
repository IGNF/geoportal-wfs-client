import axios from 'axios';
import  { HttpProxyAgent }  from 'http-proxy-agent';
import  { HttpsProxyAgent } from 'https-proxy-agent';

const axiosGlobalConfig = {};

/*
 * NodeJS specific code to allow https throw http proxy with axios
 * (fixes https://github.com/IGNF/geoportal-wfs-client/issues/5)
 */
if ('undefined' === typeof window ){
    if ( process.env.HTTP_PROXY ){
        axiosGlobalConfig.httpAgent = new HttpProxyAgent(process.env.HTTP_PROXY);
    }
    if ( process.env.HTTPS_PROXY ){
        axiosGlobalConfig.httpsAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
    }
    axiosGlobalConfig.proxy = false;
}

const httpClient = axios.create(axiosGlobalConfig);

export default httpClient;
