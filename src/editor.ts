import * as monaco from 'monaco-editor';

window.addEventListener("DOMContentLoaded", async () => {
  self.MonacoEnvironment = {
    getWorkerUrl: function (_, label) {
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
    // const filename = window.location.hash.replace('#', '');
    // const contents = await readTextFile(filename);
    monaco.editor.create(document.getElementById('monaco') as HTMLElement, {
      value: "contents",
      language: 'javascript'
    });

  }  
});

