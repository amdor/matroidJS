import { Matroid } from "./matroid";

export function getAllSubsets<T>(toSubset: T[]): T[][] {
  return toSubset.reduce((subsets: T[][], value: T) => subsets.concat(subsets.map(set => [value, ...set])), [[]]);
}

export function findBase<T>(matroid: Matroid<T>): T[] {
  let maxIndependent: T[] = [];
  let currentMaxRank = 0;
  // all bases are equal, only need to find one
  matroid.ground
    .sort((a: T[], b: T[]) => b.length - a.length)
    .some((element: T[]) => {
      // going from largest to smallest set the first independent is a base
      if (!matroid.hasCircuit(element) && element.length > currentMaxRank) {
        maxIndependent = element;
        currentMaxRank = element.length;
        return true;
      }

      return false;
    });
  return maxIndependent;
}

export function findAllBases<T>(matroid: Matroid<T>): T[][] {
  let maxIndependent: T[][] = [];
  let currentMaxRank = 0;
  const ground = matroid.ground;
  // all bases are equal, only need to find one
  ground.sort((a: T[], b: T[]) => b.length - a.length)
    .some((element: T[]) => {
      // found an independent set that's greater than the last one
      if (!matroid.hasCircuit([element])) {
        if(element.length > currentMaxRank) {
          currentMaxRank = element.length;
          // last length was not the base length
          maxIndependent = [];
          maxIndependent.push(element)
        }else if(element.length === currentMaxRank) {
          maxIndependent.push(element)
        }      
        return false;
      }
      // if element is equal in length, there might be another element with the same size that's base
      // but if element is smaller, then the last one was the last base
      if (element.length < currentMaxRank) {
        return true;
      }
      return false;
    });

  if (currentMaxRank > 0) {
    ground
      .filter((subSet: T[]) => subSet.length === currentMaxRank)
      .forEach((element: T[]) => {
        // found a base
        if (!matroid.hasCircuit(element)) {
          maxIndependent.push(element);
        }
      });
  }
  return maxIndependent;
}

export function findIndependents<T>(setToSearch: T[][], hasCircuit: (set: T[][] | T[])=>boolean): T[][] {
  const independents: T[][] = [];
  let currentMaxRank = 0;
  // all bases are equal, only need to find one
  setToSearch.sort((a: T[], b: T[]) => a.length - b.length)
    .some((element: T[]) => {
      // found an independent set that's greater than the last one
      if (!hasCircuit(element)) {
        if(element.length > currentMaxRank) {
          currentMaxRank = element.length;
        }      
        independents.push(element)
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
