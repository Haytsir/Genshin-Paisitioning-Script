import {ConfigData, getDefaultConfig} from "@src/libs/sites/config";
import { deepMerge } from "../utils";
declare const SCRIPT_VERSION: string;

/**
 * 상태 변경을 감지하는 리스너 타입
 * @param newState - 읽기 전용 새 상태
 * @param oldState - 읽기 전용 이전 상태
 * 주의: 리스너 내에서 상태를 직접 수정하지 마세요.
 * 상태 수정이 필요한 경우 setState를 사용하세요.
 */
type Listener<T> = (newState: Readonly<T>, oldState: Readonly<T>) => void;

export class Store<T extends object> {
    private state: T;
    private listeners: Set<Listener<T>> = new Set();
    private storageKey?: string;

    constructor(initialState: T, options?: { persist?: boolean, storageKey?: string }) {
        this.storageKey = options?.persist ? (options.storageKey || 'gps_persistent_state') : undefined;
        
        if (this.storageKey && this.isLocalStorageAvailable()) {
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

    /**
     * 상태 수정을 위한 깊은 복사본을 반환합니다.
     * setState를 통한 상태 업데이트 시 사용하세요.
     * 단순 읽기만 필요한 경우 getStateReadonly()를 사용하세요.
     */
    getState(): T {
        return structuredClone(this.state);
    }

    /**
     * 상태를 읽기 전용으로 반환합니다.
     * 주의: 중첩된 객체는 여전히 수정 가능합니다.
     * 완벽한 불변성이 필요한 경우 getState()를 사용하세요.
     */
    getStateReadonly(): Readonly<T> {
        return Object.freeze(this.state);
    }

    /**
     * 상태를 업데이트합니다.
     * 주의: newState 객체가 기존 상태의 참조를 포함하지 않도록 하세요.
     * 필요한 경우 getState()를 통해 얻은 복사본을 사용하세요.
     * 
     * 예시:
     * const stateForUpdate = store.getState();
     * store.setState({
     *   config: {
     *     ...stateForUpdate.config,
     *     app: newConfig
     *   }
     * });
     */
    setState(newState: Partial<T>) {
        const oldState = structuredClone(this.state);
        this.state = deepMerge(this.state, newState);
        if (this.storageKey && this.isLocalStorageAvailable()) {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.state));
            } catch (error) {
                console.warn('GPS: localStorage에 상태를 저장할 수 없습니다.', error);
            }
        }
        
        this.notify(this.state, oldState);
    }

    /**
     * localStorage가 사용 가능한지 확인합니다.
     * 테스트 환경이나 SSR에서 안전하게 동작하도록 합니다.
     */
    private isLocalStorageAvailable(): boolean {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 변경할 값을 넘기면 자동으로 병합합니다.
     * 함수형(updater)과 객체형(partial) 모두 지원.
     * deepMerge를 사용해 중첩된 객체를 안전하게 병합합니다.
     * 
     * 예시:
     * store.upsert({ config: { script: { marker_offsets: newOffsets } } });
     * store.upsert(state => ({ config: { ...state.config, script: { ...state.config.script, marker_offsets: newOffsets } } }));
     */
    upsert(partialOrUpdater: Partial<T> | ((currentState: T) => Partial<T>)) {
        const currentState = this.getState();
        const partial = typeof partialOrUpdater === 'function'
            ? partialOrUpdater(currentState)
            : partialOrUpdater;
        
        // deepMerge를 사용해 안전하게 병합
        this.setState(partial);
    }

    /**
     * 상태 변경을 구독합니다.
     * listener는 oldState와 newState를 매개변수로 받습니다.
     * oldState는 깊은 복사본이므로 안전하게 사용할 수 있습니다.
     */
    subscribe(listener: Listener<T>) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify(newState: T, oldState: T) {
        this.listeners.forEach(listener => listener(
            Object.freeze(newState),
            Object.freeze(oldState)
        ));
    }

    /**
     * 저장된 상태를 템플릿과 비교하여 유효성을 검사하고 정리합니다.
     * 타입이 일치하지 않는 필드는 템플릿의 기본값으로 대체됩니다.
     */
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
    config: {
        app?: Partial<ConfigData['app']>;
        script?: {
            marker_indicator?: Partial<ConfigData['script']['marker_indicator']>;
            marker_offsets?: ConfigData['script']['marker_offsets'];
        };
    };
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
    versionInfo: {
        app?: {
            version?: string;
        },
        lib?: {
            version?: string;
        },
        script?: {
            site: string;
            version?: string;
        }
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
    },
    versionInfo: {
        script: {
            site: '',
            version: (typeof SCRIPT_VERSION !== 'undefined' ? SCRIPT_VERSION : '')
        }
    }
}); 