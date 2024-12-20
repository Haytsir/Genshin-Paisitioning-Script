import { customElement } from '@src/libs/utils';
import styles from './styles.scss?inline';

interface DialogElements {
    dialog: HTMLDivElement;
    dialogTitle: HTMLHeadingElement;
    dialogContentText: HTMLDivElement;
    dialogMinimize: HTMLButtonElement;
    dialogClose: HTMLButtonElement;
    dialogContentProgress: HTMLDivElement;
    dialogContentProgressIn: HTMLDivElement;
}

export @customElement('gps-dialog')
class Dialog extends HTMLElement {
    private elements!: DialogElements;
    private isShowing = false;
    private isMinimized = false;
    private isProgressing = false;

    static get observedAttributes() {
        return ['title', 'content', 'closable', 'show'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        // 스타일 적용
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue || !this.elements) return;

        switch (name) {
            case 'title':
                this.elements.dialogTitle.textContent = newValue;
                break;
            case 'content':
                this.elements.dialogContentText.textContent = newValue;
                break;
            case 'show':
                this.toggleVisibility(newValue === 'true');
                break;
            case 'closable':
                this.toggleClass('closable', newValue === 'true');
                break;
        }
    }

    private render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="gps-dialog">
                <div class="gps-dialog-container">
                    <div class="gps-dialog-header">
                        <div class="gps-dialog-title-area">
                            <h3 class="gps-dialog-title"></h3>
                        </div>
                        <div class="gps-dialog-buttons">
                            <button class="gps-dialog-minimize" title="최소화">
                                <span>─</span>
                            </button>
                            <button class="gps-dialog-close" title="닫기">
                                <span>×</span>
                            </button>
                        </div>
                    </div>
                    <div class="gps-dialog-content">
                        <div class="gps-dialog-content-text"></div>
                        <div class="gps-dialog-progress">
                            <div class="gps-dialog-progress-in">
                                <div class="progress-percentage">0%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot!.appendChild(template.content.cloneNode(true));
        this.initializeElements();
    }

    private initializeElements() {
        const dialog = this.shadowRoot!.querySelector('.gps-dialog') as HTMLDivElement;
        this.elements = {
            dialog,
            dialogTitle: dialog.querySelector('.gps-dialog-title')!,
            dialogContentText: dialog.querySelector('.gps-dialog-content-text')!,
            dialogMinimize: dialog.querySelector('.gps-dialog-minimize')!,
            dialogClose: dialog.querySelector('.gps-dialog-close')!,
            dialogContentProgress: dialog.querySelector('.gps-dialog-progress')!,
            dialogContentProgressIn: dialog.querySelector('.gps-dialog-progress-in')!
        };
    }

    private setupEventListeners() {
        this.elements.dialogMinimize.addEventListener('click', this.minimize.bind(this));
        this.elements.dialogClose.addEventListener('click', this.close.bind(this));
    }

    private removeEventListeners() {
        this.elements.dialogMinimize.removeEventListener('click', this.minimize.bind(this));
        this.elements.dialogClose.removeEventListener('click', this.close.bind(this));
    }

    public alert(title: string, content: string, timeout = 0, closable = false) {
        this.setAttribute('title', title);
        this.setAttribute('content', content);
        this.setAttribute('closable', String(closable));
        this.setAttribute('show', 'true');

        if (timeout > 0) {
            setTimeout(() => this.close(null), timeout);
        }
    }

    private toggleVisibility(show: boolean) {
        this.toggleClass('show', show);
        this.isShowing = show;
        if(this.isMinimized && show) {
            this.toggleClass('new', true);
            setTimeout(() => this.toggleClass('new', false), 10);
        }
    }

    public close(_event: Event | null): void {
        this.setAttribute('show', 'false');
    }

    public showProgress() {
        this.elements.dialogContentProgress.style.display = 'block';
        this.elements.dialogContentProgressIn.style.width = '0%';
        this.isProgressing = true;
    }

    public changeProgress(percent: number) {
        if (this.isProgressing) {
            this.elements.dialogContentProgressIn.style.width = `${percent}%`;
            const percentageEl = this.shadowRoot!.querySelector('.progress-percentage');
            if (percentageEl) {
                percentageEl.textContent = `${Math.round(percent)}%`;
            }
        }
    }

    public hideProgress() {
        if (this.isProgressing) {
            this.elements.dialog.classList.add('complete');
            setTimeout(() => {
                this.elements.dialog.classList.remove('complete');
                this.elements.dialogContentProgress.style.display = 'none';
                this.elements.dialogContentProgressIn.style.width = '0%';
                this.isProgressing = false;
            }, 1000);  // 애니메이션이 끝난 후 상태 초기화
        }
    }

    private toggleClass(className: string, force?: boolean): void {
        if (!this.elements?.dialog) return;
        
        this.elements.dialog.classList.toggle(className, force);
    }

    public minimize(): void {
        this.isMinimized = !this.isMinimized;
        this.toggleClass('minimized', this.isMinimized);
    }

    // Getter methods
    get showing() { return this.isShowing; }
    get minimized() { return this.isMinimized; }
    get progressing() { return this.isProgressing; }
}