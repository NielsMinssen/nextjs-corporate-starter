export const FALLBACK_SEO = {
    title: "Strapi Starter Next Blog",
    description: "Strapi Starter Next Blog",
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
    "Performance.max_memory_size_gb" as keyof PhoneSpecs,
    "Cameras.main_camera_megapixels" as keyof PhoneSpecs,
    "Cameras.front_camera_megapixels" as keyof PhoneSpecs,
    "Cameras.largest_aperture_f" as keyof PhoneSpecs,
    "Cameras.large_aperture_front_camera_f" as keyof PhoneSpecs,
    "Cameras.optical_zoom_x" as keyof PhoneSpecs,
    "Battery.battery_capacity_mAh" as keyof PhoneSpecs,
    "Battery.charging_speed_w" as keyof PhoneSpecs,
    "Battery.wireless_charging_speed_w" as keyof PhoneSpecs,
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

export const attributesWhereLowerIsBetter = ["Design.weight_g", "Design.thickness_mm"];