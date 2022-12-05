const cacheBin: any = {};

export async function callCache(url: string, cacheName: string): Promise<any> {
    if (!cacheBin[cacheName]) {
        cacheBin[cacheName] = await caches.open(cacheName);
    }

    try {
        const res = await cacheBin[cacheName].match(new Request(url));
        return res;  
    } catch (error) {
        return undefined;        
    }
}

export async function removeCache(url: string, cacheName: string): Promise<boolean> {
    if (!cacheBin[cacheName]) {
        cacheBin[cacheName] = await caches.open(cacheName);
    }
   
    try {
        cacheBin[cacheName].delete(new Request(url));
        return true;        
    } catch {
        return false;
    }
}

export async function putCache(url: string, data: any, cacheName: string): Promise<boolean> {
    if (!cacheBin[cacheName]) {
        cacheBin[cacheName] = await caches.open(cacheName);
    }
    
    try {
        cacheBin[cacheName].put(new Request(url), new Response(JSON.stringify(data)));
        return true;        
    } catch {
        return false;
    }
}

export async function putRawCache(url: string, data: Response, cacheName: string): Promise<boolean> {
    if (!cacheBin[cacheName]) {
        cacheBin[cacheName] = await caches.open(cacheName);
    }
    
    try {
        cacheBin[cacheName].put(new Request(url), data);
        return true;        
    } catch {
        return false;
    }
}