import { GM_getValue, GM_setValue } from "$";
import { ActionMenu } from "../../components/action-menu";
import { Dialog } from "../../components/dialog";
import { UserMarker } from "../../components/user-marker";
import { UpdateData, loadCvat } from "../cvat";
import { WebSocketManager } from "../ws";
import { Config, ConfigData } from "./config";

export class MapSite {
    static #instance: MapSite;
    public root: HTMLDivElement;
    public dialog: Dialog;
    public actionMenu: ActionMenu;
    public userMarker: UserMarker;
    public config!: Config;
    public siteHost: string;
    public isPinned: boolean;
    public currentMap: number;
    public ws: WebSocketManager;
    public mapElement: HTMLDivElement | null = null;
    public isActive: boolean = false;
    // Load 버튼을 비활성화 하는 컨트롤러
    private _loadAbortController = new AbortController();
    private _loadAbortSignal = this._loadAbortController.signal;
    // Load 상태에서 활성화되는 버튼을 비활성화시키는 컨트롤러
    private _activeAbortController = new AbortController();
    private _activeAbortSignal = this._activeAbortController.signal;

    static get instance(): MapSite {
        if(!MapSite.#instance) MapSite.#instance = new MapSite();
        return MapSite.#instance;
    }
    constructor() {
        this.root = document.createElement('div');
        this.root.id = 'gps-root';
        this.siteHost = location.host;
        this.root.classList.add(this.siteHost.replace(/\./g, '-'));
        this.actionMenu = new ActionMenu();
        this.root.appendChild(this.actionMenu.actionMenu);
        this.dialog = new Dialog();
        this.root.appendChild(this.dialog.dialog);
        this.userMarker = new UserMarker();
        this.ws = WebSocketManager.instance;

        this.ws.onGetConfig = (e, d) => this.onGetConfig(e, d);
        this.ws.onAppUpdateProgress = (e, d) => this.onAppUpdateProgress(e, d);
        this.ws.onAppUpdateDone = (e, d) => this.onAppUpdateDone(e, d);
        this.ws.onLibUpdateProgress = (e, d) => this.onLibUpdateProgress(e, d);
        this.ws.onLibUpdateDone = (e, d) => this.onLibUpdateDone(e, d);

        // 다른 데이터를 필요로 하지 않고, 단순히 이벤트를 받기만 하는 경우에는 유연함을 위해 별도로 이벤트 리스너를 등록한다.
        this.ws.addSocketEventListener('close', (e) => this.onSocketClose(e));
        this.actionMenu.actionConnect.addEventListener('click', (e) => this.onClickLoadPluginBtn(e, false), {signal: this._loadAbortSignal});
        this.actionMenu.actionConnect.addEventListener('contextmenu', (e) => this.onClickLoadPluginBtn(e, true), {signal: this._loadAbortSignal});
        this.actionMenu.actionPin.addEventListener('click', (e) => this.onClickPinBtn(e));
        this.actionMenu.actionPin.addEventListener('contextmenu', (e) => this.onRightClickPinBtn(e));
        this.isPinned = true;
        if(this.isPinned) {
            this.userMarker.userMarker.classList.add('gps-pinned')
            this.actionMenu.actionPin.classList.add('gps-pinned');
        }
        this.currentMap = 0;
    }
    onClickLoadPluginBtn(event: MouseEvent, debug: boolean) {
        this._loadAbortController.abort();
        event.preventDefault();
        event.stopPropagation();
        this.loadPlugin(debug);
    }
    loadPlugin(debug: boolean) {
        loadCvat(debug);
        GM_setValue('debug', debug);
        this.ws.getSocket().then((socket) => {
            if(socket == null) {
                this.dialog.alertDialog('GPS', 'GPA에 연결할 수 없습니다. 앱이 켜져있는지 확인해주세요.', 10000);
                this.onAppDeactivate();
            }
        });
    }
    onClickPinBtn(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.togglePin();
    }
    onRightClickPinBtn(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        // $map.control.debugCapture();
    }
    onStartAppUpdate(_event: MessageEvent, data: UpdateData) {
        this.dialog.alertDialog('GPS', `GPA ${data.targetVersion} 버전 업데이트 중...`, 0, false);
        this.dialog.showProgress();
    }

    onAppUpdateProgress(event: MessageEvent, data: UpdateData) {
        if(!this.dialog.isProgressing) {
            this.onStartAppUpdate(event, data)
        }
        this.dialog.changeProgress(data.percent);
    }

    onAppUpdateDone(_event: MessageEvent, data: UpdateData) {
        if(this.dialog.isShowing && this.dialog.isProgressing) {
            this.dialog.closeDialog(null, `GPA ${data.targetVersion} 버전 업데이트 중...`);
            this.dialog.hideProgress();
        }
        if(data.updated) {
            // 모든 과정을 초기화하고 다시 시작.
            this.dialog.alertDialog('GPS', 'GPA가 업데이트 되었습니다. 다시 시작합니다. 진행되지 않으면, 페이지를 새로고침 해주세요.');
            this.ws.closeSocket();
            this.onAppDeactivate();
            this.loadPlugin(GM_getValue('debug', false));
        }
    }

    onStartLibUpdate(_event: MessageEvent, data: UpdateData) {
        this.dialog.alertDialog('GPS', `라이브러리 ${data.targetVersion} 버전 업데이트 중...`, 0, false);
        this.dialog.showProgress();
    }

    onLibUpdateProgress(event: MessageEvent, data: UpdateData) {
        console.debug("onLibUpdateProgress")
        if(!this.dialog.isProgressing) {
            this.onStartLibUpdate(event, data)
        }
        this.dialog.changeProgress(data.percent);
    }

    onLibUpdateDone(_event: MessageEvent, data: UpdateData) {
        console.debug("onLibUpdateDone")
        if(this.dialog.isShowing && this.dialog.isProgressing) {
            this.dialog.closeDialog(null, `라이브러리 ${data.targetVersion} 버전 업데이트 중...`);
            this.dialog.hideProgress();
        }
    }
    onSocketClose(_event: Event) {
        this.onAppDeactivate();
    }

    onGetConfig(_event:MessageEvent, config: ConfigData) {
        this.config = new Config({
            autoAppUpdate: GM_getValue('autoAppUpdate', true),
            autoLibUpdate: GM_getValue('autoLibUpdate', true),
            captureInterval: config.captureInterval,
            captureDelayOnError: config.captureDelayOnError,
            useBitBltCaptureMode: config.useBitBltCaptureMode,
        });
        // Config을 얻었다는 것은 GPA가 연결되었다는 것, 활성화가 된 것으로 표시한다.
        this.onAppActivate(config)
        this.config.onConfigChanged = (c) => this.onConfigChanged(c);
    }
    onAppActivate(_config: ConfigData) {
        this.isActive = true;
        this.dialog.hideProgress();
        document.body.classList.add('gps-activated');
        this.actionMenu.actionMenu.classList.add('gps-active');
        this.actionMenu.actionConnect.classList.add('gps-active');
        this.actionMenu.actionConfig.classList.add('gps-active');

        this._loadAbortController.abort();

        this._activeAbortController = new AbortController();
        this._activeAbortSignal = this._activeAbortController.signal;
        this.actionMenu.actionConfig.addEventListener('click', (e) => this.config.modal.showModal(e), {signal: this._activeAbortSignal});

    }
    onAppDeactivate() {
        this.isActive = false;
        this._loadAbortController = new AbortController();
        this._loadAbortSignal = this._loadAbortController.signal;
        this.actionMenu.actionConnect.addEventListener('click', (e) => this.onClickLoadPluginBtn(e, false), {signal: this._loadAbortSignal});
        this.actionMenu.actionConnect.addEventListener('contextmenu', (e) => this.onClickLoadPluginBtn(e, true), {signal: this._loadAbortSignal});

        document.body.classList.remove('gps-activated');
        this.actionMenu.actionMenu.classList.remove('gps-active');
        this.actionMenu.actionConnect.classList.remove('gps-active');
        this.actionMenu.actionConfig.classList.remove('gps-active');
        this._activeAbortController.abort();
    }
    onConfigChanged(config: ConfigData) {
        GM_setValue('autoAppUpdate', config.autoAppUpdate);
        GM_setValue('autoLibUpdate', config.autoLibUpdate);
        this.ws.sendConfig(config);
    }
    setFocusScroll(_x: number, _y: number) {}
    appendUserMarker(parent: Element) {
        parent.appendChild(this.userMarker.userMarker);
    }
    setPinned(p: boolean) {
        this.isPinned = p;
        if (this.isPinned) {
            this.actionMenu.actionPin.classList.add('gps-pinned');
            if(this.userMarker.userMarker) {
                this.userMarker.userMarker.classList.add('gps-pinned')
                let x, y;
                let t, s, l, c;
                t = 'translate'
                s = this.userMarker.userMarker.style["transform"].indexOf(t) + t.length + 1;
                l = this.userMarker.userMarker.style["transform"].indexOf(')', s);
                c = this.userMarker.userMarker.style["transform"].substring(s, l);

                if (c) {
                    [x, y] = c.split(', ')
                    x = parseInt(x)
                    y = parseInt(y)
                    this.setFocusScroll(x, y)
                }
            }
        } else {
            this.actionMenu.actionPin.classList.remove('gps-pinned');
            if(this.userMarker.userMarker)
                this.userMarker.userMarker.classList.remove('gps-pinned')
        }
    }
    togglePin() {
        this.setPinned(!this.isPinned);
    }
    drawUserIcon() {
        const userIcon = document.createElement('div');
        userIcon.className = 'gps-user-icon';
        this.root.appendChild(userIcon);
    }
}