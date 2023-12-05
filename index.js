import Monitor from "./build/monitor.js";
import World from "./build/world.js";

const comp = document.getElementById("comp");

const world = new World(document.getElementById("world"), [
    {
        elem: comp,
        transform: "translateZ(0) rotateX(0) translateZ(0)",
    },
    {
        elem: document.getElementsByClassName("paper")[0],
        transform: "translateZ(4rem) rotateX(-70deg) translateZ(-10rem)",
    },
]);

const monitor = new Monitor(comp);
monitor.boot();
