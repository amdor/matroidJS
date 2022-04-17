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
  constructor(groundSet: T[][], independentSet: T[][]);
  constructor(setOfAtomsOrGround: T[] | T[][], independentSet?: T[][]) {
    if (this.isSetOfAtoms(setOfAtomsOrGround)) {
      this.E = getAllSubsets(setOfAtomsOrGround);
      this.I = findIndependents(this.E, this.hasCircuit);
    } else {
      this.E = setOfAtomsOrGround || [];
      this.I = independentSet || [];
    }
  }

  /////////////////////////////////////////////////////
  //// API to be implemented by specific matroids /////
  /////////////////////////////////////////////////////

  /**
   * Searches for circuits in the given subset
   * @param subsetToCheck a subset of E to find circuits in, expects simple subsets
   */
  public abstract hasCircuit(subsetToCheck: T[]): boolean;

  // Get closure for a subset of the groundset (E)
  // @return the closure of closureBasis subSet on E
  public getClosure(closureBasis: T[][] | T[]): T[][] {
    const isSetOfSets = closureBasis.length && Array.isArray(closureBasis[0]);
    const closure: T[][] = isSetOfSets ? ([...closureBasis] as T[][]) : ([closureBasis] as T[][]);
    const initialRank = isSetOfSets ? this.rankFunc(closure) : closureBasis.length;
    // difference = E \ closureBasis
    const differenceFromGround = this.E.filter((groundSubset: T[]) => !closure.includes(groundSubset));
    // all independent sets with greater rank than closureBasis'
    const greaterIndependentsThanInClosureBasis = findIndependents<T>(differenceFromGround, this.hasCircuit).filter(
      (independent: T[]) => independent.length > initialRank,
    );

    for (const element of differenceFromGround) {
      // elements not containing greater independents (~have smaller than or equal rank to colsureBasis) are added to closure
      if (!this.doesIncludeSubset(element, greaterIndependentsThanInClosureBasis)) {
        closure.push(element);
      }
    }
    return closure;
  }

  protected rankFunc(subSet?: T[][]): number {
    if (!subSet) {
      return findBase(this).length;
    }
    return findBase(subSet, this.hasCircuit).length;
  }

  /////////////////////////////////////////////////////////
  //// API to be implemented by specific matroids END /////
  /////////////////////////////////////////////////////////

  // checking if any of `potentialSubsets` is a subset of `setToCheck`
  private doesIncludeSubset(setToCheck: T[], potentialSubsets: T[][]): boolean {
    return potentialSubsets.some(potentialSubset =>
      potentialSubset.every(elementToCheckWith => setToCheck.includes(elementToCheckWith)),
    );
  }

  private isSetOfAtoms(setOfAtomsOrGround: T[] | T[][]): setOfAtomsOrGround is T[] {
    return setOfAtomsOrGround && !!setOfAtomsOrGround.length && (setOfAtomsOrGround[0] as any).length === undefined;
  }
}
