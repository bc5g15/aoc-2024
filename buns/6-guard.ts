const testInput = `
....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...
`.trim().split('\n');

type Facing = 'up' | 'down' | 'left' | 'right';

const FACING_MAP: Record<string, Facing> = {
    '>': 'right',
    '<': 'left',
    '^': 'up',
    'v': 'down'
}

const FACING_DELTAS: Record<Facing, [number, number]> = {
    'down':     [0, 1],
    'up':       [0, -1],
    'right':    [1, 0],
    'left':     [-1, 0]
};

const RIGHT_TURN: Record<Facing, Facing> = {
    'up': 'right',
    'right': 'down',
    'down': 'left',
    'left': 'up'
};

type Coords = [number, number];

const parseInput = (s: string[]):
    [Coords, Facing, Set<string>, number, number] => {
    const obstructions: Set<string> = new Set();
    let guardPos: [number, number] = [0, 0];
    let guardFacing: Facing = 'up';
    const width = s[0].length;
    const height = s.length;
    for (let y = 0; y < s.length; y++) {
        let row = s[y];
        for (let x = 0; x < row.length; x++) {
            switch (row[x]) {
                case '#':
                    obstructions.add([x,y].join()); 
                    break;
                case '^':
                case '>':
                case '<':
                case 'v':
                    guardPos = [x, y];
                    guardFacing = FACING_MAP[row[x]];
            }
        }
    }
    return [guardPos, guardFacing, obstructions, width, height];
}

const vectorAdd = (a: Coords, b: Coords): Coords => [a[0]+b[0], a[1]+b[1]];

const takeStep = (pos: Coords, facing: Facing, obstructions: Set<string>, width: number, height: number):
    [Coords, Facing] | false => {
    const step = FACING_DELTAS[facing];
    const newPos: Coords = vectorAdd(pos, step);
    
    if (obstructions.has(newPos.join())) {
        return [pos, RIGHT_TURN[facing]];
    }

    if (newPos[0] < 0 || newPos[1] < 0 || newPos[0] >= width || newPos[1] >= height) {
        return false; 
    }

    return [newPos, facing];
}

const runPath = (s: string[]) => {
    const [pos, facing, obstructions, width, height] = parseInput(s);
    const visited: Set<string> = new Set();
    visited.add(pos.join());

    let nextStep = takeStep(pos, facing, obstructions, width, height);
    while (nextStep) {
        const [newPos, newFacing] = nextStep;
        
        visited.add(newPos.join());

        nextStep = takeStep(newPos, newFacing, obstructions, width, height);
    }
    return visited.size;
}

const runUntilDoneOrLoop = (pos: Coords, facing: Facing, obstructions: Set<string>, width: number, height: number) => {
    // const [pos, facing, obstructions, width, height] = parseInput(s);
    const visited: Set<string> = new Set();
    visited.add([pos, facing].join())

    let nextStep = takeStep(pos, facing, obstructions, width, height);
    while (nextStep) {
        const [newPos, newFacing] = nextStep;
        
        if(visited.has(nextStep.join())) {
            return true;
        }
        visited.add(nextStep.join());

        nextStep = takeStep(newPos, newFacing, obstructions, width, height);

    }
    return false;
}

const vectorEq = (a: Coords, b: Coords) => a[0]===b[0] && a[1]===b[1];

const evenSlower = (s: string[]) => {
    const [pos, facing, obstructions, width, height] = parseInput(s);
    let loopCount = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (obstructions.has([x,y].join()) || vectorEq(pos, [x,y])) {
                continue;
            }
            obstructions.add([x,y].join());
            if(runUntilDoneOrLoop(pos, facing, obstructions, width, height)) {
                loopCount++;
            }
            obstructions.delete([x,y].join());
        }
        console.log('Checked: ', y);
    }
    return loopCount;
}

console.log('Test: Expected 41 Actual', runPath(testInput));
console.log('Test: Expected 6 Actual ', evenSlower(testInput));

const liveIn = await Bun.file('6.txt').text().then(f => f.trim().split('\n'));
console.log('Part 1', runPath(liveIn));
console.log('Part 2', evenSlower(liveIn));