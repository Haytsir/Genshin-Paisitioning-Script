import { ConfigModal } from "../../components/config-modal";

export type ConfigData = {
    autoAppUpdate: boolean;
    autoLibUpdate: boolean;
    captureInterval: number;
    captureDelayOnError: number;
    useBitBltCaptureMode: boolean;
    changed?: boolean;
}

export class Config {
    private _config: ConfigData;
    public modal: ConfigModal;
    public onConfigChanged: (config: ConfigData) => void = () => {};
    constructor(config: ConfigData) {
        this._config = config;
        this.modal = ConfigModal.getInstance(this._config);
        this.modal.onSaveConfig = (config: ConfigData) => {
            this.config = config;
        }
    }

    set config(config: ConfigData) {
        this._config = config;
        this.onConfigChanged(this._config);
    }

    get config(): ConfigData {
        return this._config;
    }
}