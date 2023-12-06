export default class World {
    public root: HTMLElement;
    public selected: HTMLElement | undefined;
    public defaultTransform: string;

    constructor(root: HTMLElement, objects: { elem: HTMLElement, transform: string }[]) {
        this.root = root;
        const self = this;
        for (const { elem, transform } of objects) {
            this.root.appendChild(elem);
            if (transform == null) continue;
            elem.style.pointerEvents = "all";
            elem.addEventListener("click", function(e) {
                if (this === self.selected) return;
                if (self.selected != null) self.selected.classList.remove("selected");
                self.selected = this;
                self.selected.classList.add("selected");
                self.root.style.transform = transform;
            });
        }
        this.defaultTransform = this.root.style.transform;
        document.addEventListener("keydown", function(e) {
            if (e.key != "Escape") return;
            e.stopPropagation();
            if (self.selected != null) self.selected.classList.remove("selected");
            self.selected = undefined;
            self.root.style.transform = self.defaultTransform;
        });
    }
}
