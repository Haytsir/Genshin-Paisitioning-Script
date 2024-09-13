export class ActionMenuItem extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.className = this.getAttribute('class') || '';
        this.title = this.getAttribute('title') || '';
        if(this.hasAttribute('logo')) {
            const logo = this.hasAttribute('mask') ? document.createElement('div') : new Image();
            if (!this.hasAttribute('mask')) {
                if(logo instanceof Image) {
                    logo.src = this.getAttribute('logo') || '';
                    logo.alt = this.getAttribute('title') || '';
                }
            } else {
                if(logo instanceof HTMLDivElement) {
                    logo.className = 'mask-image';
                    logo.style.maskImage = `url(${this.getAttribute('logo')})`;
                }
            }
            this.appendChild(logo);
        }
        const connectP = document.createElement('p');
        connectP.textContent = this.getAttribute('text') || '';
        this.appendChild(connectP);
    }

    disconnectedCallback() {
        // 웹 컴포넌트가 DOM에서 제거될 때 실행되는 로직을 여기에 작성합니다.
    }
}