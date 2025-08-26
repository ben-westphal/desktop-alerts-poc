import { app } from 'electron'
import { TrayManager } from './managers/tray-manager'
import { EmergencyManager } from './managers/emergency-manager'

let trayManager: TrayManager
const emergencyManager = new EmergencyManager()

app.whenReady().then(() => {
  trayManager = new TrayManager((msg) => emergencyManager.show(msg))
  trayManager.createTray()
})

app.on('window-all-closed', () => {
  // Keep app running as tray application
})

app.on('before-quit', () => {
  if (trayManager) {
    trayManager.destroy()
  }
  emergencyManager.destroy()
})
