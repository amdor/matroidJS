// tslint:disable:max-classes-per-file
import { findIndependents } from '../src/generic-functions';
import { findBase } from '../src/private/find-base-forward';
import { Matroid } from '../src/matroid';

class Person {
    public name: string;
    public team: string;
    public skills?: any[];
}

class Team {
    public name: string;
    public members: Person[];
}

class Task {
    public id: string;
    public contributors: Person[];
}

class Project {
    public teams: Team[];
    public tasks: Task[];
}

class TaskMatroid extends Matroid<Task> {
    // are there tasks with same person working on it?
    public hasCircuit(taskSet: Task[]): boolean {
        const people: string[] = [];
        const taskIds = [];
        for (const task of taskSet) {
            if (taskIds.includes(task.id)) {
                continue;
            }
            taskIds.push(task.id);
            const peopleOnTask = task.contributors.map(contributor => contributor.name);
            for (const person of peopleOnTask) {
                if (people.includes(person)) {
                    return true;
                }
                people.push(person);
            }
        }
        return false;
    }
}

const MOCK_PEOPLE: Person[] = [
    { name: 'Zsolt', team: 'Atlantis' },
    { name: 'Levi', team: 'Prometheus' },
    { name: 'Lilla', team: 'Prometheus' },
    { name: 'Gabi', team: 'Laika' },
];

const MOCK_TEAMS: Team[] = [
    { name: 'Atlantis', members: [MOCK_PEOPLE[0]] },
    { name: 'Prometheus', members: [MOCK_PEOPLE[1], MOCK_PEOPLE[2]] },
    { name: 'Laika', members: [MOCK_PEOPLE[3]] },
];

const MOCK_TASKS: Task[] = [
    { contributors: [MOCK_PEOPLE[0]], id: '1' },
    { contributors: [MOCK_PEOPLE[0], MOCK_PEOPLE[1]], id: '2' },
    { contributors: [MOCK_PEOPLE[2]], id: '3' },
    { contributors: [MOCK_PEOPLE[3]], id: '4' },
];

describe('a task matroid', () => {
    let project: Project;
    let taskMatroid: Matroid<Task>;

    beforeEach(() => {
        project = { teams: [...MOCK_TEAMS], tasks: [...MOCK_TASKS] };
        taskMatroid = new TaskMatroid(project.tasks);
    });

    it('should be dependent when there are tasks with the same contributor', () => {
        const rank = findBase(taskMatroid).length;
        expect(rank).toBe(3);
        expect(taskMatroid.ground.length).toBeGreaterThan(taskMatroid.rank);
    });

    it('should have independent subsets', () => {
        taskMatroid.independent?.forEach((task: Task[]) => expect(taskMatroid.hasCircuit(task)).toBe(false));
    });

    it('should have a base thats closure is the ground', () => {
        const base = findBase(taskMatroid);
        // there is a subset in independent subsets that has the same elements as base
        const indeps = findIndependents(taskMatroid.ground, taskMatroid.hasCircuit);
        expect(
            indeps.some((indep: Task[]) =>
                indep.every((indepElem: Task) => base.some((baseTask: Task) => baseTask.id === indepElem.id)),
            ),
        ).toBe(true);
        expect(taskMatroid.getClosure(base).length).toEqual(taskMatroid.ground.length);
    });

    fdescribe('when base is bigger', () => {
        beforeEach(() => {
            let newTasks = [];
            for (let i = 0; i < 18; i++) {
                newTasks.push({ contributors: [MOCK_PEOPLE[1]], id: `${i + 5}` });
            }
            taskMatroid = new TaskMatroid([...MOCK_TASKS, ...newTasks]);
        });

        it('should be still fast and yield the correct result', () => {
            const base = findBase(taskMatroid);
            expect(base.length).toBe(4); // MOCK_TASKS[0, 2, 3, 4] for example
        });
    });
});
