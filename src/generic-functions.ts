import { Matroid } from './matroid';

type CircuitFunc<F> = (set: F[]) => boolean;

function findGroundBase<T>(ground: T[][], hasCircuit: CircuitFunc<T>): T[] {
  let maxIndependent: T[] = [];
  // should not modify the original ground with sort
  const sortedGround = [...ground];
  // all bases are equal, only need to find one
  sortedGround
    .sort((a: T[], b: T[]) => b.length - a.length)
    .some((element: T[]) => {
      // going from largest to smallest set the first independent is a base
      if (hasCircuit(element)) {
        return false;
      }

      maxIndependent = element;
      return true;
    });
  return maxIndependent;
}

export function getAllSubsets<T>(toSubset: T[]): T[][] {
  return toSubset.reduce((subsets: T[][], value: T) => subsets.concat(subsets.map(set => [value, ...set])), [[]]);
}

export function findBase<T>(matroid: Matroid<T>): T[];
export function findBase<T>(ground: T[][], hasCircuit: CircuitFunc<T>): T[];
export function findBase<T>(matroidOrGround: Matroid<T> | T[][], hasCircuit?: CircuitFunc<T>): T[] {
  if (hasCircuit) {
    return findGroundBase(matroidOrGround as T[][], hasCircuit);
  }
  const indeps = [...(matroidOrGround as Matroid<T>).independent];
  // looking for max independent
  return indeps.sort((a: T[], b: T[]) => b.length - a.length)?.[0] ?? [];
}

export function findAllBases<T>(matroid: Matroid<T>): T[][] {
  const maxIndependents: T[][] = [];
  const ground = matroid.ground;
  const firstBase = findBase(matroid);

  if (firstBase.length > 0) {
    ground
      .filter((subSet: T[]) => subSet.length === firstBase.length)
      .forEach((element: T[]) => {
        if (!matroid.hasCircuit(element)) {
          maxIndependents.push(element);
        }
      });
  }
  return maxIndependents;
}

export function findIndependents<T>(setToSearch: T[][], hasCircuit: CircuitFunc<T>): T[][] {
  const independents: T[][] = [];
  const setToSearchSorted = [...setToSearch];
  let currentMaxRank = 0;
  // going from smallest set to largest
  setToSearchSorted
    .sort((a: T[], b: T[]) => a.length - b.length)
    .some((element: T[]) => {
      // found an independent set that's greater than the last one
      if (hasCircuit(element)) {
        // bases are the max independent if there were no independent sets in lenght + 1 size, then
        // there are no more independents
        return element.length > currentMaxRank + 1;
      }

      if (element.length > currentMaxRank) {
        currentMaxRank = element.length;
      }
      independents.push(element);
      return false;
    });

  return independents;
}
