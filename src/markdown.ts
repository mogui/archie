// Cash
import $ from "cash-dom";

// -- Monaco js --
import * as monaco from 'monaco-editor';

// -- Marked --
import * as marked from "marked";

// Markdown Stylesheet
// import github_markdown_light from ?url';
import github_theme from 'github-markdown-css/github-markdown-light.css?url'

// -- Tauri -- 
import { readTextFile } from '@tauri-apps/api/fs';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';





window.addEventListener("DOMContentLoaded", async () => {
  // self.MonacoEnvironment = {
  //   getWorkerUrl: function (_, label) {
  //     if (label === 'json') {
  //       return './json.worker.bundle.js';
  //     }
  //     if (label === 'css' || label === 'scss' || label === 'less') {
  //       return './css.worker.bundle.js';
  //     }
  //     if (label === 'html' || label === 'handlebars' || label === 'razor') {
  //       return './html.worker.bundle.js';
  //     }
  //     if (label === 'typescript' || label === 'javascript') {
  //       return './ts.worker.bundle.js';
  //     }
  //     if (label === 'markdown' || label === 'javascript') {
  //       return './md.worker.bundle.js';
  //     }
  //     return './editor.worker.bundle.js';
  //   }
  // };
  const url_params = new URLSearchParams(window.location.search);
  const filename = url_params.get('path');
  const contents = (filename !== null)? await readTextFile(filename) : "";
  const editor = monaco.editor.create(document.getElementById('panel-code') as HTMLElement, {
    value: contents,
    language: "markdown",
    lineNumbers: "on",
    wordWrap: "wordWrapColumn",
	  wordWrapColumn: 80,
    minimap: {
      enabled: false
    },
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true, // <<== the important part
    readOnly: false,
    theme: "vs-dark",
  });

  document.addEventListener('uikit:init', async () => {
    // do something
    await listen<SaveEvent>('save', async (event) => {
        const url_params = new URLSearchParams(window.location.search);
        // Handle event only if it is directed to intended window
        if(event.payload.label == url_params.get('label')){
          console.log("save file");  
          invoke('save_file', { path: url_params.get('path'), content: editor.getValue() });
        }
    });
  });

  $('#markdown-theme').attr('href', github_theme);

  editor.getModel()?.onDidChangeContent(async  (_) => {  
    $('#panel-preview').html(await marked.parse(editor.getValue()));  
  });

  $('#view-preview').on('click', (event)=> {
    event.preventDefault();
    $('.uk-button-group .uk-button').removeClass('uk-button-primary');
    $('#view-preview').addClass('uk-button-primary');
    $('#panel-preview').addClass("uk-width-1-1@s").removeClass("uk-width-1-2@s").show();
    $('#panel-code').hide();
  });

  $('#view-code').on('click', (event)=> {
    event.preventDefault();
    $('.uk-button-group .uk-button').removeClass('uk-button-primary');
    $('#view-code').addClass('uk-button-primary');
    $('#panel-code').addClass("uk-width-1-1@s").removeClass("uk-width-1-2@s").show();
    $('#panel-preview').hide();
  });

  $('#view-both').on('click', (event)=> {
    event.preventDefault();
    $('.uk-button-group .uk-button').removeClass('uk-button-primary');
    $('#view-both').addClass('uk-button-primary');
    $('#panel-preview').addClass("uk-width-1-2@s").removeClass("uk-width-1-1@s").show();
    $('#panel-code').addClass("uk-width-1-2@s").removeClass("uk-width-1-1@s").show();
  });
});


