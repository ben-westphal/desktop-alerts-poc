"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path = require("path");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
function getAssetPath(relativePath) {
  const basePath = electron.app.isPackaged ? path__namespace.join(process.resourcesPath, "assets") : path__namespace.join(process.cwd(), "src/assets");
  return path__namespace.join(basePath, relativePath);
}
function getTemplatePath(templateName) {
  const basePath = electron.app.isPackaged ? process.resourcesPath : process.cwd();
  return path__namespace.join(basePath, "templates", templateName);
}
class TrayManager {
  constructor(onEmergencyTrigger) {
    __publicField(this, "tray", null);
    __publicField(this, "onEmergencyTrigger");
    this.onEmergencyTrigger = onEmergencyTrigger;
  }
  createTray() {
    const iconPath = getAssetPath("icons/tray-icon.png");
    let icon = electron.nativeImage.createFromPath(iconPath);
    icon = icon.resize({ width: 16, height: 16 });
    icon.setTemplateImage(true);
    this.tray = new electron.Tray(icon);
    const contextMenu = electron.Menu.buildFromTemplate([
      {
        label: "Trigger Emergency",
        click: () => {
          this.onEmergencyTrigger("EMERGENCY");
        }
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => electron.app.quit()
      }
    ]);
    this.tray.setToolTip("Desktop Emergencies POC");
    this.tray.setContextMenu(contextMenu);
  }
  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
  getTray() {
    return this.tray;
  }
}
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["INFO"] = 1] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 2] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 3] = "ERROR";
  return LogLevel2;
})(LogLevel || {});
class Logger {
  constructor() {
    __publicField(this, "level", 1);
  }
  setLevel(level) {
    this.level = level;
  }
  log(level, message, ...args) {
    if (level < this.level) return;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const levelName = LogLevel[level];
    const prefix = `[${timestamp}] [${levelName}]`;
    switch (level) {
      case 0:
        console.debug(prefix, message, ...args);
        break;
      case 1:
        console.info(prefix, message, ...args);
        break;
      case 2:
        console.warn(prefix, message, ...args);
        break;
      case 3:
        console.error(prefix, message, ...args);
        break;
    }
  }
  debug(message, ...args) {
    this.log(0, message, ...args);
  }
  info(message, ...args) {
    this.log(1, message, ...args);
  }
  warn(message, ...args) {
    this.log(2, message, ...args);
  }
  error(message, ...args) {
    this.log(3, message, ...args);
  }
}
const logger = new Logger();
class EmergencyManager {
  constructor() {
    __publicField(this, "window", null);
    electron.ipcMain.removeAllListeners("emergency-ack");
    electron.ipcMain.on("emergency-ack", () => {
      this.closeWindow();
    });
  }
  show(message) {
    this.closeWindow();
    this.window = new electron.BrowserWindow({
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
        contextIsolation: false
      }
    });
    this.window.setMenu(null);
    this.window.webContents.on(
      "before-input-event",
      (event) => event.preventDefault()
    );
    this.window.loadFile(getTemplatePath("emergency.html")).then(() => {
      if (this.window) {
        this.window.webContents.send("emergency-set-message", message);
        this.window.show();
        this.window.focus();
      }
    }).catch(
      (err) => logger.error("Failed to load emergency alert template:", err)
    );
  }
  closeWindow() {
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }
  }
  destroy() {
    this.closeWindow();
  }
  get isActive() {
    return this.window !== null;
  }
}
let trayManager;
const emergencyManager = new EmergencyManager();
electron.app.whenReady().then(() => {
  trayManager = new TrayManager((msg) => emergencyManager.show(msg));
  trayManager.createTray();
});
electron.app.on("window-all-closed", () => {
});
electron.app.on("before-quit", () => {
  if (trayManager) {
    trayManager.destroy();
  }
  emergencyManager.destroy();
});
