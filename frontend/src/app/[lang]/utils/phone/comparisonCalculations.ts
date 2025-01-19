import { attributeRanges, attributesWhereLowerIsBetter, neutralAttributes, numericAttributes } from "./constants";

// utils/comparisonCalculations.ts
export const getBarStyle = (attribute: keyof PhoneSpecs, subAttribute: string, index: number, comparisonResult: [PhoneSpecs, PhoneSpecs] | null) => {
    if (!comparisonResult || !numericAttributes.includes(`${attribute}.${subAttribute}` as keyof PhoneSpecs)) return {};

    const value1 = (comparisonResult[0][attribute] as any)[subAttribute] as number;
    const value2 = (comparisonResult[1][attribute] as any)[subAttribute] as number;

    // If one of the values doesn't exist, use pastel blue for the other existing value
    if (value1 == null || value2 == null) {
        if (index === 0 && value1 != null) {
            return {
                background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`, // pastel blue for the existing value
            };
        } else if (index === 1 && value2 != null) {
            return {
                background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`, // pastel blue for the existing value
            };
        }
        return {}; // No styling if the value doesn't exist
    }

    // If values are the same, return full pastel blue for both
    if (value1 === value2) {
        return {
            background: `linear-gradient(90deg, hsl(210, 50%, 80%) 100%, hsl(210, 50%, 80%) 100%)`, // pastel blue for equal values
        };
    }


    const maxValue = Math.max(value1, value2);
    const minValue = Math.min(value1, value2);
    const currentValue = (comparisonResult[index][attribute] as any)[subAttribute] as number;
    const isBestValue = attributesWhereLowerIsBetter.includes(`${attribute}.${subAttribute}`) ? currentValue === minValue : currentValue === maxValue;
    const otherValue = (comparisonResult[1 - index][attribute] as any)[subAttribute] as number;

    // Determine the difference ratio
    const differenceRatio = Math.abs(currentValue - otherValue) / Math.max(maxValue, 1); // Avoid division by zero
    const percentage = (currentValue / maxValue) * 100;

    if (neutralAttributes.includes(`${attribute}.${subAttribute}`)) {
        return {
            background: `linear-gradient(90deg, hsl(210, 50%, 80%) ${percentage}%, transparent ${percentage}%)`, // pastel blue for neutral attributes
        };
    }

    // Base color for the best value (always green)
    let color = `hsl(120, 70%, 60%)`; // green

    if (!isBestValue) {
        // Color transitions from green (120 hue) to red (0 hue) based on how far the values are
        const hue = 100 - (differenceRatio * 120); // Shift hue from 120 (green) to 0 (red) based on the difference
        color = `hsl(${hue}, 70%, 60%)`; // Softened, pastel color
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

    const calculateScore = (value1: any, value2: any, subAttribute: string): [number, number] => {
        // For numeric values
        if (typeof value1 === 'number' && typeof value2 === 'number' && value1 !== 0 && value2 !== 0) {
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
        if (!neutralAttributes.includes(`${attribute}.${subAttribute}`) && typeof value1 !== 'string' && typeof value2 !== 'string') {
            totalMetrics += 1;
        }
    });

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

    // Calculate average scores (without extra normalization)
    const averageScorePhone1 = (totalScorePhone1 * 100) / (totalMetrics * 10);
    const averageScorePhone2 = (totalScorePhone2 * 100) / (totalMetrics * 10);

    const isEqual = Math.abs(averageScorePhone1 - averageScorePhone2) < 0.1;

    // Determine which phone is better
    const phone1IsBetter = averageScorePhone1 > averageScorePhone2;
    const betterPhone = phone1IsBetter
        ? comparisonResult[0].brand_and_full_name
        : comparisonResult[1].brand_and_full_name;
    const worsePhone = phone1IsBetter
        ? comparisonResult[1].brand_and_full_name
        : comparisonResult[0].brand_and_full_name;

    // Calculate percentage difference as (better/worse - 1) * 100
    const betterScore = Math.max(averageScorePhone1, averageScorePhone2);
    const worseScore = Math.min(averageScorePhone1, averageScorePhone2);
    const percentageDifference = ((betterScore / worseScore) - 1) * 100;

    console.log(averageScorePhone1, averageScorePhone2, percentageDifference);

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