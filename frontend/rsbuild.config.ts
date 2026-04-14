import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from "@rsbuild/plugin-sass"
import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	server: {
		open: false
	},
	plugins: [
		pluginReact(),
		pluginSass({
		sassLoaderOptions: (config) => {
			const variablesPath = path.join(__dirname, 'src/styles/abstracts/_variables.scss');
			const normalizedPath = variablesPath.replace(/\\/g, '/');
			config.additionalData = `
				@use "sass:color";
				@use "${normalizedPath}" as *;
			`;
		},
		}),
	],
	html: {
		title: 'transcendence',
		favicon: './public/favicon.png'
	},
	resolve: {
		alias: {
			'@pages': './src/pages',
			'@components': './src/components',
			'@styles': './src/styles',
			'@utils': './src/utils',
			'@hooks': './src/hooks',
			'@images': './src/assets/img',
			'@fonts': './src/assets/fonts',
			'@data': './src/assets/data',
			'@icons': './src/assets/icons',
			'@reset': './src/styles/App.scss',
		}
	},
});
