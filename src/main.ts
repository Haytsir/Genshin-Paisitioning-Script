import './style.css';

import { GamedotMaps } from './libs/sites/gamedot'

(() => {
    const site = GamedotMaps.instance;
    if(site.objectPanelMenu instanceof HTMLDivElement)
        site.objectPanelMenu.appendChild(site.root);
})();
