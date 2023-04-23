import { GM_getValue } from "$";
import { TrackData, UpdateData } from "../cvat";
import { ConfigData } from "../sites/config";
import { delay, fetchWithTimeout, isMobileBrowser } from "../utils";

export class WebSocketManager {
    private static _instance: WebSocketManager;
    private socket: WebSocket | null;
    public onSocketConnectPost: (event: Event) => void = () => {};
    public onTrackEvent: (event: MessageEvent, data: TrackData) => void = () => {};
    public onGetConfig: (event: MessageEvent, data: ConfigData) => void = () => {};
    public onLibUpdateProgress: (event:MessageEvent, data: UpdateData) => void = () => {};
    public onLibUpdateDone: (event:MessageEvent, data: UpdateData) => void = () => {};
    public onLibInit: (event:MessageEvent, data: ConfigData) => void = () => {};
    private constructor() {
        this.socket = null;
    }
    static get instance(): WebSocketManager {
        if(!WebSocketManager._instance) WebSocketManager._instance = new WebSocketManager();
        return WebSocketManager._instance;
    }
    public async getSocket(): Promise<WebSocket | null> {
        let i = 0;
        while (i++ < 10 && (!this.socket || (this.socket.readyState !== WebSocket.OPEN && this.socket.readyState !== WebSocket.CONNECTING))) {
            let res: Response;
            try{
                res = await fetchWithTimeout('http://localhost:32332/register', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_id: !isMobileBrowser ? 1 : 2 }),
                    timeout: 8000
                });
                if(res.ok) {
                    const connectionURL = await res.json();
                    this.socket = new WebSocket(connectionURL.url);
    
                    this.socket.addEventListener('open', (e) => this.onWsOpen(e));
                    this.socket.addEventListener('message', (e) => this.onWsMessage(e));
                    this.socket.addEventListener('error', (e) => this.onWsError(e));
                    this.socket.addEventListener('close', (e) => this.onWsClose(e));

                    return this.socket;
                } else {
                    await delay(3000);
                    continue;
                }
            }
            catch(e) {
                await delay(3000);
                continue;
            }
        }
        return this.socket;
    }
    public closeSocket(): void {
        if(this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    public isSocketOpen(): boolean {
        if(this.socket instanceof WebSocket) {
            if(this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN) {
                return true;
            }
        }
        return false;
    }

    private onWsOpen(event: Event): void {
        if(event?.currentTarget instanceof WebSocket)
            event.currentTarget.send(JSON.stringify({ event: 'checkLibUpdate' }));
        this.onSocketConnectPost(event);
    }
    
    private onWsMessage(event: MessageEvent): void {
        const msg = JSON.parse(event.data)
        if(GM_getValue('debug')) console.debug(msg.data);
        if (msg?.event == 'track') {
            msg.data.err = msg.data.err != '' ? JSON.parse(msg.data.err) : null;
            msg.data = msg.data as TrackData;
            this.onTrackEvent(event, msg.data as TrackData);
        } else if (msg?.event == 'update') {
            this.onUpdateEvent(event, msg.data as UpdateData);
        } else if (msg?.event == 'config') {
            this.onConfigEvent(event, msg.data as ConfigData);
        }
    }
    
    private onWsError(event: Event): void {
        console.debug('============= WebSocket Error =============')
        console.debug(`error: ${event}`)
        console.debug('===========================================')
    }
    
    private onWsClose(event: CloseEvent): void {
        console.debug('============= WebSocket Closed =============')
        console.debug(`code: ${event.code}`)
        console.debug(`reason: ${event.reason}`)
        // TODO: 소켓 종료 시 site의 모든 과정을 초기화 시키는 코드를 작성해야 함.
        console.debug('============================================')
    }

    private onConfigEvent(event: MessageEvent, data: ConfigData): void {
        this.onGetConfig(event, data);
        if(!data.changed) {
            if(event?.currentTarget instanceof WebSocket){
                this.onLibInit(event, data);
                event.currentTarget.send(JSON.stringify({ event: 'init' }));
            }
        }
    }
    
    private onUpdateEvent(event: MessageEvent, data: UpdateData): void {
        if(data.done) {
            if(event?.currentTarget instanceof WebSocket){
                event.currentTarget.send(JSON.stringify({ event: 'getConfig' }));
            }
            
            this.onLibUpdateDone(event, data);
        } else {
            this.onLibUpdateProgress(event, data);
        }
    }

    sendConfig(config: ConfigData): void {
        if(this.socket) {
            this.socket.send(JSON.stringify({ event: 'setConfig', data: config }));
        }
    }
}