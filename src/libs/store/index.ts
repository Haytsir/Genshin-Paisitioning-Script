import {AppConfigData, getDefaultConfig} from "@src/libs/sites/config";

type Listener<T> = (state: T) => void;

export class Store<T extends object> {
    private state: T;
    private listeners: Set<Listener<T>> = new Set();
    private storageKey?: string;

    constructor(initialState: T, options?: { persist?: boolean, storageKey?: string }) {
        this.storageKey = options?.persist ? (options.storageKey || 'gps_persistent_state') : undefined;
        
        if (this.storageKey) {
            try {
                const savedState = localStorage.getItem(this.storageKey);
                if (savedState) {
                    const parsed = JSON.parse(savedState);
                    this.state = this.sanitizeState(parsed, initialState);
                } else {
                    this.state = initialState;
                }
            } catch (error) {
                console.error('GPS: 저장된 설정을 불러오는 중 오류가 발생했습니다. 설정을 초기화합니다.', error);
                this.state = initialState;
            }
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

    private sanitizeState<S extends Record<string, any>, U extends Record<string, any>>(state: S, template: U): U {
        const sanitized = {} as U;
        
        for (const key in template) {
            if (!(key in state)) {
                sanitized[key] = template[key];
                continue;
            }

            if (typeof template[key] === 'object' && template[key] !== null) {
                sanitized[key as keyof U] = this.sanitizeState(
                    state[key],
                    template[key]
                );
            } else {
                sanitized[key] = (typeof state[key] === typeof template[key]
                    ? state[key]
                    : template[key]) as U[Extract<keyof U, string>];
            }
        }

        return sanitized;
    }
}

// 영구 저장이 필요한 상태 타입
export interface PersistentState {
    config: AppConfigData;
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
        ...getDefaultConfig()
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