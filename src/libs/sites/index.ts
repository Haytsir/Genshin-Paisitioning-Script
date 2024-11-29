import { ActionMenu } from "../../components/action-menu";
import { Dialog } from "../../components/dialog";
import { UserMarker } from "../../components/user-marker";
import { TrackData, UpdateData, loadCvat } from "../cvat";
import { ConfigData } from "./config";
import { AppCommunication } from "../communication";
import { PersistentState, persistentStore, sessionStore } from '../store';
import { ConfigModal } from "@src/components/config-modal";

export class MapSite {
    private static _instance: MapSite | null = null;
    public root: HTMLDivElement;
    public dialog: Dialog;
    public actionMenu: ActionMenu;
    public userMarker: UserMarker;
    public config!: ConfigData;
    public siteHost: string;
    public isPinned: boolean;
    public currentMap: number;
    public mapElement: HTMLDivElement | null = null;
    public isActive: boolean = false;
    // Load 버튼을 비활성화 하는 컨트롤러
    private _loadAbortController = new AbortController();
    private _loadAbortSignal = this._loadAbortController.signal;
    // Load 상태에서 활성화되는 버튼을 비활성화시키는 컨트롤러
    private _activeAbortController = new AbortController();
    private _activeAbortSignal = this._activeAbortController.signal;
    private readonly eventListeners: Map<string, EventListener> = new Map();
    public objectPanelMenu: HTMLDivElement | null = null;
    public objectTargetFilterBtn: HTMLDivElement | null = null;
    protected communication: AppCommunication;
    public configModal: ConfigModal;

    public static getInstance(): MapSite {
        if (!this._instance) {
            this._instance = new MapSite();
        }
        return this._instance;
    }
    protected constructor() {
        this.root = document.createElement('div');
        this.root.id = 'gps-root';
        this.siteHost = location.host;
        this.root.classList.add(this.siteHost.replace(/\./g, '-'));
        this.actionMenu = new ActionMenu();
        this.root.appendChild(this.actionMenu);
        this.dialog = new Dialog();
        this.root.appendChild(this.dialog);
        this.userMarker = new UserMarker();
        this.communication = new AppCommunication();
        this.configModal = new ConfigModal();
        this.root.appendChild(this.configModal);

        // WebSocket 핸들러 설정
        this.communication.setHandlers({
            onGetConfig: (e, d) => this.onGetConfig(e, d),
            onAppUpdateProgress: (e, d) => this.onAppUpdateProgress(e, d),
            onAppUpdateDone: (e, d) => this.onAppUpdateDone(e, d),
            onLibUpdateProgress: (e, d) => this.onLibUpdateProgress(e, d),
            onLibUpdateDone: (e, d) => this.onLibUpdateDone(e, d)
        });

        // WebSocket 이벤트 등록
        this.communication.addEventListener('close', this.onSocketClose);
        
        // 기존 DOM 이벤트 등록
        this.registerEventListener(this.actionMenu.actionConnect, 'click', 
            (e) => this.onClickLoadPluginBtn(e, false), 
            {signal: this._loadAbortSignal}
        );
        this.registerEventListener(this.actionMenu.actionConnect, 'contextmenu', (e) => this.onClickLoadPluginBtn(e, true), {signal: this._loadAbortSignal});
        this.registerEventListener(this.actionMenu.actionPin, 'click', this.onClickPinBtn);
        this.registerEventListener(this.actionMenu.actionPin, 'contextmenu', this.onRightClickPinBtn);
        
        this.isPinned = true;
        if(this.isPinned) {
            this.userMarker.classList.add('active')
            this.actionMenu.actionPin.classList.add('active');
        }
        this.currentMap = 0;

        this.mapElement = this.getDOMElement<HTMLDivElement>('#objectViewer');
        this.objectPanelMenu = this.getDOMElement<HTMLDivElement>('#mapsMenu');
        this.objectTargetFilterBtn = this.getDOMElement<HTMLDivElement>('#mapsAreaFilter div[data-value="unset"]');

        persistentStore.subscribe((state: PersistentState) => {
            if(!Object.is(this.config, state.config)) {
                const {debug} = sessionStore.getState().currentUser;
                if(debug) {
                    console.debug('config changed', state.config);
                }
                this.config = state.config;
                this.communication.sendConfig(this.config);
            }
        });
    }

