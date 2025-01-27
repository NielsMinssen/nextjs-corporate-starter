import { attributeRanges, neutralAttributes, numericAttributes } from "./constants";

// utils/comparisonCalculations.ts
export const getBarStyle = (attribute: keyof PhoneSpecs, subAttribute: string, index: number, comparisonResult: [PhoneSpecs, PhoneSpecs] | null) => {
    if (!comparisonResult || !numericAttributes.includes(`${attribute}.${subAttribute}` as keyof PhoneSpecs)) return {};

    const attributeKey = `${attribute}.${subAttribute}` as keyof typeof attributeRanges;
    const range = attributeRanges[attributeKey];

    if (!range) return {};

    const rawValue = (comparisonResult[index][attribute] as any)[subAttribute];
    const currentValue = typeof rawValue === 'object' && rawValue !== null ? rawValue.value : rawValue;

    // If the value doesn't exist, return empty style
    if (currentValue == null) return {};

    // Calculate percentage based on the range
    let percentage: number;
    let colorPercentage: number;
    const valueRange = range.max - range.min;

    if (range.lowerIsBetter) {
        // For attributes where lower is better, inverse the percentage
        percentage = ((currentValue - range.min) / valueRange) * 100;
        colorPercentage = ((range.max - currentValue) / valueRange) * 100;

    } else {
        percentage = ((currentValue - range.min) / valueRange) * 100;
        colorPercentage = ((currentValue - range.min) / valueRange) * 100;
    }

    // Clamp percentage between 0 and 100
    percentage = Math.max(0, Math.min(100, percentage));
    colorPercentage = Math.max(0, Math.min(100, colorPercentage));

    // Determine color based on percentage
    // 0% = red (0), 100% = green (120)
    const hue = colorPercentage * 1.2;
    const color = `hsl(${hue}, 70%, 60%)`; // Softened, pastel color

    if (neutralAttributes.includes(`${attribute}.${subAttribute}`)) {
        return {
            background: `linear-gradient(90deg, hsl(210, 50%, 80%) ${percentage}%, transparent ${percentage}%)`, // pastel blue for neutral attributes
        };
    }

    // Fill slightly with red if below minimum range
    if (currentValue <= range.min && !range.lowerIsBetter) {
        return {
            background: `linear-gradient(90deg, hsl(0, 70%, 60%) 3%, ${color} 3%, ${color} ${percentage}%, transparent ${percentage}%)`,
        };
    }

    // Fill compeltely with green if above maximum range for attributes where lower is better
    if (currentValue <= range.min && range.lowerIsBetter) {
        return {
            background: `linear-gradient(90deg, hsl(120, 70%, 60%) 3%, ${color} 3%, ${color} ${percentage}%, transparent ${percentage}%)`,
        };
    }

    return {
        background: `linear-gradient(90deg, ${color} ${percentage}%, transparent ${percentage}%)`,
    };
};

export const getOverallComparisonPercentage = (
    comparisonResult: [PhoneSpecs, PhoneSpecs] | null,
    comparisonAttributes: (keyof PhoneSpecs)[]
): {
    betterPhone: string | null,
    worsePhone: string | null,
    percentageDifference: number | null,
    isEqual: boolean,
    averageScorePhone1: number,
    averageScorePhone2: number;
} => {
    if (!comparisonResult) {
        return {
            betterPhone: null,
            worsePhone: null,
            percentageDifference: null,
            isEqual: true,
            averageScorePhone1: 0,
            averageScorePhone2: 0
        };
    }

    let totalScorePhone1 = 0;
    let totalScorePhone2 = 0;
    let totalAttributes = 0;

    // Sum up the normalized scores for each attribute
    comparisonAttributes.forEach((attribute) => {
        const comparison = getAttributeComparisonPercentage(attribute, comparisonResult);
        if (comparison.scores.normalized[comparisonResult[0].brand_and_full_name] !== undefined &&
            comparison.scores.normalized[comparisonResult[1].brand_and_full_name] !== undefined) {
            totalScorePhone1 += comparison.scores.normalized[comparisonResult[0].brand_and_full_name];
            totalScorePhone2 += comparison.scores.normalized[comparisonResult[1].brand_and_full_name];
            totalAttributes++;
        }
    });

    // If no attributes were compared, return equal
    if (totalAttributes === 0) {
        return {
            betterPhone: null,
            worsePhone: null,
            percentageDifference: null,
            isEqual: true,
            averageScorePhone1: 0,
            averageScorePhone2: 0
        };
    }

    const averageScorePhone1 = totalScorePhone1 / totalAttributes;
    const averageScorePhone2 = totalScorePhone2 / totalAttributes;

    // If the difference is negligible, consider them equal
    if (Math.abs(averageScorePhone1 - averageScorePhone2) < 0.01) {
        return {
            betterPhone: null,
            worsePhone: null,
            percentageDifference: null,
            isEqual: true,
            averageScorePhone1: 0,
            averageScorePhone2: 0
        };
    }

    // Return the comparison result based on the average scores
    return {
        betterPhone: averageScorePhone1 > averageScorePhone2
            ? comparisonResult[0].brand_and_full_name
            : comparisonResult[1].brand_and_full_name,
        worsePhone: averageScorePhone1 > averageScorePhone2
            ? comparisonResult[1].brand_and_full_name
            : comparisonResult[0].brand_and_full_name,
        percentageDifference: Number(((Math.abs(averageScorePhone1 - averageScorePhone2) / Math.min(averageScorePhone1, averageScorePhone2)) * 100).toFixed(1)),
        isEqual: false,
        averageScorePhone1: Number(averageScorePhone1.toFixed(2)),
        averageScorePhone2: Number(averageScorePhone2.toFixed(2)),
    };
};

