export default class World {
    public root: HTMLElement;
    public selected: HTMLElement;

    constructor(root: HTMLElement, objects: { elem: HTMLElement, transform: string }[]) {
        this.root = root;
        this.selected = objects[0].elem;
        const self = this;
        for (const { elem, transform } of objects) {
            elem.addEventListener("click", function(e) {
                if (this === self.selected) return;
                self.selected.classList.remove("selected");
                self.selected = this;
                self.selected.classList.add("selected");
                self.root.style.transform = transform;
            });
        }
    }
}
