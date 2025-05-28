import { ConfigData } from "@src/libs/sites/config";
import { unsafeWindow } from '$';

// Site class에서 넘겨받는 맵 정보 타입,
// 스크립트가 구버전인 상황에서도 새 맵 정보를 추가할 수 있도록,
// Site class에서 넘겨줄 때 현재 사이트의 변수 등을 이용해 최신 맵 정보 데이터를 추가하여 주어야 함.
interface MapOffsetInfo {
    [mapId: number]: {
        lib_map_id: number;
        formula_x: string;
        formula_y: string;
        title: string;
    };
}

export function createOffsetConfigInputs(tempConfig: ConfigData): string {
    const offsets = tempConfig.script.marker_offsets;
    let html = '<div class="offset-list">';
    
    // TODO: 현재 맵 offset 설정 특화 기능 추가.
    for(const mapId in offsets) {
        const offset = offsets[mapId];
        html += `
            <div class="offset-item">
                <h3>${offset.title}</h3>
                <div class="formula-inputs">
                    <div class="formula-group">
                        <label>X 공식:</label>
                        <input type="text" class="formula-input" data-map="${mapId}" data-axis="x" value="${offset.formula_x}">
                    </div>
                    <div class="formula-group">
                        <label>Y 공식:</label>
                        <input type="text" class="formula-input" data-map="${mapId}" data-axis="y" value="${offset.formula_y}">
                    </div>
                </div>
            </div>
        `;
    }    
    html += '</div>';
    return html;
} 