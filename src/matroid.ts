import { RankFunc, Dependencies } from "./dependency";
import { getAllSubsets, findIndependents } from "./generic-functions";

// since we work with 'sets' we must regard single elements of any type as arrays of length 1, thus every element is T[]
export abstract class Matroid<T> implements Dependencies {

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
    return this.I.length;
  }

  // ~at least one subset of E is independent, the empty set
  private E: T[][];
  private I: T[][];
  
  constructor(setOfAtoms: T[]);
  // independentSet is subset of groundSet
  constructor(groundSet: T[][], independentSets: T[][]);
  constructor(setOfAtoms?: T[], groundSet?: T[][], independentSets?: T[][]) {
    if(setOfAtoms) {
      this.E = getAllSubsets(setOfAtoms);
      this.I = findIndependents(this.E, this.hasCircuit);
    } else {
      this.E = groundSet || [];
      this.I = independentSets || [];
    }
  }
  
  public abstract hasCircuit(subSetToCheck: T[][] | T[]): boolean;

  public getClosure(subSet: T[][]) {
    const closure = [...subSet];
    const initialRank = this.rankFunc(subSet);
    const difference = this.E.filter(x => !subSet.includes(x));
    difference.forEach((element: T[]) => {
      closure.push(element);
      if(this.rankFunc(closure) > initialRank) {
        closure.pop();
      }
    });
  }

  protected abstract rankFunc(subSet: T[][]): number;
}
