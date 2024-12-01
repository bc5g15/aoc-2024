const std = @import("std");
const expectEqual = std.testing.expectEqual;
const parseInt = std.fmt.parseInt;
const splitSequence = std.mem.splitSequence;
const print = std.debug.print;
const count = std.mem.count;

pub fn main() !void {
    var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
    const alloc = arena.allocator();
    defer arena.deinit();

    var left = std.ArrayList(u32).init(alloc);
    var right = std.ArrayList(u32).init(alloc);
    defer left.deinit();
    defer right.deinit();

    readInputArrays(&left, &right) catch |err| {
        print("Error> {}\n", .{err});
        return;
    };

    const leftItems = left.items;
    const rightItems = right.items;

    std.mem.sort(u32, leftItems, {}, comptime std.sort.asc(u32));
    std.mem.sort(u32, rightItems, {}, comptime std.sort.asc(u32));

    print("Part 1: {d}\nPart 2: {d}\n", .{ differenceValue(leftItems, rightItems), similarityValue(leftItems, rightItems) });
}

fn differenceValue(left: []u32, right: []u32) u32 {
    var score: u32 = 0;
    for (0..left.len) |i| {
        if (left[i] < right[i]) {
            score += right[i] - left[i];
        } else {
            score += left[i] - right[i];
        }
    }
    return score;
}

fn similarityValue(left: []u32, right: []u32) u32 {
    var score: u32 = 0;
    for (0..left.len) |i| {
        const value = left[i];
        const times: u32 = @intCast(count(u32, right, &[1]u32{value}));
        score += value * times;
    }
    return score;
}

fn readFile() ![]u8 {
    const file = try std.fs.cwd().openFile("1.txt", .{});
    defer file.close();

    var buff: [1024]u8 = undefined;
    _ = try file.read(&buff);
    return &buff;
}

fn readInputArrays(left: *std.ArrayList(u32), right: *std.ArrayList(u32)) !void {
    const file = try std.fs.cwd().openFile("1.txt", .{});
    defer file.close();

    var buffer: [1024]u8 = undefined;
    var line = try nextLine(file.reader(), &buffer);
    while (line != null) {
        const l, const r = try readLine(line.?);
        try left.append(l);
        try right.append(r);
        line = try nextLine(file.reader(), &buffer);
    }
    print("Lines: {d}\n", .{left.capacity});
}

fn nextLine(reader: anytype, buffer: []u8) !?[]const u8 {
    const line = (try reader.readUntilDelimiterOrEof(
        buffer,
        '\n',
    )) orelse return null;
    if (@import("builtin").os.tag == .windows) {
        return std.mem.trimRight(u8, line, "\r");
    } else {
        return line;
    }
}

fn readLine(string: []const u8) ![2]u32 {
    var left: u32 = 0;
    var right: u32 = 0;
    const trimmedString = std.mem.trim(u8, string, "\r\n");
    // I know all the values are split by three spaces
    var splitString = splitSequence(u8, trimmedString, "   ");
    left = try parseInt(u32, splitString.first(), 10);
    right = try parseInt(u32, splitString.next().?, 10);
    return [2]u32{ left, right };
}

const expectEqualSlices = std.testing.expectEqualSlices;
test "Splitting works how I think" {
    var result = splitSequence(u8, "123   456", "   ");
    try expectEqualSlices(u8, result.first(), "123");
    try expectEqualSlices(u8, result.next().?, "456");
}

test "Trimming works how I think" {
    const result = std.mem.trim(u8, "123\r\n", "\r\n");
    try expectEqualSlices(u8, result, "123");
}
