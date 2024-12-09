import { customElement } from '@src/libs/utils';
import styles from './styles.scss?inline';
import { persistentStore, sessionStore } from '@src/libs/store';
import { unsafeWindow } from '$';

@customElement('gps-user-marker')
export class UserMarker extends HTMLElement {
    public userMarkerIcon: HTMLDivElement;
    public userViewAngle: HTMLDivElement;
    private unsubscribeSession: (() => void) | null = null;
    private unsubscribePersistent: (() => void) | null = null;
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
        const indicatorState = persistentStore.getState();
        indicator.style.visibility = indicatorState.config.script.marker_indicator.show_user_indicator ? 'inherit' : 'hidden';
        indicator.style.setProperty('--size', indicatorState.config.script.marker_indicator.indicator_size.toString());
        indicator.style.setProperty('--color', indicatorState.config.script.marker_indicator.indicator_color);
        indicator.style.setProperty('--initial-opacity', indicatorState.config.script.marker_indicator.indicator_initial_opacity.toString());
        indicator.style.setProperty('--animation-duration', indicatorState.config.script.marker_indicator.indicator_duration.toString()+'s');
        shadow.appendChild(this.userMarkerIcon);
        shadow.appendChild(this.userViewAngle);
        shadow.appendChild(indicator);

        // 스타일 적용
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];
        
        this.unsubscribeSession = sessionStore.subscribe((state) => {
            if (state.currentUser.isActive) {
                this.style.visibility = 'visible';
                if (unsafeWindow.objectViewer) {
                    unsafeWindow.objectViewer.addEventListener('mousemove', this.mouseMoveEvent.bind(this));
                }
            } else {
                this.style.visibility = 'hidden';
                if (unsafeWindow.objectViewer) {
                    unsafeWindow.objectViewer.removeEventListener('mousemove', this.mouseMoveEvent.bind(this));
                }
            }
        });
        this.unsubscribePersistent = persistentStore.subscribe((state) => {
            indicator.style.visibility = state.config.script.marker_indicator.show_user_indicator ? 'inherit' : 'hidden';
            indicator.style.setProperty('--size', state.config.script.marker_indicator.indicator_size.toString());
            indicator.style.setProperty('--color', state.config.script.marker_indicator.indicator_color);
            indicator.style.setProperty('--initial-opacity', state.config.script.marker_indicator.indicator_initial_opacity.toString());
            indicator.style.setProperty('--animation-duration', state.config.script.marker_indicator.indicator_duration.toString()+'s');
        });
    }

    private mouseMoveEvent(event: MouseEvent): void {
        if (unsafeWindow.MAPS_ViewMobile == true) return;
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let vecX = event.clientX - (centerX + window.scrollX)
        let vecY = event.clientY - (centerY + window.scrollY)
        let dist = Math.round(Math.sqrt( vecX*vecX + vecY*vecY ));
        const radius = Math.ceil(rect.width/2);
        if(dist <= radius) {
            this.classList.add('hover')
        } else {
            this.classList.remove('hover')
        }
    }

    disconnectedCallback() {
        // 컴포넌트가 제거될 때 구독 해제
        if (this.unsubscribeSession) {
            this.unsubscribeSession();
            this.unsubscribeSession = null;
        }
        if (this.unsubscribePersistent) {
            this.unsubscribePersistent();
            this.unsubscribePersistent = null;
        }
    }
}