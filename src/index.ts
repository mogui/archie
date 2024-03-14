import { invoke } from "@tauri-apps/api/tauri";
import $ from "cash-dom";


document.addEventListener('uikit:init', async () => {
    // do something    
    $('#open-btn').on('click', (_) => {
      invoke('invoke_open_file', { name: 'World' })
    });

    $('#settings-btn').on('click', (_) => {
      invoke('open_settings')
    });
});