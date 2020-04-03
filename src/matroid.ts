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
    return this.rankFunc(this.I);
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
   * @param subSetToCheck a subset of E to find circuits in, we must expect simple subsets as well as sets of subsets
   */
  public abstract hasCircuit(subSetToCheck: T[][] | T[]): boolean;

  public getClosure(subSet: T[][]): T[][] {
    const closure = [...subSet];
    const initialRank = this.rankFunc(subSet);
    const difference = this.E.filter(x => !subSet.includes(x));
    difference.forEach((element: T[]) => {
      closure.push(element);
      if (this.rankFunc(closure) > initialRank) {
        closure.pop();
      }
    });
    return closure;
  }

  protected rankFunc(subSet: T[][]): number {
    return findBase({ ground: subSet, hasCircuit: this.hasCircuit } as Matroid<T>).length;
  }
}
