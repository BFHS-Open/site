import type { Program } from "../program";

const message = `\
List of commands:
    help
        Display this message.
    color [<angle>]
        Change terminal color.
    mkdir [<name>]
        Create a directory. Parent directory must exist.
    touch [<name>]
        Create an empty file. Parent directory must exist.
    cat [<name>]
        Print the contents of a file.
    ls [<name>]
        Print the entries in a directory.
    rm [<name>]
        Delete an entry from a directory.
This terminal is very work-in-progress.
`

export default (async (sys, argv) => {
    sys.out(message);
}) satisfies Program;
