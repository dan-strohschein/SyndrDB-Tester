// Preload script for security context isolation
// This script runs in a privileged context and can expose APIs to the renderer

import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface for type safety
interface ElectronAPI {
  // Add any APIs you need to expose to the renderer process here
  // For example:
  // openFile: () => Promise<string>;
  // minimize: () => Promise<void>;
  // maximize: () => Promise<void>;
  // close: () => Promise<void>;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // Add implementations here when needed
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);