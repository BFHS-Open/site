import { makeStyle } from "../utils";

const thick = 1;

const makeLeg = ({ x, y, height }: { x: number, y: number, height: number }) => {
    return <div class="group" style={makeStyle({ pos: `translate3d(${x}rem,0,${y}rem)`})}>
        <div class="object" style={makeStyle({ color: "#261a0d", width: thick, height: height-thick, pos: `translateX(${thick/2}rem) rotateY(90deg)`})}></div>
        <div class="object" style={makeStyle({ color: "#261a0d", width: thick, height: height-thick, pos: `translateZ(${thick/2}rem)`})}></div>
        <div class="object" style={makeStyle({ color: "#261a0d", width: thick, height: height-thick, pos: `translateX(${-thick/2}rem) rotateY(-90deg)`})}></div>
        <div class="object" style={makeStyle({ color: "#261a0d", width: thick, height: height-thick, pos: `translateZ(${-thick/2}rem) rotateY(180deg)`})}></div>
    </div>;
};

export const makeTable = ({ width, depth, height }: { width: number, depth: number, height: number }) => {
    return <div class="group" style={makeStyle({ pos: "translate3d(0,0,0)"})}>
        <div class="group" style={makeStyle({ pos: `translateY(${(-height+thick)/2}rem)`})}>
            {makeLeg({ x: width/2-thick*2, y: depth/2-thick*2, height })}
            {makeLeg({ x: -width/2+thick*2, y: depth/2-thick*2, height })}
            {makeLeg({ x: -width/2+thick*2, y: -depth/2+thick*2, height })}
            {makeLeg({ x: width/2-thick*2, y: -depth/2+thick*2, height })}
        </div>
        <div class="group" style={makeStyle({ pos: `translateY(${-height+thick/2}rem)` })}>
            <div class="object" style={makeStyle({ color: "#5e3d19", width, height: depth, pos: `translateY(${-thick/2}rem) rotateX(90deg)`})} />
            <div class="object" style={makeStyle({ color: "#261a0d", width, height: depth, pos: `translateY(${thick/2}rem) rotateX(90deg)`})} />
            <div class="object" style={makeStyle({ color: "#493117", width, height: thick, pos: `translateZ(${depth/2}rem)`})} />
            <div class="object" style={makeStyle({ color: "#493117", width, height: thick, pos: `rotateY(180deg) translateZ(${depth/2}rem)`})} />
            <div class="object" style={makeStyle({ color: "#493117", width: depth, height: thick, pos: `rotateY(90deg) translateZ(${width/2}rem)`})} />
            <div class="object" style={makeStyle({ color: "#493117", width: depth, height: thick, pos: `rotateY(-90deg) translateZ(${width/2}rem)`})} />
        </div>
    </div>;
};
