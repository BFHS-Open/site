export default (async (sys, argv) => {
    const hue = argv[1] === undefined ? Math.random() : +argv[1] / 360;
    if (!Number.isFinite(hue)) {
        sys.out(`Invalid hue angle "${argv[1]}"\n`);
        return;
    }
    sys.monitor.root.style.setProperty("--screen-color", `hsl(${hue ?? Math.random()}turn 100% 50%)`);
});
//# sourceMappingURL=color.js.map