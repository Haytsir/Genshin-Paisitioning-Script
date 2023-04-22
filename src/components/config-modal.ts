import { ConfigData } from "../libs/sites/config";

type ConfigItem = {
    configKey: keyof ConfigData;
    label: string;
    defaultValue: any;
    type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
}

export class ConfigModal {
    private static _instance: ConfigModal;
    private config: any;
    private configItems: ConfigItem[] = [];

    public modal: HTMLDivElement;
    public btnSave: HTMLButtonElement;
    public btnCancel: HTMLButtonElement;
    public onSaveConfig: (config: ConfigData) => void = () => {};

    static getInstance(config: ConfigData): ConfigModal {
        if(!ConfigModal._instance) ConfigModal._instance = new ConfigModal(config);
        return ConfigModal._instance;
    }

    private constructor(config: ConfigData) {
        this.config = config;
        for(const key in config) {
            let label: string = "";
            if(key === 'autoAppUpdate') label = '앱 자동 업데이트';
            else if(key === 'autoLibUpdate') label = '라이브러리 자동 업데이트';
            else if(key === 'captureInterval') label = '화면 캡쳐 간격';
            else if(key === 'captureDelayOnError') label = '캡쳐 에러 시 대기 시간';
            else if(key === 'useBitBltCaptureMode') label = '비트블럭 캡쳐 모드 사용';
            this.configItems.push({
                configKey: key as keyof ConfigData,
                label: label,
                defaultValue: config[key as keyof ConfigData],
                type: typeof config[key as keyof ConfigData]
            });
        }
        /* ========== Modal 생성 ========== */

        this.modal = document.createElement('div');
        this.modal.className = 'gps-config-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'gps-config-modal-content';
        this.modal.appendChild(modalContent);

        /* ========== Header 생성 ========== */

        const modalContentHeader = document.createElement('div');
        modalContentHeader.className = 'gps-config-modal-content-header';
        modalContent.appendChild(modalContentHeader);

        /* ==== Title 생성 ==== */
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'gps-config-modal-title';
        modalTitle.innerText = '설정';
        modalContentHeader.appendChild(modalTitle);
        /* ==== 닫기 Button 생성 ==== */
        const modalClose = document.createElement('div');
        modalClose.className = 'gps-config-close';
        modalClose.innerText = '&times;';
        modalContentHeader.appendChild(modalClose);

        /* ========== Body 생성 ========== */
        const modalContentBody = document.createElement('div');
        modalContentHeader.className = 'gps-config-modal-content-body';
        modalContent.appendChild(modalContentBody);
        
        this.configItems.forEach((item: ConfigItem, index: number) => {
            const configItem = document.createElement('div');
            configItem.className = 'gps-config-item';
            modalContentBody.appendChild(configItem);

            const configItemLabel = document.createElement('label');
            configItemLabel.className = 'gps-config-item-label';
            configItemLabel.innerText = item.label;
            configItemLabel.htmlFor = `gps-config-${index}`;
            configItem.appendChild(configItemLabel);

            if(item.type === 'boolean') {
                const configItemValue = document.createElement('label');
                configItemValue.className = 'gps-config-value gps-config-switch';
                configItem.appendChild(configItemValue);

                const configItemInput = document.createElement('input');
                configItemInput.id = `gps-config-${index}`;
                configItemInput.type = 'checkbox';
                configItemInput.checked = item.defaultValue;
                
                configItemInput.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement;
                    this.config[item.configKey as keyof ConfigData] = target.checked;
                });
                configItemValue.appendChild(configItemInput);
                
                const configToggleSlider = document.createElement('span');
                configToggleSlider.className = 'gps-config-slider';
                configItemValue.appendChild(configToggleSlider);
            } else if(item.type === 'number') {
                const configItemValue = document.createElement('div');
                configItemValue.className = 'gps-config-value';
                configItem.appendChild(configItemValue);

                const configItemInput = document.createElement('input');
                configItemInput.className = 'gps-config-item-input';
                configItemInput.id = `gps-config-${index}`;
                configItemInput.type = item.type;
                configItemInput.min = '100';
                configItemInput.max = '60000';
                configItemInput.value = item.defaultValue;
                configItemInput.maxLength = 5;
                configItemInput.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement;
                    this.config[item.configKey as keyof ConfigData] = parseInt(target.value);
                });
                configItemValue.appendChild(configItemInput);
            }
        });

        /* ========== Footer 생성 ========== */

        const modalContentFooter = document.createElement('div');
        modalContentHeader.className = 'gps-config-modal-content-footer';
        modalContent.appendChild(modalContentFooter);
        
        /* ==== 저장 Button 생성 ==== */
        this.btnSave = document.createElement('button');
        this.btnSave.className = 'gps-config-btn save';
        this.btnSave.innerText = '저장';
        modalContentFooter.appendChild(this.btnSave);

        /* ==== 취소 Button 생성 ==== */
        this.btnCancel = document.createElement('button');
        this.btnCancel.className = 'gps-config-btn cancel';
        this.btnCancel.innerText = '취소';
        modalContentFooter.appendChild(this.btnCancel);

        document.body.appendChild(this.modal);

        /* ========== Event 생성 ========== */
        modalClose.addEventListener('click', () => {
            this.hideModal();
        });

        this.btnCancel.addEventListener('click', () => {
            this.hideModal();
        });

        this.btnSave.addEventListener('click', () => {
            this.hideModal();
            this.onSaveConfig(this.config);
        });
    }

    showModal() {
        this.modal.classList.add('show');
    }

    hideModal() {
        this.modal.classList.remove('show');
    }
}

/*
<div id="modal" class="gps-config-modal">
        <div class="gps-config-modal-content">
            <div class="gps-config-modal-content-header">
                <h2 class="gps-config-modal-title">설정</h2>
                <div class="gps-config-close">&times;</div>
            </div>
            <div class="gps-config-modal-content-body">
                <label class="gps-config-label" for="gps-config-auto-update-gps">GPS앱 자동 업데이트</label>
                <label class="gps-config-value gps-config-switch">
                    <input type="checkbox" id="gps-config-auto-update-gps">
                    <span class="gps-config-slider"></span>
                </label>

                <label class="gps-config-label" for="gps-config-auto-update-lib">cvAutoTrack 라이브러리 자동 업데이트</label>
                <label class="gps-config-value gps-config-switch">
                    <input type="checkbox" id="gps-config-auto-update-lib">
                    <span class="gps-config-slider"></span>
                </label>

                <label class="gps-config-label" for="gps-config-time-capture-interval">화면 캡처 간격</label>
                <div>
                    <input maxlength="5" type="text" id="gps-config-time-capture-interval"
                        class="gps-config-value gps-config-time-input"></input>
                    <span class="gps-config-time-input-label ms"></span>
                </div>

                <label class="gps-config-label" for="gps-config-time-capture-delay-on-error">캡처 실패시 딜레이</label>
                <div>
                    <input maxlength="5" type="text" id="gps-config-time-capture-delay-on-error"
                        class="gps-config-value gps-config-time-input"></input>
                    <span class="gps-config-time-input-label ms"></span>
                </div>
            </div>
            <div class="gps-config-modal-content-footer">
                <button class="gps-config-btn save">저장</button>
                <button class="gps-config-btn cancel">취소</button>
            </div>
        </div>
    </div>
*/