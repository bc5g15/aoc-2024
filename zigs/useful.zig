const std = @import("std");
const ArrayList = std.ArrayList;
const Allocator = std.mem.Allocator;
const splitSequence = std.mem.splitSequence;

pub fn readFileToLines(fileName: []const u8, alloc: Allocator) ![][]const u8 {
    const delimiter: []const u8 = if (@import("builtin").os.tag == .windows) "\r\n" else "\n";
    const blob = try readFile(fileName, alloc);
    var sequence = splitSequence(u8, blob, delimiter);

    var ar = ArrayList([]const u8).init(alloc);
    while (sequence.next()) |arr| {
        try ar.append(arr);
    }

    return ar.items;
}

pub fn readFile(fileName: []const u8, alloc: Allocator) ![]u8 {
    const file = try std.fs.cwd().openFile(fileName, .{});
    const fc = try file.reader().readAllAlloc(alloc, std.math.maxInt(usize));
    return fc;
}

pub fn nextLine(reader: anytype, buffer: []u8) !?[]const u8 {
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
