// tslint:disable:max-classes-per-file
import { findBase } from "../src/generic-functions";
import { Matroid } from "../src/matroid";


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
    public hasCircuit(taskSets: Task[][] | Task[]): boolean {
        const people: string[] = [];
        const taskIds = [];
        let actualSets;
        if(taskSets.length && Array.isArray(taskSets[0])) {
            actualSets = taskSets;
        } else {
            actualSets = [taskSets];
        }
        for(const taskSet of actualSets) {
            for(const task of taskSet) {
                if(taskIds.includes(task.id)) {
                    continue;
                }
                taskIds.push(task.id);
                const peopleOnTask = task.contributors.map(contributor => contributor.name);
                for(const person of peopleOnTask) {
                    if(people.includes(person)) {
                        return true;
                    }
                    people.push(person);
                }
            }
        }
        return false;
    }
} 

const MOCK_PEOPLE: Person[] = [{name: "Zsolt", team: "Atlantis"}, {name: "Levi", team: "Prometheus"}, {name: "Lilla", team: "Prometheus"}, {name: "Gabi", team: "Laika"}]

const MOCK_TEAMS: Team[] = [
    {name: "Atlantis", members: [MOCK_PEOPLE[0]]},
    {name: "Prometheus", members: [MOCK_PEOPLE[1], MOCK_PEOPLE[2]]},
    {name: "Laika", members: [MOCK_PEOPLE[3]]},
];

const MOCK_TASKS: Task[] = [
    {contributors: [MOCK_PEOPLE[0]], id: "1"},
    {contributors: [MOCK_PEOPLE[0], MOCK_PEOPLE[1]], id: "2"}, 
    {contributors: [MOCK_PEOPLE[2]], id: "3"}, 
    {contributors: [MOCK_PEOPLE[3]], id: "4"}
];

describe("a task matroid", () => {
    let project: Project;
    let taskMatroid: Matroid<Task>;

    beforeEach(() => {
        project = {teams: [...MOCK_TEAMS], tasks: [...MOCK_TASKS]};
        taskMatroid = new TaskMatroid(project.tasks);
    });

    it("should be dependent when there are tasks with the same contributor", () => {
        expect(taskMatroid.rank).toBe(3);
        // not all sets are independent
        expect(taskMatroid.independent.length).toBeLessThan(taskMatroid.ground.length);
        // biggest subset cannot be independent if rank is smaller
        const biggestSubset = taskMatroid.ground.sort((firstTask: Task[], secondTask: Task[]) => secondTask.length - firstTask.length )[0];
        expect(biggestSubset.length).toBeGreaterThan(taskMatroid.rank);
    });

    it("should have independent subsets", () => {
        taskMatroid.independent.forEach((task: Task[]) => expect(taskMatroid.hasCircuit(task)).toBe(false));
    });

    it("should have a base thats closure is the ground", () => {
        const base = findBase(taskMatroid);
        // there is a subset in independent subsets that has the same elements as base
        expect(taskMatroid.independent.some(
            (indep: Task[]) => indep.every(
                (indepElem: Task) => base.some(
                    (baseTask: Task) => baseTask.id === indepElem.id)
                )
            )
        ).toBe(true);
        expect(taskMatroid.getClosure([base]).length).toEqual(taskMatroid.ground.length);
    });
});