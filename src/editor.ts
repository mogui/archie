import { invoke } from "@tauri-apps/api/tauri";
import * as monaco from 'monaco-editor';
import { listen, emit } from "@tauri-apps/api/event";

import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs';

window.addEventListener("DOMContentLoaded", async () => {
  self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
      if (label === 'json') {
        return './json.worker.bundle.js';
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return './css.worker.bundle.js';
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return './html.worker.bundle.js';
      }
      if (label === 'typescript' || label === 'javascript') {
        return './ts.worker.bundle.js';
      }
      return './editor.worker.bundle.js';
    }
  };

  // const input = document.getElementById(
  //   'monaco',
  // ) as HTMLInputElement | null;
  
  if(window.location.hash){
    const filename = window.location.hash.replace('#', '');
    const contents = await readTextFile(filename);


    monaco.editor.create(document.getElementById('monaco') as HTMLElement, {
      value: contents,
      language: 'javascript'
    });
  }  
});

