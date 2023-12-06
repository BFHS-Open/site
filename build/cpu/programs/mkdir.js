export default (async (sys, argv) => {
    if (argv[1] === undefined) {
        sys.out("need argument\n");
        return;
    }
    try {
        await sys.monitor.computer.filesystem.mkdir(argv[1]);
    }
    catch (err) {
        sys.out(`${err}\n`);
        return;
    }
    sys.out("done\n");
});
//# sourceMappingURL=mkdir.js.map