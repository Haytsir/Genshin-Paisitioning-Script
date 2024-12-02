import { WebSocketManager } from "./ws";
import { IPCManager, IPCEventMap } from "./ipc";
import { AppConfigData } from "../sites/config";
import { TrackData, UpdateData } from "../cvat";
import { isElectron, isTauri } from "../utils";


export interface AppCommunicationHandlers {
    onGetConfig: (event: MessageEvent, data: AppConfigData) => void;
    onAppUpdateProgress: (event: MessageEvent, data: UpdateData) => void;
    onAppUpdateDone: (event: MessageEvent, data: UpdateData) => void;
    onLibUpdateProgress: (event: MessageEvent, data: UpdateData) => void;
    onLibUpdateDone: (event: MessageEvent, data: UpdateData) => void;
    onLibInit: (event: MessageEvent, data: AppConfigData) => void;
    onTrackEvent: (event: MessageEvent, data: TrackData) => void;
}

export type CommunicationEventMap = WebSocketEventMap & IPCEventMap;

export interface CommunicationManager {
    connect(): Promise<boolean>;
    isConnected(): boolean;
    close(): void;
    sendConfig(config: AppConfigData): void;
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

    public sendConfig(config: AppConfigData): void {
        this.communication.sendConfig(config);
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
