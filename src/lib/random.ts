let _seed: number = 1;

export function seed(value: number) {
    _seed = value;
}

export function choose<T>(options: readonly T[]) {
    const index = Math.min(Math.floor(Math.random() * options.length), options.length);
    return options[index];
}