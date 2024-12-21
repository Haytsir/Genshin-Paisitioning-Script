import { WebSocketManager } from "./ws";
import { IPCManager, IPCEventMap } from "./ipc";
import { CvatConfig, TrackData, UpdateData } from "../cvat";
import { isElectron, isTauri } from "../utils";
declare const __IPC_ENABLED__: boolean;

// Communication에서 최초 이벤트 수신 시 호출되는 함수,
// 이벤트 이름을 키로 갖고, 키에 해당하는 이벤트 수신 시 대응하는 함수를 실행한다.
export interface CommunicationRxEventHandlers {
    track: (event: MessageEvent, data: TrackData) => void;
    config: (event: MessageEvent, data: CvatConfig) => void;
    update: (event: MessageEvent, data: UpdateData) => void;
    doneInit: (event: MessageEvent, data: null) => void;
}

// Communication에서 이벤트 처리 중 다양한 상황에 대응하는 함수를 정의한다.
export interface AppCommunicationHandlers {
    onConnectPost: (event: Event) => void;
    onGetConfig: (event: MessageEvent, data: CvatConfig) => void;
    onAppUpdateProgress: (event: MessageEvent, data: UpdateData) => void;
    onAppUpdateDone: (event: MessageEvent, data: UpdateData) => void;
    onLibUpdateProgress: (event: MessageEvent, data: UpdateData) => void;
    onLibUpdateDone: (event: MessageEvent, data: UpdateData) => void;
    onLibInit: (event: MessageEvent, data: null) => void;
    onTrackEvent: (event: MessageEvent, data: TrackData) => void;
    onClose: (event: CloseEvent) => void;
}

export type CommunicationEventMap = WebSocketEventMap & IPCEventMap;

export interface CommunicationManager {
    connect(): Promise<boolean>;
    isConnected(): boolean;
    close(): void;
    send(event: string, data: any): void;
    addEventListener<K extends keyof CommunicationEventMap>(event: K, handler: (event: CommunicationEventMap[K]) => void): void;
    removeEventListener<K extends keyof CommunicationEventMap>(event: K, handler: (event: CommunicationEventMap[K]) => void): void;
    setHandlers(handlers: Partial<AppCommunicationHandlers>): void;
}

export class AppCommunication {
    private communication: CommunicationManager;

    constructor() {
        if (__IPC_ENABLED__ && (isElectron() || isTauri())) {
            this.communication = new IPCManager();
        } else {
            this.communication = WebSocketManager.getInstance();
        }
    }

    public async connect(): Promise<boolean> {
        return this.communication.connect();
    }

    public isConnected(): boolean {
        return this.communication.isConnected();
    }

    public send(event: string, data: any): void {
        this.communication.send(event, data);
    }

    public sendConfig(config: CvatConfig): void {
        this.communication.send('setConfig', config);
    }

    public close(): void {
        this.communication.close();
    }

    public addEventListener<K extends keyof CommunicationEventMap>(
        event: K,
        handler: (event: CommunicationEventMap[K]) => void
    ): void {
        const boundHandler = handler.bind(this);
        this.communication.addEventListener(event, boundHandler);
    }

    public removeEventListener<K extends keyof CommunicationEventMap>(
        event: K,
        handler: (event: CommunicationEventMap[K]) => void
    ): void {
        this.communication.removeEventListener(event, handler);
    }

    public setHandlers(handlers: Partial<AppCommunicationHandlers>): void {
        this.communication.setHandlers(handlers);
    }

    public destroy(): void {
        this.close();
    }
} 

export { WebSocketManager };
