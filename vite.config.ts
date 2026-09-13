import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    // Must come before tanstackStart(): builds the SSR bundle as a Worker.
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({ srcDirectory: 'src' }),
    viteReact(),
  ],
})
