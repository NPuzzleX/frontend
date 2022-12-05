<script lang="ts">
  import { onMount } from "svelte";
  import { user, offlineMode } from "../stores";
  import CallAPI, { validateToken } from "../helpers/axios";

 let done: Boolean = false;

 onMount(async () => {
  const token = localStorage.getItem("NPToken");
  const userData = localStorage.getItem("NPUserData") ?? "{}";

  user.set({ token: token, ...JSON.parse(userData), anonymous: (userData == "{}") });
  offlineMode.set(!navigator.onLine);

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        user.subscribe((val) => {
          navigator.serviceWorker.controller?.postMessage({anon: val.anonymous});
        })
        navigator.serviceWorker.controller?.postMessage({offline: !navigator.onLine});
      }
    } catch (error) {
      console.log('Registration failed with ' + error);  
    }
  }

  done = true;

  addEventListener('online', (event) => { 
    if (event.isTrusted) {
      navigator.serviceWorker.controller?.postMessage({offline: false});
      offlineMode.set(false);
      reSync();
    }
  });

  addEventListener('offline', (event) => { 
    if (event.isTrusted) {
      navigator.serviceWorker.controller?.postMessage({offline: true});
      offlineMode.set(true);
    }
  });

  async function reSync() {
    const cache = await caches.open("sync-data");
    const keys = await cache.keys();
    const baseUrl = import.meta.env.VITE_BASE_URL;
    await validateToken();
    for (let i = 0; i < keys.length; i++) {
      try {
        const dt = await cache.match(keys[i]);
        const body = await dt?.json();
        if (keys[i].url.indexOf("state") == -1) {
          await CallAPI("POST", keys[i].url.replace(baseUrl, ""), body,
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("NPToken"),
              }          
            }
          );
        } else {
          await CallAPI("POST", "/puzzle/state", body,
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("NPToken"),
              }          
            }
          );          
        }
        await cache.delete(keys[i]);
      } catch (error) {
        console.log("UNABLE SYNC " + error);
      }
    }
  }
});
</script>

{#if done}
    <slot/>
{/if}