import { RankFunc } from "./dependency";

// since we work with 'sets' we must regard single elements of any type as arrays of length 1, thus every element is T[]
export class Matroid<T> {

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
  private base: T[][];
  private rankFunc: RankFunc<T>;

  // independentSet is subset of groundSet
  constructor(groundSet: T[][], independentSets: T[][], rankFn: RankFunc<T>) {
    this.E = groundSet;
    this.I = independentSets;
    this.rankFunc = rankFn;
  }

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
}
