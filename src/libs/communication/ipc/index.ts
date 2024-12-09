import { AppConfigData } from "../../sites/config";
import { UpdateData } from "../../cvat";
import { AppCommunicationHandlers, CommunicationManager, CommunicationEventMap } from "..";

interface TauriWindow extends Window {
    __TAURI__?: {
        event: {
            listen: (event: string, callback: (event: any) => void) => void;
        };
        invoke: (cmd: string, args?: any) => Promise<any>;
    };
}

export interface IPCEventMap {
    'close': Event;
    'message': MessageEvent;
    'error': Event;
}

export interface IPCHandlers {
    onGetConfig: (event: MessageEvent, data: AppConfigData) => void;
    onAppUpdateProgress: (event: MessageEvent, data: UpdateData) => void;
    onAppUpdateDone: (event: MessageEvent, data: UpdateData) => void;
    onLibUpdateProgress: (event: MessageEvent, data: UpdateData) => void;
    onLibUpdateDone: (event: MessageEvent, data: UpdateData) => void;
}

export class IPCManager implements CommunicationManager {
    private eventListeners: Map<string, EventListener> = new Map();
    private readonly handlers: Partial<IPCHandlers> = {};

    constructor() {
        // Electron이나 Tauri의 IPC 초기화
        this.initializeIPC();
    }

    private initializeIPC(): void {
        if ((window as TauriWindow).__TAURI__) {
            this.initializeTauriIPC();
        } else if ((window as any).electron) {
            this.initializeElectronIPC();
        }
    }

    private initializeTauriIPC(): void {
        const tauri = (window as TauriWindow).__TAURI__;
        if (!tauri?.event?.listen) return;
        
        const { listen } = tauri.event;
        
        listen('config', (event: any) => {
            if (this.handlers.onGetConfig) {
                this.handlers.onGetConfig(new MessageEvent('message', { data: event }), event.payload);
            }
        });

        // 다른 이벤트들도 비슷하게 처리
    }

    private initializeElectronIPC(): void {
        // Electron IPC 초기화
        const { ipcRenderer } = (window as any).electron;

        ipcRenderer.on('config', (_: any, data: any) => {
            if (this.handlers.onGetConfig) {
                this.handlers.onGetConfig(new MessageEvent('message', { data }), data);
            }
        });

        // 다른 이벤트들도 비슷하게 처리
    }

    public async connect(): Promise<boolean> {
        return true;  // IPC는 항상 연결되어 있음
    }

    public isConnected(): boolean {
        return true;  // IPC는 항상 연결되어 있음
    }

    public close(): void {
        this.destroy();
    }

    public setHandlers(handlers: Partial<AppCommunicationHandlers>): void {
        Object.assign(this.handlers, handlers);
    }

    public sendConfig(config: AppConfigData): void {
        const tauri = (window as TauriWindow).__TAURI__;
        if (tauri?.invoke) {
            tauri.invoke('send_config', { config });
        } else if ((window as any).electron) {
            (window as any).electron.ipcRenderer.send('send_config', config);
        }
    }

    public destroy(): void {
        this.eventListeners.forEach((handler, key) => {
            const event = key.replace('ipc-', '') as keyof CommunicationEventMap;
            this.removeEventListener(event, handler);
        });
        this.eventListeners.clear();
    }

    public addEventListener<K extends keyof CommunicationEventMap>(
        event: K,
        handler: (event: CommunicationEventMap[K]) => void
    ): void {
        const boundHandler = handler.bind(this);
        this.eventListeners.set(`ipc-${event}`, boundHandler as EventListener);

        // close 이벤트 처리
        if (event === 'close') {
            if ((window as TauriWindow).__TAURI__) {
                if ((window as TauriWindow).__TAURI__) {
                    (window as TauriWindow).__TAURI__?.event.listen('close', () => {
                        handler(new Event('close') as CommunicationEventMap[K]);
                    });
                }
            } else if ((window as any).electron) {
                (window as any).electron.ipcRenderer.on('close', () => {
                    handler(new Event('close') as CommunicationEventMap[K]);
                });
            }
        }
    }

    public removeEventListener<K extends keyof CommunicationEventMap>(
        event: K,
        handler: (event: CommunicationEventMap[K]) => void
    ): void {
        const storedHandler = this.eventListeners.get(`ipc-${event}`);
        if (storedHandler) {
            this.eventListeners.delete(`ipc-${event}`);
        }
    }
}
