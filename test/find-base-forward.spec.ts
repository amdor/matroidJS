import { Matroid } from '../src/matroid';
import { findBase } from '../src/private/find-base-forward';

class SimpleMatroid extends Matroid<string> {
    constructor(public mockHasCircuit: any, setOfAtoms: string[]) {
        super(setOfAtoms);
    }

    hasCircuit(subsetToCheck: string[]): boolean {
        return this.mockHasCircuit(subsetToCheck);
    }
}

describe('findIndependentsFromAtoms', () => {
    let atoms;

    beforeEach(() => {
        atoms = ['a', 'b', 'c'];
    });
    it('should find independents', () => {
        const indeps = findBase(new SimpleMatroid(() => false, atoms));
        expect(indeps).toEqual(['a', 'b', 'c']);
    });

    it('should find independents with hasCircuit actually defined', () => {
        const indeps = findBase(new SimpleMatroid(atomset => atomset.length !== 1 || atomset[0] !== 'b', atoms));
        expect(indeps).toEqual(['b']);
    });
});
