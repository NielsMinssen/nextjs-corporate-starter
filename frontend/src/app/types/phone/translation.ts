interface Translation {
    phoneComparison: {
        title: string;
        description: string;
        selectPhone1: string;
        selectPhone2: string;
        select: string;
        compareButton: string;
        points: string;
        attribute: string;
        bothequal: string;
        equivalent: string;
        is: string;
        betterthan: string;
        basedon: string;
        buyonamazon: string;
        amazondisclaimer: string;
        similarCarousel: {
            title: string;
        },
        popularCarousel: {
            title: string;
        },
        neutralAttribute: string;
        details: { [key: string]: { title: string; description: string } } & {
            title: string;
            brand_and_full_name: {
                title: string;
                description: string;
            };
            Design: {
                title: string;
                weight_g: {
                    title: string;
                    description: string;
                };
                thickness_mm: {
                    title: string;
                    description: string;
                };
                width_mm: {
                    title: string;
                    description: string;
                };
                height_mm: {
                    title: string;
                    description: string;
                };
                IP_rating: {
                    title: string;
                    description: string;
                };
                volume_cm3: {
                    title: string;
                    description: string;
                };
            };
            Screen: {
                title: string;
                screen_size_in: {
                    title: string;
                    description: string;
                };
                screen_type: {
                    title: string;
                    description: string;
                };
                pixel_density_ppi: {
                    title: string;
                    description: string;
                };
                resolution: {
                    title: string;
                    description: string;
                };
                refresh_rate_hz: {
                    title: string;
                    description: string;
                };
                typical_brightness_nits: {
                    title: string;
                    description: string;
                };
                HDR10_compatible: {
                    title: string;
                    description: string;
                };
                Dolby_Vision_compatible: {
                    title: string;
                    description: string;
                };
            };
            Performance: {
                title: string;
                storage_options_gb: {
                    title: string;
                    description: string;
                };
                RAM_gb: {
                    title: string;
                    description: string;
                };
                AnTuTu_benchmark_score: {
                    title: string;
                    description: string;
                };
                GPU_name: {
                    title: string;
                    description: string;
                };
                processor_speed_ghz: {
                    title: string;
                    description: string;
                };
                RAM_speed_mhz: {
                    title: string;
                    description: string;
                };
                semiconductor_size_nm: {
                    title: string;
                    description: string;
                };
                supports_64_bit: {
                    title: string;
                    description: string;
                };
                uses_big_LITTLE_technology: {
                    title: string;
                    description: string;
                };
                processor_threads: {
                    title: string;
                    description: string;
                };
                uses_multithreading: {
                    title: string;
                    description: string;
                };
            };
            Cameras: {
                title: string;
                main_camera_megapixels: {
                    title: string;
                    description: string;
                };
                front_camera_megapixels: {
                    title: string;
                    description: string;
                };
                built_in_optical_image_stabilization: {
                    title: string;
                    description: string;
                };
                video_recording: {
                    title: string;
                    description: string;
                };
                largest_aperture_f: {
                    title: string;
                    description: string;
                };
                continuous_autofocus_during_video_recording: {
                    title: string;
                    description: string;
                };
                can_record_slow_motion_videos: {
                    title: string;
                    description: string;
                };
                IGD_mode: {
                    title: string;
                    description: string;
                };
                flash: {
                    title: string;
                    description: string;
                };
                optical_zoom_x: {
                    title: string;
                    description: string;
                };
                CMOS_sensor: {
                    title: string;
                    description: string;
                };
                manual_ISO: {
                    title: string;
                    description: string;
                };
                burst_mode: {
                    title: string;
                    description: string;
                };
                manual_focus: {
                    title: string;
                    description: string;
                };
                manual_white_balance: {
                    title: string;
                    description: string;
                };
                takes_raw_images: {
                    title: string;
                    description: string;
                };
                AF_touch: {
                    title: string;
                    description: string;
                };
                manual_shutter_speed: {
                    title: string;
                    description: string;
                };
                in_camera_panoramas: {
                    title: string;
                    description: string;
                };
                large_aperture_front_camera_f: {
                    title: string;
                    description: string;
                };
                Dolby_Vision_recording: {
                    title: string;
                    description: string;
                };
            };
            Operating_System: {
                title: string;
                version: {
                    title: string;
                    description: string;
                };
                location_privacy_options: {
                    title: string;
                    description: string;
                };
                camera_and_microphone_privacy_options: {
                    title: string;
                    description: string;
                };
                theme_customization: {
                    title: string;
                    description: string;
                };
                dark_mode: {
                    title: string;
                    description: string;
                };
                WiFi_password_sharing: {
                    title: string;
                    description: string;
                };
                battery_health_check: {
                    title: string;
                    description: string;
                };
                extra_dim_mode: {
                    title: string;
                    description: string;
                };
                Focus_mode: {
                    title: string;
                    description: string;
                };
                dynamic_theming: {
                    title: string;
                    description: string;
                };
                offload_apps: {
                    title: string;
                    description: string;
                };
                customizable_notifications: {
                    title: string;
                    description: string;
                };
                live_text: {
                    title: string;
                    description: string;
                };
                direct_OS_updates: {
                    title: string;
                    description: string;
                };
                quick_start: {
                    title: string;
                    description: string;
                };
            };
            Battery: {
                title: string;
                battery_capacity_mAh: {
                    title: string;
                    description: string;
                };
                wireless_charging: {
                    title: string;
                    description: string;
                };
                fast_charging: {
                    title: string;
                    description: string;
                };
                charging_speed_w: {
                    title: string;
                    description: string;
                };
                battery_life_h: {
                    title: string;
                    description: string;
                };
            };
            Audio: {
                title: string;
                built_in_stereo_speaker: {
                    title: string;
                    description: string;
                };
                aptX: {
                    title: string;
                    description: string;
                };
                LDAC: {
                    title: string;
                    description: string;
                };
                aptX_HD: {
                    title: string;
                    description: string;
                };
            };
            Features: {
                title: string;
                supports_5G: {
                    title: string;
                    description: string;
                };
                WiFi_version: {
                    title: string;
                    description: string;
                };
                download_speed_mbps: {
                    title: string;
                    description: string;
                };
                upload_speed_mbps: {
                    title: string;
                    description: string;
                };
                USB_Type_C_ports: {
                    title: string;
                    description: string;
                };
                USB_version: {
                    title: string;
                    description: string;
                };
                NFC_device: {
                    title: string;
                    description: string;
                };
                SIM_cards: {
                    title: string;
                    description: string;
                };
                fingerprint_reader: {
                    title: string;
                    description: string;
                };
                emergency_communication_via_satellite: {
                    title: string;
                    description: string;
                };
                detects_car_accidents: {
                    title: string;
                    description: string;
                };
                Bluetooth_version: {
                    title: string;
                    description: string;
                };
                gyroscope: {
                    title: string;
                    description: string;
                };
                GPS: {
                    title: string;
                    description: string;
                };
                compass: {
                    title: string;
                    description: string;
                };
                WiFi_compatible: {
                    title: string;
                    description: string;
                };
                infrared_sensor: {
                    title: string;
                    description: string;
                };
                accelerometer: {
                    title: string;
                    description: string;
                };
                barometer: {
                    title: string;
                    description: string;
                };
                supports_Galileo: {
                    title: string;
                    description: string;
                };
            };
        };
    };
}