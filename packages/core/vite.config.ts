import path from "node:path";
import dts from "unplugin-dts/vite";
import {defineConfig} from "vite";
import Inspect from "vite-plugin-inspect";
// import {nodePolyfills} from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        target: "node16",
        lib: {
            entry: path.resolve(__dirname, "src", "index.ts"),
            name: "monoalias",
            formats: ['es'],
            fileName: "monoalias",
        },
        rollupOptions: {
            external: [
                'node:path',
                'node:fs',
                'vite'
            ]
        },
    },
    plugins: [
        dts(),
        Inspect(),
    ],
});
