

// -- UIkit JS --
import UIkit from 'uikit';

// Cash
import $ from "cash-dom";

// -- Monaco js --
import * as MonacoEditor from 'monaco-editor';

import { readTextFile } from '@tauri-apps/api/fs';

document.addEventListener('uikit:init', async () => {
  // if(window.location.hash){
  //   const filename = window.location.hash.replace('#', '');
  //   const contents = await readTextFile(filename);
  //   monaco.editor.create(document.getElementById('monaco') as HTMLElement, {
  //     value: contents,
  //     language: 'javascript'
  //   });
  // }
  console.log("loaded");
  

  // UIkit.util.on('#editor-switch', 'show', function () {
  //   // do something
  //   console.log("asd");
  // });

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

  const filename = window.location.hash.replace('#', '');
  
  const contents = (filename !=="")? await readTextFile(filename) : "sd";

  MonacoEditor.editor.create(document.getElementById('monaco') as HTMLElement, {
    value: contents,
    language: 'markdown'
  });
  
});


