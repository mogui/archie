// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_api::dialog::{select, Response, message};

use tauri::{Manager};
use sha2::{Sha256, Digest};

use std::path::Path;
use std::ffi::OsStr;
use std::{fs::File, io::Write};

mod menu;

#[derive(Clone, serde::Serialize)]
struct SaveFile {
  label: String,
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

#[tauri::command]
fn save_file(_: tauri::AppHandle, path:String, content:String){  
  
  let file = File::open(&path).unwrap();
  // file.write_all(content.as_bytes());
  message( format!("{} {}", path, content), "Alert!");
}
// message( "Tauri", "Tauri is awesome!")

fn save_current(app_handle: &tauri::AppHandle) {

  if let Some(current_window) = app_handle.get_focused_window() {
      let label = current_window.label();
      current_window.emit("save", SaveFile { label: label.into() }).unwrap();    
  }
}

#[tauri::command]
fn open_settings(app_handle: tauri::AppHandle) {
  let _ = tauri::WindowBuilder::new(
    &app_handle,
    "settings", /* the unique window label */
    tauri::WindowUrl::App("pages/settings.html".into())
  ).title("Settings").build().unwrap();
}

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
          let label = file_hash(&selected_path);
          let _ = tauri::WindowBuilder::new(
            app_handle,
            &label, /* the unique window label */
            tauri::WindowUrl::App(format!("{}?path={}&label={}", template, selected_path, &label).into())
          ).title(selected_path).maximized(true).build().unwrap();
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
            "open" => open_file(&event.window().app_handle()),
            "save" => save_current(&event.window().app_handle()),
            "settings" => open_settings(event.window().app_handle()),
            _ => {}
        })
        
        .invoke_handler(tauri::generate_handler![invoke_open_file, save_file, open_settings])
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
