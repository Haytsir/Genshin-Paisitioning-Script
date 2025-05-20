import { customElement } from '@src/libs/utils';
import type { ToggleSwitch } from './toggle-switch';
import type { RangeInput } from './range-input';
import type { ColorInput } from './color-input';
import type { NumberInput } from './number-input';

interface InputProps {
    label: string;
    type: 'checkbox' | 'number' | 'color' | 'range' | 'formula';
    value: any;
    key: string;
    section: 'app' | 'indicator';
    min?: number;
    max?: number;
    step?: number;
}

@customElement('gps-config-input')
export class ConfigInput extends HTMLElement {
    private props: InputProps;

    constructor() {
        super();
        this.props = {
            label: '',
            type: 'checkbox',
            value: false,
            key: '',
            section: 'app'
        };
    }

    static get observedAttributes() {
        return ['label', 'type', 'value', 'key', 'section', 'min', 'max', 'step'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'label':
                this.props.label = newValue;
                break;
            case 'type':
                this.props.type = newValue as InputProps['type'];
                break;
            case 'value':
                this.props.value = this.parseValue(newValue);
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

    private parseValue(value: string): any {
        if (this.props.type === 'checkbox') {
            return value === 'true';
        } else if (this.props.type === 'number' || this.props.type === 'range') {
            return Number(value);
        }
        return value;
    }

    private render() {
        let element: HTMLElement;
        
        switch (this.props.type) {
            case 'checkbox':
                element = document.createElement('gps-toggle-switch');
                break;
            case 'range':
                element = document.createElement('gps-range-input');
                break;
            case 'color':
                element = document.createElement('gps-color-input');
                break;
            default:
                element = document.createElement('gps-number-input');
        }

        // 공통 속성 설정
        element.setAttribute('label', this.props.label);
        element.setAttribute('value', String(this.props.value));
        element.setAttribute('key', this.props.key);
        element.setAttribute('section', this.props.section);

        // 추가 속성 설정
        if (this.props.min !== undefined) {
            element.setAttribute('min', String(this.props.min));
        }
        if (this.props.max !== undefined) {
            element.setAttribute('max', String(this.props.max));
        }
        if (this.props.step !== undefined) {
            element.setAttribute('step', String(this.props.step));
        }

        // 기존 내용 제거 후 새로운 요소 추가
        this.innerHTML = '';
        this.appendChild(element);
    }
} 