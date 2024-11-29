import { customElement } from '@src/libs/utils';
import styles from './styles.scss?inline';

@customElement('gps-user-marker')
export class UserMarker extends HTMLElement {
    public userMarkerIcon: HTMLDivElement;
    public userViewAngle: HTMLDivElement;
    userMarker: any;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        this.userMarkerIcon = document.createElement('div');
        this.userMarkerIcon.classList.add('gps-user-position');
        this.userViewAngle = document.createElement('div');
        this.userViewAngle.classList.add('gps-user-view-angle');

        // ripple indicator
        const indicator = document.createElement('div');
        indicator.classList.add('gps-user-marker-indicator');
        indicator.innerHTML = `
            <div class="circle1"></div>
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
    }
}