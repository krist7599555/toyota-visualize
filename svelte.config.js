import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html', // Essential for Single Page App (SPA) behavior
			precompress: false,
			strict: true
		}),
		paths: {
			// Replace 'your-repo-name' with your actual repository name
			// If deploying to a custom domain or username.github.io, set to empty string ''
			base: process.env.NODE_ENV === 'production' ? '/toyota-visualize' : ''
		}
	}
};

export default config;
