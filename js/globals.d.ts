/*
originally used at https://github.com/tobspr-games/shapez-community-edition/pull/12/commits/56330a1433e81a260be66648f90df77c8172308f
relicensed by me, the original author
*/

// JSX type support - https://www.typescriptlang.org/docs/handbook/jsx.html
// modified from https://stackoverflow.com/a/68238924
declare namespace JSX {
    /**
     * The return type of a JSX expression.
     *
     * In reality, Fragments can return arbitrary values, but we ignore this for convenience.
     */
    type Element = HTMLElement;
    /**
     * Key-value list of intrinsic element names and their allowed properties.
     *
     * Because children are treated as a property, the Node type cannot be excluded from the index signature.
     */
    type IntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: {
            children?: Node | Node[];
            [k: string]: Node | Node[] | string | number | boolean;
        };
    };
    /**
     * The property of the attributes object storing the children.
     */
    type ElementChildrenAttribute = { children: unknown };

    // The following do not have special meaning to TypeScript.

    /**
     * An attributes object.
     */
    type Props = { [k: string]: unknown };
    /**
     * A functional component requiring attributes to match `T`.
     */
    type Component<T extends Props> = {
        (props: T): Element;
    };
    /**
     * A child of a JSX element.
     */
    type Node = Element | string | boolean | null | undefined;
}
