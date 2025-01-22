import React from 'react';
import Select from "react-select";
import PhoneVariantSelector from './PhoneVariantSelector';

interface PhoneSelectorsProps {
    phone1: string;
    phone2: string;
    phoneOptions: { value: string; label: string; storage: number; ram: number; }[];
    translations: any;
    handleSelectChange: (selectedOption: any, setter: (value: string) => void) => void;
    setPhone1: (value: string) => void;
    setPhone2: (value: string) => void;
}

const PhoneSelectors: React.FC<PhoneSelectorsProps> = ({
    phone1,
    phone2,
    phoneOptions,
    translations,
    handleSelectChange,
    setPhone1,
    setPhone2,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
                <Select
                    value={phoneOptions.find((option) => option.value === phone1) || null}
                    onChange={(option) => handleSelectChange(option, setPhone1)}
                    options={phoneOptions}
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
                <Select
                    value={phoneOptions.find((option) => option.value === phone2) || null}
                    onChange={(option) => handleSelectChange(option, setPhone2)}
                    options={phoneOptions}
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