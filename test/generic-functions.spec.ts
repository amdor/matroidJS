import { findBase, findIndependents } from '../src/generic-functions';

interface Value {
    value: string;
}

describe('generic helper functions', () => {
    let atoms: Value[];
    let hasCircuitSpy: jest.Mock;

    beforeEach(() => {
        atoms = [{ value: 'a' }, { value: 'b' }, { value: 'c' }, { value: 'd' }];
        hasCircuitSpy = jest.fn(() => false);
    });

    describe('findIndependents', () => {
        it('should find all combinations', () => {
            const independents = findIndependents<Value>(atoms, hasCircuitSpy);
            expect(independents.length).toBe(15);
            expect(independents[14]).toEqual(atoms);
        });
    });

    describe('findGroundBase', () => {
        it('should find no base in a fully dependent matroid', () => {
            hasCircuitSpy.mockReturnValue(true);
            findBase(atoms, hasCircuitSpy);
            expect(hasCircuitSpy).toHaveBeenCalledTimes(15);
            expect(hasCircuitSpy).toHaveBeenCalledWith(atoms);
        });
    });
});
