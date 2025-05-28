import { GamedotMaps } from './libs/sites/gamedot'
import { BaseSite } from './libs/sites'

// 사이트별 클래스 매핑
const SITE_CLASSES: Record<string, new () => BaseSite> = {
    [GamedotMaps.siteUri]: GamedotMaps,
};

(() => {
    // 현재 도메인에 해당하는 클래스 찾기
    const currentHost = window.location.host;
    const SiteClass = SITE_CLASSES[currentHost];
    
    if (!SiteClass) {
        console.error(`지원하지 않는 사이트입니다: ${currentHost}`);
        return;
    }

    // 해당 사이트의 인스턴스 생성 및 초기화
    const site = new SiteClass();
    
    // DOM에 추가
    if(site.objectPanelMenu instanceof HTMLDivElement) {
        site.objectPanelMenu.appendChild(site.root);
    }
})();
