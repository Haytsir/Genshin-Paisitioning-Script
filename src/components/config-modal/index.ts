import { customElement } from '@src/libs/utils';
import styles from './styles.scss?inline';
import { ConfigData } from "@src/libs/sites/config";
import { persistentStore } from '@src/libs/store';

@customElement('gps-config-modal')
export class ConfigModal extends HTMLElement {
    private readonly elements: {
        modal: HTMLDivElement;
        content: HTMLDivElement;
        inputs: Map<string, HTMLInputElement>;
    };

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        
        // 스타일 적용
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];

        this.elements = {
            modal: this.createModal(),
            content: document.createElement('div'),
            inputs: new Map()
        };

        shadow.appendChild(this.elements.modal);
        this.setupEventListeners();
    }

    private createModal(): HTMLDivElement {
        const modal = document.createElement('div');
        modal.className = 'gps-config-modal';
        modal.innerHTML = `
            <div class="gps-config-backdrop"></div>
            <div class="gps-config-content">
                <header class="gps-config-header">
                    <h2>설정</h2>
                    <button class="gps-config-close" title="닫기">
                        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                </header>
                <div class="gps-config-body">
                    ${this.createConfigInputs()}
                </div>
                <footer class="gps-config-footer">
                    <button class="gps-config-cancel">취소</button>
                    <button class="gps-config-save">저장</button>
                </footer>
            </div>
        `;
        return modal;
    }

    private createConfigInputs(): string {
        const config = persistentStore.getState().config;
        const labelMap: Record<keyof ConfigData, string> = {
            auto_app_update: '앱 자동 업데이트',
            auto_lib_update: '라이브러리 자동 업데이트',
            capture_interval: '화면 캡쳐 간격',
            capture_delay_on_error: '캡쳐 에러 시 대기 시간',
            use_bit_blt_capture_mode: '비트블럭 캡쳐 모드 사용',
            changed: '변경된 설정 저장'
        };

        return Object.entries(config)
            .map(([key, value]) => {
                const type = typeof value;
                return type === 'boolean'
                    ? this.createToggleSwitch(labelMap[key as keyof ConfigData], key, value as boolean)
                    : this.createNumberInput(labelMap[key as keyof ConfigData], key, value as number);
            })
            .join('');
    }

    private createToggleSwitch(label: string, key: string, value: boolean): string {
        return `
            <div class="config-item">
                <label class="config-label">${label}</label>
                <label class="toggle-switch">
                    <input type="checkbox" data-key="${key}" ${value ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
    }

    private createNumberInput(label: string, key: string, value: number): string {
        return `
            <div class="config-item">
                <label class="config-label">${label}</label>
                <input type="number" class="number-input" data-key="${key}" value="${value}">
            </div>
        `;
    }

    private setupEventListeners(): void {
        const modal = this.elements.modal;
        const backdrop = modal.querySelector('.gps-config-backdrop');
        const closeBtn = modal.querySelector('.gps-config-close');
        const cancelBtn = modal.querySelector('.gps-config-cancel');
        const saveBtn = modal.querySelector('.gps-config-save');

        backdrop?.addEventListener('click', () => this.hideModal());
        closeBtn?.addEventListener('click', () => this.hideModal());
        cancelBtn?.addEventListener('click', () => this.hideModal());
        saveBtn?.addEventListener('click', () => this.saveConfig());

        // 입력 요소들의 변경 감지
        modal.querySelectorAll('input').forEach(input => {
            const key = input.dataset.key as keyof ConfigData;
            this.elements.inputs.set(key, input);
            
            input.addEventListener('change', () => {
                const newConfig = { ...persistentStore.getState().config };
                if (input.type === 'checkbox') {
                    (newConfig[key] as boolean) = input.checked;
                } else {
                    (newConfig[key] as number) = Number(input.value);
                }
                persistentStore.setState({ config: newConfig });
            });
        });
    }

    private saveConfig(): void {
        this.hideModal();
    }

    public showModal(): void {
        this.elements.modal.classList.add('show');
    }

    public hideModal(): void {
        this.elements.modal.classList.remove('show');
    }
}