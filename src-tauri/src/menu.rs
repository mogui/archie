
use tauri::AboutMetadata;
use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu};

pub fn setup_menu() -> Menu {
    let mut menu = Menu::new();
    #[cfg(target_os = "macos")]
    {
      menu = menu.add_submenu(Submenu::new(
        "Archie",
        Menu::new()
          .add_native_item(MenuItem::About(
            "Archie".to_string(),
            AboutMetadata::default(),
          ))
          .add_native_item(MenuItem::Separator)
          .add_item(CustomMenuItem::new("settings".to_string(), "Settings").accelerator("CommandOrControl+,"))
          .add_native_item(MenuItem::Separator)
          .add_native_item(MenuItem::Services)
          .add_native_item(MenuItem::Separator)
          .add_native_item(MenuItem::Hide)
          .add_native_item(MenuItem::HideOthers)
          .add_native_item(MenuItem::ShowAll)
          .add_native_item(MenuItem::Separator)
          .add_native_item(MenuItem::Quit),
      ));
    }

    let mut file_menu = Menu::new();
    file_menu = file_menu
        .add_item(CustomMenuItem::new("save".to_string(), "Save").accelerator("CommandOrControl+S"))
        .add_native_item(MenuItem::Separator)
        .add_item(CustomMenuItem::new("open".to_string(), "Open").accelerator("CommandOrControl+O"))
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::CloseWindow);
    
    #[cfg(not(target_os = "macos"))]
    {
      file_menu = file_menu.add_native_item(MenuItem::Quit);
    }
    menu = menu.add_submenu(Submenu::new("File", file_menu));

    #[cfg(not(target_os = "linux"))]
    let mut edit_menu = Menu::new();
    #[cfg(target_os = "macos")]
    {
      edit_menu = edit_menu.add_native_item(MenuItem::Undo);
      edit_menu = edit_menu.add_native_item(MenuItem::Redo);
      edit_menu = edit_menu.add_native_item(MenuItem::Separator);
    }
    #[cfg(not(target_os = "linux"))]
    {
      edit_menu = edit_menu.add_native_item(MenuItem::Cut);
      edit_menu = edit_menu.add_native_item(MenuItem::Copy);
      edit_menu = edit_menu.add_native_item(MenuItem::Paste);
    }
    #[cfg(target_os = "macos")]
    {
      edit_menu = edit_menu.add_native_item(MenuItem::SelectAll);
    }
    #[cfg(not(target_os = "linux"))]
    {
      menu = menu.add_submenu(Submenu::new("Edit", edit_menu));
    }
    #[cfg(target_os = "macos")]
    {
      menu = menu.add_submenu(Submenu::new(
        "View",
        Menu::new().add_native_item(MenuItem::EnterFullScreen),
      ));
    }

    let mut window_menu = Menu::new();
    window_menu = window_menu.add_native_item(MenuItem::Minimize);
    #[cfg(target_os = "macos")]
    {
      window_menu = window_menu.add_native_item(MenuItem::Zoom);
      window_menu = window_menu.add_native_item(MenuItem::Separator);
    }
    window_menu = window_menu.add_native_item(MenuItem::CloseWindow);
    menu = menu.add_submenu(Submenu::new("Window", window_menu));

    menu
  }