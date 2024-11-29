import {ConfigData} from "@src/libs/sites/config";

type Listener<T> = (state: T) => void;

export class Store<T extends object> {
    private state: T;
    private listeners: Set<Listener<T>> = new Set();
    private storageKey?: string;

    constructor(initialState: T, options?: { persist?: boolean, storageKey?: string }) {
        this.storageKey = options?.persist ? (options.storageKey || 'gps_persistent_state') : undefined;
        
        if (this.storageKey) {
            const savedState = localStorage.getItem(this.storageKey);
            this.state = savedState ? JSON.parse(savedState) : initialState;
        } else {
            this.state = initialState;
        }
    }

    getState(): T {
        return this.state;
    }

    setState(newState: Partial<T>) {
        this.state = { ...this.state, ...newState };
        
        if (this.storageKey) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        }
        
        this.notify();
    }

    subscribe(listener: Listener<T>) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

// 영구 저장이 필요한 상태 타입
export interface PersistentState {
    config: ConfigData;
}

// 세션 동안만 유지되는 상태 타입
interface SessionState {
    currentUser: {
        position: {
            x: number;
            y: number;
        };
        isActive: boolean;
        debug: boolean;
    };
    tempSettings: {
        isPinned: boolean;
    };
}

// 영구 저장소 인스턴스
export const persistentStore = new Store<PersistentState>({
    config: {
        auto_app_update: true,
        auto_lib_update: true,
        capture_interval: 250,
        capture_delay_on_error: 1000,
        use_bit_blt_capture_mode: false
    }
}, { 
    persist: true,
    storageKey: 'gps_persistent_state' 
});

// 세션 저장소 인스턴스
export const sessionStore = new Store<SessionState>({
    currentUser: {
        position: { x: 0, y: 0 },
        isActive: false,
        debug: false
    },
    tempSettings: {
        isPinned: true
    }
}); 