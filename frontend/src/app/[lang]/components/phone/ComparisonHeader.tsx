import React from 'react';
import { getOverallComparisonPercentage } from '../../utils/phone/comparisonCalculations';

interface Phone {
    brand_and_full_name: string;
}

interface ComparisonHeaderProps {
    comparisonResult: [PhoneSpecs, PhoneSpecs];
    comparisonAttributes: any;
    translations: {
        phoneComparison: {
            bothequal: string;
            is: string;
            betterthan: string;
            basedon: string;
        };
    };
}

const ComparisonHeader = ({ comparisonResult, comparisonAttributes, translations }: ComparisonHeaderProps) => {
    const renderComparison = () => {
        const comparisonData = getOverallComparisonPercentage(comparisonResult, comparisonAttributes);

        if (comparisonData.isEqual) {
            return translations.phoneComparison.bothequal;
        } else {
            return (
                <>
                    <span
                        className={
                            comparisonData.betterPhone === comparisonResult[0].brand_and_full_name
                                ? "text-[#b83f39]"
                                : "text-[#514bbd]"
                        }
                    >
                        {comparisonData.betterPhone}
                    </span>
                    {' '}
                    {translations.phoneComparison.is}
                    {' '}
                    <span className="text-blue-600">{comparisonData.percentageDifference}%</span>
                    {' '}
                    {translations.phoneComparison.betterthan}
                    {' '}
                    <span
                        className={
                            comparisonData.worsePhone === comparisonResult[0].brand_and_full_name
                                ? "text-[#b83f39]"
                                : "text-[#514bbd]"
                        }
                    >
                        {comparisonData.worsePhone}
                    </span>
                    {' '}
                    {translations.phoneComparison.basedon}
                </>
            );
        }
    };

    return (
        <div className="mt-6 pb-6 text-center text-xl font-semibold text-gray-800">
            {renderComparison()}
        </div>
    );
};

export default ComparisonHeader;
