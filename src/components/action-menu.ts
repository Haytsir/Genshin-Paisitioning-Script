import logoPin from '../static/pin-follow.svg';
import logoConnect from '../static/pin-connect.svg';
import logoShare from '../static/pin-share.svg';

export class ActionMenu {
    public actionMenu: HTMLDivElement;
    public actionPin: HTMLDivElement;
    public actionConnect: HTMLDivElement;
    public actionShare: HTMLDivElement;

    constructor() {
        this.actionMenu = document.createElement('div');
        this.actionMenu.className = 'gps-action';

        this.actionPin = document.createElement('div');
        this.actionPin.className = 'maps-menu gps-pin';
        this.actionPin.title = '내 위치로 이동';
        this.actionPin.innerHTML = `<img src=${logoPin} alt="Pin" class="gps-action-icon" /><p>내 위치로 이동</p>`;
        this.actionMenu.append(this.actionPin);

        this.actionConnect = document.createElement('div');
        this.actionConnect.className = 'maps-menu gps-connect';
        this.actionConnect.title = '플러그인 연결'
        this.actionConnect.innerHTML = `<img src=${logoConnect} alt="Load" class="gps-action-icon" /><p>실시간 연결</p>`
        this.actionMenu.append(this.actionConnect);

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