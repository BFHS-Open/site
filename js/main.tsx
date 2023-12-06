import Monitor from "./monitor.js";
import World from "./world.js";
import { makeTable } from "./objects/table.js";
import { makeStyle } from "./utils.js";

const comp = <div id="comp" class="computer object">
    <div class="screen">
        <div class="content">
            <pre class="output"></pre><pre autofocus class="input empty" contenteditable="plaintext-only" spellcheck="false"></pre>
        </div>
    </div>
</div>;

const paper = <div class="paper object">
    <h2>About the club</h2>
    <p>
        Lorem ipsum dolor sit amet,
        consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident,
        sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p>
    Officers:
        <ul>
            <li>Alice</li>
            <li>Bob</li>
        </ul>
    </p>
</div>;

const world = new World(document.getElementById("world")!, [
    {
        elem: makeTable({ width: 5*12, depth: 2*12, height: 2.5*12 }),
        transform: "",
    },
    {
        elem: comp,
        transform: "rotateX(-10deg) rotateY(-5deg) translate3d(3rem,35rem,0rem)",
    },
    {
        elem: paper,
        transform: "rotateX(-80deg) rotateY(5deg) translate3d(-5rem,28rem,-5rem)",
    },
]);

const monitor = new Monitor(comp);
monitor.boot();
