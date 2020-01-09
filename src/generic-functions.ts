import { IsDependentFunc } from "./dependency";

function getAllSubsets<T>(toSubset: T[]): T[][] {
  return toSubset.reduce((subsets: T[][], value: T) => subsets.concat(subsets.map(set => [value, ...set])), [[]]);
}

export function findBase<T>(ground: T[], isDependent:IsDependentFunc<T>): T[] {
  let maxIndependent: T[] = [];
  // all bases are equal, only need to find one
  getAllSubsets(ground)
    .sort((a: T[], b: T[]) => b.length - a.length)
    .some((element: T[]) => {
      if (!isDependent(element)) {
        maxIndependent = element;
        return true;
      }
    });
  return maxIndependent;
}
