use tauri_app::AppBuilder;

#[tauri::mobile_entry_point]
fn main() {
  super::AppBuilder::new().run();
}
