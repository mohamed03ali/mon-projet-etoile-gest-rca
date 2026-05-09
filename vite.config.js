import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Gestionnaire des stocks hors ligne',
        short_name: 'Gestion-etoile',
        description: 'une application qui fonctionne sans internet',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/logo192.jpg',
            sizes: '192x192',
            type: 'image/jpg',
          },
        ],
      },
    }),
  ],
})