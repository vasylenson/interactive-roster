let _seed: number = 912312423333;

export function seed(value: number) {
    _seed = value;
}

/**
 * Create a new list of given elements in random order.
 * 
 * @param items elements to permuted
 */
export function permute<T>(items: readonly T[]) {
    return sample(items.length, items.map((item) => [item, 1 / items.length]));
}

export function choose<T>(options: readonly T[]) {
    const index = Math.min(Math.floor(random() * options.length), options.length);
    return options[index];
}

export function sample<T>(n: number, distribution: readonly [T, number][]) {
    const probabilities = distribution.map(([f, s]) => s);
    const items = distribution.map(([f, s]) => f);
    const choices: T[] = [];
    for (let i = 0; i < n; i++) {
        normalize(probabilities);
        const point = random();
        const cd = cumulative(probabilities);
        const index = cd.findIndex((p) => p > point);

        choices.push(items[index]);
        probabilities.splice(index, 1);
        items.splice(index, 1);
    }
    return choices;
}

export function cumulative(probabilities: number[]) {
    let sum = 0;
    return probabilities.map((p) => (sum += p, sum));
}

/**
 * Normalize array in place such that the sum of the elements is 1.
 */
export function normalize(probabilities: number[], safe: boolean = true) {
    for (const p of probabilities)
        if (p === 0 || p === Infinity || p === -Infinity)
            throw new Error('Invalid set of probabilities');

    const sum = probabilities.reduce((a, b) => a + b);
    for (let i = 0; i < probabilities.length; i++) probabilities[i] /= sum;
}

/**
 * Seeded random number generator. See {@linkcode seed()}.
 */
export function random(normal: boolean = true) {
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

export function* subsetsOf<T>(num: number, arr: T[]) {
    function* generateSubset(currentSubset: T[], startIndex: number): Generator<T[]> {
        if (currentSubset.length === num) {
            yield currentSubset;
            return;
        }
        for (let i = startIndex; i < arr.length; i++) {
            yield* generateSubset([...currentSubset, arr[i]], i + 1);
        }
    }

    yield* generateSubset([], 0);
}