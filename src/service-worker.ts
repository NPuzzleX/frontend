/// <reference lib="webworker" />

import { version, build, files } from '$service-worker';
import { putCache, putRawCache, callCache } from "./helpers/cacheApi";
import { getDBbyId } from './helpers/indexdb';

const worker = (self as unknown) as ServiceWorkerGlobalScope;
const baseUrl: string = "https://3mworkshop.com/api";
const remoteAddr: string = "https://3mworkshop.com/repo";

let anon: boolean = true;
let offline: boolean = false;

const cacheName = `cache${version}`;

const persistentCache: string[] = [
    "anon",
    "offline-data",
    "sync-data",
    "core-puzzle",
    cacheName
]

const to_cache = build.concat(files);
const staticAssets = new Set(to_cache);

worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(cacheName)
			.then((cache) => cache.addAll(to_cache))
			.then(() => {
				worker.skipWaiting();
			})
	);
});

worker.addEventListener('activate', async (event) => {
    event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (!persistentCache.includes(key)) {
                    await caches.delete(key);
                }                 
			}

			worker.clients.claim();
		})
	);
});

worker.addEventListener('fetch', (event: FetchEvent) => {
    if ((event.request.method == "GET") && (event.request.url.indexOf(remoteAddr) == 0)) {
        if (offline) {
            return event.respondWith((async () => {
                const cachedData = await callCache(event.request.url, "core-puzzle");
                return cachedData || new Response(null, {
                    status: 400
                });
            }) ());
        } else {
            return event.respondWith((async () => {
                const res = await fetch(event.request);
                putRawCache(event.request.url, res.clone(), "core-puzzle")
                return res;
            }) ());
        }
    }

    if (anon && (event.request.url.indexOf(baseUrl + "/puzzle/") == 0)) {
        let url: string = event.request.url.replace(baseUrl + "/puzzle/", "");
        if ((url.indexOf("state?puzzle_id=") == 0) && (event.request.method == "GET")) {
            url = url.replace("state?puzzle_id=", "");
            return event.respondWith((async () => {
                const cachedData = await callCache(event.request.url, "anon");
                return cachedData || new Response(JSON.stringify({
                    puzzle_id: url
                }));
            }) ());
        } else if ((url == "state") && (event.request.method == "POST")) {
            return event.respondWith((async () => {
                const dt = await event.request.json();
                putCache(event.request.url + "?puzzle_id=" + dt.puzzle_id, dt, "anon");
                return new Response("OK");
            }) ());
        } else if (event.request.method == "POST") {
            return event.respondWith(new Response("true"));
        }        
    }

    if (offline && (event.request.url.indexOf(baseUrl + "/puzzle/") == 0)){
        let url: string = event.request.url.replace(baseUrl + "/puzzle/", "");
        if ((url.indexOf("state?puzzle_id=") == 0) && (event.request.method == "GET")) {
            url = url.replace("state?puzzle_id=", "");
            return event.respondWith((async () => {
                const cachedData = await callCache(event.request.url, "offline-data")
                return cachedData || new Response(JSON.stringify({
                    puzzle_id: url
                }));
            }) ());
        } else if ((url == "state") && (event.request.method == "POST")) {
            return event.respondWith((async () => {
                const dt = await event.request.json();
                putCache(event.request.url + "?puzzle_id=" + dt.puzzle_id, dt, "sync-data");
                putCache(event.request.url + "?puzzle_id=" + dt.puzzle_id, dt, "offline-data");
                return new Response("OK");
            }) ());
        } else if ((url.indexOf("/") == -1) && (url != "favourite")) {
            if (event.request.method == "GET") {
                return event.respondWith((async () => {
                    const dt = await getDBbyId("saved_puzzles", url, "");
                    if (dt) {
                        return new Response(JSON.stringify({data: dt.game, type: dt.type}));
                    } else {
                        return new Response(null, {status: 400});
                    }                    
                }) ());
            } else if (event.request.method == "POST") {
                return event.respondWith((async () => {
                    const dt = await event.request.json();
                    putCache(event.request.url, dt, "sync-data");
                    return new Response("true");
                }) ());                
            }
        }
    }

    if (offline && (event.request.method == "GET")) {
        const url = new URL(event.request.url);

        const isHttp = url.protocol.startsWith('http');
        const isDevServerRequest = url.hostname === self.location.hostname && url.port !== self.location.port;
        const isStaticAsset = url.host === self.location.host && staticAssets.has(url.pathname);
        const skipBecauseUncached = event.request.cache === 'only-if-cached' && !isStaticAsset;
    
        if (isHttp && !isDevServerRequest && !skipBecauseUncached) {
            return event.respondWith(
                (async () => {
                    const cachedAsset = isStaticAsset && (await caches.match(event.request));
    
                    return cachedAsset || fetch(event.request);
                })()
            );
        }
    }

    if (event.request.url.indexOf(baseUrl + "/puzzle/") == 0){
        let url: string = event.request.url.replace(baseUrl + "/puzzle/", "");
        if ((url == "state") && (event.request.method == "POST")) {
            return event.respondWith(
                (async () => {
                    const dt = await event.request.clone().json();
                    const e = await getDBbyId("saved_puzzles", dt.puzzle_id, "");
                    if (e) {
                        putCache(event.request.url + "?puzzle_id=" + dt.puzzle_id, dt, "offline-data");
                    }
        
                    return fetch(event.request);
                })()
            );
        }
    }

    return event.respondWith(fetch(event.request)); 
});

onmessage = async (event: MessageEvent) => {
    if (event.isTrusted) {
        if (event.data.hasOwnProperty("anon")) {
            anon = event.data.anon;
        } else if (event.data.hasOwnProperty("offline")) {
            offline = event.data.offline;
        }
    }
}
