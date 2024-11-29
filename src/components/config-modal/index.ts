import { customElement } from '@src/libs/utils';
import styles from './styles.scss?inline';
import { AppConfigData } from "@src/libs/sites/config";
import { persistentStore } from '@src/libs/store';

@customElement('gps-config-modal')
export class ConfigModal extends HTMLElement {
    private readonly elements: {
        modal: HTMLDivElement;
        content: HTMLDivElement;
        inputs: Map<string, HTMLInputElement>;
        tabs: Map<string, HTMLDivElement>;
    };
    private tempConfig: AppConfigData;  // 임시 설정 저장용

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];

        this.elements = {
            modal: this.createModal(),
            content: document.createElement('div'),
            inputs: new Map(),
            tabs: new Map()
        };

        shadow.appendChild(this.elements.modal);
        this.tempConfig = { ...persistentStore.getState().config };
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
                <div class="gps-config-tabs">
                    <button class="tab-button active" data-tab="general">일반</button>
                    <button class="tab-button" data-tab="indicator">표시</button>
                </div>
                <div class="gps-config-body">
                    <div class="tab-content active" data-tab="general">
                        ${this.createGeneralConfigInputs()}
                    </div>
                    <div class="tab-content" data-tab="indicator">
                        ${this.createIndicatorConfigInputs()}
                    </div>
                </div>
                <footer class="gps-config-footer">
                    <button class="gps-config-cancel">취소</button>
                    <button class="gps-config-save">저장</button>
                </footer>
            </div>
        `;
        return modal;
    }

    private createGeneralConfigInputs(): string {
        const { config } = persistentStore.getState();
        const labelMap: Record<keyof AppConfigData['app'], string> = {
            auto_app_update: '앱 자동 업데이트',
            auto_lib_update: '라이브러리 자동 업데이트',
            capture_interval: '화면 캡쳐 간격',
            capture_delay_on_error: '캡쳐 에러 시 대기 시간',
            use_bit_blt_capture_mode: '비트블럭 캡쳐 모드 사용'
        };

        return Object.entries(config.app)
            .map(([key, value]) => {
                const configKey = key as keyof AppConfigData['app'];
                return typeof value === 'boolean'
                    ? this.createToggleSwitch(labelMap[configKey], configKey, value as boolean)
                    : this.createNumberInput(labelMap[configKey], configKey, value as number);
            })
            .join('');
    }

    private createIndicatorConfigInputs(): string {
        const { config } = persistentStore.getState();
        return `
            <div class="config-item">
                <label class="config-label">표시 활성화</label>
                <label class="toggle-switch">
                    <input type="checkbox" data-key="show_user_indicator" data-section="indicator" 
                        ${config.script.marker_indicator.show_user_indicator ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="config-item">
                <label class="config-label">표시 크기</label>
                <input type="range" class="range-input" data-key="indicator_size" data-section="indicator"
                    min="30" max="100" value="${config.script.marker_indicator.indicator_size}" step="5">
            </div>
            <div class="config-item">
                <label class="config-label">표시 색상</label>
                <input type="color" class="color-input" data-key="indicator_color" data-section="indicator"
                    value="${config.script.marker_indicator.indicator_color}">
            </div>
            <div class="config-item">
                <label class="config-label">시작 투명도</label>
                <input type="range" class="range-input" data-key="indicator_initial_opacity" data-section="indicator"
                    min="0" max="1" value="${config.script.marker_indicator.indicator_initial_opacity}" step="0.05">
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
        cancelBtn?.addEventListener('click', () => this.cancelConfig());
        saveBtn?.addEventListener('click', () => this.saveConfig());

        // 입력 요소들의 변경 감지
        modal.querySelectorAll('input').forEach(input => {
            const key = input.dataset.key!;
            const section = input.dataset.section;
            this.elements.inputs.set(key, input);
            
            input.addEventListener('change', () => {
                const newConfig = { ...this.tempConfig };
                if (section === 'indicator') {
                    if (input.type === 'checkbox' && key === 'show_user_indicator') {
                        newConfig.script.marker_indicator.show_user_indicator = input.checked;
                    } else if (input.type === 'color' && key === 'indicator_color') {
                        newConfig.script.marker_indicator.indicator_color = input.value;
                    } else if (key === 'indicator_size' || key === 'indicator_initial_opacity') {
                        newConfig.script.marker_indicator[key] = Number(input.value);
                    }
                } else {
                    if (input.type === 'checkbox') {
                        newConfig.app[key as 'auto_app_update' | 'auto_lib_update' | 'use_bit_blt_capture_mode'] = input.checked;
                    } else {
                        newConfig.app[key as 'capture_interval' | 'capture_delay_on_error'] = Number(input.value);
                    }
                }
                this.tempConfig = newConfig;
            });
        });

        // 탭 전환 이벤트 추가
        this.elements.modal.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const tabId = target.dataset.tab;
                this.switchTab(tabId!);
            });
        });
    }

    private saveConfig(): void {
        persistentStore.setState({ config: { ...this.tempConfig } });
        this.hideModal();
    }

    private cancelConfig(): void {
        this.hideModal();
    }

    public showModal(): void {
        this.tempConfig = { ...persistentStore.getState().config };
        
        this.elements.inputs.forEach((input, key) => {
            const section = input.dataset.section;
            const value = section === 'indicator' 
                ? this.tempConfig.script.marker_indicator[key as keyof AppConfigData['script']['marker_indicator']]
                : this.tempConfig.app[key as keyof AppConfigData['app']];

            if (input.type === 'checkbox') {
                input.checked = value as boolean;
            } else if (input.type === 'color') {
                input.value = value as string;
            } else {
                input.value = String(value);
            }
        });

        this.elements.modal.classList.add('show');
    }

    public hideModal(): void {
        this.elements.modal.classList.remove('show');
        // 모달이 닫힐 때 임시 설정 초기화
        this.tempConfig = { ...persistentStore.getState().config };
    }

    private switchTab(tabId: string): void {
        // 모든 탭 버튼과 컨텐츠를 비활성화
        this.elements.modal.querySelectorAll('.tab-button, .tab-content').forEach(el => {
            el.classList.remove('active');
        });

        // 선택된 탭 활성화
        this.elements.modal.querySelector(`.tab-button[data-tab="${tabId}"]`)?.classList.add('active');
        this.elements.modal.querySelector(`.tab-content[data-tab="${tabId}"]`)?.classList.add('active');
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
}