import { DependencyFunctions, IsDependentFunc } from './dependency';
import { findBase } from './generic-functions';
import { Matroid } from './matroid';

export abstract class MatroidFactory<T> implements DependencyFunctions<T> {
  public abstract isDependent: IsDependentFunc<T>;

  public createMatroid(groundSet: T[]): Matroid<T> {
    return new Matroid(groundSet, findBase(groundSet, this.isDependent), (ground: T[]) => findBase(ground, this.isDependent));
  }
}
