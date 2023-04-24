import { MapSite } from "..";
import { unsafeWindow } from "\$";
import { TrackData, UpdateData } from "../../cvat";
import { overrideFuntions } from "./overrides";
import { ConfigData } from "../config";


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
        drawMapsScale: (...args: any) => void;
        changeMapsType: (...args: any) => void;
    }
}

export class GamedotMaps extends MapSite {
    static #instance: GamedotMaps;
    public objectPanelMenu: HTMLDivElement | null = null;
    public objectTargetFilterBtn: HTMLDivElement | null = null;
    public mapInfo: Map<number, string>;
    public mcEnsure: number;
    public focusPos: [number, number] = [0, 0];
    private tmpDragging = -1;
    private tmpMousePos: [number, number] = [0, 0];

    static get instance(): GamedotMaps {
        if(!GamedotMaps.#instance) GamedotMaps.#instance = new GamedotMaps();
        return GamedotMaps.#instance;
    }

    constructor() {
        super();
        const menu = document.getElementById('mapsMenu');
        if(menu instanceof HTMLDivElement)
            this.objectPanelMenu = menu;

        const objectTargetFilter = document.getElementById("mapsAreaFilter");
        if(objectTargetFilter instanceof HTMLDivElement)
            this.objectTargetFilterBtn = objectTargetFilter.querySelector("div[data-value='unset']");

        this.userMarker.userMarker.style.transform = `translate(${unsafeWindow.MAPS_RelativeX}px, ${unsafeWindow.MAPS_RelativeY}px) scale(${unsafeWindow.MAPS_PointScale})`;
        if(unsafeWindow.objectLayerPin instanceof HTMLDivElement)
            this.appendUserMarker(unsafeWindow.objectLayerPin);

        this.mapElement = unsafeWindow.objectViewer;
        
        this.mapInfo = new Map<number, string>([[0, 'teyvat'], [1, 'enkanomiya'], [2, 'underground-mines']]);
        this.mcEnsure = 0;

        // this.ws.onSocketConnectPost = this.onSocketConnect;
        this.ws.onTrackEvent = (e, d) => this.mapOnPos(e, d);
        this.ws.onAppUpdateProgress = (e, d) => this.onLibUpdateProgress(e, d);
        this.ws.onAppUpdateDone = (e, d) => this.onLibUpdateDone(e, d);
        this.ws.onLibUpdateProgress = (e, d) => this.onLibUpdateProgress(e, d);
        this.ws.onLibUpdateDone = (e, d) => this.onLibUpdateDone(e, d);
        this.ws.onLibInit = (e, d) => this.onLibInit(e, d);

        if(unsafeWindow.objectViewer instanceof HTMLDivElement) {
            unsafeWindow.objectViewer.addEventListener('mousedown', (e) => this.onMouseTouchDown(e));
            unsafeWindow.objectViewer.addEventListener('touchstart', (e) => this.onMouseTouchDown(e));
            unsafeWindow.objectViewer.addEventListener('mouseup', (e) => this.onMouseTouchUp(e));
            unsafeWindow.objectViewer.addEventListener('touchend', (e) => this.onMouseTouchUp(e));
            unsafeWindow.objectViewer.addEventListener('mousemove', (e) => this.onMouseTouchMove(e));
            unsafeWindow.objectViewer.addEventListener('touchmove', (e) => this.onMouseTouchMove(e));
        }

        overrideFuntions(this);
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
    mapOnPos(_event: MessageEvent, posobj: TrackData) {
        let { m, x, y, r: rot, a: dir, err } = posobj;
        if(err) {
            this.dialog.alertDialog('GPS', '위치를 얻는 도중 오류가 발생했습니다.', this.mapOnPos.name, 0, true);
            return;
        }
        if(this.dialog.isShowing){
            this.dialog.closeDialog(null, '위치를 얻는 도중 오류가 발생했습니다.', this.mapOnPos.name);
        }
        if(this.currentMap !== m) {
            if(this.mcEnsure < 10) {
                this.mcEnsure = this.mcEnsure + 1
            } else {
                this.mcEnsure = 0
                this.currentMap = m
                if(this.mapInfo.has(this.currentMap)) {
                    const mapName = this.mapInfo.get(this.currentMap);
                    if(mapName)
                        this.onPlayerMovedMap(mapName);
                } else {
                    this.dialog.alertDialog('GPS', '알 수 없는 지도입니다.', this.mapOnPos.name, 0, true);
                }
            }
        } else {
            const pos = [y, x];
            switch (this.currentMap) {
                case 0:
                    pos[0] = (pos[0] + 5890) / 2;
                    pos[1] = (pos[1] - 2285) / 2;
                    break;
                case 1:
                    pos[0] = ((pos[0])*1.275) - 670;
                    pos[1] = ((pos[1])*1.275) - 2247;
                    break;
                case 2:
                    pos[0] = ((pos[0])*1.275) - 225;
                    pos[1] = ((pos[1])*1.275) - 2060;
                    break;
                default:
                    pos[0] = (pos[0] + 5890) / 2;
                    pos[1] = (pos[1] - 2285) / 2;
            }
            let rpos=[pos[0], pos[1]]
            rpos[0] = pos[0]+unsafeWindow.MAPS_RelativeY-13;
            rpos[1] = pos[1]+unsafeWindow.MAPS_RelativeX-8;
            if (this.isPinned) {
                let distance =  Math.pow(this.focusPos[0] - pos[0], 2) +
                                        Math.pow(this.focusPos[1] - pos[1], 2)
                distance = Math.sqrt(distance)
                if(distance > 15) {
                    this.focusPos[0] = pos[0]
                    this.focusPos[1] = pos[1]
                    this.setFocusPoint(pos[1], pos[0]);
                }
            }
            let o = this.userMarker.userMarker.style['transform']
            let t, s, l, c;
            t = 'translate'
            s = this.userMarker.userMarker.style["transform"].indexOf(t) + t.length + 1
            l = this.userMarker.userMarker.style["transform"].indexOf(')', s)
            c = this.userMarker.userMarker.style["transform"].substring(s, l)

            let setValues = [Math.round(rpos[1])+'px', Math.round(rpos[0])+'px']

            this.userMarker.userMarker.style['transform'] = o.substring(0, s) + setValues.join(', ') + o.substring(s + c.length);
            
            this.userMarker.userMarkerIcon.style.setProperty('--dir', 0 - dir + 'deg');
            this.userMarker.userMarkerIcon.style.setProperty('--rot', 0 - rot + 'deg');
        }
    }

    onPlayerMovedMap(mapName: string) {
        const objectTab = document.getElementById("mapsAreaFilter");
        if(this.objectTargetFilterBtn instanceof HTMLDivElement) 
            this.objectTargetFilterBtn.classList.remove('current-map')
        if(objectTab instanceof HTMLDivElement)
            this.objectTargetFilterBtn = objectTab.querySelector(`div[data-value='${mapName}']`)
        if(this.objectTargetFilterBtn instanceof HTMLDivElement)
            this.objectTargetFilterBtn.classList.add('current-map')

        if(this.userMarker.userMarker) {
            if(unsafeWindow.MAPS_Type !== mapName) {
                this.userMarker.userMarker.classList.add('hide')
                this.setPinned(false);
                this.dialog.alertDialog('GPS', '플레이어의 현재 위치와 활성화된 지도가 다릅니다.', this.onPlayerMovedMap.name, 0, true);
            } else {
                this.userMarker.userMarker.classList.remove('hide')
                this.dialog.closeDialog(null, '플레이어의 현재 위치와 활성화된 지도가 다릅니다.', this.onPlayerMovedMap.name);
            }
        }
    }

    onChangeMap(strCode: string, _mapCode = "") {
        if(this.userMarker.userMarker) {
            if(unsafeWindow.MAPS_Type !== strCode) {
                this.userMarker.userMarker.classList.add('hide')
                this.setPinned(false);
                this.dialog.alertDialog('GPS', '플레이어의 현재 위치와 활성화된 지도가 다릅니다.', this.onChangeMap.name, 0, true);
            } else {
                this.userMarker.userMarker.classList.remove('hide')
                this.dialog.closeDialog(null, '플레이어의 현재 위치와 활성화된 지도가 다릅니다.', this.onChangeMap.name);
            }
            if(this.objectTargetFilterBtn instanceof HTMLDivElement)
                this.objectTargetFilterBtn.classList.remove('current-map')
            const objectTab = document.getElementById("mapsAreaFilter");
            if(objectTab instanceof HTMLDivElement)
                this.objectTargetFilterBtn = objectTab.querySelector(`div[data-value='${this.mapInfo.get(this.currentMap)}']`)
            if(this.objectTargetFilterBtn)
                this.objectTargetFilterBtn.classList.add('current-map')
        }
    }

    setPinned(p: boolean): void {
        super.setPinned(p);
        if(this.isPinned) {
            if(this.mapInfo.get(this.currentMap) !== unsafeWindow.MAPS_Type) {
                unsafeWindow.changeMapsType(this.mapInfo.get(this.currentMap))
            }
        }
    }

    mouseMoveEvent(event: MouseEvent): void {
        if (unsafeWindow.MAPS_ViewMobile == true) return;
        const rect = this.userMarker.userMarker.getBoundingClientRect();
        let vecX = event.clientX - (rect.left + window.scrollX)
        let vecY = event.clientY - (rect.top + window.scrollY)
        let dist = Math.sqrt( vecX*vecX + vecY*vecY )
        if(dist <= 17.5/unsafeWindow.MAPS_PointScale) {
            this.userMarker.userMarker.classList.add('hover')
        } else {
            this.userMarker.userMarker.classList.remove('hover')
        }
    }

    onMouseTouchDown(e: MouseEvent | TouchEvent) {
        if (!this.ws.isSocketOpen()) return;
        this.tmpDragging = Date.now();
        if(e instanceof MouseEvent)
            this.tmpMousePos = [e.clientX, e.clientY];
        else if(e instanceof TouchEvent)
            this.tmpMousePos = [e.touches[0].clientX, e.touches[0].clientY];
    }

    onMouseTouchMove(e: MouseEvent | TouchEvent) {
        if (!this.ws.isSocketOpen()) return;

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
        if (!this.ws.isSocketOpen()) return;
            this.tmpDragging = -1;
    }

    onStartAppUpdate(_event: MessageEvent, data: UpdateData) {
        this.dialog.alertDialog('GPS', `GPA ${data.targetVersion} 버전 업데이트 중...`, this.onStartLibUpdate.name, 0, false);
        this.dialog.showProgress();
    }

    onAppUpdateProgress(event: MessageEvent, data: UpdateData) {
        if(!this.dialog.isProgressing) {
            this.onStartAppUpdate(event, data)
        }
        this.dialog.changeProgress(data.percent);
    }

    onAppUpdateDone(_event: MessageEvent, data: UpdateData) {
        if(this.dialog.isShowing && this.dialog.isProgressing) {
            this.dialog.closeDialog(null, `GPA ${data.targetVersion} 버전 업데이트 중...`, this.onStartLibUpdate.name);
            this.dialog.hideProgress();
        }
    }

    onStartLibUpdate(_event: MessageEvent, data: UpdateData) {
        this.dialog.alertDialog('GPS', `라이브러리 ${data.targetVersion} 버전 업데이트 중...`, this.onStartLibUpdate.name, 0, false);
        this.dialog.showProgress();
    }

    onLibUpdateProgress(event: MessageEvent, data: UpdateData) {
        if(!this.dialog.isProgressing) {
            this.onStartLibUpdate(event, data)
        }
        this.dialog.changeProgress(data.percent);
    }

    onLibUpdateDone(_event: MessageEvent, data: UpdateData) {
        if(this.dialog.isShowing && this.dialog.isProgressing) {
            this.dialog.closeDialog(null, `라이브러리 ${data.targetVersion} 버전 업데이트 중...`, this.onStartLibUpdate.name);
            this.dialog.hideProgress();
        }
    }

    onLibInit(_event: MessageEvent, _data: ConfigData){
        document.body.addEventListener("mousemove", (e) => this.mouseMoveEvent(e));
    }
}