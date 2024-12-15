const testInput = `
190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20
`.trim().split('\n');

type Calculation = [number, number[]];

const parseInput = (s: string[]): Calculation[] => {
    return s.map(l => {
        const [code, rest] = l.split(':');
        const values = rest.trim().split(" ").map(v => parseInt(v, 10));
        const target = parseInt(code, 10);
        return [target, values];
    })
};

const targetCheck = ([target, values]: Calculation, allowConcat: boolean = false) => {
    const nodes: Calculation[] = [[values[0], values.slice(1)]];
    const results = [];
    while (nodes.length) {
        const [acc, curList] = nodes.shift() as Calculation;
        if (curList.length === 0) {
            if (acc === target) {
                return true;
            }
            continue;
        }

        const nextValue = curList[0];
        nodes.push([acc + nextValue, [...curList].splice(1)]);
        nodes.push([acc * nextValue, [...curList].splice(1)]);
        if (allowConcat) {
            nodes.push(
                [parseInt(acc.toString() + nextValue.toString(), 10), [...curList].splice(1)]
            )
        }
    }
    return false;
}

const solve = (s: string[], part2: boolean = false) => {
    const calculations = parseInput(s);
    return calculations.filter(c => targetCheck(c, part2))
        .reduce((acc, cur) => acc + cur[0], 0);
}

console.log('Test: Expecting 3749 Actual', solve(testInput));
console.log('Test: Expecting 11387 Actual', solve(testInput, true));


const input = await Bun.file('7.txt').text();
const lines = input.split('\n');

console.log("Part 1", solve(lines));
console.log("Part 2", solve(lines, true));
