"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyndrDBDriver = void 0;
class SyndrDBDriver {
    connectionId = null;
    connected = false;
    config = null;
    constructor() { }
    /**
     * Connect to SyndrDB server using Electron IPC to main process TCP socket
     */
    async connect(config) {
        if (this.connected) {
            throw new Error('Already connected');
        }
        this.config = config;
        try {
            // Check if we're running in Electron
            if (typeof window !== 'undefined' && window.electronAPI) {
                console.log('Connecting to SyndrDB via Electron main process...');
                const result = await window.electronAPI.syndrdb.connect(config);
                console.log('🔗 Main process connect result:', result);
                if (result.success && result.connectionId) {
                    this.connectionId = result.connectionId;
                    console.log('💾 Set connectionId to:', this.connectionId);
                    // The main process already waits for authentication completion
                    // No need for additional waiting here since result.success means auth is complete
                    this.connected = true;
                    console.log('✅ SyndrDB connection and authentication successful:', this.connectionId);
                    return true;
                }
                else {
                    console.error('❌ SyndrDB connection/authentication failed:', result.error);
                    return false;
                }
            }
            else {
                // Fallback to WebSocket for non-Electron environments (development)
                console.log('Electron API not available, using WebSocket fallback...');
                return this.connectWebSocket(config);
            }
        }
        catch (error) {
            console.error('SyndrDB connection error:', error);
            throw error;
        }
    }
    /**
     * Wait for authentication to complete by listening for connection status events
     */
    async waitForAuthentication() {
        return new Promise((resolve) => {
            let timeout;
            let resolved = false;
            const statusHandler = (data) => {
                if (resolved)
                    return; // Prevent multiple resolutions
                console.log('🔊 Received connection status event:', data);
                console.log('🔊 Checking against connectionId:', this.connectionId);
                console.log('🔊 Connection IDs match:', data.connectionId === this.connectionId);
                if (data.connectionId === this.connectionId) {
                    console.log('🎯 Connection ID matches, processing status:', data.status);
                    if (data.status === 'connected') {
                        console.log('✅ Authentication successful - cleaning up and resolving');
                        resolved = true;
                        clearTimeout(timeout);
                        // Add a small delay to ensure authentication messages are fully processed
                        setTimeout(() => resolve(true), 500);
                    }
                    else if (data.status === 'error') {
                        console.log('❌ Authentication failed - cleaning up and resolving false');
                        resolved = true;
                        clearTimeout(timeout);
                        resolve(false);
                    }
                }
                else {
                    console.log('🔄 Connection ID mismatch, ignoring this status event');
                }
            };
            // Listen for connection status updates
            console.log('🎧 Starting to listen for connection status events...');
            window.electronAPI?.syndrdb.onConnectionStatus(statusHandler);
            // Set a timeout for authentication (10 seconds)
            timeout = setTimeout(() => {
                if (!resolved) {
                    console.error('⏰ Authentication timeout after 10 seconds');
                    resolved = true;
                    resolve(false);
                }
            }, 10000);
        });
    }
    /**
     * WebSocket fallback for development/browser environments
     */
    async connectWebSocket(config) {
        // This is the original WebSocket implementation for fallback
        const connectionString = this.buildConnectionString(config);
        const wsUrl = `ws://${config.hostname}:${parseInt(config.port) + 1}`;
        console.log('Fallback: Connecting via WebSocket:', wsUrl);
        // For now, just simulate success in development
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.connected = true;
        this.connectionId = 'ws_fallback_' + Date.now();
        return true;
    }
    /**
     * Build SyndrDB connection string in the required format
     */
    buildConnectionString(config) {
        return `syndrdb://${config.hostname}:${config.port}:${config.database}:${config.username}:${config.password}`;
    }
    /**
     * Test connection without storing the configuration
     */
    async testConnection(config) {
        try {
            // Check if we're running in Electron
            if (typeof window !== 'undefined' && window.electronAPI) {
                return await window.electronAPI.syndrdb.testConnection(config);
            }
            else {
                // Fallback for non-Electron environments
                console.log('Testing connection via fallback method...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                return true; // Mock success for development
            }
        }
        catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
    /**
     * Execute a query on the SyndrDB server
     */
    async executeQuery(query) {
        if (!this.connected || !this.connectionId) {
            throw new Error('Not connected to SyndrDB server');
        }
        console.log('🔍 executeQuery called with:', query);
        console.log('🔍 Connected:', this.connected);
        console.log('🔍 ConnectionId:', this.connectionId);
        console.log('🔍 Window electronAPI available:', typeof window !== 'undefined' && !!window.electronAPI);
        // Test the electronAPI object structure
        if (typeof window !== 'undefined' && window.electronAPI) {
            console.log('🔍 electronAPI keys:', Object.keys(window.electronAPI));
            console.log('🔍 syndrdb keys:', Object.keys(window.electronAPI.syndrdb || {}));
            console.log('🔍 executeQuery function type:', typeof window.electronAPI.syndrdb?.executeQuery);
        }
        try {
            // Check if we're running in Electron
            if (typeof window !== 'undefined' && window.electronAPI) {
                console.log('✅ Using Electron IPC for query execution');
                console.log('🚀 About to call window.electronAPI.syndrdb.executeQuery with:', { connectionId: this.connectionId, query });
                const result = await window.electronAPI.syndrdb.executeQuery(this.connectionId, query);
                console.log('📦 Query result from Electron:', result);
                return result;
            }
            else {
                // Fallback to mock implementation for development
                console.log('⚠️ Using mock implementation - Electron API not available');
                return this.executeQueryMock(query);
            }
        }
        catch (error) {
            console.error('Query execution failed:', error);
            throw error;
        }
    }
    /**
     * Disconnect from the SyndrDB server
     */
    async disconnect() {
        if (!this.connected || !this.connectionId) {
            return;
        }
        try {
            // Check if we're running in Electron
            if (typeof window !== 'undefined' && window.electronAPI) {
                await window.electronAPI.syndrdb.disconnect(this.connectionId);
            }
        }
        catch (error) {
            console.error('Disconnect error:', error);
        }
        this.connected = false;
        this.connectionId = null;
        this.config = null;
    }
    /**
     * Check if currently connected
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Get current connection configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Get current connection ID
     */
    getConnectionId() {
        return this.connectionId;
    }
    /**
     * Mock implementation for development/testing
     * This simulates a SyndrDB server response
     */
    async executeQueryMock(query) {
        const startTime = Date.now();
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
        const executionTime = Date.now() - startTime;
        // Parse query type
        const queryLower = query.toLowerCase().trim();
        if (queryLower.includes('find')) {
            // Mock find query result
            return {
                success: true,
                data: [
                    {
                        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
                        "name": "John Doe",
                        "email": "john.doe@example.com",
                        "age": 28,
                        "department": "Engineering"
                    },
                    {
                        "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
                        "name": "Jane Smith",
                        "email": "jane.smith@example.com",
                        "age": 32,
                        "department": "Marketing"
                    }
                ],
                executionTime,
                documentCount: 2
            };
        }
        else if (queryLower.includes('show') || queryLower.includes('list')) {
            // Handle specific show commands
            if (queryLower.includes('databases')) {
                // Mock SHOW DATABASES result
                return {
                    success: true,
                    data: [
                        { database: "inventory_db" },
                        { database: "analytics_db" },
                        { database: "user_sessions" },
                        { database: "audit_logs" }
                    ],
                    executionTime,
                    documentCount: 4
                };
            }
            else {
                // Mock show/list query result for collections
                return {
                    success: true,
                    data: [
                        { collection: "users", documents: 1234, size: "45.2 KB" },
                        { collection: "orders", documents: 5678, size: "123.8 KB" },
                        { collection: "products", documents: 892, size: "28.9 KB" }
                    ],
                    executionTime,
                    documentCount: 3
                };
            }
        }
        else if (queryLower.includes('error')) {
            // Mock error response
            return {
                success: false,
                error: "Simulated query error: Invalid syntax",
                executionTime
            };
        }
        else {
            // Default success response
            return {
                success: true,
                data: [{ message: "Query executed successfully", result: "OK" }],
                executionTime,
                documentCount: 1
            };
        }
    }
}
exports.SyndrDBDriver = SyndrDBDriver;
