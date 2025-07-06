import vue from "@vitejs/plugin-vue";
import {defineConfig} from "vite";
import Inspect from "vite-plugin-inspect";
import Monoalias from "vite-plugin-monoalias";
import {fileURLToPath, URL} from "url";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        Inspect(), vue(),
        Monoalias({root: fileURLToPath(new URL("../../", import.meta.url))}),
        // Monoalias({root: process.cwd()})
        // Monoalias()
    ],
});
