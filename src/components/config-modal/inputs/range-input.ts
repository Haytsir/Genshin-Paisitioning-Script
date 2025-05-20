import { customElement } from '@src/libs/utils';
import './range-input.scss';
import styles from './range-input.scss?inline';

interface RangeInputProps {
    label: string;
    value: number;
    key: string;
    section: 'app' | 'indicator';
    min: number;
    max: number;
    step: number;
}

@customElement('gps-range-input')
export class RangeInput extends HTMLElement {
    private props: RangeInputProps;

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
            section: 'app',
            min: 0,
            max: 100,
            step: 1
        };
    }

    static get observedAttributes() {
        return ['label', 'value', 'key', 'section', 'min', 'max', 'step'];
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
            case 'min':
                this.props.min = Number(newValue);
                break;
            case 'max':
                this.props.max = Number(newValue);
                break;
            case 'step':
                this.props.step = Number(newValue);
                break;
        }

        this.render();
    }

    private render() {
        this.shadowRoot!.innerHTML = `
            <div class="config-item">
                <label class="config-label">${this.props.label}</label>
                <div class="range-container">
                    <input type="range" class="range-input" 
                        data-key="${this.props.key}" 
                        data-section="${this.props.section}"
                        min="${this.props.min}" 
                        max="${this.props.max}" 
                        step="${this.props.step}"
                        value="${this.props.value}">
                    <div class="range-tooltip">${this.props.value}</div>
                </div>
            </div>
        `;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        const input = this.shadowRoot!.querySelector('input') as HTMLInputElement;
        const tooltip = this.shadowRoot!.querySelector('.range-tooltip') as HTMLElement;
        if (!input || !tooltip) return;

        const updateTooltip = () => {
            const value = input.value;
            const min = Number(input.min) || 0;
            const max = Number(input.max) || 100;
            const range = max - min;
            
            const thumbRadius = 8;
            const trackWidth = input.offsetWidth - (thumbRadius * 2);
            const percent = ((Number(value) - min) / range);
            const thumbPosition = (percent * trackWidth) + thumbRadius;
            
            tooltip.textContent = value;
            tooltip.style.left = `${thumbPosition}px`;
        };

        setTimeout(updateTooltip, 0);
        input.addEventListener('input', updateTooltip);
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