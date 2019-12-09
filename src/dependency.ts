export type MaxIndependentFunc<T> = (ground: T[]) => T[];

export type IsDependentFunc<T> = (setToCheck: T[]) => boolean;

export interface DependencyFunctions<T> {
    isDependent: IsDependentFunc<T>;
    getMaxIndependent?: MaxIndependentFunc<T>
}