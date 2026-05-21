/**
 * Client HTTP façon axios (params, headers, responseType:text, transformResponse).
 * Navigateur : fetch natif ; Node : fetch avec Undici.ProxyAgent selon HTTP(S)_PROXY
 * et liste NO_PROXY / no_proxy séparées par espaces ou virgules (hôte, .suffixe,
 * motif *.suffixe sans espace dans le suffixe, host:port, [IPv6]:port ou *, optionnellement).
 */

/** @typedef {{ params?: Record<string, unknown>; headers?: Record<string, string>; responseType?: string; transformResponse?: (body: string) => unknown }} AxiosLikeOpts */

const proxyAgents = new Map();

function parseNoProxyEntries() {
    if ('undefined' === typeof process || !process.env) {
        return [];
    }
    const raw = process.env.NO_PROXY ?? process.env.no_proxy ?? '';
    return String(raw)
        .split(/[\s,]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

function effectivePort(url) {
    if (url.port) {
        return String(url.port);
    }
    if ('https:' === url.protocol) {
        return '443';
    }
    if ('http:' === url.protocol) {
        return '80';
    }
    return '';
}

function splitHostPattern(entry) {
    if (entry.startsWith('[')) {
        const bracketEnd = entry.indexOf(']:');
        if (-1 !== bracketEnd) {
            const p = entry.slice(bracketEnd + 2);
            if (/^\d{1,5}$/.test(p)) {
                return {
                    hostPart: entry.slice(1, bracketEnd).toLowerCase(),
                    portPart: p,
                };
            }
        }
        const close = entry.indexOf(']');
        const inner = 1 < close ? entry.slice(1, close).toLowerCase() : '';
        return { hostPart: inner, portPart: '' };
    }
    const lastColon = entry.lastIndexOf(':');
    if (0 < lastColon && /^\d{1,5}$/.test(entry.slice(lastColon + 1))) {
        return {
            hostPart: entry.slice(0, lastColon).toLowerCase(),
            portPart: entry.slice(lastColon + 1),
        };
    }
    return { hostPart: entry, portPart: '' };
}

function hostMatchesPattern(hostLower, hostPattern) {
    if ('*' === hostPattern) {
        return true;
    }
    if (hostPattern.startsWith('.')) {
        const d = hostPattern.slice(1);
        return hostLower === d || hostLower.endsWith(`.${d}`);
    }
    if (hostPattern.startsWith('*')) {
        const rest = hostPattern.slice(1).replace(/^\.+/u, '');
        if (!rest.length) {
            return false;
        }
        return hostLower === rest || hostLower.endsWith(`.${rest}`);
    }
    return hostLower === hostPattern;
}

function bypassNoProxy(urlObj) {
    const rules = parseNoProxyEntries();
    if (!rules.length) {
        return false;
    }
    const hostLower = urlObj.hostname.toLowerCase();
    const portEffective = effectivePort(urlObj);
    for (const rule of rules) {
        const { hostPart, portPart } = splitHostPattern(rule);
        if (portPart && portPart !== portEffective) {
            continue;
        }
        if (hostMatchesPattern(hostLower, hostPart)) {
            return true;
        }
    }
    return false;
}

function proxyUriFor(urlObj) {
    if ('undefined' === typeof process || !process.env) {
        return '';
    }
    const httpP = process.env.HTTP_PROXY ?? process.env.http_proxy ?? '';
    const httpsP = process.env.HTTPS_PROXY ?? process.env.https_proxy ?? '';
    if ('https:' === urlObj.protocol) {
        return httpsP || httpP || '';
    }
    return httpP || httpsP || '';
}

function isNodeWithoutWindow() {
    return (
        'undefined' !== typeof process &&
        process.versions?.node !== undefined &&
        'undefined' === typeof globalThis.window
    );
}

/**
 * @param {string} resource
 * @param {RequestInit} [init]
 */
async function fetchWithProxy(resource, init) {
    let urlObj;
    try {
        urlObj = new URL(resource);
    } catch {
        return globalThis.fetch(resource, init);
    }

    if (!isNodeWithoutWindow()) {
        return globalThis.fetch(resource, init);
    }

    const proxyUri = proxyUriFor(urlObj);
    if (!proxyUri || bypassNoProxy(urlObj)) {
        return globalThis.fetch(resource, init);
    }

    const mod = await import(/* webpackIgnore: true */ 'undici');
    let agent = proxyAgents.get(proxyUri);
    if (!agent) {
        agent = new mod.ProxyAgent(proxyUri);
        proxyAgents.set(proxyUri, agent);
    }
    const fetchImpl = 'function' === typeof mod.fetch ? mod.fetch : globalThis.fetch;
    const opts =
        'undefined' === typeof init || null === init
            ? { dispatcher: agent }
            : { ...init, dispatcher: agent };
    return fetchImpl(resource, opts);
}

/**
 * Construit l URL avec parametres comme axios (valeurs primitives stringifiees).
 * @param {string} url
 * @param {Record<string, unknown>} [params]
 */
function buildFullUrl(url, params) {
    const u = new URL(url);
    Object.entries(params || {}).forEach(([k, val]) => {
        if (val === undefined || null === val) {
            return;
        }
        u.searchParams.set(k, 'string' === typeof val ? val : String(val));
    });
    return u.toString();
}

/**
 * @param {string} method
 * @param {string} baseUrl
 * @param {AxiosLikeOpts} [opts]
 * @param {string} [rawBodyForPost]
 */
async function request(method, baseUrl, opts, rawBodyForPost) {
    const o = opts ?? {};
    const fullUrl = buildFullUrl(baseUrl, o.params);
    const headers = new Headers(o.headers || {});
    /** @type {RequestInit} */
    const init = { method, headers };
    if ('POST' === method && rawBodyForPost !== undefined) {
        if (!headers.has('Content-Type')) {
            headers.set(
                'Content-Type',
                'application/x-www-form-urlencoded;charset=UTF-8',
            );
        }
        init.body = rawBodyForPost;
    }
    const res = await fetchWithProxy(fullUrl, init);
    const text = await res.text();

    /*
     * Comportement proche d axios : transformResponse voit le corps même en erreur HTTP,
     * pour permettre les levées métier lorsque la réponse n'est pas du JSON (ex. XML OWS).
     */
    let data = text;
    if (o.transformResponse) {
        data = o.transformResponse(text);
    }
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status} ${res.statusText}`);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return { data };
}

export default {
    get(url, config) {
        return request('GET', url, config);
    },
    post(url, body, config) {
        return request('POST', url, config, body);
    },
};

