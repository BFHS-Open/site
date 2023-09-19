export default class World {
    /**
     * @param {HTMLElement} root
     * @param {{
     *     elem: HTMLElement,
     *     transform: string,
     * }[]} objects
     */
    constructor(root, objects) {
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
