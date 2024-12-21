import { persistentStore, sessionStore } from '../store';
import { ActionMenu } from "../../components/action-menu";
import { Dialog } from "../../components/dialog";
import { UserMarker } from "../../components/user-marker";
import { CvatConfig, TrackData, UpdateData, loadCvat } from "../cvat";
import { AppCommunication } from "../communication";
import { ConfigModal } from "@src/components/config-modal";
import { Toast } from "../../components/toast";
import { deepEqual, extractKeyFromList } from '../utils';

interface ErrorItem {
    message: string;
    details?: string;
}

export class MapSite {
    private static _instance: MapSite | null = null;
    public root: HTMLDivElement;
    public dialog: Dialog;
    public actionMenu: ActionMenu;
    public userMarker: UserMarker;
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
    public toast: Toast;

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
        this.toast = new Toast();
        this.root.appendChild(this.toast);

        // WebSocket 핸들러 설정
        this.communication.setHandlers({
            onConnectPost: (e) => this.onCommunicationConnectPost(e),
            onGetConfig: (e, d) => this.onGetConfig(e, d),
            onAppUpdateProgress: (e, d) => this.onAppUpdateProgress(e, d),
            onAppUpdateDone: (e, d) => this.onAppUpdateDone(e, d),
            onLibUpdateProgress: (e, d) => this.onLibUpdateProgress(e, d),
            onLibUpdateDone: (e, d) => this.onLibUpdateDone(e, d),
            onLibInit: (e, d) => this.onLibInit(e, d),
            onClose: (e) => this.onCommunicationClose(e)
        });
        
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

        persistentStore.subscribe((newState, oldState) => {
            const {debug} = sessionStore.getStateReadonly().currentUser;
            if(deepEqual(newState.config.app, oldState.config.app)) return;
            if(debug) {
                console.debug('설정 변경됨', newState.config);
            }
            if(newState.config.app) {
                this.communication.sendConfig(newState.config.app);
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

    protected handleError(error: Error | ErrorItem | (Error | ErrorItem)[]): void {
        const errors = Array.isArray(error) ? error : [error];
        
        errors.forEach(err => {
            const message = err instanceof Error ? err.message : err.message;
            const details = err instanceof Error ? err.stack : err.details;
            
            this.toast.show(
                'error',
                'GPS',
                message,
                details
            );
        });
    }

    private handleDisconnect(_event: CloseEvent | null = null): void {
        this.deactivateApp();
        this.toast.show('error', 'GPS', 'GPA와의 연결이 끊어졌습니다.');
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
                this.toast.show('error', 'GPS', 'GPA에 연결할 수 없습니다. 앱이 켜져있는지 확인해주세요.');
                this.deactivateApp();
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
    onCommunicationConnectPost(_event: Event) {
        this.communication.send('getConfig', null);
        this.communication.send('checkAppUpdate', { force: false });
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
            this.dialog.close(null);
            this.dialog.hideProgress();
        }
        if(data.updated) {
            // 모든 과정을 초기화하고 다시 시작.
            this.dialog.alert('GPS', 'GPA가 업데이트 되었습니다. 다시 시작합니다. 진행되지 않으면, 페이지를 새로고침 해주세요.');
            this.communication.close();
            this.deactivateApp();
            this.loadPlugin(sessionStore.getStateReadonly().currentUser.debug);
        }
        if(data.done) {
            sessionStore.setState({
                versionInfo: {
                    app: {
                        version: data.currentVersion
                    }
                }
            });
            const {debug} = sessionStore.getStateReadonly().currentUser;
            if(debug) {
                console.debug(`GPA 버전: ${sessionStore.getStateReadonly().versionInfo.app?.version}`);
            }
            if(sessionStore.getStateReadonly().versionInfo.lib?.version) {
                this.activateApp();
            }else{
                this.communication.send('checkLibUpdate', { force: false });
            }
        }
    }

    onStartLibUpdate(_event: MessageEvent, data: UpdateData) {
        this.dialog.alert('GPS', `라이브러리 ${data.targetVersion} 버전 업데이트 중...`, 0, false);
        this.dialog.showProgress();
    }

    onLibUpdateProgress(event: MessageEvent, data: UpdateData) {
        const {debug} = sessionStore.getStateReadonly().currentUser;
        if(debug) {
            console.debug("onLibUpdateProgress")
        }
        if(!this.dialog.progressing) {
            this.onStartLibUpdate(event, data)
        }
        this.dialog.changeProgress(data.percent);
    }

    onLibUpdateDone(_event: MessageEvent, data: UpdateData) {
        const {debug} = sessionStore.getStateReadonly().currentUser;
        if(debug) {
            console.debug("onLibUpdateDone")
        }
        if(this.dialog.showing && this.dialog.progressing) {
            this.dialog.close(null);
            this.dialog.hideProgress();
        }

        if(data.done) {
            sessionStore.setState({
                versionInfo: {
                    lib: {
                        version: data.displayVersionName
                    }
                }
            });
            if(debug) {
                console.debug(`라이브러리 버전: ${sessionStore.getStateReadonly().versionInfo.lib?.version}`);
            }
            if(sessionStore.getStateReadonly().versionInfo.app?.version) {
                this.activateApp();
            }else{
                this.communication.send('checkLibUpdate', { force: false });
            }
        }
    }

    onGetConfig(_event:MessageEvent, newConfig: CvatConfig) {
        const appConfig = persistentStore.getStateReadonly().config.app;
        if(deepEqual(appConfig, newConfig)) return;

        persistentStore.setState({
            config: {
                app: newConfig
            }
        });
    }

    onCommunicationClose(event: CloseEvent) {
        const {debug} = sessionStore.getStateReadonly().currentUser;
        if(debug) {
            console.debug('onCommunicationClose', event);
        }
        this.handleDisconnect(event);
    }

    activateApp() {
        if(this.isActive) return;
        this.communication.send('init', null);
    }

    onAppActivate() {
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
        this.setPinned(true);
    }
    deactivateApp() {
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

    onTrackEvent(event: MessageEvent|null, data: TrackData) {
        if (!this.isActive) return;
        if(event !== null) { // null이라면 MapSite를 상속한 클래스에서 처리하는 것이다.
            const { debug } = sessionStore.getStateReadonly().currentUser;
            if(debug) {
                console.debug("onTrackEvent", data);
            }
        }
            
        const { err } = data;
        if(err?.errorList) {
            const trackErrors: Error[] = extractKeyFromList(err.errorList, 'msg').map((msg: string) => new Error(msg));
            this.handleError(trackErrors);
            return;
        }
    }

    private getDOMElement<T extends HTMLElement>(
        selector: string,
        context: Document | HTMLElement = document
    ): T | null {
        return context.querySelector<T>(selector);
    }

    public updateUserMarkerPosition(x: number, y: number, dir: number, rot: number): void {
        if (!this.userMarker) return;
        
        let o = this.userMarker.style['transform']
        let t, s, l, c;
        t = 'translate'
        s = this.userMarker.style["transform"].indexOf(t) + t.length + 1
        l = this.userMarker.style["transform"].indexOf(')', s)
        c = this.userMarker.style["transform"].substring(s, l)

        let setValues = [Math.round(x)+'px', Math.round(y)+'px']

        this.userMarker.style['transform'] = o.substring(0, s) + setValues.join(', ') + o.substring(s + c.length);
        
        this.userMarker.style.setProperty('--dir', 0 - dir + 'deg');
        this.userMarker.style.setProperty('--rot', 0 - rot + 'deg');
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

    onLibInit(event: MessageEvent, data: null) {
        this.onAppActivate();
    }
}