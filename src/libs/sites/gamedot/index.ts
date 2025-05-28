import { BaseSite } from "..";
import { sessionStore, persistentStore } from "@src/libs/store";
import { unsafeWindow } from "\$";
import { CvatConfig, TrackData } from "@src/libs/cvat";
import { overrideFuntions } from "./overrides";
import './style.scss';
import { ConfigData } from "../config";
import { FormulaManager } from "../config/formula";

// 사이트에서 지정한 변수들의 타입 추가
declare global {
    interface Window {
        objectPanelWindow: HTMLDivElement | null;
        objectViewer: HTMLDivElement | null;
        objectLayerBase: HTMLDivElement | null;
        objectLayerPin: HTMLDivElement | null;
        objectTargetFilterBtn: HTMLDivElement | null;
        MAPS_Size: number;
        MAPS_PointScale: number;
        MAPS_Scale: number;
        MAPS_RelativeX: number;
        MAPS_RelativeY: number;
        MAPS_ViewMobile: boolean;
        MAPS_Type: string;
        MAPS_Version: {
            [key: string]: {
                id: number;
                title: string;
                relativeX: number;
                relativeY: number;
                size: number;
                update: string;
                maps: {
                    [mapName: string]: string;
                }
            };
        };
        drawMapsScale: (...args: any) => void;
        changeMapsType: (...args: any) => void;
    }
}

export class GamedotMaps extends BaseSite {
    static siteUri = 'genshin.gamedot.org';
    static siteId = 'gamedot';

    static defaultMarkerOffsets: ConfigData["script"]["marker_offsets"] = {
        2: {
            title: '티바트 대륙',
            lib_map_id: 0,
            formula_x: '((x-2285)/2)',
            formula_y: '((y+5890)/2)'
        },
        7: {
            title: '연하궁',
            lib_map_id: 1,
            formula_x: '(((x)*1.275) - 2247)',
            formula_y: '(((y)*1.275) - 670)'
        },
        8: {
            title: '층암거연',
            lib_map_id: 2,
            formula_x: '(((x)*1.275) - 2060)',
            formula_y: '(((y)*1.275) - 225)'
        },
        12: {
            title: '지난 날의 바다',
            lib_map_id: 3,
            formula_x: '(((x)*1.275))',
            formula_y: '(((y)*1.275))'
        },
        13: {
            title: '태고의 신성한 산',
            lib_map_id: 4,
            formula_x: '(((x)*1.275))',
            formula_y: '(((y)*1.275))'
        }
    };
    public objectPanelMenu: HTMLDivElement | null = null;
    public objectTargetFilterBtn: HTMLDivElement | null = null;
    public libIdToKeyMap: Map<number, string>;
    public mcEnsure: number;
    public focusPos: [number, number] = [0, 0];
    private tmpDragging = -1;
    private tmpMousePos: [number, number] = [0, 0];
    private formulaManager: FormulaManager; // 현재 위치 마커 오프셋 계산을 위한 수식 매니저

    static get instance(): GamedotMaps {
        return BaseSite.instance as GamedotMaps;
    }

