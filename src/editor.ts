import * as monaco from 'monaco-editor';
import { readTextFile } from '@tauri-apps/api/fs';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { PUmlExtension } from '@sinm/monaco-plantuml';

interface SaveEvent {
  label: string;
}

async function getEditor(
  filepath: string | null, 
  editorId:string = "panel-code", 
  language: string = "markdown", 
  listener: (ev: monaco.editor.IModelContentChangedEvent, ed: monaco.editor.IStandaloneCodeEditor) => void): Promise<monaco.editor.IStandaloneCodeEditor> {

  const contents = (filepath !== null)? await readTextFile(filepath) : "";
  const editor = monaco.editor.create(document.getElementById(editorId) as HTMLElement, {
    value: contents,
    language: language,
    lineNumbers: "on",
    wordWrap: "wordWrapColumn",
	  wordWrapColumn: 80,
    minimap: {
      enabled: false
    },
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true, 
    readOnly: false,
    theme: "vs-dark",
  });
  const extension = new PUmlExtension();
  extension.active(editor);

  await listen<SaveEvent>('save', async (event) => {
    const url_params = new URLSearchParams(window.location.search);
    // Handle event only if it is directed to intended window
    if(event.payload.label == url_params.get('label')){
      console.log(`saving file ${url_params.get('path')}`);  
      invoke('save_file', { path: url_params.get('path'), content: editor.getValue() });
    }
  });

  editor.getModel()?.onDidChangeContent(async  (event) => {  
    listener(event, editor);
  });

  return new Promise((resolve) => {
    resolve(editor);
  });
}

export {getEditor}