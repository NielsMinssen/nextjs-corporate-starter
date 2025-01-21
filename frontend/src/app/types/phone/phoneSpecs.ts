interface PhoneSpecs {
    brand_and_full_name: string;
    Design: {
        weight_g: number;
        thickness_mm: number;
        width_mm: number;
        height_mm: number;
        IP_rating: string;
        volume_cm3: number;
    };
    Screen: {
        screen_size_in: number;
        screen_type: string;
        pixel_density_ppi: number;
        resolution: string;
        refresh_rate_hz: number;
        typical_brightness_nits: number;
        HDR10_compatible: boolean;
        Dolby_Vision_compatible: boolean;
    };
    Performance: {
        storage_options_gb: number;
        RAM_gb: number;
        AnTuTu_benchmark_score: number;
        GPU_name: string;
        processor_speed_ghz: {
            text: string;
            value: number;
        };
        RAM_speed_mhz: number;
        semiconductor_size_nm: number;
        supports_64_bit: boolean;
        uses_big_LITTLE_technology: boolean;
        processor_threads: number;
        uses_multithreading: boolean;
    };
    Cameras: {
        main_camera_megapixels: {
            text: string;
            value: number;
        }
        front_camera_megapixels: number;
        built_in_optical_image_stabilization: boolean;
        video_recording: string;
        largest_aperture_f: number;
        continuous_autofocus_during_video_recording: boolean;
        can_record_slow_motion_videos: boolean;
        IGD_mode: boolean;
        optical_zoom_x: number;
        CMOS_sensor: boolean;
        manual_ISO: boolean;
        burst_mode: boolean;
        manual_focus: boolean;
        manual_white_balance: boolean;
        takes_raw_images: boolean;
        AF_touch: boolean;
        manual_shutter_speed: boolean;
        large_aperture_front_camera_f: number;
        Dolby_Vision_recording: boolean;
    };
    Operating_System: {
        version: string;
        location_privacy_options: boolean;
        camera_and_microphone_privacy_options: boolean;
        theme_customization: boolean;
        dark_mode: boolean;
        WiFi_password_sharing: boolean;
        battery_health_check: boolean;
        extra_dim_mode: boolean;
        Focus_mode: boolean;
        dynamic_theming: boolean;
        offload_apps: boolean;
        customizable_notifications: boolean;
        live_text: boolean;
        screen_sharing: boolean;
        direct_OS_updates: boolean;
        quick_start: boolean;
    };
    Battery: {
        battery_capacity_mAh: number;
        wireless_charging: boolean;
        fast_charging: boolean;
        charging_speed_w: number;
        battery_life_h: number;
    };
    Audio: {
        mini_jack: boolean;
        built_in_stereo_speaker: boolean;
        aptX: boolean;
        LDAC: boolean;
        aptX_HD: boolean;
    };
    Features: {
        supports_5G: boolean;
        WiFi_version: string;
        download_speed_mbps: number;
        upload_speed_mbps: number;
        USB_Type_C_ports: boolean;
        USB_version: string;
        NFC_device: boolean;
        SIM_cards: string;
        fingerprint_reader: boolean;
        emergency_communication_via_satellite: boolean;
        detects_car_accidents: boolean;
        Bluetooth_version: string;
        gyroscope: boolean;
        GPS: boolean;
        compass: boolean;
        WiFi_compatible: boolean;
        infrared_sensor: boolean;
        accelerometer: boolean;
        barometer: boolean;
        supports_Galileo: boolean;
    };
}