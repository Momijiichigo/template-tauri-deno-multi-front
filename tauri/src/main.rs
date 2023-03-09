#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri_app::AppBuilder;

pub fn main() {
  AppBuilder::new().run();
}


