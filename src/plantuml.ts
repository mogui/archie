import $ from "cash-dom";
import { writeTextFile, BaseDirectory, createDir, readTextFile } from '@tauri-apps/api/fs';
import { getEditor } from './editor.ts';
import { ConfigManager } from './settings.ts'
import { Command } from '@tauri-apps/api/shell'
import { tempdir } from '@tauri-apps/api/os';
import { message } from '@tauri-apps/api/dialog';
import { convertFileSrc } from "@tauri-apps/api/tauri";
import Split from 'split.js'


window.addEventListener("DOMContentLoaded", async () => {
    Split(['#panel-code', '#panel-preview'])


    $('#loader').hide();
    const url_params = new URLSearchParams(window.location.search);
    const filename = url_params.get('path');
    const label = url_params.get('label');
    let settings = await ConfigManager.create();
    const plantuml = await settings.get("plantuml") as string;
    const editor = await getEditor(filename, "panel-code", "plantuml", async (ev, ed) => {
        
    });

    const previewPlantuml = async () => {
        await createDir(label as string, { dir: BaseDirectory.Temp, recursive: true });
        const tempFile = `${label}/${label}.plantuml`;
        const text = editor.getValue();
        const tmp = await tempdir();
        let match = /@[a-z]* (.*)/i.exec(text.split("\n")[0]);
        let output = `${tmp}${label}/${label}.svg`;
        if (match != null && match?.length > 1 && match[1].trim() != ""){
            output = `${tmp}${label}/${match[1].trim()}.svg`;
        }
        // await message(output, {type: "error", okLabel: "ok"});
        
        
        await writeTextFile({ path: tempFile, contents: text }, { dir: BaseDirectory.Temp });
        const command = await new Command('plantuml', ['-jar', plantuml, `${tmp}${tempFile}`,"-svg", "-o", `${tmp}${label}`] ).execute();
        console.log(`command finished with code ${command.code} and signal ${output} `);
        if(command.code == 0){
            const assetUrl = convertFileSrc(output);
            $('#svg-preview').attr("src", assetUrl);
            $('#loader').hide();
        } else {
            await message(command.stderr, {type: "error", okLabel: "ok"});
            $('#loader').hide();
        }
    }
    previewPlantuml();
    $('#loader').show();
    $("#render").on('click', async (ev)=>{
        ev.preventDefault();
        
        previewPlantuml();
    });
});