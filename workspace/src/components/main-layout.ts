import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { ConnectionConfig } from "../drivers/syndrdb-driver";
import { SyndrDBDriver } from "../drivers/syndrdb-driver";
import { SyndrDBDriverManager } from "../drivers/syndrdb-driver-manager";
import type { TestResult } from "../test_engine/test-types";

@customElement("main-layout")
export class MainLayout extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    @state() private connectionConfig: ConnectionConfig | null = null;
    @state() private isConnecting = false;
    private driverManager!: SyndrDBDriverManager;
    private navigationComponent: any = null;

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // This function executes exactly ONCE when the component first loads
        // It runs after the first render is complete and DOM is available
        this.connectionConfig = {
            name: 'Localhost',
            hostname: 'localhost',
            port: '1776', 
            database: 'primary',
            username: 'root',
            password: 'root'
        };
        
        // Initialize SyndrDB driver manager
        this.driverManager = SyndrDBDriverManager.getInstance();
        
        // Get reference to navigation component
        this.navigationComponent = this.querySelector('main-navigation');
        
        // Set up event listeners for connection events
        this.addEventListener('connect-server', (event: Event) => {
            this.handleConnectServer(event as CustomEvent);
        });
        this.addEventListener('disconnect-server', (event: Event) => {
            this.handleDisconnectServer(event as CustomEvent);
        });
        
        // Set up event listener for test results
        this.addEventListener('test-result', (event: Event) => {
            this.handleTestResult(event as CustomEvent);
        });
        
        // Listen for connection status updates from main process
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.syndrdb.onConnectionStatus((data: { connectionId: string; status: string; error?: string; welcomeMessage?: string }) => {
                console.log('📨 Received connection status update:', data);
                
                if (data.welcomeMessage) {
                    console.log('🎉 SyndrDB Server Welcome Message:', data.welcomeMessage);
                    
                    // You could also show this in the UI if desired
                    if (this.navigationComponent) {
                        this.navigationComponent.modalMessage = `Server says: ${data.welcomeMessage}`;
                    }
                }
            });
        }
        
        // Add component styles to document head (for Light DOM)
        if (MainLayout.styles && MainLayout.styles.length > 0) {
            const styleSheet = new CSSStyleSheet();
            styleSheet.replaceSync(MainLayout.styles[0].cssText);
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
        }
    }

    private async handleConnectServer(event: CustomEvent) {
        if (this.isConnecting || !this.connectionConfig) {
            return;
        }
        
        console.log('Attempting to connect to SyndrDB server...');
        this.isConnecting = true;
        
        try {
            const syndrDBDriver = this.driverManager.getDriver();
            await syndrDBDriver.connect(this.connectionConfig);
            console.log('Successfully connected to SyndrDB server');
            
            // Update navigation component status
            if (this.navigationComponent) {
                this.navigationComponent.updateConnectionStatus(true);
            }
        } catch (error) {
            console.error('Failed to connect to SyndrDB server:', error);
            
            // Update navigation component status
            if (this.navigationComponent) {
                this.navigationComponent.updateConnectionStatus(false);
            }
        } finally {
            this.isConnecting = false;
        }
    }

    private async handleDisconnectServer(event: CustomEvent) {
        if (!this.driverManager.isConnected()) {
            return;
        }
        
        console.log('Disconnecting from SyndrDB server...');
        
        try {
            const syndrDBDriver = this.driverManager.getDriver();
            await syndrDBDriver.disconnect();
            console.log('Successfully disconnected from SyndrDB server');
            
            // Update navigation component status
            if (this.navigationComponent) {
                this.navigationComponent.updateConnectionStatus(false);
            }
        } catch (error) {
            console.error('Error during disconnection:', error);
        }
    }

    private handleTestResult(event: CustomEvent) {
        const testResult: TestResult = event.detail;
        console.log('Main layout received test result:', testResult);
        
        // Find the CLI container and add the result
        const cliContainer = this.querySelector('cli-container');
        if (cliContainer) {
            // Add the result to the CLI container's TestResults array
            const currentResults = cliContainer.TestResults || [];
            cliContainer.TestResults = [...currentResults, testResult];
            console.log('Added test result to CLI container');
        } else {
            console.warn('CLI container not found');
        }
    }

    render() {
        return html`
        
         <div class="row">
            <div class="col">
                <!-- Navigation Bar -->
                <main-navigation></main-navigation>
            </div>
        </div>
         <div class="row gx-1 main-content-row">
            <div class="col-4 border-end main-content-col">
                <!-- Sidebar -->
                <side-bar></side-bar>
            </div>
            <div class="col-8 main-content-col">
                <!-- Main area  -->
                <!-- Main container with Bootstrap classes -->
                <div class="container-fluid text-center h-100 d-flex align-items-center justify-content-center">
                    <!-- Welcome component will be inserted here -->
                    <welcome-component style="width:100%; height:100%;">
                        <!-- Fallback content while component loads -->
                        
                    </welcome-component>
                </div>
            </div>
        </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "main-layout": MainLayout;
    }
}
