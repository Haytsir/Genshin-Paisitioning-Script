export class ActionMenuItem extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.className = this.getAttribute('class') || '';
        this.title = this.getAttribute('title') || '';
    }

    disconnectedCallback() {
        // 웹 컴포넌트가 DOM에서 제거될 때 실행되는 로직을 여기에 작성합니다.
    }
}