import { findIndependents, findBase } from '../src/generic-functions';

interface Value {
    value: string;
}

describe('generic helper functions', () => {
    let atoms: Value[];
    let hasCircuitSpy: jasmine.Spy;

    beforeEach(() => {
        atoms = [{ value: 'a' }, { value: 'b' }, { value: 'c' }, { value: 'd' }];
        hasCircuitSpy = jasmine.createSpy('hasCircuit').and.callFake(() => false);
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
            hasCircuitSpy.and.callFake(() => true);
            findBase(atoms, hasCircuitSpy);
            expect(hasCircuitSpy).toHaveBeenCalledTimes(4);
            for (let atom of atoms) {
                expect(hasCircuitSpy).toHaveBeenCalledWith([atom]);
            }
        });
    });

    describe('findBase', () => {
        it('should find a base', () => {
            hasCircuitSpy.and.callFake(a => {
                const am = a.map(e => e.value);
                return am.includes('a') && am.includes('b');
            });
            const base = findBase(atoms, hasCircuitSpy);
            expect(base.length).toBe(3);
        });
    });
});
