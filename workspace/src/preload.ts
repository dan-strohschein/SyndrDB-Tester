// Preload script for security context isolation
// This script runs in a privileged context and can expose APIs to the renderer

import { contextBridge, ipcRenderer } from 'electron';
import type { SyndrDBElectronAPI, ConnectionStorageAPI, FileDialogAPI } from './drivers/electron-api';
import type { ConnectionConfig, QueryResult } from './drivers/syndrdb-driver';

// Define the API interface for type safety
interface ElectronAPI {
  syndrdb: SyndrDBElectronAPI;
  connections: ConnectionStorageAPI;
  fileDialog: FileDialogAPI;
}

// SyndrDB API implementation
const syndrdbAPI: SyndrDBElectronAPI = {
  connect: (config: ConnectionConfig) => ipcRenderer.invoke('syndrdb:connect', config),
  disconnect: (connectionId: string) => ipcRenderer.invoke('syndrdb:disconnect', connectionId),
  testConnection: (config: ConnectionConfig) => ipcRenderer.invoke('syndrdb:testConnection', config),
  executeQuery: (connectionId: string, query: string) => ipcRenderer.invoke('syndrdb:executeQuery', connectionId, query),
  onConnectionStatus: (callback: (data: { connectionId: string; status: string; error?: string }) => void) => {
    ipcRenderer.on('syndrdb:connectionStatus', (event, data) => callback(data));
  },
  removeConnectionStatusListener: (callback: Function) => {
    ipcRenderer.removeListener('syndrdb:connectionStatus', callback as any);
  }
};

// Connection storage API implementation
const connectionsAPI: ConnectionStorageAPI = {
  load: () => ipcRenderer.invoke('connections:load'),
  save: (connection: ConnectionConfig) => ipcRenderer.invoke('connections:save', connection),
  overwrite: (connection: ConnectionConfig) => ipcRenderer.invoke('connections:overwrite', connection),
  delete: (name: string) => ipcRenderer.invoke('connections:delete', name)
};

// File dialog API implementation
const fileDialogAPI: FileDialogAPI = {
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options)
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  syndrdb: syndrdbAPI,
  connections: connectionsAPI,
  fileDialog: fileDialogAPI
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);