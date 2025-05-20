import { customElement } from '@src/libs/utils';
import styles from './styles.scss?inline';
import { ConfigData, getDefaultConfig } from "@src/libs/sites/config";
import './inputs';
import { persistentStore } from '@src/libs/store';
import { createAppConfigInputs, APP_CONFIG_FIELDS } from './sections/app';
import { createIndicatorConfigInputs, INDICATOR_CONFIG_FIELDS } from './sections/indicator';
import { createOffsetConfigInputs } from './sections/offset';

@customElement('gps-config-modal')
export class ConfigModal extends HTMLElement {
    private readonly elements: {
        modal: HTMLDivElement;
        content: HTMLDivElement;
        inputs: Map<string, HTMLInputElement>;
        tabs: Map<string, HTMLDivElement>;
    };
    private tempConfig: ConfigData;  // 임시 설정 저장용

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];

        this.tempConfig = persistentStore.getState().config as ConfigData;

        this.elements = {
            modal: this.createModal(),
            content: document.createElement('div'),
            inputs: new Map(),
            tabs: new Map()
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
                <div class="gps-config-tabs">
                    <button class="tab-button active" data-tab="general">일반</button>
                    <button class="tab-button" data-tab="indicator">위치 마커</button>
                    <button class="tab-button" data-tab="offset">오프셋</button>
                </div>
                <div class="gps-config-body">
                    <div class="tab-content active" data-tab="general">
                        ${createAppConfigInputs(this.tempConfig)}
                    </div>
                    <div class="tab-content" data-tab="indicator">
                        ${createIndicatorConfigInputs(this.tempConfig)}
                    </div>
                    <div class="tab-content" data-tab="offset">
                        ${createOffsetConfigInputs(this.tempConfig)}
                    </div>
                </div>
                <footer class="gps-config-footer">
                    <div class="footer-left">
                        <button class="gps-config-reset">초기화</button>
                    </div>
                    <div class="footer-right">
                        <button class="gps-config-cancel">취소</button>
                        <button class="gps-config-save">저장</button>
                    </div>
                </footer>
            </div>
        `;
        return modal;
    }

    private setupEventListeners(): void {
        const modal = this.elements.modal;
        const backdrop = modal.querySelector('.gps-config-backdrop');
        const closeBtn = modal.querySelector('.gps-config-close');
        const cancelBtn = modal.querySelector('.gps-config-cancel');
        const saveBtn = modal.querySelector('.gps-config-save');
        const resetBtn = modal.querySelector('.gps-config-reset');

        backdrop?.addEventListener('click', () => this.hideModal());
        closeBtn?.addEventListener('click', () => this.hideModal());
        cancelBtn?.addEventListener('click', () => this.cancelConfig());
        saveBtn?.addEventListener('click', () => this.saveConfig());
        resetBtn?.addEventListener('click', () => this.resetCurrentSection());

        // ConfigInput 컴포넌트의 변경 이벤트 감지
        modal.querySelectorAll('gps-config-input').forEach(input => {
            input.addEventListener('config-change', ((e: CustomEvent) => {
                const { key, value, section } = e.detail;
                const field = APP_CONFIG_FIELDS[key] || INDICATOR_CONFIG_FIELDS[key];
                if (field) {
                    const newConfig = { ...this.tempConfig };
                    this.setValueAtPath(newConfig, field.path, value);
                    this.tempConfig = newConfig;
                }
            }) as EventListener);
        });

        // 탭 전환 이벤트 추가
        this.elements.modal.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const tabId = target.dataset.tab;
                this.switchTab(tabId!);
            });
        });

        // Offset 설정 변경 감지
        this.elements.modal.querySelectorAll('.formula-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const mapId = Number(target.dataset.map!);
                const axis = target.dataset.axis!;
                
                if (!this.tempConfig.script.marker_offsets[mapId]) {
                    this.tempConfig.script.marker_offsets[mapId] = {
                        formula_x: '',
                        formula_y: ''
                    };
                }
                
                this.tempConfig.script.marker_offsets[mapId][axis === 'x' ? 'formula_x' : 'formula_y'] = target.value;
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
        this.tempConfig = persistentStore.getState().config as ConfigData;
        
        this.elements.inputs.forEach((input, key) => {
            const field = APP_CONFIG_FIELDS[key] || INDICATOR_CONFIG_FIELDS[key];
            if (field) {
                const value = this.getValueFromPath(this.tempConfig, field.path);

                if (input.type === 'checkbox') {
                    input.checked = value as boolean;
                } else if (input.type === 'color') {
                    input.value = value as string;
                } else {
                    input.value = String(value);
                }
            }
        });

        this.elements.modal.classList.add('show');
    }

    public hideModal(): void {
        this.elements.modal.classList.remove('show');
        this.tempConfig = persistentStore.getState().config as ConfigData;
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

    private resetCurrentSection(): void {
        const activeTab = this.elements.modal.querySelector('.tab-button.active');
        const currentSection = activeTab?.getAttribute('data-tab');
        
        const defaultConfig = getDefaultConfig();
        const newConfig = { ...this.tempConfig };

        // 현재 섹션에 해당하는 필드들만 초기화
        const currentFields = currentSection === 'general' ? APP_CONFIG_FIELDS : 
                            currentSection === 'indicator' ? INDICATOR_CONFIG_FIELDS : {};

        Object.entries(currentFields)
            .forEach(([key, field]) => {
                const defaultValue = this.getValueFromPath(defaultConfig, field.path);
                this.setValueAtPath(newConfig, field.path, defaultValue);
                
                // UI 업데이트
                const input = this.elements.inputs.get(key);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = defaultValue as boolean;
                    } else if (input.type === 'color') {
                        input.value = defaultValue as string;
                    } else {
                        input.value = String(defaultValue);
                        if (input.type === 'range') {
                            const tooltip = input.nextElementSibling as HTMLElement;
                            if (tooltip) tooltip.textContent = String(defaultValue);
                        }
                    }
                }
            });
        
        this.tempConfig = newConfig;
    }

    // 경로로부터 값을 가져오는 헬퍼 함수
    private getValueFromPath(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }

    // 경로에 값을 설정하는 헬퍼 함수
    private setValueAtPath(obj: any, path: string, value: any): void {
        const parts = path.split('.');
        const lastPart = parts.pop()!;
        const target = parts.reduce((acc, part) => acc[part], obj);
        target[lastPart] = value;
    }
}