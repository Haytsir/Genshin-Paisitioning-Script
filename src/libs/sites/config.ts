import { CvatConfig, getCvatDefaultConfig } from "../cvat";

export interface ConfigData {
    app: CvatConfig;
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

export function getDefaultConfig(): ConfigData {
    return {
        app: getCvatDefaultConfig(),
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
