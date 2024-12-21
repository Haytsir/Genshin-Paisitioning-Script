import logoConnect from '@static/pin-connect.svg?url';
import logoSettings from '@static/config.svg?url';
import logoPin from '@static/pin-follow.svg?url';
import { ActionMenuItem } from './item';
import styles from './styles.scss?inline';
import { customElement, decodeSvg } from '@src/libs/utils';
import { sessionStore } from '@src/libs/store';

interface MenuItemConfig {
    className: string;
    title: string;
    logo?: string;
    text: string;
    logoType: keyof typeof ActionMenuItem.LOGO_TYPES;
    svg?: string;
}

@customElement('gps-action-menu')
export class ActionMenu extends HTMLElement {
    public readonly shadowRoot: ShadowRoot;
    public actionPin: ActionMenuItem;
    public actionConnect: ActionMenuItem;
    public actionConfig: ActionMenuItem;
    private unsubscribe: (() => void) | null = null;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });
        
        // 메뉴 아이템 설정
        const menuItems: Record<string, MenuItemConfig> = {
            pin: {
                className: 'maps-menu gps-pin',
                title: '내 위치로 이동',
                text: '따라가기',
                logo: decodeSvg(logoPin),
                logoType: ActionMenuItem.LOGO_TYPES.svg
            },
            connect: {
                className: 'maps-menu gps-connect',
                title: '플러그인 연결',
                logo: decodeSvg(logoConnect),
                text: '실시간 연결',
                logoType: ActionMenuItem.LOGO_TYPES.svg
            },
            config: {
                className: 'maps-menu gps-config',
                title: '설정',
                logo: decodeSvg(logoSettings),
                text: '설정',
                logoType: ActionMenuItem.LOGO_TYPES.svg
            }
        };
        // 메뉴 아이템 생성
        this.actionPin = this.createMenuItem(menuItems.pin);
        this.actionConnect = this.createMenuItem(menuItems.connect);
        this.actionConfig = this.createMenuItem(menuItems.config);

        // 스타일 적용
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        this.shadowRoot.adoptedStyleSheets = [styleSheet];
    }

    private createMenuItem(config: MenuItemConfig): ActionMenuItem {
        const menuItem = new ActionMenuItem();
        menuItem.setAttribute('class', config.className);
        menuItem.setAttribute('title', config.title);
        menuItem.setAttribute('text', config.text);
        
        if (config.logo) {
            menuItem.setAttribute('logo', config.logo);
            menuItem.setAttribute('logoType', config.logoType || ActionMenuItem.LOGO_TYPES.image);
        }
        
        if (config.svg) {
            menuItem.innerHTML = config.svg;
        }

        this.shadowRoot.appendChild(menuItem);
        return menuItem;
    }

    connectedCallback() {
        this.classList.add('gps-action');
        this.updateVisibility(this.getAttribute('active') === 'true');
        // 디버그 모드 변경 감지
        this.unsubscribe = sessionStore.subscribe((newState) => {
            const { isActive } = newState.currentUser;
            this.updateVisibility(isActive);
        });
    }

    disconnectedCallback() {
        // 컴포넌트가 제거될 때 구독 해제
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    private updateVisibility(isActive: boolean) {
        this.actionConnect.style.display = isActive ? 'none' : 'block';
        this.actionPin.style.display = isActive ? 'block' : 'none';
        this.actionConfig.style.display = isActive ? 'block' : 'none';
    }
}