import { customElement } from '@src/libs/utils';
import './color-input.scss';
import styles from './color-input.scss?inline';

interface ColorInputProps {
    label: string;
    value: string;
    key: string;
    section: 'app' | 'indicator';
}

@customElement('gps-color-input')
export class ColorInput extends HTMLElement {
    private props: ColorInputProps;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];

        this.props = {
            label: '',
            value: '#000000',
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
                this.props.value = newValue;
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
                <input type="color" class="color-input" 
                    data-key="${this.props.key}" 
                    data-section="${this.props.section}"
                    value="${this.props.value}">
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
                    value: input.value,
                    section: this.props.section
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
    }
} 