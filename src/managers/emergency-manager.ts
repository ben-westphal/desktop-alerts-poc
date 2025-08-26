import { BrowserWindow, ipcMain } from 'electron'
import { logger } from '../utils/logger'
import { getTemplatePath } from '../utils/paths'

export class EmergencyManager {
  private window: BrowserWindow | null = null

  constructor() {
    ipcMain.removeAllListeners('emergency-ack')
    ipcMain.on('emergency-ack', () => {
      this.closeWindow()
    })
  }

  public show(message: string): void {
    this.closeWindow()

    this.window = new BrowserWindow({
      frame: false,
      fullscreen: true,
      kiosk: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    })

    this.window.setMenu(null)

    // Disable all keyboard shortcuts and inputs except our acknowledge button
    this.window.webContents.on('before-input-event', (event) =>
      event.preventDefault()
    )

    this.window
      .loadFile(getTemplatePath('emergency.html'))
      .then(() => {
        if (this.window) {
          this.window.webContents.send('emergency-set-message', message)
          this.window.show()
          this.window.focus()
        }
      })
      .catch((err) =>
        logger.error('Failed to load emergency alert template:', err)
      )
  }

  public closeWindow(): void {
    if (this.window) {
      this.window.destroy()
      this.window = null
    }
  }

  public destroy(): void {
    this.closeWindow()
  }

  public get isActive(): boolean {
    return this.window !== null
  }
}
