import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  return {
    // 關鍵設定：請將 'FoodDatabase' 換成您 GitHub 儲存庫的實際名稱
    // 如果是部署在個人首頁 (username.github.io)，則可以設為 '/' 或直接移除 base
    base: '/FoodDatabase/', 
    
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 建議指向 ./src 資料夾
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
