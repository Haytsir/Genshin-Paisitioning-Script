import { ConfigData } from "@src/libs/sites/config";
import { ConfigField } from '../types';

export const APP_CONFIG_FIELDS: Record<string, ConfigField> = {
    auto_app_update: {
        label: '앱 자동 업데이트',
        type: 'checkbox',
        section: 'app',
        path: 'app.auto_app_update'
    },
    auto_lib_update: {
        label: '라이브러리 자동 업데이트',
        type: 'checkbox',
        section: 'app',
        path: 'app.auto_lib_update'
    },
    capture_interval: {
        label: '화면 캡쳐 간격',
        type: 'number',
        section: 'app',
        path: 'app.capture_interval'
    },
    capture_delay_on_error: {
        label: '캡쳐 에러 시 대기 시간',
        type: 'number',
        section: 'app',
        path: 'app.capture_delay_on_error'
    },
    use_bit_blt_capture_mode: {
        label: '비트블럭 캡쳐 모드 사용',
        type: 'checkbox',
        section: 'app',
        path: 'app.use_bit_blt_capture_mode'
    }
};

export function createAppConfigInputs(tempConfig: ConfigData): string {
    return Object.entries(APP_CONFIG_FIELDS)
        .map(([key, field]) => {
            const value = getValueFromPath(tempConfig, field.path);
            return `<gps-config-input
                label="${field.label}"
                type="${field.type}"
                value="${value}"
                key="${key}"
                section="${field.section}"
                ${field.min !== undefined ? `min="${field.min}"` : ''}
                ${field.max !== undefined ? `max="${field.max}"` : ''}
                ${field.step !== undefined ? `step="${field.step}"` : ''}
            ></gps-config-input>`;
        })
        .join('');
}

// 경로로부터 값을 가져오는 헬퍼 함수
function getValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
} 