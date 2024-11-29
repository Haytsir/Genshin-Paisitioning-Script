export type UpdateData = {
    targetType: string;
    targetVersion: string;
    currentVersion: string;
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

type CvatError = {
    errorCode?: number;
    errorList?: string[];
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