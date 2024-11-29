export interface AppConfigData {
    app: {
        auto_app_update: boolean;
        auto_lib_update: boolean;
        capture_interval: number;
        capture_delay_on_error: number;
        use_bit_blt_capture_mode: boolean;
    };
    script: {
        marker_indicator: {
            show_user_indicator: boolean;
            indicator_size: number;
            indicator_color: string;
            indicator_initial_opacity: number;
        };
    };
}
