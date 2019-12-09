import { IsDependentFunc, MaxIndependentFunc, DependencyFunctions } from './dependency';
import { Matroid } from './matroid';



export abstract class MatroidFactory<T> implements DependencyFunctions<T>{
  
  public abstract isDependent: IsDependentFunc<T>;
  public getMaxIndependent?: MaxIndependentFunc<T> = this.findBase;
  
  public createMatroid(groundSet: T[]): Matroid<T> {
      return new Matroid(groundSet, this.getMaxIndependent(groundSet));
  }

  private getAllSubsets(toSubset: T[]): T[][] {
    return toSubset.reduce((subsets, value) => subsets.concat(subsets.map(set => [value, ...set])), [[]]);
  }

  private findBase(ground: T[]): T[] {
    let maxIndependent = [];
    // all bases are equal, only need to find one
    this.getAllSubsets(ground).sort((a:T[], b: T[]) => b.length - a.length).some((element: T[]) => {
      if(!this.isDependent(element)) {
        maxIndependent = element;
        return true;
      }
    });
    return maxIndependent;
  }
}
