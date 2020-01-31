import { findBase } from './generic-functions';
import { Matroid } from './matroid';

export abstract class MatroidFactory<T> {
  
  public createMatroid(groundSet: T[]): Matroid<T> {
    return new Matroid(groundSet, findBase(groundSet, this.hasCircuit), (ground: T[]) => findBase(ground, this.hasCircuit).length);
  }
  
  protected abstract hasCircuit(setToCheck: T[][]): boolean;
}
