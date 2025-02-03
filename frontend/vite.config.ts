import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import sassGlobImports from "vite-plugin-sass-glob-import";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), svgr(), tsconfigPaths(), sassGlobImports()],
	server: {
		host: true,
		port: 3000,
		strictPort: true,
		watch: {
			usePolling: true,
		},
		hmr: {
			clientPort: 3000,
			overlay: false,
		},
	},
	define: {
		global: "window",
		"VITE_WEBSITE_URL": JSON.stringify(process.env.VITE_WEBSITE_URL),
	},
	build: {
		sourcemap: true,
		minify: "terser"
	},
	css: {
		postcss: "./postcss.config.js",
		preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  },
	publicDir: "public",
});
