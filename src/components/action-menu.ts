import logoConnect from '../static/pin-connect.svg';
import logoSettigns from '../static/config.svg';
import logoShare from '../static/pin-share.svg';

export class ActionMenu {
    public actionMenu: HTMLDivElement;
    public actionPin: HTMLDivElement;
    public actionConnect: HTMLDivElement;
    public actionConfig: HTMLDivElement;
    public actionShare: HTMLDivElement;

    constructor() {
        this.actionMenu = document.createElement('div');
        this.actionMenu.className = 'gps-action';

        this.actionPin = document.createElement('div');
        this.actionPin.className = 'maps-menu gps-pin';
        this.actionPin.title = '내 위치로 이동';
        this.actionPin.innerHTML = `<svg viewBox="0 0 1024 1024"><path d="M176 478.208l275.328 91.733333c1.28 0.426667 2.261333 1.408 2.688 2.688l91.733333 275.328a4.266667 4.266667 0 0 0 7.978667 0.341334l279.381333-651.861334a4.266667 4.266667 0 0 0-5.589333-5.589333L175.658667 470.186667a4.266667 4.266667 0 0 0 0.341333 7.978666z"></path></svg>
        <p>따라가기</p>`;
        this.actionMenu.append(this.actionPin);

        this.actionConnect = document.createElement('div');
        this.actionConnect.className = 'maps-menu gps-connect';
        this.actionConnect.title = '플러그인 연결'
        this.actionConnect.innerHTML = `<img src=${logoConnect} alt="Load" class="gps-action-icon" /><p>실시간 연결</p>`
        this.actionMenu.append(this.actionConnect);

        this.actionConfig = document.createElement('div');
        this.actionConfig.className = 'maps-menu gps-config hide';
        this.actionConfig.title = '설정'
        this.actionConfig.innerHTML = `<img src=${logoSettigns} alt="Load" class="gps-action-icon" /><p>설정</p>`
        this.actionMenu.append(this.actionConfig);

        this.actionShare = document.createElement('div');
        this.actionShare.className = 'maps-menu gps-share';
        this.actionShare.style.display = 'none';
        this.actionShare.title = '멀티스크린 공유'
        this.actionShare.innerHTML = `<img src=${logoShare} alt="QR Code" class="gps-action-icon" /><p>멀티스크린</p>`;
        const actionShareDot = document.createElement('div');
        actionShareDot.className = 'gps-share-dot';
        actionShareDot.innerText = '0';
        this.actionShare.append(actionShareDot);
        this.actionMenu.append(this.actionShare)
    }
}