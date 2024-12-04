const std = @import("std");
const expectEqual = std.testing.expectEqual;
const parseInt = std.fmt.parseInt;
const splitSequence = std.mem.splitSequence;
const print = std.debug.print;
const count = std.mem.count;
const ArrayList = std.ArrayList;

const useful = @import("useful.zig");
const readFileToLines = useful.readFileToLines;

pub fn main() !void {
    var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
    const alloc = arena.allocator();
    defer arena.deinit();

    const file = try readFileToLines("4.txt", alloc);
    // for (file) |line| {
    //     print("MyLine: {s}\n", .{line});
    // }
    const part1 = try directionalSearch(file, alloc);
    const part2 = try crossSearch(file, alloc);
    print("Part 1: {d}\nPart 2: {d}\n", .{ part1, part2 });
}

const DELTA_DIRECTIONS = [8][2]i32{ [2]i32{ 1, 0 }, [2]i32{ -1, 0 }, [2]i32{ 0, 1 }, [2]i32{ 0, -1 }, [2]i32{ 1, 1 }, [2]i32{ 1, -1 }, [2]i32{ -1, -1 }, [2]i32{ -1, 1 } };

fn findStartPoints(block: [][]const u8, start: u8, alloc: std.mem.Allocator) !ArrayList([2]usize) {
    var results = ArrayList([2]usize).init(alloc);
    for (block, 0..) |line, y| {
        for (line, 0..) |char, x| {
            if (char == start) {
                try results.append([2]usize{ x, y });
            }
        }
    }
    return results;
}

fn directionalSearch(block: [][]const u8, alloc: std.mem.Allocator) !u32 {
    var total: u32 = 0;
    const starts = try findStartPoints(block, 'X', alloc);
    const search_array = [_]u8{ 'X', 'M', 'A', 'S' };

    for (starts.items) |start| {
        const x, const y = start;
        directionLoop: for (DELTA_DIRECTIONS) |delta| {
            const dx, const dy = delta;
            for (search_array, 0..) |char, i| {
                const mult: isize = @intCast(i);
                const neg_x: isize = @intCast(x);
                const neg_y: isize = @intCast(y);
                const nx: isize = neg_x + (dx * mult);
                const ny: isize = neg_y + (dy * mult);
                if (nx < 0 or ny < 0 or ny >= block.len or nx >= block[@abs(ny)].len or block[@abs(ny)][@abs(nx)] != char) {
                    continue :directionLoop;
                }
            }
            total += 1;
        }
    }

    return total;
}

const CROSS_DELTAS = [2][2]i8{ [_]i8{ 1, 1 }, [_]i8{ 1, -1 } };

fn crossSearch(block: [][]const u8, alloc: std.mem.Allocator) !u32 {
    var total: u32 = 0;
    const starts = try findStartPoints(block, 'A', alloc);

    positionLoop: for (starts.items) |start| {
        const x, const y = start;
        for (CROSS_DELTAS) |delta| {
            const dx, const dy = delta;
            const neg_x: isize = @intCast(x);
            const neg_y: isize = @intCast(y);
            const nx1: isize = neg_x + dx;
            const nx2: isize = neg_x - dx;
            const ny1: isize = neg_y + dy;
            const ny2: isize = neg_y - dy;

            if (nx1 < 0 or nx2 < 0 or ny1 < 0 or ny2 < 0) {
                continue :positionLoop;
            }
            if (ny1 >= block.len or ny2 >= block.len or nx1 >= block[@abs(ny1)].len or nx2 >= block[@abs(ny2)].len) {
                continue :positionLoop;
            }

            const isMas = (block[@abs(ny1)][@abs(nx1)] == 'M' and block[@abs(ny2)][@abs(nx2)] == 'S') or
                (block[@abs(ny1)][@abs(nx1)] == 'S' and block[@abs(ny2)][@abs(nx2)] == 'M');

            if (!isMas) {
                continue :positionLoop;
            }
        }
        total += 1;
    }

    return total;
}
