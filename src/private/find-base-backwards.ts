import { CircuitFunc, Id, IdArray } from '../model';

export function findGroundBase<T>(ground: T[], hasCircuit: CircuitFunc<T>): T[];
export function findGroundBase<T>(ground: T[], hasCircuit: CircuitFunc<T>, rank: number, findAll: boolean): T[][];
export function findGroundBase<T>(
    ground: T[],
    hasCircuit: CircuitFunc<T>,
    rank?: number,
    findAll?: boolean,
): T[] | T[][] {
    // tslint:disable-next-line: variable-name
    const _ground: IdArray<T> = ground.map((e: any, i) => {
        e.id = i;
        return e;
    });

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
            // no proper next atom or not enough atoms to fill back (e.g. the found is the last element on the first position)
            if (foundNextAtom === undefined || combination.length - lookBackIndex > _ground.length - foundNextAtom.id) {
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

    // looking for all the atomsInCurrentCombination sized combinations
    // looking only rank sized combinations if we know the rank
    for (
        let atomsInCurrentCombination = rank ?? _ground.length;
        atomsInCurrentCombination > (rank ?? 1) - 1;
        atomsInCurrentCombination--
    ) {
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

        // there's no other combination if all elements are present once already
        if (atomsInCurrentCombination === _ground.length) {
            continue;
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
