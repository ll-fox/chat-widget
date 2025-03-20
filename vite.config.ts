import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IntelligentChat',
      fileName: (format) => `intelligent-chat.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    // cssCodeSplit: true,
  },
  server: {
    port: 5174,
    cors: true
  },
  css: {
    // 配置PostCSS插件，这里使用了Tailwind CSS
    postcss: {
      plugins: [require('tailwindcss')]
    },
    // 配置CSS模块的类名转换规则
    modules: {
      // 将CSS模块中的类名统一转换为驼峰命名
      localsConvention: 'camelCaseOnly'
    }
  },
  publicDir: '../../public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});