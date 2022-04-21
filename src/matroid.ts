import { findBase } from './generic-functions';

// since we work with 'sets' we must regard single elements of any type as arrays of length 1, thus every element is T[]
export abstract class Matroid<T> {
    get ground(): T[] | T[][] {
        return this.E;
    }

    set ground(groundSet: T[] | T[][]) {
        this.E = groundSet;
    }

    get independent(): T[][] | undefined {
        return this.I;
    }

    set independent(independentSet: T[][] | undefined) {
        this.I = independentSet;
    }

    get rank(): number {
        return this.rankFunc();
    }

    // ~at least one subset of E is independent, the empty set
    // we may store only the atoms for E, no need to combine all possibilities and store it
    private E: T[] | T[][];
    private I: T[][] | undefined;

    constructor(setOfAtoms: T[]);
    // independentSet is subset of groundSet
    constructor(groundSet: T[][], independentSet: T[][]);
    constructor(setOfAtomsOrGround: T[] | T[][], independentSet?: T[][]) {
        if (this.isSetOfAtoms(setOfAtomsOrGround)) {
            this.E = setOfAtomsOrGround;
        } else {
            this.E = setOfAtomsOrGround ?? [];
            this.I = independentSet ?? [];
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
    public getClosure(closureBasisAtoms: T[]): T[][] {
        const closure: T[] = [...closureBasisAtoms];
        const initialRank = this.rankFunc(closureBasisAtoms);
        const groundAtoms = this.isSetOfAtoms(this.E) ? this.E : this.getUniqueAtoms(this.E);
        // difference = E \ closureBasis
        const differenceFromGround = groundAtoms.filter((groundAtom: T) => !closureBasisAtoms.includes(groundAtom));

        for (const element of differenceFromGround) {
            const potentialNewClosure = [...closureBasisAtoms, element];
            if(initialRank === potentialNewClosure.length && !this.hasCircuit(potentialNewClosure))
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

    private isSetOfAtoms(setOfAtomsOrGround: T[] | T[][]): setOfAtomsOrGround is T[] {
        return setOfAtomsOrGround && !!setOfAtomsOrGround.length && (setOfAtomsOrGround[0] as any).length === undefined;
    }

    private getUniqueAtoms(atomsArr: T[][]): T[] { 
        return atomsArr.reduce((acc, curr) => {
            for (let atom of curr) {
                if (!acc.includes(atom)) {
                    acc.push(atom);
                }
            }
            return acc;
        }, [])
    }
}
