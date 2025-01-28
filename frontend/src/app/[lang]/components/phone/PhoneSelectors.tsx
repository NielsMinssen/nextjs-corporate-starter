import React from 'react';
import Select from "react-select";
import PhoneVariantSelector from './PhoneVariantSelector';

interface PhoneSelectorsProps {
    phone1: string;
    phone2: string;
    phoneOptions: { brand_and_full_name: string; RAM_gb: number; storage_options_gb: number; }[];
    handleSelectChange: (selectedOption: any, setter: (value: string) => void) => void;
    setPhone1: (value: string) => void;
    setPhone2: (value: string) => void;
}

const PhoneSelectors: React.FC<PhoneSelectorsProps> = ({
    phone1,
    phone2,
    phoneOptions,
    handleSelectChange,
    setPhone1,
    setPhone2,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
                <Select<{ brand_and_full_name: string; RAM_gb: number; storage_options_gb: number; }>
                    value={phoneOptions.find((option) => option.brand_and_full_name === phone1) || null}
                    onChange={(option) => handleSelectChange(option, setPhone1)}
                    options={phoneOptions}
                    getOptionLabel={(option) => option.brand_and_full_name}
                    getOptionValue={(option) => option.brand_and_full_name}
                    classNamePrefix="react-select"
                    className="w-full"
                />
                <PhoneVariantSelector
                    phoneOptions={phoneOptions}
                    selectedPhone={phone1}
                    otherPhone={phone2}
                    position={1}
                />
            </div>
            <div>
                <Select<{ brand_and_full_name: string; RAM_gb: number; storage_options_gb: number; }>
                    value={phoneOptions.find((option) => option.brand_and_full_name === phone2) || null}
                    onChange={(option) => handleSelectChange(option, setPhone2)}
                    options={phoneOptions}
                    getOptionLabel={(option) => option.brand_and_full_name}
                    getOptionValue={(option) => option.brand_and_full_name}
                    classNamePrefix="react-select"
                    className="w-full"
                />
                <PhoneVariantSelector
                    phoneOptions={phoneOptions}
                    selectedPhone={phone2}
                    otherPhone={phone1}
                    position={2}
                />
            </div>
        </div>
    );
};

export default PhoneSelectors;