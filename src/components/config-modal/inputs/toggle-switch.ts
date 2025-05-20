import { customElement } from '@src/libs/utils';
import './toggle-switch.scss';
import styles from './toggle-switch.scss?inline';

interface ToggleSwitchProps {
    label: string;
    value: boolean;
    key: string;
    section: 'app' | 'indicator';
}

@customElement('gps-toggle-switch')
export class ToggleSwitch extends HTMLElement {
    private props: ToggleSwitchProps;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];

        this.props = {
            label: '',
            value: false,
            key: '',
            section: 'app'
        };
    }

    static get observedAttributes() {
        return ['label', 'value', 'key', 'section'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'label':
                this.props.label = newValue;
                break;
            case 'value':
                this.props.value = newValue === 'true';
                break;
            case 'key':
                this.props.key = newValue;
                break;
            case 'section':
                this.props.section = newValue as 'app' | 'indicator';
                break;
        }

        this.render();
    }

    private render() {
        this.shadowRoot!.innerHTML = `
            <div class="config-item">
                <label class="config-label">${this.props.label}</label>
                <label class="toggle-switch">
                    <input type="checkbox" data-key="${this.props.key}" ${this.props.value ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        const input = this.shadowRoot!.querySelector('input') as HTMLInputElement;
        if (!input) return;

        input.addEventListener('change', () => {
            const event = new CustomEvent('config-change', {
                detail: {
                    key: this.props.key,
                    value: input.checked,
                    section: this.props.section
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
    }
} 