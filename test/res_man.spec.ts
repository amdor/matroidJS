// tslint:disable:max-classes-per-file
import { Matroid } from "../src/matroid";
import { MatroidFactory } from "./../src/matroid.factory";


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

class TaskMatroidFactory extends MatroidFactory<Task> {
    // are there tasks with same person working on it?
    protected hasCircuit(tasks: Task[][]): boolean {
        const people: string[] = [];
        for(const task of tasks) {
            const peopleOnTask = task.contributors.map(contributor => contributor.name);
            for(const person of peopleOnTask) {
                if(people.includes(person)) {
                    return true;
                }
                people.push(person);
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

describe("matroid integration", () => {
    const taskMatroidFactory = new TaskMatroidFactory();
    let project: Project;
    let taskMatroid: Matroid<Task>;

    beforeEach(() => {
        project = {teams: [...MOCK_TEAMS], tasks: [...MOCK_TASKS]};
        taskMatroid = taskMatroidFactory.createMatroid(project.tasks);
    });

    it("should be dependent when there are tasks with the same contributor", () => {
        expect(taskMatroid.ground.length).toBe(4);
        expect(taskMatroid.rank).toBe(3);
    });

    it("should have independent subset", () => {
        expect(taskMatroid.ground.length).toBe(4);
        expect(taskMatroid.rank).toBe(3);
    });
});