import './style.css';

import { GamedotMaps } from './libs/sites/gamedot'
import { overrideFuntions } from './libs/sites/gamedot/overrides';
import { isMobileBrowser } from './libs/utils';

(() => {
    const site = GamedotMaps.instance;
    if(site.objectPanelMenu instanceof HTMLDivElement)
        site.objectPanelMenu.appendChild(site.root);
})();
