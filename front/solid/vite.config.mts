import { defineConfig } from "npm:vite";
import solidPlugin from "npm:vite-plugin-solid";
import { internalIpV4 } from 'npm:internal-ip'
import { config } from 'https://deno.land/x/dotenv/mod.ts'

config({
  export: true
})

export default defineConfig(async () => {
  const host = await internalIpV4()
  return {
    plugins: [solidPlugin()],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // tauri expects a fixed port, fail if that port is not available
    server: {
        host: '0.0.0.0', // listen on all addresses
        port: 5173,
        strictPort: true,
        hmr: {
          protocol: 'ws',
          host,
          port: 5183,
        },
      },
    // to make use of `TAURI_DEBUG` and other env variables
    // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
    envPrefix: ["VITE_", "TAURI_"],
    build: {
      // Tauri supports es2021
      target: Deno.env.get('TAURI_PLATFORM') == "windows" ? "chrome105" : "safari13",
      // don't minify for debug builds
      minify: !Deno.env.get('TAURI_DEBUG') ? "esbuild" : false,
      // produce sourcemaps for debug builds
      sourcemap: !!Deno.env.get('TAURI_DEBUG'),
    },
  }
});
