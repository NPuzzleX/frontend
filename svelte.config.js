import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		//   SPA MODE
        adapter: adapter({
            fallback: 'index.html',
        }),
		files: {
			assets: 'static',
			serviceWorker: 'src/service-worker',
		},		
		serviceWorker: {
			register: true,
			files: ((filepath) => true)
		},		
		trailingSlash: 'always',
		prerender: {
			entries: ["*"]
		}		
	}	
};

export default config;
