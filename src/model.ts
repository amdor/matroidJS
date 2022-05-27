export type CircuitFunc<F> = (set: F[]) => boolean;
export type Id<T> = T & { id: number };
export type IdArray<T> = Array<Id<T>>;
