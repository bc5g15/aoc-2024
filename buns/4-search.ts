
const testInput = `
MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX
`.trim().split('\n');

const makeCharMap = (block: string[]) => {
    const map: Record<string, string> = {};
    for (let y = 0; y < block.length; y++) {
        for (let x = 0; x < block[y].length; x++) {
            map[[x,y].join(',')] = block[y][x];
        }
    }
    return map;
}

const fromKey = (key: string) => key.split(',').map(v => parseInt(v, 10)) as [number, number];

const deltaDirections: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1]
];

const directionalSearch = (inMap: Record<string, string>, searchKey: string) => {
    const starts = Object.entries(inMap).filter(([_, value]) => value === 'X').map(([key, _]) => fromKey(key));
    const searchArray = searchKey.split('');
    let total = 0;
    for (const key of starts) {
        const [x, y] = key;
        directionLoop: for (const delta of deltaDirections) {
            const [dx, dy] = delta;
            for (let i = 0; i < searchArray.length; i++) {
                if (inMap[[x+(dx*i),y+(dy*i)].join()] !== searchArray[i]) continue directionLoop;
            }
            total += 1;
        }
    }
    return total;
}

const crossDeltas = [
    [1,1],
    [1, -1],
]

const crossSearch = (inMap: Record<string, string>) => {
    const starts = Object.entries(inMap).filter(([_, value]) => value === 'A').map(([key, _]) => fromKey(key));
    let total = 0;
    positionLoop: for (const key of starts) {
        const [x, y] = key;
        for (const delta of crossDeltas) {
            const [dx, dy] = delta;
            const key1 = [x+dx, y+dy].join(',');
            const key2 = [x-dx, y-dy].join(',');
            const MAS = (inMap[key1] === 'M' && inMap[key2] === 'S') || (inMap[key1] === 'S' && inMap[key2] === 'M');
            if (!MAS) continue positionLoop;
        }
        total += 1;
    }
    return total;
}

console.log('Expect 18, Get ', directionalSearch(makeCharMap(testInput), 'XMAS'));
console.log('Expect 9, Get ', crossSearch(makeCharMap(testInput)));

const inBlock = await Bun.file('4.txt').text().then(s => s.split('\n'));

console.log('Part 1: ', directionalSearch(makeCharMap(inBlock), 'XMAS'));
console.log('Part 1: ', crossSearch(makeCharMap(inBlock)));
