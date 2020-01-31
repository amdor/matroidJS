import { HasCircuitFunc } from './dependency';

function getAllSubsets<T>(toSubset: T[]): T[][] {
  return toSubset.reduce((subsets: T[][], value: T) => subsets.concat(subsets.map(set => [value, ...set])), [[]]);
}

export function findBase<T>(ground: T[][], hasCircuit: HasCircuitFunc<T>): T[] {
  let maxIndependent: T[] = [];
  let currentMaxRank = 0;
  // all bases are equal, only need to find one
  ground
    .sort((a: T[], b: T[]) => a.length - b.length)
    .some((element: T[]) => {
      // found a base that's greater than the last one
      if (!hasCircuit(element) && element.length > currentMaxRank) {
        maxIndependent = element;
        currentMaxRank = element.length;
        return false;
      }
      // if element only greater, there might be another element with the same size that's a base
      // but if element is bigger by at least 2, then there are no further bases in ground
      if (element.length > currentMaxRank + 1) {
        return true;
      }
      return false;
    });
  return maxIndependent;
}

export function findAllBases<T>(ground: T[], hasCircuit: HasCircuitFunc<T>): T[][] {
  const maxIndependent: T[][] = [];
  const allSubSets = getAllSubsets(ground);
  let currentMaxRank = 0;
  // all bases are equal, only need to find one
  allSubSets
    .sort((a: T[], b: T[]) => b.length - a.length)
    .some((element: T[]) => {
      // found a base that's greater than the last one
      if (!hasCircuit(element) && element.length > currentMaxRank) {
        currentMaxRank = element.length;
        return false;
      }
      // if element only greater, there might be another element with the same size that's a base
      // but if element is bigger by at least 2, then there are no further bases in ground
      if (element.length > currentMaxRank + 1) {
        return true;
      }
      return false;
    });

  if (currentMaxRank > 0) {
    allSubSets
      .filter((subSet: T[]) => subSet.length === currentMaxRank)
      .forEach((element: T[]) => {
        // found a base
        if (!hasCircuit(element)) {
          maxIndependent.push(element);
        }
      });
  }
  return maxIndependent;
}

export function findIndependents<T>() {
  
}
