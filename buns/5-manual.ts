
const testInput = `
47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47
`.trim();

type Rules = Record<number, Set<number>>;

const parseInput = (s: string): [Rules, number[][]] => {
    const blocks = s.split('\n\n');

    const ruleText = blocks[0].split('\n');
    const rules: Rules = {};
    for (const rule of ruleText) {
        const parts = rule.split('|').map(p => parseInt(p, 10));
        if (!rules[parts[1]]) {
            rules[parts[1]] = new Set<number>();
        }
        rules[parts[1]].add(parts[0]);
    }

    const checks = blocks[1].split('\n')
        .map(r => r.split(',').map(c => parseInt(c, 10)));

    return [rules, checks];
}

const checkLine = (rules: Rules, checks: number[]) => {
    for (let i = 0; i < checks.length-1; i++) {
        const number = checks[i];
        const rest = new Set(checks.slice(i+1));
        const outOfOrder = rest.intersection(rules[number] ?? new Set());
        if (outOfOrder.size > 0) {
            return false;
        }
    }
    return true;
}

const findLegalPosition = (set: Set<number>, list: number[]) => {
    let index = 0;
    set.forEach(v => {
        index = Math.max(index, list.indexOf(v));
    })
    return index+1;
} 

const reorderLine = (rules: Rules, checks: number[]) => {
    const result = [...checks];
    while(!checkLine(rules, result)) {
        for (let i = 0; i < result.length-1; i++) {
            const number = result[i];
            let rest = new Set(result.slice(i+1));
            let outOfOrder = rest.intersection(rules[number] ?? new Set()).size > 0;
            if (outOfOrder) {
                let newPosition = findLegalPosition(rules[number], result);
                result.splice(newPosition, 0, number);
                result.splice(i, 1);
                i--;
                // let temp = result[i+1];
                // result[i+1] = result [i];
                // result[i] = temp;
            }
        }
    }
    return result;
}

const middleElement = <T>(arr: T[]): T => {
    const midPoint = Math.floor(arr.length / 2);
    return arr[midPoint];
}

const part1 = (rules: Rules, checks: number[][]) => {
    const legalLines = checks.filter(line => checkLine(rules, line));
    return legalLines.reduce((acc, cur) => acc + middleElement(cur), 0);
}

const part2 = (rules: Rules, checks: number[][]) => {
    const illegalLines = checks.filter(line => !checkLine(rules, line));
    return illegalLines.map(line => reorderLine(rules, line))
        .reduce((acc, cur) => acc + middleElement(cur), 0);
}

console.log('Test: Expecting 143, Actual ', part1(...parseInput(testInput)));
console.log('Test: Expecting 123, Actual ', part2(...parseInput(testInput)));

const fileContents = await Bun.file('5.txt').text();
const [rules, lines] = parseInput(fileContents);

console.log('Part 1: ', part1(rules, lines));
console.log('Part 2: ', part2(rules, lines));