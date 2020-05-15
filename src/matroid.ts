import { findBase, findIndependents, getAllSubsets } from './generic-functions';

// since we work with 'sets' we must regard single elements of any type as arrays of length 1, thus every element is T[]
export abstract class Matroid<T> {
  get ground(): T[][] {
    return this.E;
  }

  set ground(groundSet: T[][]) {
    this.E = groundSet;
  }

  get independent(): T[][] {
    return this.I;
  }

  set independent(independentSet: T[][]) {
    this.I = independentSet;
  }

  get rank(): number {
    return this.rankFunc();
  }

  // ~at least one subset of E is independent, the empty set
  private E: T[][];
  private I: T[][];

  constructor(setOfAtoms: T[]);
  // independentSet is subset of groundSet
  constructor(groundSet: T[][], independentSets: T[][]);
  constructor(setOfAtomsOrGround: T[] | T[][], independentSets?: T[][]) {
    if (setOfAtomsOrGround && setOfAtomsOrGround.length && !(setOfAtomsOrGround[0] as any).length) {
      this.E = getAllSubsets(setOfAtomsOrGround as T[]);
      this.I = findIndependents(this.E, this.hasCircuit);
    } else {
      this.E = (setOfAtomsOrGround as T[][]) || [];
      this.I = independentSets || [];
    }
  }

  /////////////////////////////////////////////////////
  //// API to be implemented by specific matroids /////
  /////////////////////////////////////////////////////

  /**
   * Searches for circuits in the given subset
   * @param subsetToCheck a subset of E to find circuits in, we must expect simple subsets as well as sets of subsets
   */
  public abstract hasCircuit(subsetToCheck: T[][] | T[]): boolean;

  // Get closure for a subset of the groundset (E)
  // @return the closure of closureBasis subSet on E
  public getClosure(closureBasis: T[][]): T[][] {
    const closure = [...closureBasis];
    const initialRank = this.rankFunc(closureBasis);
    // difference = E \ subSet
    const differenceFromGround = this.E.filter(x => !closureBasis.includes(x));
    // all independent sets with greater rank than closureBasis'
    const greaterIndependentsThanInClosureBasis = findIndependents<T>(differenceFromGround, this.hasCircuit).filter(
      (independent: T[]) => independent.length > initialRank,
    );

    differenceFromGround.forEach((element: T[]) => {
      // elements not containing greater independents (~have smaller than or equal rank to colsureBasis) are added to closure
      if (!this.doesIncludeSubset(element, greaterIndependentsThanInClosureBasis)) {
        closure.push(element);
      }
    });
    return closure;
  }

  protected rankFunc(subSet?: T[][]): number {
    if (!subSet) {
      return findBase(this).length;
    }
    return findBase(subSet, this.hasCircuit).length;
  }

  // checking if any of `setsToCheckWith` is a subset of `setToCheck`
  private doesIncludeSubset(setToCheck: T[], setsToCheckWith: T[][]): boolean {
    return setsToCheckWith.some((setToCheckWith: T[]) => {
      return setToCheckWith.every((elementToCheckWith: T) => {
        return setToCheck.includes(elementToCheckWith);
      });
    });
  }
}
