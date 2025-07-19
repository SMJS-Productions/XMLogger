type Split<T extends string, D extends string = ""> = T extends `${infer P}${D}${infer R}` ?
    R extends "" ?
        [P] :
        [P, ...Split<R, D>] :
    [T];

type SplitExclusive<T extends string, D extends string = ""> = Split<T, D> extends [string, ...infer R] ?
    R extends string[] ?
        R :
        [] :
    [];

type FirstChar<T extends string> = T extends `${infer P}${string}` ? P : T;

type FilterTuple<T extends any[], F> = T extends [infer P, ...infer R] ?
    [P] extends [F] ?
        FilterTuple<R, F> :
        [P, ...FilterTuple<R, F>] :
    [];

// Utility type, do not export
type SplitTemplate<T extends string[]> = {
    [K in keyof T]:
        FirstChar<T[K]> extends "s" ? { toString(): string } :
        FirstChar<T[K]> extends "d" | "i" | "f" ? number :
        FirstChar<T[K]> extends "j" | "o" | "O" ? object :
        never;
};

/**
 * Supported template types: @see https://nodejs.org/api/util.html#utilformatformat-args
 */
export type Template<T extends string> = FilterTuple<SplitTemplate<SplitExclusive<T, "%">>, never>;