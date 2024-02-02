// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_api::dialog::{select, Response};
use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu};
use log::{debug, error, log_enabled, info, Level};



// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    env_logger::init();
    let open = CustomMenuItem::new("open".to_string(), "Open");
    let file_menu = Submenu::new("File", Menu::new().add_item(open));
    let menu = Menu::new()
        .add_submenu(file_menu)
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::Quit);

    tauri::Builder::default()
        // .menu(menu)
        .setup(|app|{
            // get default menu or current one
            let win = app.get_window("main").unwrap();
            
            Ok(())
          })
        .on_menu_event(|event| match event.menu_item_id() {
            "open" => {
                let response = select(Some("md"), Some(".")).unwrap();
                match response {
                    Response::Okay(selected_path) => {
                        error!("selected file: {}", selected_path)
                    }
                    _ => {}
                }
              }
              _ => {}
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