    constructor() {
        super();

        this.communication.setHandlers({
            onTrackEvent: (e, d) => this.onTrackEvent(e, d)
        });

        const menu = document.getElementById('mapsMenu');
        if(menu instanceof HTMLDivElement)
            this.objectPanelMenu = menu;

        const objectTargetFilter = document.getElementById("mapsAreaFilter");
        if(objectTargetFilter instanceof HTMLDivElement)
            this.objectTargetFilterBtn = objectTargetFilter.querySelector("div[data-value='unset']");

        this.userMarker.style.transform = `translate(${unsafeWindow.MAPS_RelativeX}px, ${unsafeWindow.MAPS_RelativeY}px) scale(${unsafeWindow.MAPS_PointScale})`;
        if(unsafeWindow.objectLayerPin instanceof HTMLDivElement)
            this.appendUserMarker(unsafeWindow.objectLayerPin);

        this.mapElement = unsafeWindow.objectViewer;
        
        this.libIdToKeyMap = new Map<number, string>(); // CVAT 의 m(맵 id)를 통해 게임닷의 맵 이름을 얻어오기 위함, (id, 맵 이름)
        const mapEntries = Object.entries(unsafeWindow.MAPS_Version);
        mapEntries.sort((a, b) => a[1].id - b[1].id);
        mapEntries.forEach(([key, mapInfo], idx) => {
            this.libIdToKeyMap.set(idx, key);
            if(!GamedotMaps.defaultMarkerOffsets[mapInfo.id]) {
                GamedotMaps.defaultMarkerOffsets[mapInfo.id] = { // 스크립트가 업데이트 되지 않은 상황에서 맵 추가에 대응하기 위해 기본값에 존재하지 않는 맵 정보도 갱신
                    title: mapInfo.title,
                    lib_map_id: idx,
                    formula_x: '(((x)*1.275))',
                    formula_y: '(((y)*1.275))'
                }
            }
        });
        this.mcEnsure = 0;
        this.formulaManager = new FormulaManager();

        if(unsafeWindow.objectViewer instanceof HTMLDivElement) {
            unsafeWindow.objectViewer.addEventListener('mousedown', (e) => this.onMouseTouchDown(e));
            unsafeWindow.objectViewer.addEventListener('touchstart', (e) => this.onMouseTouchDown(e));
            unsafeWindow.objectViewer.addEventListener('mouseup', (e) => this.onMouseTouchUp(e));
            unsafeWindow.objectViewer.addEventListener('touchend', (e) => this.onMouseTouchUp(e));
            unsafeWindow.objectViewer.addEventListener('mousemove', (e) => this.onMouseTouchMove(e));
            unsafeWindow.objectViewer.addEventListener('touchmove', (e) => this.onMouseTouchMove(e));
        }

        overrideFuntions(this);

        sessionStore.upsert({
            versionInfo: {
                script: {
                    site: GamedotMaps.siteUri
                }
            }
        });

        persistentStore.upsert({
            config: {
                script: {
                    marker_offsets: {
                        ...GamedotMaps.defaultMarkerOffsets,
                        ...persistentStore.getStateReadonly().config.script?.marker_offsets,
                    }
                }
            }
        });
    }

    setFocusScroll(x: number, y: number) {
        if(unsafeWindow.objectLayerBase instanceof HTMLDivElement && unsafeWindow.objectViewer instanceof HTMLDivElement){
            let baseView: DOMRect = unsafeWindow.objectLayerBase.getClientRects()[0];
            let nowView: DOMRect = unsafeWindow.objectViewer.getClientRects()[0];
            // 현재 화면에서 보고 있는 비율 확인
            var viewWidth = (unsafeWindow.MAPS_Size / 100) * (nowView.width / (baseView.width / 100));
            var viewHeight = (unsafeWindow.MAPS_Size / 100) * (nowView.height / (baseView.height / 100));

            var scrollX = ((x - viewWidth / 2) / 100) * unsafeWindow.MAPS_Scale;
            var scrollY = ((y - viewHeight / 2) / 100) * unsafeWindow.MAPS_Scale;
            
            unsafeWindow.objectViewer.scrollTo({top: scrollY, left: scrollX, behavior: 'smooth'});
        }
    }

