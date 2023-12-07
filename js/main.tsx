import Monitor from "./monitor";
import World from "./world";
import { makeTable } from "./objects/table";

const comp = <div id="comp" class="computer object">
    <div class="screen">
        <div class="content">
            <pre class="output"></pre><pre autofocus class="input empty" contenteditable="plaintext-only" spellcheck="false"></pre>
        </div>
    </div>
</div>;

const paper = <div class="paper object">
    <div class="scroll">
        <h1>CLUB WEBSITE MANUAL<br />and<br />CAKE DISPENSARY</h1>
        <p>
            Click on stuff to look at it.
            You probably figured that one out already,
            but did you know you can press <kbd>Esc</kbd> to zoom back out???
        </p>
        <p>
            The terminal's filesystem requires IndexedDB permissions.
        </p>
        <p>
            Good luck!
        </p>
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
                <li><b>President:</b> Joe</li>
                <li><b>Vice President:</b> Austin</li>
                <li><b>Secretary:</b> Thomas</li>
                <li><b>Outreach Director:</b> Xindi</li>
                <li><b>Tech Lead:</b> Jonathan</li>
                <li><b>Contributing Members:</b> Eden, Oscar</li>
            </ul>
        </p>
        <h2>About this site</h2>
        <p>
            This is a prototype.
            Maybe it really is cooler than a plain old 2D site,
            or maybe it isn't and we'll work on something else.
        </p>
        <p>
            Everything here is HTML/CSS/JS, with no client-side libraries!
            (Only TypeScript and webpack are used for development.)
            Maybe I should research libraries more.
            I still can't believe web browsers support really decent basic 3D!!!
        </p>
        <p>
            By the way, try zooming in and out, or resizing your browser window.
            Accessibility!!
            In fact, the terminal supports selections and copy-pasting
            via a few shims on a "contenteditable" element.
            Actually you can select any text on this site.
            Except the blinking cursor character. Cool effect, huh?
        </p>
        <p>
            This site's source code is available <a target="_blank" rel="noreferrer" href="https://github.com/BFHS-Open/site">here</a>.
            It's licensed under the ISC License,
            which according to Wikipedia is (hopefully) just the MIT License but more concise.
        </p>
        <p>
            Have fun!
        </p>
        <p>
            -Austin
        </p>
    </div>
</div>;

const world = new World(document.getElementById("world")!, [
    {
        elem: makeTable({ width: 5*12, depth: 2*12, height: 2.5*12 }),
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
