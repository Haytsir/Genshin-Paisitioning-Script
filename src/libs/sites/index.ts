import { ActionMenu } from "../../components/action-menu";
import { Dialog } from "../../components/dialog";
import { UserMarker } from "../../components/user-marker";
import { loadCvat } from "../cvat";
import { WebSocketManager } from "../ws";

export class MapSite {
    static #instance: MapSite;
    public root: HTMLDivElement;
    public dialog: Dialog;
    public actionMenu: ActionMenu;
    public userMarker: UserMarker;
    public siteHost: string;
    public isPinned: boolean;
    public currentMap: number;
    public ws: WebSocketManager;
    public mapElement: HTMLDivElement | null = null;

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
        this.actionMenu.actionConnect.addEventListener('click', (e) => this.onClickLoadPluginBtn(e));
        this.actionMenu.actionPin.addEventListener('click', (e) => this.onClickPinBtn(e));
        this.actionMenu.actionPin.addEventListener('contextmenu', (e) => this.onRightClickPinBtn(e));
        this.isPinned = true;
        this.currentMap = 0;
    }
    onClickLoadPluginBtn(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        loadCvat(false);
        this.ws.getSocket();
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
    setFocusScroll(x: number, y: number) {

    }
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
                let o = this.userMarker.userMarker.style['transform']
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