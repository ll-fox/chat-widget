import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic'
  })],
  root: 'src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
    lib: {
      // 指定库的入口文件为src/index.ts
      entry: resolve(__dirname, 'src/index.ts'),
      // 设置库的全局变量名称为IntelligentChat
      name: 'IntelligentChat',
      // 自定义输出文件名，根据格式生成不同的文件名
      fileName: (format) => `intelligent-chat.${format}.js`,
      // 指定输出格式为ES模块和UMD格式
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // 将react和react-dom标记为外部依赖，不打包进库中
      external: ['react', 'react-dom'],
      output: {
        // 定义外部依赖的全局变量名称
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // 设置静态资源文件的输出路径和命名规则
        assetFileNames: 'assets/[name].[ext]',
      }
    },
    // 禁用CSS代码分割，将所有CSS打包到一个文件中
    cssCodeSplit: false,
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