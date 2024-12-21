import { CvatConfig, TrackData, UpdateData } from "../../cvat";
import { CommunicationManager, AppCommunicationHandlers, CommunicationRxEventHandlers } from "../index";
import { fetchWithTimeout, isMobileBrowser } from "../../utils";
import { sessionStore } from "../../store";

// 설정 인터페이스 정의
interface WebSocketConfig {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
    retryDelay: number;
}

enum SocketState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    DESTROYED
}

class WebSocketError extends Error {
    constructor(
        message: string,
        public readonly code: number,
        public readonly retryCount: number
    ) {
        super(message);
    }
}

interface WebSocketMessage<T = unknown> {
    event: string;
    data: T;
    timestamp: number;
}

export class WebSocketManager implements CommunicationManager {
    private static _instance: WebSocketManager;
    private socket: WebSocket | null = null;
    private socketState: SocketState = SocketState.DISCONNECTED;
    private readonly config: WebSocketConfig;
    private isDestroyed = false;

    // 이벤트 핸들러들을 readonly로 선언
    public readonly rxEventHandlers: Partial<CommunicationRxEventHandlers> = {};
    public readonly handlers: Partial<AppCommunicationHandlers> = {};

    private constructor(config?: Partial<WebSocketConfig>) {
        this.config = {
            baseUrl: 'http://localhost:32332',
            timeout: 8000,
            maxRetries: 10,
            retryDelay: 3000,
            ...config
        };

        this.rxEventHandlers = {
            track: this.onTrackEvent.bind(this),
            config: this.onConfigEvent.bind(this),
            update: this.onUpdateEvent.bind(this),
            doneInit: this.onLibInit.bind(this)
        };
    }

    static getInstance(config?: Partial<WebSocketConfig>): WebSocketManager {
        if (!WebSocketManager._instance || WebSocketManager._instance.isDestroyed) {
            WebSocketManager._instance = new WebSocketManager(config);
        }
        return WebSocketManager._instance;
    }

    public async getSocket(): Promise<WebSocket | null> {
        let retryCount = 0;
        const maxRetryDelay = 30000; // 최대 30초

        while (retryCount++ < this.config.maxRetries && !this.isSocketOpen()) {
            try {
                const socket = await this.registerSocket();
                if (socket) return socket;
            } catch (e) {
                const delay = Math.min(this.config.retryDelay * Math.pow(2, retryCount), maxRetryDelay);
                await this.handleConnectionError(e, retryCount, delay);
            }
        }
        throw new Error('연결 재시도 횟수 초과');
    }

