import { Matroid } from './matroid';

type CircuitFunc<F> = (set: F[]) => boolean;

function findGroundBase<T>(ground: T[], hasCircuit: CircuitFunc<T>): T[] {
    let maxIndependent: T[] = [];
    // should not modify the original ground with sort
    const sortedGround = [...ground].sort((a: T[], b: T[]) => b.length - a.length);
    // all bases are equal, only need to find one
    sortedGround.some((element: T[]) => {
        // going from largest to smallest set the first independent is a base
        if (hasCircuit(element)) {
            return false;
        }

        maxIndependent = element;
        return true;
    });
    return maxIndependent;
}

export function getAllSubsets<T>(toSubset: T[]): T[][] {
    return toSubset.reduce((subsets: T[][], value: T) => subsets.concat(subsets.map(set => [value, ...set])), [[]]);
}

export function findBase<T>(matroid: Matroid<T>): T[];
export function findBase<T>(ground: T[], hasCircuit: CircuitFunc<T>): T[];
export function findBase<T>(matroidOrGround: Matroid<T> | T[], hasCircuit?: CircuitFunc<T>): T[] {
	if (hasCircuit) {
		return findGroundBase(matroidOrGround as T[], hasCircuit);
    }
	const independents = (matroidOrGround as Matroid<T>).independent;
	if(!independents) {
		const {ground, hasCircuit} = matroidOrGround as Matroid<T>;
		return findGroundBase(ground, hasCircuit )
	}
    const indeps = [...(matroidOrGround as Matroid<T>).independent!];
    // looking for max independent
    return indeps.sort((a: T[], b: T[]) => b.length - a.length)?.[0] ?? [];
}

export function findAllBases<T>(matroid: Matroid<T>): T[][] {
    const maxIndependents: T[][] = [];
    const ground = matroid.ground;
    const firstBase = findBase(matroid);

    if (firstBase.length > 0) {
        ground
            .filter((subSet: T[]) => subSet.length === firstBase.length)
            .forEach((element: T[]) => {
                if (!matroid.hasCircuit(element)) {
                    maxIndependents.push(element);
                }
            });
    }
    return maxIndependents;
}

function findIndependentsFromSubSequences<T>(
    setToSearch: T[][],
    hasCircuit: CircuitFunc<T>,
    knownMaxRank?: number,
): T[][] {
    const independents: T[][] = [];
    // going from smallest set to largest
    const setToSearchSorted = [...setToSearch].sort((a: T[], b: T[]) => a.length - b.length);
    let currentMaxRank = knownMaxRank ?? setToSearchSorted[0]?.length ?? 0;
    setToSearchSorted.some((element: T[]) => {
        // found a dependent set that's greater than the last one
        if (hasCircuit(element)) {
            // bases are the max independent if there were no independent sets in length + 1 size, then
            // there are no more independents
            return element.length > currentMaxRank + 1;
        }

        if (element.length > currentMaxRank) {
            currentMaxRank = element.length;
        }
        independents.push(element);
        return false;
    });

    return independents;
}

function findIndependentsFromAtoms<T>(setOfAtomsToSearch: T[], hasCircuit: CircuitFunc<T>): T[][] {
    const independents: T[][] = [];
    const maxRank = setOfAtomsToSearch.length;
    // singles
    let combinations: T[][] = setOfAtomsToSearch.map(atom => [atom]);
    let nextCombinations: T[][] = [];
    let currentMaxRank = 0;
    // the size of each element in combination, first it's just the atoms [[atom1], [atom2]...], each are lenght 1
    for (let currentCombinationItemSize = 1; currentCombinationItemSize <= maxRank; currentCombinationItemSize++) {
        nextCombinations = [];
        independents.push(...findIndependentsFromSubSequences(combinations, hasCircuit, currentMaxRank));
        for (let i = 0; i < combinations.length; i++) {
            const nextCombinationLeftOperand = combinations[i];
            const lastAtomInLeftOperand = nextCombinationLeftOperand[nextCombinationLeftOperand.length - 1];
            const nextCombinationRightOperandStartIndex = setOfAtomsToSearch.indexOf(lastAtomInLeftOperand) + 1;
            for (
                let nextCombinationRightOperandIndex = nextCombinationRightOperandStartIndex;
                nextCombinationRightOperandIndex < maxRank;
                nextCombinationRightOperandIndex++
            ) {
                nextCombinations.push([
                    ...nextCombinationLeftOperand,
                    setOfAtomsToSearch[nextCombinationRightOperandIndex],
                ]);
            }
        }
        combinations = nextCombinations;
    }
    return independents;
}

export function findIndependents<T>(setToSearch: T[][], hasCircuit: CircuitFunc<T>): T[][];
export function findIndependents<T>(setOfAtomsToSearch: T[], hasCircuit: CircuitFunc<T>): T[][];
export function findIndependents<T>(setOrAtoms: T[] | T[][], hasCircuit: CircuitFunc<T>): T[][] {
    if (setOrAtoms.length && typeof setOrAtoms[0] !== 'string' && (setOrAtoms[0] as any).length !== undefined) {
        return findIndependentsFromSubSequences(setOrAtoms as any, hasCircuit);
    }
    return findIndependentsFromAtoms(setOrAtoms as any, hasCircuit);
}
