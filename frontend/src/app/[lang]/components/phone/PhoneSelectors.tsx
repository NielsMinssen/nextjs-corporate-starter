import Select from "react-select";

interface PhoneSelectorsProps {
    phone1: string;
    phone2: string;
    phoneOptions: { value: string; label: string; }[];
    translations: any;
    handleSelectChange: (option: any, setter: (value: string) => void) => void;
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
    setPhone2
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.phoneComparison.selectPhone1}
                </label>
                <Select
                    value={phoneOptions.find((option) => option.value === phone1) || null}
                    onChange={(option) => handleSelectChange(option, setPhone1)}
                    options={phoneOptions}
                    classNamePrefix="react-select"
                    className="w-full"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.phoneComparison.selectPhone2}
                </label>
                <Select
                    value={phoneOptions.find((option) => option.value === phone2) || null}
                    onChange={(option) => handleSelectChange(option, setPhone2)}
                    options={phoneOptions}
                    classNamePrefix="react-select"
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default PhoneSelectors;