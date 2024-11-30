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
            indicator_duration: number;
        };
    };
}

export function getDefaultConfig(): AppConfigData {
    return {
        app: {
            auto_app_update: true,
            auto_lib_update: true,
            capture_interval: 250,
            capture_delay_on_error: 1000,
            use_bit_blt_capture_mode: false
        },
        script: {
            marker_indicator: {
                show_user_indicator: true,
                indicator_size: 45,
                indicator_color: '#d3bc8e',
                indicator_initial_opacity: 0.35,
                indicator_duration: 7
            }
        }
    };
}
