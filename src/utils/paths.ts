import { app } from 'electron'
import * as path from 'path'

export function getAssetPath(relativePath: string): string {
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(process.cwd(), 'src/assets')

  return path.join(basePath, relativePath)
}

export function getTemplatePath(templateName: string): string {
  const basePath = app.isPackaged 
    ? process.resourcesPath 
    : process.cwd()
  
  return path.join(basePath, 'templates', templateName)
}
