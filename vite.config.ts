import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import path from "node:path";
import packageInfo from "./package.json" with { type: "json" };

const { displayName, description, repository } = packageInfo;
const fileName = 'genshin-paisitioning-script.user.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: {
            '': displayName,
            ko: '원신-파이지셔닝 스크립트'
        },
        description:{
            '': description,
            ko: "원신 게임닷 지도에서 실제 게임에서의 캐릭터 위치를 실시간으로 보여줍니다."
        },
        icon: 'https://genshin.gamedot.org/asset/xapp-icon128.png.pagespeed.ic.zyAE0ntk9a.webp',
        namespace: 'genshin-paisitioning/script',
        match: ['https://genshin.gamedot.org/?mid=genshinmaps'],
        downloadURL: `${repository.url}/raw/gh-pages/userscript/${fileName}`,
        updateURL: `${repository.url}/raw/gh-pages/userscript/${fileName}`
      },
      build: {
        fileName
      }
    }),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname) },
      {
        find: "@src",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: "@static",
        replacement: path.resolve(__dirname, "src/static"),
      },
      {
        find: "@components",
        replacement: path.resolve(__dirname, "src/components"),
      },
    ],
  },
  server: {
    watch: {
      usePolling: false,
      interval: 100,
    },
    hmr: {
      overlay: false,
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {}
  },
  define: {
    __IPC_ENABLED__: false,
    SCRIPT_VERSION: `"${packageInfo.version}"`
  },
  esbuild: {
    target: 'esnext'
  }
});
