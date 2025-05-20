import { ConfigData } from "@src/libs/sites/config";
import { unsafeWindow } from '$';

export function createOffsetConfigInputs(tempConfig: ConfigData): string {
    const offsets = tempConfig.script.marker_offsets;
    let html = '<div class="offset-list">';
    
    // 현재 맵에 대한 offset 설정
    const currentMap = Number(unsafeWindow.MAPS_Type) || 2;
    const currentOffset = offsets[currentMap] || { formula_x: '', formula_y: '' };
    
    html += `
        <div class="offset-item">
            <h3>현재 맵 Offset 설정</h3>
            <div class="formula-inputs">
                <div class="formula-group">
                    <label>X 공식:</label>
                    <input type="text" class="formula-input" data-map="${currentMap}" data-axis="x" value="${currentOffset.formula_x}">
                </div>
                <div class="formula-group">
                    <label>Y 공식:</label>
                    <input type="text" class="formula-input" data-map="${currentMap}" data-axis="y" value="${currentOffset.formula_y}">
                </div>
            </div>
        </div>
    `;
    
    html += '</div>';
    return html;
} 