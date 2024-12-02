const std = @import("std");
const useful = @import("useful.zig");
const cwd = std.fs.cwd;
const expect = std.testing.expect;
const ArrayList = std.ArrayList;
const splitSequence = std.mem.splitSequence;
const print = std.debug.print;
const parseInt = std.fmt.parseInt;

pub fn main() !void {
    var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
    const alloc = arena.allocator();
    defer arena.deinit();

    const solutions = try readAndSolve(alloc);
    print("Part 1: {d}\nPart 2: {d}\n", .{ solutions[0], solutions[1] });
}

fn readAndSolve(alloc: std.mem.Allocator) ![2]u32 {
    const file = try cwd().openFile("2.txt", .{});
    defer file.close();
    var part1: u32 = 0;
    var part2: u32 = 0;

    var buffer: [1024]u8 = undefined;
    // var line = try useful.nextLine(file.reader(), &buffer);
    while (try useful.nextLine(file.reader(), &buffer)) |line| {
        var values = splitSequence(u8, line, " ");
        var numberValues = ArrayList(u32).init(alloc);
        defer numberValues.deinit();
        while (values.next()) |value| {
            try numberValues.append(try parseInt(u32, value, 10));
        }
        if (checkSafe(numberValues)) {
            part1 += 1;
            part2 += 1;
        } else {
            for (0..numberValues.items.len) |i| {
                var dupItems = try numberValues.clone();
                _ = dupItems.orderedRemove(i);
                defer dupItems.deinit();
                if (checkSafe(dupItems)) {
                    part2 += 1;
                    break;
                }
            }
        }
    }
    return [2]u32{ part1, part2 };
}

const Direction = enum { up, down, unknown };

fn checkSafe(values: ArrayList(u32)) bool {
    var dir: Direction = Direction.unknown;
    const items = values.items;
    for (1..items.len) |i| {
        const a = items[i - 1];
        const b = items[i];

        if (dir == Direction.unknown) {
            if (a < b) {
                dir = Direction.up;
            } else if (a > b) {
                dir = Direction.down;
            } else {
                return false;
            }
        }

        if (!checkDirection(a, b, dir)) return false;

        const diff = if (a < b) b - a else a - b;
        if (diff > 3) return false;
    }
    return true;
}

fn checkDirection(a: u32, b: u32, d: Direction) bool {
    if (d == Direction.up) {
        if (a < b) return true;
    } else if (d == Direction.down) {
        if (a > b) return true;
    }
    return false;
}
