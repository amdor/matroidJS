import { findBase, findIndependents, useKnownCircuitsCheck } from '../src/generic-functions';

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
            expect(independents.length).toBe(16);
            expect(independents[15]).toEqual(atoms);
        });
    });

    describe('findGroundBase', () => {
        it('should find no base in a fully dependent matroid', () => {
            hasCircuitSpy.mockReturnValue(true);
            findBase(atoms, hasCircuitSpy);
            expect(hasCircuitSpy).toHaveBeenCalledTimes(23);
            expect(hasCircuitSpy).toHaveBeenCalledWith(atoms);
        });
    });

    describe('findBase', () => {
        it('should find a base', () => {
            hasCircuitSpy.mockImplementation(a => a[0].value === 'a' && a[1].value === 'b');
            const base = findBase(atoms, hasCircuitSpy);
            expect(base.length).toBe(3);
        });
    });
});