    setFocusPoint(x: number, y: number) {
        if(unsafeWindow.objectLayerBase instanceof HTMLDivElement && unsafeWindow.objectViewer instanceof HTMLDivElement) {
            x = x + unsafeWindow.MAPS_RelativeX;
            y = y + unsafeWindow.MAPS_RelativeY;
        
            var baseView = unsafeWindow.objectLayerBase.getClientRects()[0];
            var nowView = unsafeWindow.objectViewer.getClientRects()[0];
        
            // 현재 화면에서 보고 있는 비율 확인
            var viewWidth = (unsafeWindow.MAPS_Size / 100) * (nowView.width / (baseView.width / 100));
            var viewHeight = (unsafeWindow.MAPS_Size / 100) * (nowView.height / (baseView.height / 100));
        
            var scrollX = ((x - viewWidth / 2) / 100) * unsafeWindow.MAPS_Scale;
            var scrollY = ((y - viewHeight / 2) / 100) * unsafeWindow.MAPS_Scale;
            
            unsafeWindow.objectViewer.scrollTo({top: scrollY, left: scrollX, behavior: 'smooth'});
        }
    }
    onTrackEvent(_event: MessageEvent, posobj: TrackData) {
        let { m, x, y, r: rot, a: dir } = posobj;
        super.onTrackEvent(null, posobj);
        const { debug } = sessionStore.getStateReadonly().currentUser;
        if(debug) {
            console.debug("gamedot:onTrackEvent", posobj);
        }
        if(this.currentMap !== m) {
            if(this.mcEnsure < 10) {
                this.mcEnsure = this.mcEnsure + 1
            } else {
                this.mcEnsure = 0
                this.currentMap = m
                if(this.libIdToKeyMap.has(this.currentMap)) {
                    const mapName = this.libIdToKeyMap.get(this.currentMap);
                    if(mapName)
                        this.onPlayerMovedMap(mapName); // 플레이어가 (인게임에서) 실제로 다른 맵으로 이동했다고 판단될 때 호출
                } else {
                    this.handleError(new Error(`알 수 없는 지도입니다: ${m}`));
                }
            }
        } else {
            if(x===0 && y===0) return;
            const pos = [x, y];
            
            this.formulaManager.setVariable('x', '인게임 X 좌표', () => pos[0]);
            this.formulaManager.setVariable('y', '인게임 Y 좌표', () => pos[1]);
            this.formulaManager.setVariable('scale', '지도 크기', () => unsafeWindow.MAPS_Scale);
            this.formulaManager.setVariable('relativeX', '맵스 상대 X 오프셋', () => unsafeWindow.MAPS_RelativeX);
            this.formulaManager.setVariable('relativeY', '맵스 상대 Y 오프셋', () => unsafeWindow.MAPS_RelativeY);
            
            const config = persistentStore.getStateReadonly().config as ConfigData;
            
            // this.currentMap은 CVAT 라이브러리에서 인식하는 맵 번호이므로, 이를 게임닷 맵스 번호로 변환
            const mapId = this.libIdToKeyMap.get(this.currentMap) || 'teyvat';
            const formulaX = config.script.marker_offsets[unsafeWindow.MAPS_Version[mapId]?.id]?.formula_x || 'x';
            const formulaY = config.script.marker_offsets[unsafeWindow.MAPS_Version[mapId]?.id]?.formula_y || 'y';
            pos[0] = this.formulaManager.evaluate(formulaX);
            pos[1] = this.formulaManager.evaluate(formulaY);
            if(debug) {
                console.debug("gamedot:onTrackEvent.GetOffsetFormula", formulaX, formulaY);
                console.debug("gamedot:onTrackEvent.EvaluateFormula", pos[0], pos[1]);
            }
            
            let rpos=[pos[0], pos[1]]
            rpos[0] = pos[0]+unsafeWindow.MAPS_RelativeX;
            rpos[1] = pos[1]+unsafeWindow.MAPS_RelativeY;
            if (this.isPinned) {
                let distance =  Math.pow(this.focusPos[0] - pos[0], 2) +
                                        Math.pow(this.focusPos[1] - pos[1], 2)
                distance = Math.sqrt(distance)
                if(distance > 15) {
                    this.focusPos[0] = pos[0]
                    this.focusPos[1] = pos[1]
                    this.setFocusPoint(pos[0], pos[1]);
                }
            }
            let o = this.userMarker.style['transform']
            let t, s, l, c;
            t = 'translate'
            s = this.userMarker.style["transform"].indexOf(t) + t.length + 1
            l = this.userMarker.style["transform"].indexOf(')', s)
            c = this.userMarker.style["transform"].substring(s, l)

            let setValues = [Math.round(rpos[0])+'px', Math.round(rpos[1])+'px']
            this.userMarker.style['transform'] = o.substring(0, s) + setValues.join(', ') + o.substring(s + c.length);

            if(dir === 0 && rot === 0) return;
            this.userMarker.style.setProperty('--dir', 0 - dir + 'deg');
            this.userMarker.style.setProperty('--rot', 0 - rot + 'deg');
        }
    }

    // 플레이어가 (인게임에서) 다른 맵으로 이동했을 때 호출되는 함수
    onPlayerMovedMap(mapName: string) {
        const objectTab = document.getElementById("mapsAreaFilter");
        if(this.objectTargetFilterBtn instanceof HTMLDivElement) 
            this.objectTargetFilterBtn.classList.remove('current-map')
        if(objectTab instanceof HTMLDivElement)
            this.objectTargetFilterBtn = objectTab.querySelector(`div[data-value='${mapName}']`)
        if(this.objectTargetFilterBtn instanceof HTMLDivElement)
            this.objectTargetFilterBtn.classList.add('current-map')

        if(this.isActive && this.userMarker) {
            if(unsafeWindow.MAPS_Type !== mapName) {
                this.userMarker.hide();
                this.setPinned(false);
                this.handleError(new Error(`플레이어의 현재 위치와 활성화된 지도가 다릅니다: 현재 위치 ${mapName}, 활성화된 지도 ${unsafeWindow.MAPS_Type}`));
            } else {
                this.userMarker.show();
            }
        }
    }

