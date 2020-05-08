// tslint:disable:max-classes-per-file
import { findBase, findAllBases } from "../src/generic-functions";
import { Matroid } from "../src/matroid";

class Class {
    public name: string;
    public occurances: Occurance[];
    public lector: string;
    public freeCapacity: number;
}

class Occurance {
    public day: Day;
    public week: Week;
    public timeSlot: number;
    public place: Building
}

enum Day {
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday
}

enum Week {
    A,
    B
}

enum Building {
    I,
    Q,
    K,
    E,
    St,
    R
}

function isOverlappingOrConsecutiveInDifferentBuilding(classA: Class, classB: Class): boolean {
    return classA.occurances.some((occA: Occurance) =>
        classB.occurances.some((occB: Occurance) => occA.week === occB.week && occA.day === occB.day
            && (occA.timeSlot === occB.timeSlot || Math.abs(occA.timeSlot - occB.timeSlot) === 1 && occA.place !== occB.place)
        ))
}

function isExtendableWithClass(indepClasses: { [key: string]: Class }, claz: Class): boolean {
    const indepClassesValues = Object.keys(indepClasses).map(key => indepClasses[key]);
    return indepClassesValues.some(
        (indepClass: Class) => isOverlappingOrConsecutiveInDifferentBuilding(indepClass, claz)
    );
}

function classMatroidHasCircuit(subsetToCheck: Class[] | Class[][]) {
    let innerSubsetToCheck = [];
    if (subsetToCheck.length && Array.isArray(subsetToCheck[0])) {
        innerSubsetToCheck = subsetToCheck;
    } else {
        innerSubsetToCheck.push(subsetToCheck);
    }

    const indepClasses: { [key: string]: Class } = {};

    return innerSubsetToCheck.some((classes: Class[]) => {
        return classes.some((claz: Class) => {
            if (indepClasses[claz.name]) {
                return false;
            }

            const isClazDependentToPrevClasses = isExtendableWithClass(indepClasses, claz);
            if (isClazDependentToPrevClasses) {
                return true;
            }
            indepClasses[claz.name] = claz;
            return false;
        });
    });
}

class LectorTimetableMatroid extends Matroid<Class> {
    // classes are dependent if they have the same lector and are in the same time or they are in consecutive timeslots in different buildings
    // if returns true, then dependent
    public hasCircuit(subsetToCheck: Class[] | Class[][]): boolean {
        return classMatroidHasCircuit(subsetToCheck);
    }

}


class StudentTimetableMatroid extends Matroid<Class> {
    // classes are dependent if (this is OR condition)
    // - they are at the same time
    // - they are in consecutive timeslots in different buildings
    // - there's no capacity
    public hasCircuit(subsetToCheck: Class[] | Class[][]): boolean {
        return classMatroidHasCircuit(subsetToCheck);
    }

}

const CLASS1: Class = {
    name: "CLASS1",
    occurances: [{ week: Week.A, day: Day.Monday, timeSlot: 2, place: Building.E }],
    lector: "Dr Knohow",
    freeCapacity: 15
}

const CLASS2: Class = {
    name: "CLASS2",
    lector: "Ulrich von Liechtenstein",
    occurances: [{ week: Week.A, day: Day.Monday, timeSlot: 3, place: Building.Q }],
    freeCapacity: 15
}

const CLASS3: Class = {
    name: "CLASS3",
    lector: "Ulrich von Liechtenstein",
    occurances: [{ week: Week.A, day: Day.Monday, timeSlot: 4, place: Building.Q }],
    freeCapacity: 15
}

const CLASS1_DIFF_BUILD: Class = {
    ...CLASS1, occurances: [{ ...CLASS1.occurances[0], place: Building.Q }], name: "CLASS1_DIFF_BUILD"
};

const CLASS2_DIFF_LECTOR: Class = {
    ...CLASS2, lector: "Prof Spiderpig", name: "CLASS2_DIFF_LECTOR"
}

const CLASS3_NO_CAPACITY: Class = {
    ...CLASS3, freeCapacity: 0, name: "CLASS3_NO_CAPACITY"
}

const CLASSES = [CLASS1, CLASS2, CLASS3, CLASS1_DIFF_BUILD, CLASS2_DIFF_LECTOR, CLASS3_NO_CAPACITY];

describe("a timetable matroid", () => {
    let matroid: Matroid<Class>;

    describe("a student timetable matroid", () => {
        beforeEach(() => {
            matroid = new StudentTimetableMatroid(CLASSES);
        });

        it("should have two bases with maximum independent class sets", () => {
            const bases = findAllBases(matroid);
            expect(bases.length).toBe(2);
            for (const base of bases) {
                expect(base.length).toBe(3);
            }
        });

        // CLASS2 and CLASS3 are independent
        it("should provide closure for subset of the matroid", () => {
            const subset = matroid.ground.find((element: Class[]) => element.length === 2 && element.includes(CLASS2) && element.includes(CLASS3)) ?? [];

            // interested only in subsets where CLASS2 and CLASS3 are in as base
            const closureSet = matroid.getClosure([subset])
                .filter((closureSubset: Class[]) => closureSubset.includes(CLASS2) && closureSubset.includes(CLASS3));
            // let's not consider the original subset in the closures
            for (let i = 0; i < closureSet.length; i++) {
                closureSet[i] = closureSet[i].filter((claz: Class) => claz !== CLASS2 && claz !== CLASS3);
            }

            closureSet.sort((closureSubsetA: Class[], closureSubsetB: Class[]) => {
                return closureSubsetA.length - closureSubsetB.length
            });
            // CLASS2 is in dependency with both CLASS1 and CLASS2_DIFF_LECTOR, while CLASS3 is with CLASS3_NO_CAPACITY
            // hence the two of them has at most 3 dependents
            expect(closureSet[closureSet.length - 1].length).toBe(3);
        });
    });
});