# matroidJS

A library to model any data structures with [matroids](https://en.wikipedia.org/wiki/Matroid). "A matroid is a structure that abstracts and generalizes the notion of linear independence in vector spaces". For example any finite graphs and matrices can be viewed as matroids. This library views matroids as a way to model dependencies in any given sets.

## Usage
To get started with Matroids you need to define what is considered a dependency in your data. Use Matroid abstract class for this:
```typescript
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
```
In this example we have Tasks as the model we want to matroidize. Tasks have contributors and contributors have names. Any two different Tasks are considered dependent if there is a person working on both of them. Note the function signature `public hasCircuit(taskSets: Task[][] | Task[]): boolean {`, the Matroid<T> descendant must be able to tell if there is a dependency in a T[] or in a T[][] also.

After defining your dependency function `hasCircuit` we can add our data to the new class
```typescript
const MOCK_TASKS: Task[] = [
    {contributors: [MOCK_PEOPLE[0]], id: "1"},
    {contributors: [MOCK_PEOPLE[0], MOCK_PEOPLE[1]], id: "2"}, 
    {contributors: [MOCK_PEOPLE[2]], id: "3"}, 
    {contributors: [MOCK_PEOPLE[3]], id: "4"}
];
taskMatroid = new TaskMatroid(MOCK_TASKS);
```
Having the matroid initialized we can access information about our original task set such as its rank ```taskMatroid.rank```, that tells the maximum task set size that could contain only independent tasks. 
You also have `ground` and `independent` properties. `ground` contains all possible combinations of the initializing set (if not a T[][] was given to the constructor) while `independent` contains all the sets of `ground` with only independent items in them.

Then there are the util functions consuming matroids:
### findBase():
Returns the first rank sized (biggest possible) independent set of T (T[]). For instance in the example above this would contain 3 Tasks (id 1,3,4). 

### findBases():
As opposed to `findBase()` this returns all the rank sized T sets (T[][]) that are independent, in this example case there are two: the one mentioned above (ids 1,3,4), and an other (ids 2,3,4)

### findIndependents():
Returns all independent sets (T[][]) regardless of their size.

### getClosure():
This function return a set of sets (T[][]) thats rank is not greater than the original, meaning the maximum number of independent T items in every returned T sets (T[]) is less then or equal to the original set. The parameter for this function is a set of sets (T[][]), not a Matroid. Naturally if the parameter contains a base as well, then the return value will be the ground of the Matroid.