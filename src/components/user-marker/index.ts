import { customElement } from '@src/libs/utils';
import styles from './styles.scss?inline';
import { persistentStore, sessionStore } from '@src/libs/store';

@customElement('gps-user-marker')
export class UserMarker extends HTMLElement {
    public userMarkerIcon: HTMLDivElement;
    public userViewAngle: HTMLDivElement;
    userMarker: any;
    constructor() {
        super();
        this.style.visibility = 'hidden';
        const shadow = this.attachShadow({ mode: 'open' });

        this.userMarkerIcon = document.createElement('div');
        this.userMarkerIcon.classList.add('gps-user-position');
        this.userViewAngle = document.createElement('div');
        this.userViewAngle.classList.add('gps-user-view-angle');

        // ripple indicator
        const indicator = document.createElement('div');
        indicator.classList.add('gps-user-marker-indicator');
        indicator.innerHTML = `
            <div class="circle"></div>
            <div class="circle2"></div>
            <div class="circle3"></div>
        `;
        shadow.appendChild(this.userMarkerIcon);
        shadow.appendChild(this.userViewAngle);
        shadow.appendChild(indicator);

        // 스타일 적용
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];
        
        sessionStore.subscribe((state) => {
            this.style.visibility = state.currentUser.isActive ? 'visible' : 'hidden';
        });
        persistentStore.subscribe((state) => {
            indicator.style.visibility = state.config.script.marker_indicator.show_user_indicator ? 'visible' : 'hidden';
            indicator.style.setProperty('--size', state.config.script.marker_indicator.indicator_size.toString());
            indicator.style.setProperty('--color', state.config.script.marker_indicator.indicator_color);
            indicator.style.setProperty('--initial-opacity', state.config.script.marker_indicator.indicator_initial_opacity.toString());
            indicator.style.setProperty('--animation-duration', state.config.script.marker_indicator.indicator_duration.toString()+'s');
        });
    }
}