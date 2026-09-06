import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Vite runs this file on the server during development/build.
// Keep the real Replicate token server-side only. The browser receives a
// harmless sentinel value so existing client guards continue to work while
// production requests are authenticated by /api/replicate.ts.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const replicateToken = env.REPLICATE_API_TOKEN

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_REPLICATE_API_TOKEN': JSON.stringify('server-managed'),
    },
    server: {
      proxy: {
        '/api/replicate': {
          target: 'https://api.replicate.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/replicate/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (replicateToken) {
                proxyReq.setHeader('Authorization', `Token ${replicateToken}`)
              }
            })
          },
        },
      },
    },
  }
})
