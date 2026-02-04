import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from "@rsbuild/plugin-sass"

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
	pluginReact(),
	pluginSass()],
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
			'@reset': './src/styles/App.scss'
		}
	}
});
