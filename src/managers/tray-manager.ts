import { Tray, Menu, app, nativeImage } from 'electron'
import { getAssetPath } from '../utils/paths'

export class TrayManager {
  private tray: Tray | null = null
  private onEmergencyTrigger: (message: string) => void

  constructor(onEmergencyTrigger: (message: string) => void) {
    this.onEmergencyTrigger = onEmergencyTrigger
  }

  public createTray(): void {
    const iconPath = getAssetPath('icons/tray-icon.png')

    let icon = nativeImage.createFromPath(iconPath)
    icon = icon.resize({ width: 16, height: 16 })
    icon.setTemplateImage(true)

    this.tray = new Tray(icon)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Trigger Emergency',
        click: () => {
          this.onEmergencyTrigger('EMERGENCY')
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ])

    this.tray.setToolTip('Desktop Emergencies POC')
    this.tray.setContextMenu(contextMenu)
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }

  public getTray(): Tray | null {
    return this.tray
  }
}
