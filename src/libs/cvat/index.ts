export type UpdateData = {
    targetType: string;
    targetVersion: string;
    currentVersion: string;
    displayVersionName: string;
    downloaded: number;
    fileSize: number;
    percent: number;
    done: boolean;
    updated: false;
}

export type TrackData = {
    m: number;
    x: number;
    y: number;
    r: number;
    a: number;
    err: CvatError;
}

export type CvatConfig = {
    auto_app_update: boolean;
    auto_lib_update: boolean;
    capture_interval: number;
    capture_delay_on_error: number;
    use_bit_blt_capture_mode: boolean;
}

type CvatError = {
    errorCode?: number;
    errorList?: Array<{
        code: number;
        msg: string;
    }>;
}

export async function loadCvat(debug=false): Promise<void> {
    const params: string[] = new Array();
    if(debug) params.push('debug');
    params.push('launch');
    const launchBase = 'genshin-paisitioning://'
    let launchUrl = `${launchBase}${params.join('/')}`;
    try {
        const a: HTMLAnchorElement = document.createElement('a');
        a.href = launchUrl;
        a.click();
    } catch (e) {
        console.error(e);
    }
}

export function getCvatDefaultConfig(): CvatConfig {
    return {
        auto_app_update: true,
        auto_lib_update: true,
        capture_interval: 250,
        capture_delay_on_error: 1000,
        use_bit_blt_capture_mode: false
    };
}
