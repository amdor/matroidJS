import { Matroid } from './matroid';

type CircuitFunc<F> = (set: F[]) => boolean;
type Id<T> = T & { id: number };
type IdArray<T> = Array<Id<T>>;

function findGroundBase<T>(ground: T[], hasCircuit: CircuitFunc<T>): T[];
function findGroundBase<T>(ground: T[], hasCircuit: CircuitFunc<T>, rank: number, findAll: boolean): T[][];
function findGroundBase<T>(ground: T[], hasCircuit: CircuitFunc<T>, rank?: number, findAll?: boolean): T[] | T[][] {
    // tslint:disable-next-line: variable-name
    const _ground: IdArray<T> = ground.map((e: any, i) => {
        e.id = i;
        return e;
    });
    const MAX_KNOWN_CIRCUIT_SIZE = 3;

    const getNextAtomFromPosition = (combination: IdArray<T>, position: number): Id<T> | undefined => {
        const lastItemIndex = combination[position].id; // _ground.indexOf(combination[position]);
        if (lastItemIndex >= _ground.length - 1) {
            return undefined;
        }
        return _ground[lastItemIndex + 1];
    };

    // returns the next combination and the last visited lookback index
    const getNextCombination = (combination: IdArray<T>, fixPosition: number): IdArray<T> | undefined => {
        const nextCombination = [...combination];
        let foundOne = false;
        // checking atoms backward to find one that is still changable
        for (let lookBackIndex = combination.length - 1; lookBackIndex > fixPosition; lookBackIndex--) {
            let foundNextAtom = getNextAtomFromPosition(combination, lookBackIndex);
            if (foundNextAtom === undefined) {
                continue;
            }
            foundOne = true;
            nextCombination[lookBackIndex] = foundNextAtom;
            // filling up the rest of the atoms with subsequent item, but if there aren't
            // enough subsequent atoms, then the lookback found an invalid candidate so there
            // are no more combinations for the current lookback position
            for (let fillIndex = lookBackIndex + 1; fillIndex < combination.length; fillIndex++) {
                foundNextAtom = getNextAtomFromPosition(nextCombination, fillIndex - 1);
                if (foundNextAtom === undefined) {
                    foundOne = false;
                    continue;
                }
                nextCombination[fillIndex] = foundNextAtom;
            }
            if (foundOne) {
                // to continue, if the last changed lookBackIndex was 1, we should not start by changing that, there might be other valid combinations left
                // for that still
                return nextCombination;
            }
        }
        return undefined;
    };

    const allBases = [];
    let knownCircuits: Array<IdArray<T>> = [];

    const checkForKnownCircuit = (currentCombination: IdArray<T>): number | undefined => {
        const currentCombinationIndexMap = currentCombination.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
        }, {} as Record<number, Id<T>>);
        // the index of the circuit element to which all other circuit elements are to the left, being the highest
        let maxCircuitIndexInCombination: number | undefined;
        knownCircuits.find(circuit => {
            let maxIndex: number | undefined;
            const isCircuitInCombination = circuit.every(circuitElement => {
                // every circuit element is in the combination
                const index = currentCombinationIndexMap[circuitElement.id]?.id ?? -1;
                if (index === -1) {
                    return false;
                }
                maxIndex = (maxIndex ?? 0) <= index ? index : maxIndex;
                return true;
            });
            if (isCircuitInCombination) {
                maxCircuitIndexInCombination = maxIndex;
            }
            return isCircuitInCombination;
        });
        return maxCircuitIndexInCombination;
    };

    const fillKnownCircuits = () => {
        // check all <=3 long combinations
        const baseCombination = [..._ground];
        let currentCombination = baseCombination.slice(0, MAX_KNOWN_CIRCUIT_SIZE);
        while (currentCombination.length > 1) {
            for (let firstFixedAtomInCombination = currentCombination.length - 2; firstFixedAtomInCombination >= -1; ) {
                const nextCombination = getNextCombination(currentCombination, firstFixedAtomInCombination);
                if (nextCombination === undefined) {
                    firstFixedAtomInCombination--;
                    continue;
                }
                if (hasCircuit(currentCombination)) {
                    knownCircuits.push(currentCombination);
                }
                currentCombination = nextCombination;
            }
            currentCombination.pop();
        }
    };
    fillKnownCircuits();

    // looking for all the atomsInCurrentCombination sized combinations
    // looking only rank sized combinations if we know the rank
    for (
        let atomsInCurrentCombination = rank ?? _ground.length;
        atomsInCurrentCombination > (rank ?? 1) - 1;
        atomsInCurrentCombination--
    ) {
        knownCircuits =
            atomsInCurrentCombination <= MAX_KNOWN_CIRCUIT_SIZE
                ? knownCircuits.filter(circuit => circuit.length <= atomsInCurrentCombination)
                : knownCircuits;
        let currentCombination: IdArray<T> = [];
        currentCombination.push(_ground[0]);
        // initial combination
        for (let combinationPosition = 1; combinationPosition < atomsInCurrentCombination; combinationPosition++) {
            const nextAtom = getNextAtomFromPosition(currentCombination, combinationPosition - 1);
            if (nextAtom === undefined) {
                currentCombination = [];
                break;
            }
            currentCombination[combinationPosition] = nextAtom;
        }
        if (!hasCircuit(currentCombination)) {
            if (!findAll) {
                return currentCombination;
            }
            allBases.push(currentCombination);
        }

        // find the next combination with fix firs N items, it there's no more, find combinations with
        // N-1 elements fixed, until there are no elements fixed anymore
        for (let firstFixedAtomInCombination = currentCombination.length - 2; firstFixedAtomInCombination >= -1; ) {
            let nextCombination: IdArray<T> | undefined;
            nextCombination = getNextCombination(currentCombination, firstFixedAtomInCombination);
            if (nextCombination === undefined) {
                firstFixedAtomInCombination--;
                continue;
            }
            currentCombination = nextCombination;
            // going from last element to first with variable atoms, if there is a circuit among the fixed atoms, all
            // combinations starting with it will have a circuit, so the first fixed index must be under it
            const maxElementIndexForKnownCircuit = checkForKnownCircuit(currentCombination);
            if (maxElementIndexForKnownCircuit && maxElementIndexForKnownCircuit <= firstFixedAtomInCombination) {
                firstFixedAtomInCombination = maxElementIndexForKnownCircuit - 1;
                continue;
            }
            if (!hasCircuit(currentCombination)) {
                if (!findAll) {
                    return currentCombination;
                }
                allBases.push(currentCombination);
            }
        }
    }
    return allBases;
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
    if (!independents?.length) {
        const { ground, hasCircuit: mHasCircuit } = matroidOrGround as Matroid<T>;
        return findGroundBase(ground, mHasCircuit);
    }
    const indeps = [...(matroidOrGround as Matroid<T>).independent!];
    // looking for max independent
    return indeps.sort((a: T[], b: T[]) => b.length - a.length)?.[0] ?? [];
}

export function findAllBases<T>(matroid: Matroid<T>): T[][] {
    const ground = matroid.ground;
    const firstBase = findBase(matroid);
    return findGroundBase(ground, matroid.hasCircuit, firstBase.length, true);
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
    const independents: T[][] = [[]];
    const maxRank = setOfAtomsToSearch.length;
    // singles
    let combinations: T[][] = setOfAtomsToSearch.map(atom => [atom]);
    let nextCombinations: T[][] = [];
    // the size of each element in combination, first it's just the atoms [[atom1], [atom2]...], each are length 1
    for (let currentCombinationItemSize = 1; currentCombinationItemSize <= maxRank; currentCombinationItemSize++) {
        nextCombinations = [];
        independents.push(...findIndependentsFromSubSequences(combinations, hasCircuit, 0));
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
