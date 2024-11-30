import { customElement } from '@src/libs/utils';
import styles from './styles.scss?inline';
import { AppConfigData, getDefaultConfig } from "@src/libs/sites/config";
import { persistentStore } from '@src/libs/store';

// 설정 경로를 위한 타입 정의
type PathsToStringProps<T> = T extends object
    ? {
        [K in keyof T]: T[K] extends object
            ? `${string & K}.${PathsToStringProps<T[K]>}`
            : string & K
    }[keyof T]
    : never;

type ConfigPath = PathsToStringProps<AppConfigData>;

interface ConfigField {
    label: string;
    type: 'checkbox' | 'number' | 'color' | 'range';
    section: 'app' | 'indicator';
    path: ConfigPath;  // 전체 경로를 문자열로 저장
    min?: number;
    max?: number;
    step?: number;
}

const CONFIG_FIELDS: Record<string, ConfigField> = {
    // App 섹션
    auto_app_update: {
        label: '앱 자동 업데이트',
        type: 'checkbox',
        section: 'app',
        path: 'app.auto_app_update'
    },
    auto_lib_update: {
        label: '라이브러리 자동 업데이트',
        type: 'checkbox',
        section: 'app',
        path: 'app.auto_lib_update'
    },
    capture_interval: {
        label: '화면 캡쳐 간격',
        type: 'number',
        section: 'app',
        path: 'app.capture_interval'
    },
    capture_delay_on_error: {
        label: '캡쳐 에러 시 대기 시간',
        type: 'number',
        section: 'app',
        path: 'app.capture_delay_on_error'
    },
    use_bit_blt_capture_mode: {
        label: '비트블럭 캡쳐 모드 사용',
        type: 'checkbox',
        section: 'app',
        path: 'app.use_bit_blt_capture_mode'
    },
    // Indicator 섹션
    show_user_indicator: {
        label: '표시 활성화',
        type: 'checkbox',
        section: 'indicator',
        path: 'script.marker_indicator.show_user_indicator'
    },
    indicator_size: {
        label: '표시 크기',
        type: 'range',
        section: 'indicator',
        path: 'script.marker_indicator.indicator_size',
        min: 30,
        max: 100,
        step: 5
    },
    indicator_color: {
        label: '표시 색상',
        type: 'color',
        section: 'indicator',
        path: 'script.marker_indicator.indicator_color'
    },
    indicator_initial_opacity: {
        label: '시작 투명도',
        type: 'range',
        section: 'indicator',
        path: 'script.marker_indicator.indicator_initial_opacity',
        min: 0,
        max: 1,
        step: 0.05
    },
    indicator_duration: {
        label: '애니메이션 지속 시간',
        type: 'range',
        section: 'indicator',
        path: 'script.marker_indicator.indicator_duration',
        min: 3,
        max: 10,
        step: 0.5
    }
};

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

        this.tempConfig = { ...persistentStore.getState().config };

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

    private createGeneralConfigInputs(): string {
        return Object.entries(CONFIG_FIELDS)
            .filter(([_, field]) => field.section === 'app')
            .map(([key, field]) => this.createConfigInput(key, field))
            .join('');
    }

    private createIndicatorConfigInputs(): string {
        return Object.entries(CONFIG_FIELDS)
            .filter(([_, field]) => field.section === 'indicator')
            .map(([key, field]) => this.createConfigInput(key, field))
            .join('');
    }

    private createConfigInput(key: string, field: ConfigField): string {
        const value = this.getValueFromPath(this.tempConfig, field.path);
        
        switch (field.type) {
            case 'checkbox':
                return this.createToggleSwitch(field.label, key, value as boolean, field.section);
            case 'range':
                return `
                    <div class="config-item">
                        <label class="config-label">${field.label}</label>
                        <div class="range-container">
                            <input type="range" class="range-input" 
                                data-key="${key}" 
                                data-section="${field.section}"
                                min="${field.min}" 
                                max="${field.max}" 
                                step="${field.step}"
                                value="${value}">
                            <div class="range-tooltip">${value}</div>
                        </div>
                    </div>
                `;
            case 'color':
                return `
                    <div class="config-item">
                        <label class="config-label">${field.label}</label>
                        <input type="color" class="color-input" 
                            data-key="${key}" 
                            data-section="${field.section}"
                            value="${value}">
                    </div>
                `;
            default:
                return this.createNumberInput(field.label, key, value as number, field.section);
        }
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

        // 입력 요소들의 변경 감지
        modal.querySelectorAll('input').forEach(input => {
            const key = input.dataset.key!;
            const field = CONFIG_FIELDS[key];
            this.elements.inputs.set(key, input);
            
            input.addEventListener('change', () => {
                const newConfig = { ...this.tempConfig };
                const value = this.getInputValue(input, field.type);
                this.setValueAtPath(newConfig, field.path, value);
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

        // range input의 실시간 값 업데이트
        modal.querySelectorAll('.range-input').forEach(input => {
            const tooltip = input.nextElementSibling as HTMLElement;
            const rangeInput = input as HTMLInputElement;
            
            const updateTooltip = () => {
                const value = rangeInput.value;
                console.log(`updateTooltip value: ${value}`);
                const min = Number(rangeInput.min) || 0;
                console.log(`updateTooltip min: ${min}`);
                const max = Number(rangeInput.max) || 100;
                console.log(`updateTooltip max: ${max}`);
                const range = max - min;
                
                // thumb의 반지름을 고려한 위치 계산
                const thumbRadius = 8; // thumb의 반지름 (CSS와 일치해야 함)
                const trackWidth = rangeInput.offsetWidth - (thumbRadius * 2);
                console.log(`updateTooltip trackWidth: ${trackWidth}`);
                const percent = ((Number(value) - min) / range);
                console.log(`updateTooltip percent: ${percent}`);
                const thumbPosition = (percent * trackWidth) + thumbRadius;
                console.log(`updateTooltip thumbPosition: ${thumbPosition}`);
                
                tooltip.textContent = value;
                tooltip.style.left = `${thumbPosition}px`;
            };

            // 초기 위치 설정 (DOM이 완전히 로드된 후)
            setTimeout(updateTooltip, 0);
            
            // 값 변경 시 업데이트
            rangeInput.addEventListener('input', updateTooltip);
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
            const field = CONFIG_FIELDS[key];
            const value = this.getValueFromPath(this.tempConfig, field.path);

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

    private createToggleSwitch(label: string, key: string, value: boolean, section: 'app' | 'indicator'): string {
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

    private createNumberInput(label: string, key: string, value: number, section: 'app' | 'indicator'): string {
        return `
            <div class="config-item">
                <label class="config-label">${label}</label>
                <input type="number" class="number-input" data-key="${key}" value="${value}">
            </div>
        `;
    }

    private getInputValue(input: HTMLInputElement, type: ConfigField['type']): any {
        switch (type) {
            case 'checkbox':
                return input.checked;
            case 'color':
                return input.value;
            default:
                return Number(input.value);
        }
    }

    private resetCurrentSection(): void {
        const activeTab = this.elements.modal.querySelector('.tab-button.active');
        const currentSection = activeTab?.getAttribute('data-tab') === 'general' ? 'app' : 'indicator';
        
        const defaultConfig = getDefaultConfig();
        const newConfig = { ...this.tempConfig };

        // 현재 섹션에 해당하는 필드들만 초기화
        Object.entries(CONFIG_FIELDS)
            .filter(([_, field]) => field.section === currentSection)
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