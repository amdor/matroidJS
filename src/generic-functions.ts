import { Matroid } from './matroid';

export function getAllSubsets<T>(toSubset: T[]): T[][] {
  return toSubset.reduce((subsets: T[][], value: T) => subsets.concat(subsets.map(set => [value, ...set])), [[]]);
}

export function findBase<T>(matroid: Matroid<T>): T[] {
  let maxIndependent: T[] = [];
  // should not modify the original ground with sort
  const ground = [...matroid.ground];
  // all bases are equal, only need to find one
  ground
    .sort((a: T[], b: T[]) => b.length - a.length)
    .some((element: T[]) => {
      // going from largest to smallest set the first independent is a base
      if (!matroid.hasCircuit(element)) {
        maxIndependent = element;
        return true;
      }

      return false;
    });
  return maxIndependent;
}

export function findAllBases<T>(matroid: Matroid<T>): T[][] {
  const maxIndependent: T[][] = [];
  const ground = matroid.ground;
  const firstBase = findBase(matroid);

  if (firstBase.length > 0) {
    ground
      .filter((subSet: T[]) => subSet.length === firstBase.length)
      .forEach((element: T[]) => {
        if (!matroid.hasCircuit(element)) {
          maxIndependent.push(element);
        }
      });
  }
  return maxIndependent;
}

export function findIndependents<T>(setToSearch: T[][], hasCircuit: (set: T[][] | T[]) => boolean): T[][] {
  const independents: T[][] = [];
  let currentMaxRank = 0;
  const setToSearchSorted = [...setToSearch];
  // going from smallest set to largest
  setToSearchSorted
    .sort((a: T[], b: T[]) => a.length - b.length)
    .some((element: T[]) => {
      // found an independent set that's greater than the last one
      if (!hasCircuit(element)) {
        if (element.length > currentMaxRank) {
          currentMaxRank = element.length;
        }
        independents.push(element);
        return false;
      }
      // bases are the max independent if there were no independent sets in lenght + 1 size, then
      // there are no more independents
      if (element.length > currentMaxRank + 1) {
        return true;
      }
      return false;
    });

  return independents;
}
