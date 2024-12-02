import { customElement } from '@src/libs/utils';
import styles from './styles.scss?inline';

interface ToastMessage {
    id: string;
    type: 'error' | 'warning' | 'success';
    title: string;
    content: string;
    details?: string;
    timestamp: number;
    expanded?: boolean;
    minimized?: boolean;
}

@customElement('gps-toast')
export class Toast extends HTMLElement {
    private messages: Set<ToastMessage> = new Set();
    private timers: Map<string, number> = new Map();
    private readonly MAX_MESSAGES = 5;
    private readonly AUTO_DISMISS_DELAY = 5000;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadow.adoptedStyleSheets = [styleSheet];

        this.render();
    }

    private render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="gps-toast-container"></div>
        `;
        this.shadowRoot!.appendChild(template.content.cloneNode(true));
    }

    public show(type: ToastMessage['type'], title: string, content: string, details?: string) {
        const id = this.generateMessageId(content);
        
        if (this.hasMessage(id)) {
            this.refreshTimer(id);
            return;
        }

        const message: ToastMessage = {
            id,
            type,
            title,
            content,
            details,
            timestamp: Date.now(),
            expanded: false,
            minimized: false
        };

        this.addMessage(message);
        this.renderMessage(message);
        this.scheduleAutoDismiss(message);
    }

    private generateMessageId(content: string): string {
        return content.trim().toLowerCase();
    }

    private hasMessage(id: string): boolean {
        return Array.from(this.messages).some(msg => msg.id === id);
    }

    private addMessage(message: ToastMessage) {
        if (this.messages.size >= this.MAX_MESSAGES) {
            const oldestMessage = Array.from(this.messages)[0];
            this.removeMessage(oldestMessage.id);
        }
        this.messages.add(message);
    }

    private renderMessage(message: ToastMessage) {
        const container = this.shadowRoot!.querySelector('.gps-toast-container');
        const toast = document.createElement('div');
        toast.className = `toast-item ${message.type} ${message.minimized ? 'minimized' : ''}`;
        toast.dataset.id = message.id;
        
        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-message">${message.content}</div>
                <div class="toast-actions">
                    ${message.details ? `
                        <button class="toast-details" title="자세히 보기">
                            <span class="details-icon">›</span>
                        </button>
                    ` : ''}
                    <button class="toast-minimize" title="최소화">─</button>
                    <button class="toast-close" title="닫기">×</button>
                </div>
            </div>
            ${message.details ? `
                <div class="toast-details-content">${message.details}</div>
            ` : ''}
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn?.addEventListener('click', () => this.removeMessage(message.id));

        const minimizeBtn = toast.querySelector('.toast-minimize');
        minimizeBtn?.addEventListener('click', () => {
            message.minimized = !message.minimized;
            toast.classList.toggle('minimized', message.minimized);
        });

        const detailsBtn = toast.querySelector('.toast-details');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => {
                if (!message.minimized) {
                    message.expanded = !message.expanded;
                    toast.classList.toggle('expanded', message.expanded);
                    (detailsBtn.querySelector('.details-icon') as HTMLElement).style.transform = 
                        message.expanded ? 'rotate(90deg)' : 'rotate(0deg)';
                }
            });
        }

        toast.addEventListener('click', () => {
            if (message.minimized) {
                message.minimized = false;
                toast.classList.remove('minimized');
            }
        });

        const buttons = toast.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        container?.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
    }

    private removeMessage(id: string) {
        const timer = this.timers.get(id);
        if (timer) {
            window.clearTimeout(timer);
            this.timers.delete(id);
        }

        const toast = this.shadowRoot!.querySelector(`.toast-item[data-id="${id}"]`);
        if (toast) {
            toast.classList.remove('show');
            
            const handleTransitionEnd = () => {
                toast.removeEventListener('transitionend', handleTransitionEnd);
                toast.remove();
                this.messages.delete(Array.from(this.messages).find(m => m.id === id)!);
            };
            
            toast.addEventListener('transitionend', handleTransitionEnd);
        }
    }

    private refreshTimer(id: string) {
        const existingTimer = this.timers.get(id);
        if (existingTimer) {
            window.clearTimeout(existingTimer);
        }

        const timer = window.setTimeout(() => {
            this.removeMessage(id);
        }, this.AUTO_DISMISS_DELAY);

        this.timers.set(id, timer);

        const toast = this.shadowRoot!.querySelector(`.toast-item[data-id="${id}"]`);
        if (toast) {
            toast.classList.add('refresh');
            setTimeout(() => toast.classList.remove('refresh'), 200);
        }
    }

    private scheduleAutoDismiss(message: ToastMessage) {
        const timer = window.setTimeout(() => {
            this.removeMessage(message.id);
        }, this.AUTO_DISMISS_DELAY);

        this.timers.set(message.id, timer);
    }
} 