let _seed: number = 9318924765;

export function seed(value: number) {
    _seed = value;
}

export function choose<T>(options: readonly T[]) {
    const index = Math.min(Math.floor(random() * options.length), options.length);
    return options[index];
}

export function sample<T>(n: number, distribution: [T, number][]) {
    let cumulativeProbability = 0;
    const cumulative = [];
    for (const [item, probability] of distribution) {
        cumulativeProbability += probability;
        cumulative.push(cumulativeProbability);
    }

    const choices: T[] = [];
    for (let i = 0; i < n; i++) {
        normalize(cumulative);
        const point = random();
        const index = cumulative.findIndex((p) => p > point);
        choices.push(distribution[index][0]);

        distribution.splice(index, 1);
        cumulative.splice(index, 1);
    }
    return choices;
}

/**
 * Normalize array in place such that the sum of the elements is 1.
 */
function normalize(probabilities: number[]) {
    const sum = probabilities.reduce((a, b) => a + b);
    for (let i = 0; i < probabilities.length; i++) probabilities[i] /= sum;
}

/**
 * Seeded random number generator. See {@linkcode seed()}.
 */
function random(normal: boolean = true) {
    // Parameters for the LCG (constants are chosen based on known good values)
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;

    _seed = (a * _seed + c) % m;

    return normal ? _seed / m : _seed;
}

/**
 * Hash a list of integers into a u32 with the djb2 algorithm.
 */
export function hash(nums: Iterable<number>) {
    let hash = 5381;
    for (const n of nums) {
        hash = (hash * 33) + n;
        hash = hash & hash;
    }
    return hash >>> 0;
}