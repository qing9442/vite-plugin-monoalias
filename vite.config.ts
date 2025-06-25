import { defineConfig } from "vite";
import path from "path";
import dts from "unplugin-dts/vite";
import Inspect from "vite-plugin-inspect";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.join("src", "index.ts"),
      name: "Pl",
      formats: ["es"],
      fileName: "pl",
    },
  },
  plugins: [dts(), Inspect()],
});
