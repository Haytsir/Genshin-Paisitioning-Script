import { GM_getValue, GM_setValue } from "$";
import { ActionMenu } from "../../components/action-menu";
import { Dialog } from "../../components/dialog";
import { UserMarker } from "../../components/user-marker";
import { loadCvat } from "../cvat";
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
    private _loadAbortController = new AbortController();
    private _loadAbortSignal = this._loadAbortController.signal;

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

        this.actionMenu.actionConnect.addEventListener('click', (e) => this.onClickLoadPluginBtn(e, false), {signal: this._loadAbortSignal});
        this.actionMenu.actionConnect.addEventListener('contextmenu', (e) => this.onClickLoadPluginBtn(e, true), {signal: this._loadAbortSignal});
        this.actionMenu.actionPin.addEventListener('click', (e) => this.onClickPinBtn(e));
        this.actionMenu.actionPin.addEventListener('contextmenu', (e) => this.onRightClickPinBtn(e));
        this.isPinned = true;
        if(this.isPinned) {
            this.userMarker.userMarker.classList.add('gps-pinned')
            this.actionMenu.actionPin.classList.add('gps-active');
        }
        this.currentMap = 0;
    }
    onClickLoadPluginBtn(event: MouseEvent, debug: boolean) {
        this._loadAbortController.abort();
        event.preventDefault();
        event.stopPropagation();
        loadCvat(debug);
        this.ws.getSocket().then((socket) => {
            if(socket == null) {
                this.dialog.alertDialog('GPS', 'GPA에 연결할 수 없습니다. 앱이 켜져있는지 확인해주세요.');
                this._loadAbortController = new AbortController();
                this._loadAbortSignal = this._loadAbortController.signal;
                this.actionMenu.actionConnect.addEventListener('click', (e) => this.onClickLoadPluginBtn(e, false), {signal: this._loadAbortSignal});
                this.actionMenu.actionConnect.addEventListener('contextmenu', (e) => this.onClickLoadPluginBtn(e, true), {signal: this._loadAbortSignal});
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
    onGetConfig(_event:MessageEvent, config: ConfigData) {
        this.config = new Config({
            autoAppUpdate: GM_getValue('autoAppUpdate', true),
            autoLibUpdate: GM_getValue('autoLibUpdate', true),
            captureInterval: config.captureInterval,
            captureDelayOnError: config.captureDelayOnError,
            useBitBltCaptureMode: config.useBitBltCaptureMode,
        });
        this.actionMenu.actionConfig.classList.remove('hide');
        this.actionMenu.actionConfig.addEventListener('click', (e) => this.config.modal.showModal(e));
        this.config.onConfigChanged = (c) => this.onConfigChanged(c);
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
            this.actionMenu.actionPin.classList.add('gps-active');
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
            this.actionMenu.actionPin.classList.remove('gps-active');
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