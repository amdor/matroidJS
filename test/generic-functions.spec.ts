import { findIndependents } from '../src/generic-functions';

describe('generic helper functions', () => {
    let atoms: string[];
    let hasCircuitSpy: jest.Mock;

    beforeEach(() => {
        atoms = ['a', 'b', 'c', 'd'];
        hasCircuitSpy = jest.fn(() => false);
    });

    describe('findIndependents', () => {
        it('should find all combinations', () => {
            const independents = findIndependents<string>(atoms, hasCircuitSpy);
            expect(independents.length).toBe(15);
            expect(independents[14]).toEqual(atoms);
        });
    });
});
