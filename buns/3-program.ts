
const testString = 'xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))';
const testString2 = "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))";

const mulReader = (s: string, conditionals: boolean = false) => {
    const r = /mul\((?<left>\d+),(?<right>\d+)\)|don\'t\(\)|do\(\)/g;
    
    const matches = s.matchAll(r);
    let total = 0;
    let active = true;
    for (const match of matches) {
        if (match[0] === "don't()") {
            active = false;
            continue;
        } else if(match[0] === "do()") {
            active = true;
            continue;
        }

        if (active || !conditionals) {
            const left = parseInt(match.groups?.left ?? '0', 10)
            const right = parseInt(match.groups?.right ?? '0', 10)
            total += left * right;
        }
    }

    return total;
}

console.log('Test: Expected: 161, Actual:', mulReader(testString));
console.log('Test: Expected: 48, Actual:', mulReader(testString2, true));


const inString = await Bun.file('3.txt').text();

console.log('Part 1:', mulReader(inString));
console.log('Part 2:', mulReader(inString, true));
