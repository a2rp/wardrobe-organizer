import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/wardrobe-organizer/",
    build: { sourcemap: false },
    plugins: [react()],
});