    // 사용자가 게임닷 맵스 지도 타입을 변경했을 때 호출되는 함수
    onChangeMap({ strCode, strTarget, focus = false }: { strCode: string, strTarget: string, focus: boolean }, _mapCode = "") {
        console.debug("gamedot:onChangeMap", strCode, strTarget, focus, _mapCode);
        this.setPinned(false);
        if(this.isActive && this.userMarker) {
            if(this.libIdToKeyMap.get(this.currentMap) !== strCode) {
                this.userMarker.hide();
                this.handleError(new Error(`플레이어의 현재 위치와 활성화된 지도가 다릅니다: 현재 위치 ${strCode}, 활성화된 지도 ${unsafeWindow.MAPS_Type}`));
            } else {
                this.userMarker.show();
            }
            // 현재 맵이 어디인지 나타낼 인디케이터를 위해 클래스 지정
            if(this.objectTargetFilterBtn instanceof HTMLDivElement)
                this.objectTargetFilterBtn.classList.remove('current-map')
            const objectTab = document.getElementById("mapsAreaFilter");
            if(objectTab instanceof HTMLDivElement)
                this.objectTargetFilterBtn = objectTab.querySelector(`div[data-value='${this.libIdToKeyMap.get(this.currentMap)}']`)
            if(this.objectTargetFilterBtn)
                this.objectTargetFilterBtn.classList.add('current-map')
        }
    }

    setPinned(p: boolean): void {
        if(p) {
            if(this.libIdToKeyMap.get(this.currentMap) !== unsafeWindow.MAPS_Type) {
                unsafeWindow.changeMapsType({strCode: this.libIdToKeyMap.get(this.currentMap), focus: false}, this.libIdToKeyMap.get(this.currentMap));
                const objectTab = document.getElementById("mapsAreaFilter");

                // 따라가기를 눌러서 맵이 바뀌면, 필터 강조 표시도 바꾸기 위함
                if(objectTab instanceof HTMLDivElement) {
                    const currentFocus = objectTab.querySelector('div.focus');
                    
                    if(currentFocus instanceof HTMLDivElement)
                        currentFocus.classList.remove('focus');

                    const targetFilterBtn = objectTab.querySelector(`div[data-value='${this.libIdToKeyMap.get(this.currentMap)}']`) || objectTab.querySelector(`div[data-value='unset']`);

                    if(targetFilterBtn)
                        targetFilterBtn.classList.add('focus')
                }

                // 타임아웃이 없으면, 현재 맵이 아닌 맵에서 따라가기 할 경우 포커스가 이상한 곳으로 날아가는 경우가 있음
                setTimeout(() => super.setPinned(p), 500);
                return;
            }
        }
        // 현재 인게임 맵과 게임닷 맵이 서로 같다면 따라가기 토글 바로 적용
        super.setPinned(p);
    }

    onMouseTouchDown(e: MouseEvent | TouchEvent) {
        if (!sessionStore.getStateReadonly().currentUser.isActive) return;
        this.tmpDragging = Date.now();
        if(e instanceof MouseEvent)
            this.tmpMousePos = [e.clientX, e.clientY];
        else if(e instanceof TouchEvent)
            this.tmpMousePos = [e.touches[0].clientX, e.touches[0].clientY];
    }

    onMouseTouchMove(e: MouseEvent | TouchEvent) {
        if (!sessionStore.getStateReadonly().currentUser.isActive) return;

        if (this.tmpDragging > 0 && Date.now() - this.tmpDragging > 100) {
            let nowMousePos: [number, number] = [0, 0];
            if(e instanceof MouseEvent)
                nowMousePos = [e.clientX, e.clientY]
            else if(e instanceof TouchEvent)
                nowMousePos = [e.touches[0].clientX, e.touches[0].clientY];
            const diff = [Math.abs(nowMousePos[0] - this.tmpMousePos[0]), Math.abs(nowMousePos[1] - this.tmpMousePos[1])];
            if (diff[0] > 20 || diff[1] > 20) this.setPinned(false);
        }
    }

    onMouseTouchUp(_e: MouseEvent | TouchEvent) {
        if (!sessionStore.getStateReadonly().currentUser.isActive) return;
            this.tmpDragging = 0;
    }
}