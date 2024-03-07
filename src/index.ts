import { invoke } from "@tauri-apps/api/tauri";



document.addEventListener('uikit:init', () => {
    // do something
    const openBtn = document.getElementById('open-btn');
    openBtn?.addEventListener('click', (_) => {
        invoke('invoke_open_file', { name: 'World' })
      });
});