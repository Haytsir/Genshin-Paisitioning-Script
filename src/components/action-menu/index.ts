import logoConnect from '@static/pin-connect.svg';
import logoSettigns from '@static/config.svg';
//import logoShare from '../static/pin-share.svg';
import { ActionMenuItem } from './item';
import styles from './item-styles.scss?inline';


export class ActionMenu extends HTMLElement {
    
    public shadowRoot: ShadowRoot | null;
    public actionPin: ActionMenuItem;
    public actionConnect: ActionMenuItem;
    public actionConfig: ActionMenuItem;

    constructor() {        
        super();

        this.shadowRoot = this.attachShadow({ mode: 'open' });

        this.actionPin = new ActionMenuItem();
        this.actionPin.setAttribute('class', 'maps-menu gps-pin');
        this.actionPin.setAttribute('title', '내 위치로 이동');
        this.actionPin.innerHTML = `<svg viewBox="0 0 1024 1024"><path d="M176 478.208l275.328 91.733333c1.28 0.426667 2.261333 1.408 2.688 2.688l91.733333 275.328a4.266667 4.266667 0 0 0 7.978667 0.341334l279.381333-651.861334a4.266667 4.266667 0 0 0-5.589333-5.589333L175.658667 470.186667a4.266667 4.266667 0 0 0 0.341333 7.978666z"></path></svg>`;
        this.actionPin.setAttribute('text', '따라가기');
        this.shadowRoot.appendChild(this.actionPin);

        this.actionConnect = new ActionMenuItem();
        this.actionConnect.classList.add('maps-menu', 'gps-connect');
        this.actionConnect.setAttribute('class', 'maps-menu gps-connect');
        this.actionConnect.setAttribute('title', '플러그인 연결');
        this.actionConnect.setAttribute('logo', logoConnect);
        this.actionConnect.setAttribute('mask', '');
        this.actionConnect.setAttribute('text', '실시간 연결');
        //this.actionConnect.innerHTML = `<img src=${logoConnect} alt="Load" class="gps-action-icon" /><p>실시간 연결</p>`;

        //this.actionConnect.innerHTML = `<object type="image/svg+xml" data=${logoConnect} class="gps-action-icon"></object><p>실시간 연결</p>`;
        this.shadowRoot.appendChild(this.actionConnect);

        this.actionConfig = new ActionMenuItem();
        this.actionConfig.setAttribute('class', 'maps-menu gps-connect');
        this.actionConfig.setAttribute('title', '설정');
        this.actionConfig.setAttribute('logo', logoSettigns);
        this.actionConfig.setAttribute('mask', '');
        this.actionConfig.setAttribute('text', '설정');
        //this.actionConfig.innerHTML = `<img src=${logoSettigns} alt="Load" class="gps-action-icon" /><p>설정</p>`;
        this.shadowRoot.appendChild(this.actionConfig);

        // create variable to attach the tailwind stylesheet
        let style = document.createElement('style');
        // attach the stylesheet as text
        style.textContent = styles;
        // apply the style
        this.shadowRoot.appendChild(style);
    }

    connectedCallback() {
        // Add classname to the component's root element
        this.classList.add('gps-action');
        this.getAttribute('active') === 'true' ? this.onActivated() : this.onDeactivated();
    }

    disconnectedCallback() {
        // 웹 컴포넌트가 DOM에서 제거될 때 실행되는 로직을 여기에 작성합니다.
    }

    static get observedAttributes() {
        return ['active'];
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: string) {
        if (name === 'active') {
            console.log(`Active attribute changed from ${oldValue} to ${newValue}`);

            if (newValue === 'true') {
                this.onActivated();
            } else {
                this.onDeactivated();
            }
        }
    }

    private onActivated() {
        this.actionConnect.style.display = 'none';
        this.actionPin.style.display = 'block';
        this.actionConfig.style.display = 'block';
    }

    private onDeactivated() {
        this.actionConnect.style.display = 'block';
        this.actionPin.style.display = 'none';
        this.actionConfig.style.display = 'none';
    }
}

customElements.define('action-menu', ActionMenu);
customElements.define('action-menu-item', ActionMenuItem);