export const getAttributeComparisonPercentage = (attribute: string, comparisonResult: [PhoneSpecs, PhoneSpecs] | null): {
    betterPhone: string | null,
    worsePhone: string | null,
    percentageDifference: number | null,
    isEqual: boolean,
    scores: {
        normalized: { [phone: string]: number },
        notNormalized: { [phone: string]: number }
    },
} => {
    const phoneAttribute = attribute as keyof PhoneSpecs;
    if (!comparisonResult) return {
        betterPhone: null,
        worsePhone: null,
        percentageDifference: null,
        isEqual: false,
        scores: {
            normalized: {},
            notNormalized: {}
        },
    };

    let totalScorePhone1 = 0;
    let totalScorePhone2 = 0;
    let totalMetrics = 0;

    const calculateScore = (rawValue1: any, rawValue2: any, subAttribute: string): [number, number] => {
        // Extract values from objects if needed
        const value1 = typeof rawValue1 === 'object' && rawValue1 !== null ? rawValue1.value : rawValue1;
        const value2 = typeof rawValue2 === 'object' && rawValue2 !== null ? rawValue2.value : rawValue2;

        // For numeric values
        if (typeof value1 === 'number' && typeof value2 === 'number') {
            const range = attributeRanges[`${attribute}.${subAttribute}`];

            if (!range) {
                return [0, 0]; // Return 0 if no range is defined
            }

            if (neutralAttributes.includes(`${attribute}.${subAttribute}`)) {
                return [0, 0]; // Neutral attributes do not contribute to the score
            }

            const calculateSingleScore = (value: number): number => {
                // Clamp the value between min and max
                const clampedValue = Math.max(Math.min(value, range.max), range.min);

                // Calculate the score based on the position within the range
                const score = ((clampedValue - range.min) / (range.max - range.min)) * 10;

                // Invert the score if lower is better
                return range.lowerIsBetter ? 10 - score : score;
            };

            return [calculateSingleScore(value1), calculateSingleScore(value2)];
        }

        // For boolean values
        if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
            const score1 = value1 ? 10 : 0;
            const score2 = value2 ? 10 : 0;
            return [score1, score2];
        }

        // For unknown values (?)
        if (value1 === '?' || value2 === '?') {
            return [0, 0];
        }

        return [0, 0]; // Default value
    };

    Object.keys(comparisonResult[0][phoneAttribute as keyof PhoneSpecs]).forEach((subAttribute) => {
        const value1 = (comparisonResult[0][phoneAttribute] as any)[subAttribute];
        const value2 = (comparisonResult[1][phoneAttribute] as any)[subAttribute];

        const [score1, score2] = calculateScore(value1, value2, subAttribute);
        if (score1 !== 0 || score2 !== 0) {
            totalScorePhone1 += score1;
            totalScorePhone2 += score2;
        }
        const effectiveValue1 = typeof value1 === 'object' && value1 !== null ? value1.value : value1;
        const effectiveValue2 = typeof value2 === 'object' && value2 !== null ? value2.value : value2;
        if (!neutralAttributes.includes(`${attribute}.${subAttribute}`) && typeof effectiveValue1 !== 'string' && typeof effectiveValue2 !== 'string') {
            totalMetrics += 1;
        }
    });

    // Rest of the function remains the same...
    if (totalMetrics === 0) {
        return {
            betterPhone: null,
            worsePhone: null,
            percentageDifference: null,
            isEqual: true,
            scores: {
                normalized: {},
                notNormalized: {}
            },
        };
    }

    const averageScorePhone1 = (totalScorePhone1 * 100) / (totalMetrics * 10);
    const averageScorePhone2 = (totalScorePhone2 * 100) / (totalMetrics * 10);

    const isEqual = Math.abs(averageScorePhone1 - averageScorePhone2) < 0.1;

    const phone1IsBetter = averageScorePhone1 > averageScorePhone2;
    const betterPhone = phone1IsBetter
        ? comparisonResult[0].brand_and_full_name
        : comparisonResult[1].brand_and_full_name;
    const worsePhone = phone1IsBetter
        ? comparisonResult[1].brand_and_full_name
        : comparisonResult[0].brand_and_full_name;

    const betterScore = Math.max(averageScorePhone1, averageScorePhone2);
    const worseScore = Math.min(averageScorePhone1, averageScorePhone2);
    const percentageDifference = ((betterScore / worseScore) - 1) * 100;

    return {
        betterPhone: isEqual ? null : betterPhone,
        worsePhone: isEqual ? null : worsePhone,
        percentageDifference: isEqual ? null : Number(percentageDifference.toFixed(2)),
        isEqual,
        scores: {
            normalized: {
                [comparisonResult[0].brand_and_full_name]: averageScorePhone1,
                [comparisonResult[1].brand_and_full_name]: averageScorePhone2
            },
            notNormalized: {
                [comparisonResult[0].brand_and_full_name]: totalScorePhone1,
                [comparisonResult[1].brand_and_full_name]: totalScorePhone2
            }
        },
    };
};