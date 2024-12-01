
const input = await Bun.file('inputs/1.txt').text();

const leftList: number[] = [];
const rightList: number[] = [];

input.split('\n').forEach((line) => {
    const [left, right] = line.split('   '); // split by three spaces
    leftList.push(parseInt(left, 10));
    rightList.push(parseInt(right, 10));
});

leftList.sort();
rightList.sort();

const differenceScore = (listA: number[], listB: number[]) => {
    let totalDiff = 0;
    for(let i = 0; i < listA.length; i++) {
        totalDiff +=  Math.abs(listA[i] - listB[i]);
    }
    return totalDiff;
}

const similarityScore = (listA: number[], listB: number[]) => {
    let score = 0;
    for (let i = 0; i < listA.length; i++) {
        const value = listA[i];
        const count = listB.filter(i => i === value).length;
        score += value * count;
    }
    return score;
}

console.log('Total Difference: ', differenceScore(leftList, rightList));
console.log('Similarity Score: ', similarityScore(leftList, rightList));