    protected registerEventListener<K extends keyof HTMLElementEventMap>(
        element: HTMLElement,
        event: K,
        handler: (event: HTMLElementEventMap[K]) => void,
        options?: AddEventListenerOptions
    ): void {
        const boundHandler = handler.bind(this);
        this.eventListeners.set(`${element.id}-${event}`, boundHandler as EventListener);
        element.addEventListener(event, boundHandler, options);
    }

    public destroy(): void {
        this.communication.destroy();
        this.eventListeners.forEach((handler, key) => {
            const [elementId, event] = key.split('-');
            const element = document.getElementById(elementId);
            element?.removeEventListener(event, handler);
        });
        this.eventListeners.clear();
    }

    protected handleError(error?: Error): void {
        this.dialog.alert(
            'GPS',
            error?.message || '알 수 없는 오류가 발생했습니다.',
            5000
        );
    }

    protected async safeExecute<T>(
        operation: () => Promise<T>,
        errorMessage: string
    ): Promise<T | null> {
        try {
            return await operation();
        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(errorMessage));
            return null;
        }
    }

    onClickLoadPluginBtn(event: MouseEvent, debug: boolean) {
        this._loadAbortController.abort();
        event.preventDefault();
        event.stopPropagation();
        this.loadPlugin(debug);
    }
    loadPlugin(debug: boolean) {
        loadCvat(debug);
        sessionStore.setState({
            currentUser: {
                ...sessionStore.getState().currentUser,
                debug: debug
            }
        });
        this.communication.connect().then(connected => {
            if (!connected) {
                this.dialog.alert('GPS', 'GPA에 연결할 수 없습니다. 앱이 켜져있는지 확인해주세요.', 10000);
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
        this.dialog.alert('GPS', `GPA ${data.targetVersion} 버전 업데이트 중...`, 0, false);
        this.dialog.showProgress();
    }

    onAppUpdateProgress(event: MessageEvent, data: UpdateData) {
        if(!this.dialog.progressing) {
            this.onStartAppUpdate(event, data)
        }
        this.dialog.changeProgress(data.percent);
    }

    onAppUpdateDone(_event: MessageEvent, data: UpdateData) {
        if(this.dialog.showing && this.dialog.progressing) {
            this.dialog.close(null, `GPA ${data.targetVersion} 버전 업데이트 중...`);
            this.dialog.hideProgress();
        }
        if(data.updated) {
            // 모든 과정을 초기화하고 다시 시작.
            this.dialog.alert('GPS', 'GPA가 업데이트 되었습니다. 다시 시작합니다. 진행되지 않으면, 페이지를 새로고침 해주세요.');
            this.communication.close();
            this.onAppDeactivate();
            this.loadPlugin(sessionStore.getState().currentUser.debug);
        }
    }

    onStartLibUpdate(_event: MessageEvent, data: UpdateData) {
        this.dialog.alert('GPS', `라이브러리 ${data.targetVersion} 버전 업데이트 중...`, 0, false);
        this.dialog.showProgress();
    }

    onLibUpdateProgress(event: MessageEvent, data: UpdateData) {
        console.debug("onLibUpdateProgress")
        if(!this.dialog.progressing) {
            this.onStartLibUpdate(event, data)
        }
        this.dialog.changeProgress(data.percent);
    }

    onLibUpdateDone(_event: MessageEvent, data: UpdateData) {
        console.debug("onLibUpdateDone")
        if(this.dialog.showing && this.dialog.progressing) {
            this.dialog.close(null, `라이브러리 ${data.targetVersion} 버전 업데이트 중...`);
            this.dialog.hideProgress();
        }
    }
    onSocketClose(_event: Event) {
        this.onAppDeactivate();
    }

    onGetConfig(_event:MessageEvent, config: ConfigData) {
        this.config = persistentStore.getState().config;
        // Config을 얻었다는 것은 GPA가 연결되었다는 것, 활성화가 된 것으로 표시한다.
        this.onAppActivate(config)
    }
    onAppActivate(_config: ConfigData | null = null) {
        this.isActive = true;
        sessionStore.setState({ 
            currentUser: {
                ...sessionStore.getState().currentUser,
                isActive: true
            }
        });
        this.dialog.hideProgress();
        document.body.classList.add('gps-activated');
        this.actionMenu.classList.add('gps-active');
        this.actionMenu.actionConnect.classList.add('gps-active');
        this.actionMenu.actionConfig.classList.add('gps-active');
        this._loadAbortController.abort();

        this._activeAbortController = new AbortController();
        this._activeAbortSignal = this._activeAbortController.signal;
        this.actionMenu.actionConfig.addEventListener('click', (e) => this.configModal.showModal(), {signal: this._activeAbortSignal});
    }
    onAppDeactivate() {
        this.onAppDeactivate();
        this.isActive = false;
        sessionStore.setState({ 
            currentUser: {
                ...sessionStore.getState().currentUser,
                isActive: false
            }
        });
        this._loadAbortController = new AbortController();
        this._loadAbortSignal = this._loadAbortController.signal;
        this.actionMenu.actionConnect.addEventListener('click', (e) => this.onClickLoadPluginBtn(e, false), {signal: this._loadAbortSignal});
        this.actionMenu.actionConnect.addEventListener('contextmenu', (e) => this.onClickLoadPluginBtn(e, true), {signal: this._loadAbortSignal});

        document.body.classList.remove('gps-activated');
        this.actionMenu.classList.remove('gps-active');
        this.actionMenu.actionConnect.classList.remove('gps-active');
        this.actionMenu.actionConfig.classList.remove('gps-active');
        this._activeAbortController.abort();
    }
    setFocusScroll(_x: number, _y: number) {}
    appendUserMarker(parent: Element) {
        parent.appendChild(this.userMarker);
    }
    setPinned(p: boolean) {
        this.isPinned = p;
        if (this.isPinned) {
            this.actionMenu.actionPin.classList.add('active');
            if(this.userMarker) {
                this.userMarker.classList.add('active')
                let x, y;
                let t, s, l, c;
                t = 'translate'
                s = this.userMarker.style["transform"].indexOf(t) + t.length + 1;
                l = this.userMarker.style["transform"].indexOf(')', s);
                c = this.userMarker.style["transform"].substring(s, l);

                if (c) {
                    [x, y] = c.split(', ')
                    x = parseInt(x)
                    y = parseInt(y)
                    this.setFocusScroll(x, y)
                }
            }
        } else {
            this.actionMenu.actionPin.classList.remove('active');
            if(this.userMarker)
                this.userMarker.classList.remove('active')
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

    private getDOMElement<T extends HTMLElement>(
        selector: string,
        context: Document | HTMLElement = document
    ): T | null {
        return context.querySelector<T>(selector);
    }

    private updateUserMarkerPosition(x: number, y: number, dir: number, rot: number): void {
        if (!this.userMarker) return;
        
        const transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
        this.userMarker.style.transform = transform;
        
        if (this.userMarker) {
            this.userMarker.style.setProperty('--dir', `${-dir}deg`);
            this.userMarker.style.setProperty('--rot', `${-rot}deg`);
        }
    }

    // mapOnPos 또는 유사한 위치 업데이트 메서드에서 호출
    protected mapOnPos(event: MessageEvent, data: TrackData): void {
        if (!this.isActive) return;
        
        const { x, y, a, r } = data;
        this.updateUserMarkerPosition(x, y, a, r);
        
        if (this.isPinned) {
            this.setFocusScroll(x, y);
        }
    }

    protected registerWebSocketEvent<K extends keyof WebSocketEventMap>(
        communication: AppCommunication,
        event: K,
        handler: (event: WebSocketEventMap[K]) => void
    ): void {
        const boundHandler = handler.bind(this);
        this.eventListeners.set(`websocket-${event}`, boundHandler as EventListener);
        communication.addEventListener(event, boundHandler);
    }
}