    private async handleConnectionError(error: unknown, retryCount: number, delay: number): Promise<void> {
        // 에러 상태에 따른 처리
        if (error instanceof Error) {
            // 특정 에러 타입에 따른 처리
            if (error.name === 'TimeoutError') {
                console.warn(`Connection timeout (attempt ${retryCount})`);
            }
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    private async registerSocket(): Promise<WebSocket | null> {
        const {debug} = sessionStore.getStateReadonly().currentUser;
        
        const res = await fetchWithTimeout(`${this.config.baseUrl}/register`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: !isMobileBrowser ? 1 : 2 }),
            timeout: this.config.timeout
        });
        if (!res.ok) {
            throw new WebSocketError('소켓 등록 실패', res.status, 0);
        }
        const { url } = await res.json();
        if (debug) {
            console.debug(`register socket: ${url}`)
        }
        this.socket = new WebSocket(url);
        this.setupSocketEventListeners();
        return this.socket;
    }

    private setupSocketEventListeners(): void {
        if (!this.socket) return;
        
        // 이전 리스너 제거
        this.removeSocketEventListeners();
        
        // 바인딩된 핸들러 저장
        this.boundHandlers = {
            open: this.onWsOpen.bind(this),
            message: this.onWsMessage.bind(this),
            error: this.onWsError.bind(this),
            close: this.onWsClose.bind(this)
        };

        // 새 리스너 등록
        Object.entries(this.boundHandlers).forEach(([event, handler]) => {
            this.socket?.addEventListener(
                event as keyof WebSocketEventMap, 
                handler as EventListener
            );
        });
    }

    public destroy(): void {
        this.close();
        this.isDestroyed = true;
        // 추가적인 정리 작업 수행
    }

    public async connect(): Promise<boolean> {
        const socket = await this.getSocket();
        return socket !== null;
    }

    public isConnected(): boolean {
        return this.isSocketOpen();
    }

    public setHandlers(handlers: Partial<AppCommunicationHandlers>): void {
        Object.assign(this.handlers, handlers);
    }

    public close(): void {
        this.socketState = SocketState.DISCONNECTED;
        if (this.socket) {
            // 이벤트 리스너 제거
            this.socket.removeEventListener('open', this.onWsOpen);
            this.socket.removeEventListener('message', this.onWsMessage);
            this.socket.removeEventListener('error', this.onWsError);
            this.socket.removeEventListener('close', this.onWsClose);
            
            this.socket.close();
            this.socket = null;
        }
    }

    public isSocketOpen(): boolean {
        return this.socketState === SocketState.CONNECTED && 
               this.socket?.readyState === WebSocket.OPEN;
    }

    public send(event: string, data: any): void {
        if(this.socket) {
            this.socket.send(JSON.stringify({ event: event, data: data }));
        }
    }

    private onWsMessage(event: MessageEvent): void {
        const {debug} = sessionStore.getStateReadonly().currentUser;
        try {
            const msg = JSON.parse(event.data) as WebSocketMessage;
            if(debug && msg.event !== 'track'){
                console.debug(`Message: ${msg.event}`);
                console.debug(msg.data);
            }
            if (!this.isValidMessage(msg)) {
                console.error(msg);
                throw new Error('잘못된 메시지 형식');
            }
            const handler = this.rxEventHandlers[msg.event as keyof CommunicationRxEventHandlers];
            if (handler) {
                (handler as Function).call(this, event, this.preprocessMessageData(event, msg));
            }
        } catch (e) {
            this.handleMessageError(e);
        }
    }

    private preprocessMessageData(event: MessageEvent, msg: any): any {
        switch(msg?.event){
            case 'track':
                return {
                ...msg.data,
                    err: msg.data.err ? JSON.parse(msg.data.err) : null
                };
            case 'init':
                if (this.handlers.onLibInit) {
                    this.handlers.onLibInit(event, msg.data);
                }
                break;
            default:
                return msg.data;
        }
    }

    private onWsOpen(event: Event): void {
        if (this.handlers.onConnectPost) {
            this.handlers.onConnectPost(event);
        }
    }
    
    private onWsError(event: Event): void {
        const {debug} = sessionStore.getStateReadonly().currentUser;
        if(debug) {
            console.debug('============= WebSocket Error =============')
            console.debug(`error: ${event}`)
            console.debug('===========================================')
        }
    }
    
    private onWsClose(event: CloseEvent): void {
        const {debug} = sessionStore.getStateReadonly().currentUser;
        if(debug) {
            console.debug('============= WebSocket Closed =============')
            console.debug(`code: ${event.code}`)
            console.debug(`reason: ${event.reason}`)
            console.debug('============================================');
        }
        this.close();
        if (this.handlers.onClose) {
            this.handlers.onClose(event);
        }
    }

    private onConfigEvent(event: MessageEvent, data: CvatConfig): void {
        if (this.handlers.onGetConfig) {
            this.handlers.onGetConfig(event, data);
        }
    }

    private onLibInit(event: MessageEvent, data: null): void {
        if (this.handlers.onLibInit) {
            this.handlers.onLibInit(event, data);
        }
    }
    
    private onUpdateEvent(event: MessageEvent, data: UpdateData): void {
        if(data.done) {
            if(data.targetType == 'app') {
                // 앱이 업데이트 되면 앱 자체가 재실행되므로, 모든 과정을 초기화 시키고 다시 시도해야 함.
                if (this.handlers.onAppUpdateDone) {
                    this.handlers.onAppUpdateDone(event, data);
                }
            } else if(data.targetType == 'cvat') {
                if (this.handlers.onLibUpdateDone) {
                    this.handlers.onLibUpdateDone(event, data);
                }
            }
        } else {
            if(data.targetType == 'app') {
                if (this.handlers.onAppUpdateProgress) {
                    this.handlers.onAppUpdateProgress(event, data);
                }
            } else if(data.targetType == 'cvat') {
                if (this.handlers.onLibUpdateProgress) {
                    this.handlers.onLibUpdateProgress(event, data);
                }
            }
        }
    }

    private isValidMessage(msg: unknown): msg is WebSocketMessage {
        return typeof msg === 'object' && 
               msg !== null && 
               'event' in msg && 
               'data' in msg
    }

    private handleMessageError(error: unknown): void {
        console.error('메시지 처리 중 오류 발생:', error);
        if (error instanceof Error) {
            console.error(error.message);
        }
    }

    private boundHandlers: {
        open: (event: Event) => void;
        message: (event: MessageEvent) => void;
        error: (event: Event) => void;
        close: (event: CloseEvent) => void;
    } = {} as {
        open: (event: Event) => void;
        message: (event: MessageEvent) => void;
        error: (event: Event) => void;
        close: (event: CloseEvent) => void;
    };

    private removeSocketEventListeners(): void {
        if (!this.socket) return;
        
        Object.entries(this.boundHandlers).forEach(([event, handler]) => {
            this.socket?.removeEventListener(
                event as keyof WebSocketEventMap, 
                handler as EventListener
            );
        });
        this.boundHandlers = {} as {
            open: (event: Event) => void;
            message: (event: MessageEvent) => void;
            error: (event: Event) => void;
            close: (event: CloseEvent) => void;
        };
    }

    private onTrackEvent(event: MessageEvent, data: TrackData): void {
        if (this.handlers.onTrackEvent) {
            this.handlers.onTrackEvent(event, data);
        }
    }

    public addEventListener<K extends keyof WebSocketEventMap>(
        event: K,
        handler: (event: WebSocketEventMap[K]) => void
    ): void {
        if (!this.socket) return;
        this.socket.addEventListener(event, handler);
    }

    public removeEventListener<K extends keyof WebSocketEventMap>(
        event: K,
        handler: (event: WebSocketEventMap[K]) => void
    ): void {
        if (!this.socket) return;
        this.socket.removeEventListener(event, handler);
    }
}