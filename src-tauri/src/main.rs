// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_api::dialog::{select, Response};

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

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
  error!("selected file: {}", name);
  name.to_string()
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

fn open_file(filepath: String, event: WindowMenuEvent){
  let extension = get_extension_from_filename(filepath.as_str());
  let template = match extension {
    Some(ext) => {
      match ext {
        "md" => "editor.html",
        "mermaid" => "editor.html",
        "plantuml" => "editor.html",
        _ => "editor.html",
      }
    },
    None => "editor.html",
  };
  let _ = tauri::WindowBuilder::new(
    &event.window().app_handle(),
    file_hash(&filepath), /* the unique window label */
    tauri::WindowUrl::App(format!("{}#{}", template, filepath).into())
  ).build().unwrap();
}


fn main() {
    env_logger::init();
    let menu = menu::setup_menu();
    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "open" => {
                let response = select(Some("md,mermaid,plantuml,drawio"), Some(".")).unwrap();
                match response {
                    Response::Okay(selected_path) => {
                        open_file(selected_path, event);
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
