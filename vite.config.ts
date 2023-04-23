import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: {
            '':'Genshin-Paisitioning Script',
            ko: '원신-파이지셔닝 스크립트'
        },
        description:{
            en: "Show realtime in game location in the Teyvat Interactive Map, in browser and mobile phones!Support genshin.gamedot.org.",
            ko: "원신 게임닷 지도에서 실제 게임에서의 캐릭터 위치를 실시간으로 보여줍니다, 브라우저와 모바일 동시에 사용 가능!"
        },
        icon: 'https://genshin.gamedot.org/asset/xapp-icon128.png.pagespeed.ic.zyAE0ntk9a.webp',
        namespace: 'genshin-paisitioning/script',
        match: ['https://genshin.gamedot.org/?mid=genshinmaps'],
        downloadURL: "",
        updateURL: ""
      },
    }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {}
  }
});
