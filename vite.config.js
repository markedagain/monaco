import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	base: '/',
	build: {
		commonjsOptions: {
			transformMixedEsModules: true
		}
	}
});