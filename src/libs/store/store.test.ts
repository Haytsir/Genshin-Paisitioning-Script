// 테스트 환경 설정 - import 전에 실행되어야 함
// localStorage 모킹
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

import { Store, PersistentState } from './index';

// 실제 사용되는 SessionState 타입 (store/index.ts에서 복사)
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

describe('Store upsert 메서드 - 실제 타입 테스트', () => {
  describe('PersistentState 테스트', () => {
    let store: Store<PersistentState>;
    
    const initialState: PersistentState = {
      config: {
        app: {
          auto_app_update: true,
          auto_lib_update: true,
          capture_interval: 250,
          capture_delay_on_error: 1000,
          use_bit_blt_capture_mode: false
        },
        script: {
          marker_indicator: {
            show_user_indicator: true,
            indicator_size: 45,
            indicator_color: '#d3bc8e',
            indicator_initial_opacity: 0.35,
            indicator_duration: 7
          },
          marker_offsets: {}
        }
      }
    };

    beforeEach(() => {
      store = new Store<PersistentState>(initialState, { persist: false });
    });

    test('config.script.marker_offsets 부분 업데이트', () => {
      const newOffsets = {
        1: {
          lib_map_id: 0,
          formula_x: 'x * 2',
          formula_y: 'y * 2'
        }
      };

      store.upsert({
        config: {
          script: {
            marker_offsets: newOffsets
          }
        }
      });

      const state = store.getStateReadonly();
      expect(state.config.script?.marker_offsets).toEqual(newOffsets);
      expect(state.config.app).toBeDefined(); // 기존 값 유지
    });

    test('config.script.marker_indicator 부분 업데이트', () => {
      store.upsert({
        config: {
          script: {
            marker_indicator: {
              show_user_indicator: false,
              indicator_size: 60,
              indicator_color: '#ff0000',
              indicator_initial_opacity: 0.5,
              indicator_duration: 5
            }
          }
        }
      });

      const state = store.getStateReadonly();
      expect(state.config.script?.marker_indicator?.show_user_indicator).toBe(false);
      expect(state.config.script?.marker_indicator?.indicator_size).toBe(60);
      expect(state.config.script?.marker_indicator?.indicator_color).toBe('#ff0000');
    });

    test('config.app 부분 업데이트', () => {
      store.upsert({
        config: {
          app: {
            auto_app_update: false,
            auto_lib_update: true,
            capture_interval: 500,
            capture_delay_on_error: 2000,
            use_bit_blt_capture_mode: true
          }
        }
      });

      const state = store.getStateReadonly();
      expect(state.config.app?.auto_app_update).toBe(false);
      expect(state.config.app?.capture_interval).toBe(500);
      expect(state.config.script).toBeDefined(); // 기존 값 유지
    });

    test('함수형 upsert로 config 업데이트', () => {
      store.upsert(state => ({
        config: {
          ...state.config,
          script: {
            ...state.config.script,
            marker_offsets: {
              ...state.config.script?.marker_offsets,
              2: {
                lib_map_id: 1,
                formula_x: 'x + 100',
                formula_y: 'y + 100'
              }
            }
          }
        }
      }));

      const state = store.getStateReadonly();
      expect(state.config.script?.marker_offsets?.[2]).toEqual({
        lib_map_id: 1,
        formula_x: 'x + 100',
        formula_y: 'y + 100'
      });
    });
  });

  describe('SessionState 테스트', () => {
    let store: Store<SessionState>;
    
    const initialState: SessionState = {
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
          version: '1.0.0'
        }
      }
    };

    beforeEach(() => {
      store = new Store<SessionState>(initialState, { persist: false });
    });

    test('currentUser 부분 업데이트', () => {
      store.upsert({
        currentUser: {
          position: { x: 100, y: 200 },
          isActive: true,
          debug: true
        }
      });

      const state = store.getStateReadonly();
      expect(state.currentUser.position.x).toBe(100);
      expect(state.currentUser.position.y).toBe(200);
      expect(state.currentUser.isActive).toBe(true);
      expect(state.currentUser.debug).toBe(true);
      expect(state.tempSettings.isPinned).toBe(true); // 기존 값 유지
    });

    test('currentUser.position 부분 업데이트', () => {
      store.upsert({
        currentUser: {
          position: { x: 50, y: 75 },
          isActive: false,
          debug: false
        }
      });

      const state = store.getStateReadonly();
      expect(state.currentUser.position.x).toBe(50);
      expect(state.currentUser.position.y).toBe(75);
      expect(state.currentUser.isActive).toBe(false); // 기존 값 유지
      expect(state.currentUser.debug).toBe(false); // 기존 값 유지
    });

    test('versionInfo.script 부분 업데이트', () => {
      store.upsert({
        versionInfo: {
          script: {
            site: 'test-site.com',
            version: '2.0.0'
          }
        }
      });

      const state = store.getStateReadonly();
      expect(state.versionInfo.script?.site).toBe('test-site.com');
      expect(state.versionInfo.script?.version).toBe('2.0.0');
      expect(state.currentUser.isActive).toBe(false); // 기존 값 유지
    });

    test('tempSettings 부분 업데이트', () => {
      store.upsert({
        tempSettings: {
          isPinned: false
        }
      });

      const state = store.getStateReadonly();
      expect(state.tempSettings.isPinned).toBe(false);
      expect(state.currentUser.isActive).toBe(false); // 기존 값 유지
    });

    test('함수형 upsert로 조건부 업데이트', () => {
      store.upsert(state => {
        const updates: Partial<SessionState> = {};
        
        if (!state.currentUser.isActive) {
          updates.currentUser = {
            ...state.currentUser,
            isActive: true
          };
        }
        
        if (state.tempSettings.isPinned) {
          updates.tempSettings = {
            isPinned: false
          };
        }
        
        return updates;
      });

      const state = store.getStateReadonly();
      expect(state.currentUser.isActive).toBe(true);
      expect(state.tempSettings.isPinned).toBe(false);
    });
  });

  describe('실제 사용 사례 테스트', () => {
    test('gamedot에서 사용하는 패턴 테스트', () => {
      const store = new Store<SessionState>({
        currentUser: { position: { x: 0, y: 0 }, isActive: false, debug: false },
        tempSettings: { isPinned: true },
        versionInfo: { script: { site: '', version: '1.0.0' } }
      }, { persist: false });

      // gamedot에서 사용하는 패턴
      store.upsert({
        versionInfo: {
          script: {
            site: 'genshin.gamedot.org'
          }
        }
      });

      const state = store.getStateReadonly();
      expect(state.versionInfo.script?.site).toBe('genshin.gamedot.org');
      expect(state.versionInfo.script?.version).toBe('1.0.0'); // 기존 값 유지
    });

    test('persistentStore에서 사용하는 패턴 테스트', () => {
      const store = new Store<PersistentState>({
        config: {
          app: {
            auto_app_update: true,
            auto_lib_update: true,
            capture_interval: 250,
            capture_delay_on_error: 1000,
            use_bit_blt_capture_mode: false
          },
          script: {
            marker_indicator: {
              show_user_indicator: true,
              indicator_size: 45,
              indicator_color: '#d3bc8e',
              indicator_initial_opacity: 0.35,
              indicator_duration: 7
            },
            marker_offsets: {}
          }
        }
      }, { persist: false });

      const defaultOffsets = {
        2: { lib_map_id: 0, formula_x: '((x-2285)/2)', formula_y: '((y+5890)/2)' },
        7: { lib_map_id: 1, formula_x: '(((x)*1.275) - 2247)', formula_y: '(((y)*1.275) - 670)' }
      };

      // gamedot에서 사용하는 패턴
      store.upsert({
        config: {
          script: {
            marker_offsets: defaultOffsets
          }
        }
      });

      const state = store.getStateReadonly();
      expect(state.config.script?.marker_offsets?.[2]).toEqual(defaultOffsets[2]);
      expect(state.config.script?.marker_offsets?.[7]).toEqual(defaultOffsets[7]);
      expect(state.config.app).toBeDefined(); // 기존 값 유지
    });
  });

  describe('타입 안정성 검증', () => {
    test('Partial 타입이 올바르게 처리됨', () => {
      const store = new Store<PersistentState>({
        config: {
          app: {
            auto_app_update: true,
            auto_lib_update: true,
            capture_interval: 250,
            capture_delay_on_error: 1000,
            use_bit_blt_capture_mode: false
          },
          script: {
            marker_indicator: {
              show_user_indicator: true,
              indicator_size: 45,
              indicator_color: '#d3bc8e',
              indicator_initial_opacity: 0.35,
              indicator_duration: 7
            },
            marker_offsets: {}
          }
        }
      }, { persist: false });

      // 이 코드가 타입 오류 없이 컴파일되어야 함
      store.upsert({
        config: {
          script: {
            marker_offsets: {
              1: { lib_map_id: 0, formula_x: 'x', formula_y: 'y' }
            }
          }
        }
      });

      // 이 코드도 타입 오류 없이 컴파일되어야 함
      store.upsert(state => ({
        config: {
          script: {
            marker_offsets: {
              ...state.config.script?.marker_offsets,
              2: { lib_map_id: 1, formula_x: 'x*2', formula_y: 'y*2' }
            }
          }
        }
      }));
    });
  });
}); 