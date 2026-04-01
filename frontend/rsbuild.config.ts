import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
// @ts-ignore
import postcssPixelsToRem from 'postcss-pixels-to-rem';

export default defineConfig({
    server: {
        open: false
    },
    plugins: [
        pluginReact(),
        pluginSass()
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
            '@reset': './src/styles/App.scss'
        }
    },
    tools: {
        postcss: (config) => {
            config.postcssOptions = {
                plugins: [
                    postcssPixelsToRem({
                        base: 16,
                        unit: 'rem',
                        exclude: ['border', 'border-width'],
                    }),
                ],
            };
        },
    },
});