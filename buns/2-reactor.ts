const input = await Bun.file('2.txt').text();

const reports = input.split('\n').map(line => line.split(' ').map(value => parseInt(value, 10)));

type Direction = 'up' | 'down' | 'unknown';

const checkSafe = (row: number[]) => {
    let direction: Direction = 'unknown';
    
    for (let i = 0, j = 1; j < row.length; i++, j++) {
        const a = row[i]; const b = row[j];

        if (direction === 'unknown') {
            if (a < b) { 
                direction = 'up';
            } else if(a > b) {
                direction = 'down'
            } else {
                return false;
            }
        }

        if (!checkDirection(a, b, direction)) return false;

        const diff = Math.abs(a - b);
        if (diff > 3) return false;
    }
    return true;
}

const checkDirection = (a: number, b: number, d: Direction) => {
    if (d === 'up') {
        if (a < b) return true;
    } else if (d === 'down') {
        if (a > b) return true;
    }
    return false;
}

const checkSafeWithDampener = (row: number[]) => {
    if (checkSafe(row)) {
        return true;
    }

    for (let i = 0; i < row.length; i++) {
        const newRow = row.filter((_, index) => i!==index);
        if (checkSafe(newRow)) return true;
    }
    return false;
}

const testValue = `
7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9
`.trim().split('\n').map(line => line.split(' ').map(value => parseInt(value, 10)));

console.log('Check 1: 2 === ', testValue.filter(checkSafe).length);
console.log('Check 2: 4 === ', testValue.filter(checkSafeWithDampener).length)

console.log("Part 1: ", reports.filter(checkSafe).length);
console.log("Part 2: ", reports.filter(checkSafeWithDampener).length);

