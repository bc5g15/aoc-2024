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

const LEFT_TURN: Record<Facing, Facing> = {
    'up': 'left',
    'right': 'up',
    'down': 'right',
    'left': 'down'
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

const inBounds = (pos: Coords, width: number, height: number) => {
    const [x, y] = pos;
    return x >= 0 && y>=0 && x < width && y < height;
}

const vectorAdd = (a: Coords, b: Coords): Coords => [a[0]+b[0], a[1]+b[1]];

const dotProduct = (a: Coords, b: number): Coords => [a[0]*b, a[1]*b];

const checkObstructions = (pos: Coords, facing: Facing, obstructions: Set<string>, width: number, height: number):
    [false|Coords, false|Coords] => {
    let start: Coords = [0, 0];
    let forwards: Coords = [0, 0];
    switch (facing) {
        case 'up':
            start = [0, 1];
            forwards = [1, 0];
            break;
        case 'right':
            start = [-1, 0];
            forwards = [0, 1];
            break;
        case 'left':
            start = [1, 0];
            forwards = [0, -1];
            break;
        case 'down':
            start = [0, -1];
            forwards = [-1, 0];
            break;
    }

    // Forward obstruction
    let tempPos = vectorAdd(pos, start);
    let forwardObstruction: Coords|false = false;
    let i = 0;
    while (inBounds(tempPos, width, height)) {
        if (obstructions.has(tempPos.join())) {
            forwardObstruction = [...tempPos];
            break;
        }
        tempPos = vectorAdd(tempPos, forwards);
        i++;
    }

    // Backwards obstruction
    tempPos = vectorAdd(pos, dotProduct(forwards, -1));
    let backwardObstruction: Coords|false = false;
    i = 0;
    console.log(obstructions);
    console.log(pos);
    console.log(facing);
    while (inBounds(tempPos, width, height)) {
        console.log('T', tempPos);
        if (obstructions.has(tempPos.join())) {
            backwardObstruction = [...tempPos];
            break;
        }
        tempPos = vectorAdd(tempPos, start);
        i++;
    }
    
    return [forwardObstruction, backwardObstruction];
}

const fourthPointOfRectangle = (a: Coords, middle: Coords, b: Coords) => {
    const f = (v:number, i:number): number => v - middle[i] === 0 ? 0 : v
    const x = a.map(f) as Coords;
    const y = b.map(f) as Coords;
    const z = vectorAdd(x, y);
    console.log(a, middle, b, z);
    return vectorAdd(x, y);
}

const checkIfLoop = (pos: Coords, facing: Facing, obstructions: Set<string>, width: number, height: number)
    : false|Coords => {
    const [forwards, backwards] = checkObstructions(pos, facing, obstructions, width, height);
    console.log(pos, forwards, backwards);

    if (forwards && !backwards) {
        // Might be another loop if we check the direction. Try again and see if that one is a middle
        const [f1, _b1] = checkObstructions(forwards, RIGHT_TURN[facing], obstructions, width, height);
        if (!f1) {
            // No loop possible
            return false;
        }
        return fourthPointOfRectangle(f1, forwards, pos);
    }

    if (backwards && !forwards) {
        const [f1, b1] = checkObstructions(backwards, LEFT_TURN[facing], obstructions, width, height);
        console.log('Back', pos, f1, b1);
        if (!b1) {
            return false;
        }
        return fourthPointOfRectangle(pos, backwards, b1);
    }

    // Not sure why typescript isn't seeing it but at this point both of them must be coords
    if (backwards && forwards) {
        return fourthPointOfRectangle(forwards, pos, backwards);
    }

    return false;
}


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

const runPath = (s: string[], checkLoops: boolean = false) => {
    const [pos, facing, obstructions, width, height] = parseInput(s);
    const visited: Set<string> = new Set();
    visited.add(pos.join());
    const loopPositions: Set<string> = new Set();

    let nextStep = takeStep(pos, facing, obstructions, width, height);
    while (nextStep) {
        const [newPos, newFacing] = nextStep;
        
        visited.add(newPos.join());

        nextStep = takeStep(newPos, newFacing, obstructions, width, height);
        if (checkLoops && nextStep && nextStep?.[1] !== newFacing) {
            // Check for loop possibilities
            const firstObstruction = vectorAdd(newPos, FACING_DELTAS[newFacing]);
            const myLoop = checkIfLoop(firstObstruction, facing, obstructions, width, height);
            if (myLoop) {
                loopPositions.add(myLoop.join());
            }
        }
    }
    return checkLoops ? loopPositions.size : visited.size;
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

// 1478 Too high?

const superSlow = (s: string[]) => {
    const [pos, facing, obstructions, width, height] = parseInput(s);
    const visited: Set<string> = new Set();
    // visited.add(pos.join());
    // const loopPositions: Set<string> = new Set();
    const nope: Set<string> = new Set();
    const yep: Set<string> = new Set();

    let nextStep = takeStep(pos, facing, obstructions, width, height);
    while (nextStep) {
        const [newPos, newFacing] = nextStep;
        const obPos = vectorAdd(newPos, FACING_DELTAS[newFacing])


        if (!visited.has(nextStep.join()) && inBounds(obPos, width, height)) {
            // console.log('Checking', nextStep);
            const firstStep: [Coords, Facing] = [newPos, RIGHT_TURN[newFacing]];
            const tempObstructions = new Set(obstructions);
            tempObstructions.add(obPos.join());
            let virtualStep = takeStep(firstStep[0], firstStep[1], tempObstructions, width, height);
            const myVisited: Set<string> = new Set();
            while (virtualStep) {
                const [np, nf] = virtualStep;
                // console.log('Check', firstStep.join(), virtualStep.join());
                if (myVisited.has(virtualStep.join())) {
                    // Loop starting point found
                    yep.add(obPos.join());
                    break;
                }
                myVisited.add(virtualStep.join());
                virtualStep = takeStep(np, nf, tempObstructions, width, height);
            }
            visited.add(nextStep.join());
        }
        nextStep = takeStep(newPos, newFacing, obstructions, width, height);
    }
    // console.log(yep);
    return yep.size;
}

const evenSlower = (s: string[]) => {
    const [pos, facing, obstructions, width, height] = parseInput(s);
    let loopCount = 0;
    // const loopPositions: Set<string> = new Set();
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (obstructions.has([x,y].join()) || vectorEq(pos, [x,y])) {
                continue;
            }
            obstructions.add([x,y].join());
            if(runUntilDoneOrLoop(pos, facing, obstructions, width, height)) {
                loopCount++;
                // loopPositions.add([x,y].join());
            }
            obstructions.delete([x,y].join());
        }
        console.log('Checked: ', y);
    }
    // console.log(loopPositions);
    return loopCount;
}

// const rightAngleFacings = (a: Facing, b: Facing) => {

// }

// const runPathForObstructions = (s: string[]) => {
//     const [pos, facing, obstructions, width, height] = parseInput(s);
//     const visited: Map<string, Facing> = new Map();
//     // visited.(pos.join());
//     visited.set(pos.join(), facing);

//     let nextStep = takeStep(pos, facing, obstructions, width, height);
//     while (nextStep) {
//         const [newPos, newFacing] = nextStep;
//         const key = newPos.join()
//         if (visited.has(key)) {

//         }
//         visited.add(newPos.join());
//         nextStep = takeStep(newPos, newFacing, obstructions, width, height);
//     }
//     return visited.size;
// }


console.log('Test: Expected 41 Actual', runPath(testInput));
console.log('Test: Expected 6 Actual ', evenSlower(testInput));

const liveIn = await Bun.file('6.txt').text().then(f => f.trim().split('\n'));
console.log('Part 1', runPath(liveIn));
console.log('Part 2', evenSlower(liveIn));