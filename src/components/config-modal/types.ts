import { ConfigData } from "@src/libs/sites/config";

// 설정 경로를 위한 타입 정의
export type PathsToStringProps<T> = T extends object
    ? {
        [K in keyof T]: T[K] extends object
            ? `${string & K}.${PathsToStringProps<T[K]>}`
            : string & K
    }[keyof T]
    : never;

export type ConfigPath = PathsToStringProps<ConfigData>;

export interface ConfigField {
    label: string;
    type: 'checkbox' | 'number' | 'color' | 'range' | 'formula';
    section: 'app' | 'indicator' | 'offset';
    path: ConfigPath;
    min?: number;
    max?: number;
    step?: number;
}

export interface OffsetConfig {
    formula_x: string;
    formula_y: string;
} 