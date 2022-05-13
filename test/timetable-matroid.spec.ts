// tslint:disable:max-classes-per-file
import { findAllBases, findIndependents } from '../src/generic-functions';
import { Matroid } from '../src/matroid';

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
    public place: Building;
}

enum Day {
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
}

enum Week {
    A,
    B,
}

enum Building {
    I,
    Q,
    K,
    E,
    St,
    R,
}

function isOverlappingOrConsecutiveInDifferentBuilding(classA: Class, classB: Class): boolean {
    return classA.occurances.some((occA: Occurance) =>
        classB.occurances.some(
            (occB: Occurance) =>
                occA.week === occB.week &&
                occA.day === occB.day &&
                (occA.timeSlot === occB.timeSlot ||
                    (Math.abs(occA.timeSlot - occB.timeSlot) === 1 && occA.place !== occB.place)),
        ),
    );
}

function isExtendableWithClass(
    indepClasses: { [key: string]: Class },
    claz: Class,
    otherCondition: (cl1: Class, cl2: Class) => boolean,
): boolean {
    const indepClassesValues = Object.keys(indepClasses).map(key => indepClasses[key]);
    return indepClassesValues.some(
        (indepClass: Class) =>
            isOverlappingOrConsecutiveInDifferentBuilding(indepClass, claz) && otherCondition(indepClass, claz),
    );
}

function classMatroidHasCircuit(subsetToCheck: Class[], otherCondition = (cl1: Class, cl2: Class) => true) {
    const indepClasses: { [key: string]: Class } = {};

    return subsetToCheck.some((claz: Class) => {
        if (indepClasses[claz.name]) {
            return false;
        }

        const isClazDependentToPrevClasses = isExtendableWithClass(indepClasses, claz, otherCondition);
        if (isClazDependentToPrevClasses) {
            return true;
        }
        indepClasses[claz.name] = claz;
        return false;
    });
}

class LectorTimetableMatroid extends Matroid<Class> {
    // classes are dependent if (AND)
    // - they have the same lector
    // - they are in the same time OR they are in consecutive timeslots in different buildings
    // if returns true, then dependent
    public hasCircuit(subsetToCheck: Class[]): boolean {
        const isSameLector = (indepClass: Class, classToAdd: Class) => indepClass.lector === classToAdd.lector;
        return classMatroidHasCircuit(subsetToCheck, isSameLector);
    }
}

class StudentTimetableMatroid extends Matroid<Class> {
    // classes are dependent if (this is OR condition)
    // - they are at the same time
    // - they are in consecutive timeslots in different buildings
    public hasCircuit(subsetToCheck: Class[]): boolean {
        return classMatroidHasCircuit(subsetToCheck);
    }
}

const CLASS1: Class = {
    name: 'CLASS1',
    occurances: [{ week: Week.A, day: Day.Monday, timeSlot: 2, place: Building.E }],
    lector: 'Dr Knowhow',
    freeCapacity: 15,
};

const CLASS2: Class = {
    name: 'CLASS2',
    lector: 'Ulrich von Liechtenstein',
    occurances: [{ week: Week.A, day: Day.Monday, timeSlot: 3, place: Building.Q }],
    freeCapacity: 15,
};

const CLASS3: Class = {
    name: 'CLASS3',
    lector: 'Ulrich von Liechtenstein',
    occurances: [{ week: Week.A, day: Day.Monday, timeSlot: 4, place: Building.Q }],
    freeCapacity: 15,
};

const CLASS1_DIFF_BUILD: Class = {
    ...CLASS1,
    occurances: [{ ...CLASS1.occurances[0], place: Building.Q }],
    name: 'CLASS1_DIFF_BUILD',
};

const CLASS2_DIFF_LECTOR: Class = {
    ...CLASS2,
    lector: 'Prof Spiderpig',
    name: 'CLASS2_DIFF_LECTOR',
};

const CLASS3_NO_CAPACITY: Class = {
    ...CLASS3,
    freeCapacity: 0,
    name: 'CLASS3_NO_CAPACITY',
};

const CLASSES = [CLASS1, CLASS2, CLASS3, CLASS1_DIFF_BUILD, CLASS2_DIFF_LECTOR, CLASS3_NO_CAPACITY];

describe('a timetable matroid', () => {
    let matroid: Matroid<Class>;

    describe('a student timetable matroid', () => {
        beforeEach(() => {
            matroid = new StudentTimetableMatroid(CLASSES);
        });

        // if CLASSES is the set of classes a student is interested in bases are the class groups
        // available for simoultanous attendance
        // bases:
        // CLASS2, CLASS3, CLASS1_DIFF_BUILD
        // CLASS2, CLASS1_DIFF_BUILD, CLASS3_NO_CAPACITY
        // CLASS3, CLASS1_DIFF_BUILD, CLASS2_DIFF_LECTOR
        // CLASS1_DIFF_BUILD, CLASS2_DIFF_LECTOR, CLASS3_NO_CAPACITY
        it('should have two bases with maximum independent class sets', () => {
            const bases = findAllBases(matroid);
            expect(bases.length).toBe(4);
            for (const base of bases) {
                expect(base.length).toBe(3);
            }
        });

        // CLASS2 and CLASS3 are independent
        // checking what classes cannot be attended if these two are
        it('should provide closure for subset of the matroid', () => {
            const subset = [CLASS2, CLASS3];

            // interested only in subsets where CLASS2 and CLASS3 are in as base
            let closureSet = matroid.getClosure(subset);
            // let's not consider the original subset in the closures
            closureSet = closureSet.filter((claz: Class) => claz !== CLASS2 && claz !== CLASS3);

            // CLASS2 is in dependency with both CLASS1 and CLASS2_DIFF_LECTOR, while CLASS3 is with CLASS3_NO_CAPACITY
            // hence the two of them have at most 3 dependents
            expect(closureSet.length).toBe(3);
        });
    });

    describe('a lector timetable matroid', () => {
        beforeEach(() => {
            matroid = new LectorTimetableMatroid(CLASSES);
        });

        describe('when there are 2 classes at the same time, with the same lector', () => {
            beforeEach(() => {
                matroid = new LectorTimetableMatroid([CLASS1, CLASS1_DIFF_BUILD]);
            });

            it('should have independent subsets of 1 class', () => {
                const independents = findIndependents(matroid.ground, matroid.hasCircuit);
                expect(independents.length).toBe(3); // [] is always independent
                expect(independents[0].length).toBe(0);
                expect(independents[1].length).toBe(1);
                expect(independents[2].length).toBe(1);
            });
        });

        // if CLASSES is the set of classes a student is interested in bases are the class groups
        // available for simoultanous attendance
        it('should have two bases with maximum independent class sets', () => {
            const bases = findAllBases(matroid);
            expect(bases.length).toBe(4);
            for (const base of bases) {
                expect(base.length).toBe(4);
            }
        });
    });
});
