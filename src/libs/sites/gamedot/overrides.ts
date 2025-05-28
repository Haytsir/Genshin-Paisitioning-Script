import { unsafeWindow } from "$";
import { GamedotMaps } from ".";

// 기존 함수를 재정의하여 사용합니다.
export function overrideFuntions(site: GamedotMaps) {
    const Hooked_drawMapsScale = unsafeWindow.drawMapsScale;
    unsafeWindow.drawMapsScale = function(args: any) {
        var ret = Hooked_drawMapsScale.apply(this, [args]);
        let o = site.userMarker.style['transform']
        let t, s, l, c;
        t = 'scale'
        s = o.indexOf(t) + 'scale'.length + 1
        l = o.indexOf(')', s)
        c = o.substring(s, l-s)

        let setValues = [unsafeWindow.MAPS_PointScale]

        site.userMarker.style['transform'] = o.substring(0, s) + setValues.join(', ') + o.substring(s + c.length)
        return ret;
    };

    const Hooked_changeMapsType = unsafeWindow.changeMapsType;
    unsafeWindow.changeMapsType = function(...args) {
        let ret;
        try {
            ret = Hooked_changeMapsType.apply(this, args);
        } catch (err) {
            console.error(err);
        }

        site.onChangeMap.apply(site, [args[0], args[1]]);

        return ret;
    };
}