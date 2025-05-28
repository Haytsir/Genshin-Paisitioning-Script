import { customElement } from "@src/libs/utils";

@customElement('gps-action-menu-item')
export class ActionMenuItem extends HTMLElement {
    
    private readonly menuItemSlot: HTMLSlotElement;
    public static readonly LOGO_TYPES = {
        image: 'image',
        svg: 'svg'
    } as const;

    constructor() {
        super();
        this.menuItemSlot = document.createElement('slot');
        this.attachShadow({mode: 'open'}).append(this.menuItemSlot);
    }

    // 로고 생성
    private createLogo(type: keyof typeof ActionMenuItem.LOGO_TYPES = ActionMenuItem.LOGO_TYPES.image) {
        const container = document.createElement('div');
        container.className = 'logo-container';
        
        if (type === ActionMenuItem.LOGO_TYPES.svg) {
            container.innerHTML = this.getAttribute('logo') || '';
        } else {
            const img = new Image();
            img.src = this.getAttribute('logo') || '';
            img.alt = this.getAttribute('title') || '';
            container.appendChild(img);
        }
        
        return container;
    }

    // 텍스트 요소 생성
    private createTextElement(): HTMLParagraphElement {
        const textElement = document.createElement('p');
        textElement.textContent = this.getAttribute('text') || '';
        return textElement;
    }

    connectedCallback() {
        this.initializeAttributes();
        if (this.hasAttribute('logo')) {
            this.appendChild(this.createLogo(this.getAttribute('logoType') as keyof typeof ActionMenuItem.LOGO_TYPES));
        }
        this.appendChild(this.createTextElement());
    }

    private initializeAttributes(): void {
        this.className = this.getAttribute('class') || '';
        this.title = this.getAttribute('title') || '';
    }

    disconnectedCallback() {
        this.cleanup();
    }

    private cleanup(): void {
        // 이벤트 리스너가 있다면 제거
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
    }
}