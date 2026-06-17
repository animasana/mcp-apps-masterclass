import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const FULL_URL = "https://server.oogy.workers.dev/";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    return {
        plugins: [react(), tailwindcss()],
        base: mode === "production" ? FULL_URL : undefined,
        build: {
            outDir: "../server/dist",
            emptyOutDir: true,
        },
        server: {
            cors: true,
        },
    };
});
