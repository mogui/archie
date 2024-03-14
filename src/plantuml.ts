import { getEditor } from './editor.ts';



window.addEventListener("DOMContentLoaded", async () => {
    const url_params = new URLSearchParams(window.location.search);
    const filename = url_params.get('path');

    let ed = getEditor(filename, "panel-code", "plantuml", (ev, ed) => {
        console.log("asd");
    });
});