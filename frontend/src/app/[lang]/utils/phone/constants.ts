export const FALLBACK_SEO = {
    title: "SiliconCompare",
    description: "SiliconCompare is a hardware comparison tool that helps you find the best tools for your needs.",
}

export const comparisonAttributes: (keyof PhoneSpecs)[] = [
    "Performance",
    "Cameras",
    "Battery",
    "Screen",
    "Design",
    "Operating_System",
    "Audio",
    "Features",
];

export const numericAttributes: (keyof PhoneSpecs)[] = [
    "Design.weight_g" as keyof PhoneSpecs,
    "Design.thickness_mm" as keyof PhoneSpecs,
    "Design.width_mm" as keyof PhoneSpecs,
    "Design.height_mm" as keyof PhoneSpecs,
    "Design.volume_cm3" as keyof PhoneSpecs,
    "Screen.screen_size_in" as keyof PhoneSpecs,
    "Screen.pixel_density_ppi" as keyof PhoneSpecs,
    "Screen.refresh_rate_hz" as keyof PhoneSpecs,
    "Screen.typical_brightness_nits" as keyof PhoneSpecs,
    "Performance.storage_options_gb" as keyof PhoneSpecs,
    "Performance.RAM_gb" as keyof PhoneSpecs,
    "Performance.AnTuTu_benchmark_score" as keyof PhoneSpecs,
    "Performance.processor_speed_ghz" as keyof PhoneSpecs,
    "Performance.RAM_speed_mhz" as keyof PhoneSpecs,
    "Performance.semiconductor_size_nm" as keyof PhoneSpecs,
    "Performance.processor_threads" as keyof PhoneSpecs,
    "Cameras.main_camera_megapixels" as keyof PhoneSpecs,
    "Cameras.front_camera_megapixels" as keyof PhoneSpecs,
    "Cameras.largest_aperture_f" as keyof PhoneSpecs,
    "Cameras.large_aperture_front_camera_f" as keyof PhoneSpecs,
    "Cameras.optical_zoom_x" as keyof PhoneSpecs,
    "Battery.battery_capacity_mAh" as keyof PhoneSpecs,
    "Battery.charging_speed_w" as keyof PhoneSpecs,
    "Battery.battery_life_h" as keyof PhoneSpecs,
    "Features.download_speed_mbps" as keyof PhoneSpecs,
    "Features.upload_speed_mbps" as keyof PhoneSpecs,
];

// Attributes that are not necessarily better or worse based on their value
export const neutralAttributes = [
    "Design.width_mm",
    "Design.height_mm",
    "Design.volume_cm3",
    "Screen.screen_size_in",
];

export const attributesWhereLowerIsBetter = ["Design.weight_g", "Design.thickness_mm", "Performance.semiconductor_size_nm", "Cameras.largest_aperture_f", "Cameras.large_aperture_front_camera_f"];

// Define ranges for each numeric attribute
interface AttributeRange {
    min: number;
    max: number;
    lowerIsBetter?: boolean;
}


export const attributeRanges: Record<string, AttributeRange> = {
    // Design attributes
    "Design.weight_g": { min: 130, max: 350, lowerIsBetter: true },
    "Design.thickness_mm": { min: 5, max: 12, lowerIsBetter: true },
    "Design.width_mm": { "min": 60, "max": 80 },
    "Design.height_mm": { "min": 120, "max": 170 },
    "Design.volume_cm3": { "min": 36, "max": 163 },


    // Screen attributes
    "Screen.screen_size_in": { min: 5, max: 7.5 },
    "Screen.pixel_density_ppi": { min: 0, max: 500 },
    "Screen.refresh_rate_hz": { min: 0, max: 165 },
    "Screen.typical_brightness_nits": { min: 0, max: 2000 },

    // Performance attributes
    "Performance.storage_options_gb": { min: 0, max: 512 },
    "Performance.RAM_gb": { min: 0, max: 16 },
    "Performance.AnTuTu_benchmark_score": { min: 0, max: 1500000 },
    "Performance.processor_speed_ghz": { min: 0, max: 20 },
    "Performance.RAM_speed_mhz": { min: 0, max: 4800 },
    "Performance.semiconductor_size_nm": { min: 3, max: 10, lowerIsBetter: true },
    "Performance.processor_threads": { min: 0, max: 12 },

    // Camera attributes
    "Cameras.main_camera_megapixels": { min: 0, max: 200 },
    "Cameras.front_camera_megapixels": { min: 0, max: 16 },
    "Cameras.largest_aperture_f": { min: 1.4, max: 2.8, lowerIsBetter: true },
    "Cameras.large_aperture_front_camera_f": { min: 1.8, max: 2.8, lowerIsBetter: true },
    "Cameras.optical_zoom_x": { min: 0, max: 10 },

    // Battery attributes
    "Battery.battery_capacity_mAh": { min: 0, max: 6000 },
    "Battery.charging_speed_w": { min: 0, max: 180 },
    "Battery.battery_life_h": { min: 0, max: 24 },

    // Features attributes
    "Features.download_speed_mbps": { min: 0, max: 10000 },
    "Features.upload_speed_mbps": { min: 0, max: 2000 },
};