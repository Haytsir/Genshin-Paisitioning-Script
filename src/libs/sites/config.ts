export type ConfigData = {
    auto_app_update: boolean;
    auto_lib_update: boolean;
    capture_interval: number;
    capture_delay_on_error: number;
    use_bit_blt_capture_mode: boolean;
    changed?: boolean;
}