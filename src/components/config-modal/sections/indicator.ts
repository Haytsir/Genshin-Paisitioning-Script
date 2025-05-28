import { ConfigData } from "@src/libs/sites/config";
import { ConfigField } from '../types';

export const INDICATOR_CONFIG_FIELDS: Record<string, ConfigField> = {
    show_user_indicator: {
        label: '위치 마커 시인성 표시 활성화',
        type: 'checkbox',
        section: 'indicator',
        path: 'script.marker_indicator.show_user_indicator'
    },
    indicator_size: {
        label: '위치 마커 시인성 표시 크기',
        type: 'range',
        section: 'indicator',
        path: 'script.marker_indicator.indicator_size',
        min: 30,
        max: 100,
        step: 5
    },
    indicator_color: {
        label: '위치 마커 시인성 표시 색상',
        type: 'color',
        section: 'indicator',
        path: 'script.marker_indicator.indicator_color'
    },
    indicator_initial_opacity: {
        label: '위치 마커 시인성 시작 투명도',
        type: 'range',
        section: 'indicator',
        path: 'script.marker_indicator.indicator_initial_opacity',
        min: 0,
        max: 1,
        step: 0.05
    },
    indicator_duration: {
        label: '위치 마커 시인성 애니메이션 지속 시간',
        type: 'range',
        section: 'indicator',
        path: 'script.marker_indicator.indicator_duration',
        min: 3,
        max: 10,
        step: 0.5
    }
};

export function createIndicatorConfigInputs(tempConfig: ConfigData): string {
    return Object.entries(INDICATOR_CONFIG_FIELDS)
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