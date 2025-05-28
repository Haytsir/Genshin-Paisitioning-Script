import { customElement } from '@src/libs/utils';
import './number-input.scss';
import styles from './number-input.scss?inline';

interface NumberInputProps {
    label: string;
    value: number;
    key: string;
    section: 'app' | 'indicator';
}

@customElement('gps-number-input')
export class NumberInput extends HTMLElement {
    private props: NumberInputProps;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];

        this.props = {
            label: '',
            value: 0,
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
                this.props.value = Number(newValue);
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
                <input type="number" class="number-input" 
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
                    value: Number(input.value),
                    section: this.props.section
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
    }
} 