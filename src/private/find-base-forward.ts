import { Matroid } from '../matroid';

export function findBase<T>(matroid: Matroid<T>): T[] {
    let basis: T[] = [];
    const potentialBaseElements = [...matroid.ground];
    let foundNextElement = true;
    while (foundNextElement) {
        foundNextElement = false;
        for (let i = 0; i < potentialBaseElements.length; i++) {
            const potentialElement = potentialBaseElements[i];
            const newBasisCandidate = [...basis, potentialElement];
            if (matroid.hasCircuit(newBasisCandidate)) {
                continue;
            }
            potentialBaseElements.splice(i, 1);
            basis = newBasisCandidate;
            foundNextElement = true;
            break;
        }
    }
    return basis;
}
