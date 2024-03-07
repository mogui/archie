// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_api::dialog::{select, Response, message};

use tauri::{Manager, WindowMenuEvent};
use log::error;
use sha2::{Sha256, Digest};

use std::path::Path;
use std::ffi::OsStr;

mod menu;
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}


fn get_extension_from_filename(filename: &str) -> Option<&str> {
  Path::new(filename)
      .extension()
      .and_then(OsStr::to_str)
}

fn file_hash(filepath: &String) -> String {
  let mut hasher = Sha256::new();
  hasher.update(filepath.clone());
  let window_hash = hasher.finalize();
  format!("{:x}", window_hash)
}

#[tauri::command]
fn invoke_open_file(app_handle: tauri::AppHandle){  
  open_file(&app_handle);
}
// message( "Tauri", "Tauri is awesome!")

fn open_file(app_handle: &tauri::AppHandle) {
  match select(Some("md,mermaid,plantuml,drawio"), Some(".")) {
    Ok(response) => {
      match response {
        Response::Okay(selected_path) => {
          let extension = get_extension_from_filename(selected_path.as_str());
          let template = match extension {
            Some(ext) => {
              match ext {
                "md" => "pages/markdown.html",
                "mermaid" => "pages/mermaid.html",
                "plantuml" => "pages/plantuml.html",
                _ => "pages/editor.html",
              }
            },
            None => "editor.html",
          };
          let _ = tauri::WindowBuilder::new(
            app_handle,
            file_hash(&selected_path), /* the unique window label */
            tauri::WindowUrl::App(format!("{}#{}", template, selected_path).into())
          ).build().unwrap();
        }
        _ => {}
      }
    },
    _ => {},
  }

  
}

fn main() {
    env_logger::init();
    let menu = menu::setup_menu();
    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "open" => {
                open_file(&event.window().app_handle())
              }
              _ => {}
        })
        .invoke_handler(tauri::generate_handler![invoke_open_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
