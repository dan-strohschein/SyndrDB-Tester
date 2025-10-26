import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as net from 'net';
import type { ConnectionConfig, QueryResult } from './drivers/syndrdb-driver';

// Store active connections
const activeConnections = new Map<string, net.Socket>();

/**
 * Parse SyndrDB query response into standardized format
 */
function parseQueryResponse(responseData: string): QueryResult {
  try {
    console.log(`🔍 Parsing response data: ${responseData}`);
    
    // Remove any trailing whitespace/newlines
    const cleanResponse = responseData.trim();
    
    // Check for common error patterns first
    if (cleanResponse.toLowerCase().includes('error') || 
        cleanResponse.toLowerCase().includes('failed') ||
        cleanResponse.toLowerCase().includes('invalid')) {
      return {
        success: false,
        error: cleanResponse,
        data: [],
        executionTime: 0
      };
    }
    
    // Try to parse as JSON first (if SyndrDB returns JSON)
    try {
      const jsonResponse = JSON.parse(cleanResponse);
      return {
        success: true,
        data: Array.isArray(jsonResponse) ? jsonResponse : [jsonResponse],
        executionTime: 0, // Could be extracted from response if available
        documentCount: Array.isArray(jsonResponse) ? jsonResponse.length : 1
      };
    } catch (jsonError) {
      // If not JSON, handle as plain text response
      console.log('📄 Response is not JSON, treating as plain text');
      
      // For SELECT queries, try to parse tabular data
      if (cleanResponse.includes('|') || cleanResponse.includes('\t')) {
        const lines = cleanResponse.split('\n').filter(line => line.trim());
        const data = lines.map(line => {
          const values = line.split(/[|\t]/).map(v => v.trim());
          return { values };
        });
        
        return {
          success: true,
          data: data,
          executionTime: 0,
          documentCount: data.length
        };
      }
      
      // For other queries (INSERT, UPDATE, DELETE), parse result message
      const documentCountMatch = cleanResponse.match(/(\d+)\s+(document|record|row)s?\s+(inserted|updated|deleted|affected)/i);
      const documentCount = documentCountMatch ? parseInt(documentCountMatch[1]) : 0;
      
      return {
        success: true,
        data: [{ message: cleanResponse }],
        executionTime: 0,
        documentCount: documentCount
      };
    }
  } catch (error) {
    console.error('❌ Error parsing query response:', error);
    return {
      success: false,
      error: `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: [],
      executionTime: 0
    };
  }
}

function createWindow(): BrowserWindow {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Security best practice
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Optional icon
    show: false // Don't show until ready
  });

  // Load the index.html of the app
  // Uncomment the line below to test Bootstrap JavaScript directly
  // mainWindow.loadFile(path.join(__dirname, '../bootstrap-test.html'));
  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize(); // Maximize to fill visible screen area
    
    // Always open DevTools for debugging
    mainWindow.webContents.openDevTools();
  });

  return mainWindow;
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();

  app.on('activate', () => {
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Setup IPC handlers for SyndrDB communication
function setupIpcHandlers() {
  // SyndrDB connection handlers
  ipcMain.handle('syndrdb:connect', async (event, config: ConnectionConfig) => {
    try {
      console.log('Main process: Attempting to connect to SyndrDB with config:', config);
      
      const connectionId = `conn_${Date.now()}`;
      
      return new Promise<{ success: boolean; connectionId?: string; error?: string }>((resolve) => {
        // Create TCP socket connection
        const socket = new net.Socket();
        let authenticationComplete = false;
        let welcomeMessageReceived = false;
        
        // Set socket timeout and keepalive
        socket.setTimeout(30000); // Increase timeout to 30 seconds
        socket.setKeepAlive(true, 60000); // Enable keepalive with 60 second interval
        socket.setNoDelay(true); // Disable Nagle algorithm for faster responses
        
        socket.on('connect', () => {
          console.log(`✅ Main process: TCP connection established to ${config.hostname}:${config.port}`);
          console.log(`🔗 Connection ID: ${connectionId}`);
          
          // Send authentication string immediately upon connection
          const authString = `syndrdb://${config.hostname}:${config.port}:${config.database}:${config.username}:${config.password};`;
          console.log('📤 Main process: Sending authentication string immediately:', authString);
          console.log('📏 Main process: Auth string length:', authString.length);
          console.log('🔤 Main process: Auth string as text:', authString);
          
          try {
            // Send as plain text with ;\n ending
            const finalString = authString + '\n';
            console.log('📝 Main process: Final string with ending:', JSON.stringify(finalString));
            const bytesWritten = socket.write(finalString, 'utf8');
            console.log('✍️  Main process: Bytes written to socket:', bytesWritten);
            console.log('⏳ Main process: Waiting for server response...');
          } catch (writeError) {
            console.error('❌ Main process: Error writing auth string:', writeError);
          }
        });
        
        socket.on('data', (data) => {
          const message = data.toString().trim();
          console.log('� Main process: Received from SyndrDB server:', message);
          
          // Any response after sending auth string - check if it's welcome/success
          if (!authenticationComplete) {
            console.log('� Main process: Processing authentication response:', message);
            
            if (message.includes('Welcome')) {
              console.log('✅ Main process: SyndrDB authentication successful - received welcome');
              welcomeMessageReceived = true;
              authenticationComplete = true;
              
              // Store the connection
              activeConnections.set(connectionId, socket);
              console.log(`💾 Main process: Stored connection ${connectionId} in activeConnections`);
              console.log(`🗃️  Main process: Total connections now: ${activeConnections.size}`);
              console.log(`🔑 Main process: Connection IDs:`, Array.from(activeConnections.keys()));
              
              // Notify renderer about connection status
              const mainWindow = BrowserWindow.getAllWindows()[0];
              if (mainWindow) {
                mainWindow.webContents.send('syndrdb:connectionStatus', {
                  connectionId,
                  status: 'connected',
                  welcomeMessage: message
                });
              }
              
              resolve({
                success: true,
                connectionId: connectionId
              });
            } else if (message.includes('error') || message.includes('failed') || message.includes('denied') || message.includes('invalid')) {
              console.error('❌ Main process: SyndrDB authentication failed:', message);
              socket.destroy();
              resolve({
                success: false,
                error: `Authentication failed: ${message}`
              });
            } else {
              console.log('📄 Main process: Other response from SyndrDB:', message);
              // Continue waiting for a clearer response
            }
          } else {
            console.log('📄 Main process: Post-authentication message from SyndrDB:', message);
          }
        });
        
        socket.on('error', (error) => {
          console.error('Main process: SyndrDB socket error:', error);
          resolve({
            success: false,
            error: `Connection error: ${error.message}`
          });
        });
        
        socket.on('timeout', () => {
          console.error('Main process: SyndrDB connection timeout');
          socket.destroy();
          resolve({
            success: false,
            error: 'Connection timeout'
          });
        });
        
        socket.on('close', (hadError) => {
          console.log(`❌ Main process: SyndrDB socket closed. Had error: ${hadError}`);
          console.log(`🔍 Main process: Authentication was complete: ${authenticationComplete}`);
          console.log(`🔍 Main process: Welcome message received: ${welcomeMessageReceived}`);
          console.log(`🗃️  Main process: Removing connection ${connectionId} from activeConnections`);
          console.log(`🗃️  Main process: Connections before removal:`, Array.from(activeConnections.keys()));
          
          activeConnections.delete(connectionId);
          console.log(`🗃️  Main process: Connections after removal:`, Array.from(activeConnections.keys()));
          
          // Notify renderer about disconnection
          const mainWindow = BrowserWindow.getAllWindows()[0];
          if (mainWindow) {
            mainWindow.webContents.send('syndrdb:connectionStatus', {
              connectionId,
              status: 'disconnected',
              error: hadError ? 'Connection closed with error' : 'Connection closed normally'
            });
          }
          
          if (!authenticationComplete) {
            resolve({
              success: false,
              error: 'Connection closed before authentication'
            });
          }
        });
        
        // Initiate connection
        const port = parseInt(config.port);
        console.log(`Main process: Connecting to SyndrDB at ${config.hostname}:${port}`);
        socket.connect(port, config.hostname);
      });
      
    } catch (error) {
      console.error('Main process: SyndrDB connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  });

  ipcMain.handle('syndrdb:disconnect', async (event, connectionId: string) => {
    try {
      console.log('Main process: Disconnecting SyndrDB connection:', connectionId);
      
      const socket = activeConnections.get(connectionId);
      if (socket) {
        socket.end();
        socket.destroy();
        activeConnections.delete(connectionId);
        console.log('Main process: SyndrDB disconnection successful');
      } else {
        console.log('Main process: Connection not found for disconnection:', connectionId);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Main process: SyndrDB disconnection failed:', error);
      throw error;
    }
  });

  ipcMain.handle('syndrdb:testConnection', async (event, config: ConnectionConfig) => {
    try {
      console.log('Main process: Testing SyndrDB connection with config:', config);
      
      // TODO: Implement actual connection test
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      
      // For now, simulate success
      return true;
    } catch (error) {
      console.error('Main process: SyndrDB connection test failed:', error);
      return false;
    }
  });

  ipcMain.handle('syndrdb:executeQuery', async (event, connectionId: string, query: string) => {
    try {
      console.log(`🔍 Main process: Executing query on connection ${connectionId}`);
      console.log(`📝 Query: ${query}`);
      console.log(`🗃️  Main process: Total active connections: ${activeConnections.size}`);
      console.log(`🔑 Main process: Available connection IDs:`, Array.from(activeConnections.keys()));
      
      const socket = activeConnections.get(connectionId);
      if (!socket) {
        console.error(`❌ Main process: Connection ${connectionId} not found in activeConnections`);
        console.error(`🗃️  Main process: Available connections:`, Array.from(activeConnections.keys()));
        throw new Error(`Connection ${connectionId} not found`);
      }
      
      console.log(`✅ Main process: Found socket for connection ${connectionId}`);
      console.log(`🔌 Main process: Socket state - readable: ${socket.readable}, writable: ${socket.writable}, destroyed: ${socket.destroyed}`);
      
      return new Promise((resolve, reject) => {
        let responseData = '';
        let queryTimeout: NodeJS.Timeout;
        
        // Set up data handler for this query
        const dataHandler = (data: Buffer) => {
          const chunk = data.toString();
          responseData += chunk;
          console.log(`📦 Received data chunk: ${chunk}`);
          
          // For query responses, just look for newline termination
          // SyndrDB query responses don't use the S0001:: format
          if (chunk.includes('\n') || chunk.includes('\r')) {
            clearTimeout(queryTimeout);
            socket.removeListener('data', dataHandler);
            socket.removeListener('error', errorHandler);
            
            try {
              console.log(`✅ Complete response received: ${responseData}`);
              
              // Parse response based on SyndrDB format
              const result = parseQueryResponse(responseData);
              resolve(result);
            } catch (parseError) {
              console.error('❌ Error parsing query response:', parseError);
              reject(parseError);
            }
          }
        };
        
        // Set up error handler
        const errorHandler = (error: Error) => {
          clearTimeout(queryTimeout);
          socket.removeListener('data', dataHandler);
          socket.removeListener('error', errorHandler);
          console.error('❌ Socket error during query:', error);
          reject(error);
        };
        
        // Set up timeout (30 seconds for query execution)
        queryTimeout = setTimeout(() => {
          socket.removeListener('data', dataHandler);
          socket.removeListener('error', errorHandler);
          console.error('⏰ Query execution timeout');
          reject(new Error('Query execution timeout'));
        }, 30000);
        
        // Add listeners
        socket.on('data', dataHandler);
        socket.on('error', errorHandler);
        
        // Send the query
        console.log(`📤 Sending query to SyndrDB: ${query}`);
        socket.write(query + '\n');
      });
      
    } catch (error) {
      console.error('Main process: SyndrDB query execution failed:', error);
      throw error;
    }
  });

  console.log('Main process: IPC handlers setup complete');
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // Prevent opening new windows
    return { action: 'deny' };
  });
});