export class Matroid<T> {
  get ground(): T[] {
    return this.E;
  }

  set ground(groundSet: T[]) {
    this.E = groundSet;
  }

  get independent(): T[] {
    return this.I;
  }

  set independentS(independentSet: T[]) {
    this.I = independentSet;
  }

  // ~at least one subset of E is independent, the empty set
  private E: T[] = [];
  private I: T[] = [];

  // independentSet must be subset of groundSet, hence without one the other cannot exist either
  constructor(groundSet?: T[], independentSet?: T[]) {
    if (groundSet) {
      this.E = groundSet;
      if (independentSet) {
        this.I = independentSet;
      }
    }
  }
}
