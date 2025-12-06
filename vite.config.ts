import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        // 代理配置 - 解决CORS问题
        // 使用方式: 在端点配置中填写 /api/elysiver 代替 https://elysiver.h-e.top
        '/api/elysiver': {
          target: 'https://elysiver.h-e.top',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/elysiver/, ''),
          secure: false
        },
        // 可以添加更多代理，例如:
        // '/api/xxx': { target: 'https://xxx.com', changeOrigin: true, rewrite: ... }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
