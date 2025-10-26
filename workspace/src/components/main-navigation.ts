import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, state } from "lit/decorators.js"

@customElement("main-navigation")
export class MainNavigation extends LitElement {
    @state() private showModal = false;
    @state() private modalMessage = '';
    @state() private serverConnected = false; // Connection status

    // Use Light DOM instead of Shadow DOM for Bootstrap compatibility
    createRenderRoot() {
        return this;
    }

    static styles: CSSResult[] = [
        css`
            .navbar {
                background-color: #343a40 !important;
                border-bottom: 1px solid #495057;
                padding: 0.5rem 1rem;
            }

            .navbar-brand {
                color: #ffffff !important;
                font-weight: bold;
                font-size: 1.25rem;
                text-decoration: none;
            }

            .navbar-brand:hover {
                color: #007bff !important;
            }

            .nav-link {
                color: #ffffff !important;
                padding: 0.5rem 1rem !important;
                transition: color 0.15s ease-in-out;
                text-decoration: none;
                cursor: pointer;
            }

            .nav-link:hover {
                color: #007bff !important;
            }

            .dropdown-menu {
                background-color: #495057 !important;
                border: 1px solid #6c757d !important;
            }

            .dropdown-item {
                color: #ffffff !important;
                padding: 0.5rem 1rem;
                transition: background-color 0.15s ease-in-out;
                text-decoration: none;
                cursor: pointer;
            }

            .dropdown-item:hover {
                background-color: #007bff !important;
                color: #ffffff !important;
            }

            /* Modal styles */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }

            .modal-content {
                background-color: #ffffff;
                border-radius: 0.375rem;
                box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                max-width: 500px;
                width: 90%;
                padding: 1.5rem;
                text-align: center;
            }

            .modal-header {
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 1rem;
                margin-bottom: 1rem;
            }

            .modal-title {
                font-size: 1.25rem;
                font-weight: 500;
                margin: 0;
            }

            .close-btn {
                background: #6c757d;
                border: none;
                border-radius: 0.375rem;
                color: white;
                padding: 0.5rem 1rem;
                margin-top: 1rem;
                cursor: pointer;
                transition: background-color 0.15s ease-in-out;
            }

            .close-btn:hover {
                background: #5a6268;
            }
            
            /* Connection Status Indicator */
            .connection-status {
                margin-left: auto;
                display: flex;
                align-items: center;
                font-size: 0.875rem;
                font-weight: 500;
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                transition: all 0.2s ease-in-out;
            }
            
            .connection-status.connected {
                color: #ffffff;
                background-color: #198754;
                border: 1px solid #146c43;
            }
            
            .connection-status.disconnected {
                color: #ffffff;
                background-color: #dc3545;
                border: 1px solid #b02a37;
            }
            
            .connection-status i {
                margin-right: 0.5rem;
                animation: pulse 2s infinite;
            }
            
            .connection-status.connected i {
                animation: none;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `
    ];

    firstUpdated() {
        // Add the component styles to the document head
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(MainNavigation.styles[0].cssText);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
        
        // Simulate connection status changes for demo
        this.simulateConnectionChanges();
    }

    private simulateConnectionChanges() {
        // Start as disconnected
        this.serverConnected = false;
        
        // Remove simulation - let parent component handle real connections
        // Real connection status will be updated via updateConnectionStatus() method
    }

    private toggleConnection() {
        // Emit event to parent component to handle actual connection logic
        if (this.serverConnected) {
            // Request disconnection
            this.dispatchEvent(new CustomEvent('disconnect-server', {
                bubbles: true,
                detail: { action: 'disconnect' }
            }));
        } else {
            // Request connection
            this.dispatchEvent(new CustomEvent('connect-server', {
                bubbles: true,
                detail: { action: 'connect' }
            }));
        }
    }

    // Method to update connection status from parent component
    public updateConnectionStatus(connected: boolean) {
        this.serverConnected = connected;
        
        if (connected) {
            this.modalMessage = 'Successfully connected to SyndrDB server.';
        } else {
            this.modalMessage = 'Disconnected from SyndrDB server.';
        }
    }

    private showActionModal(action: string): void {
        this.modalMessage = `Clicked on ${action}`;
        this.showModal = true;
    }

    private closeModal(): void {
        this.showModal = false;
        this.modalMessage = '';
    }

    private handleOverlayClick(e: Event): void {
        if (e.target === e.currentTarget) {
            this.closeModal();
        }
    }

    render(): TemplateResult {
        return html`
            <!-- Navigation Bar -->
            <nav class="navbar navbar-expand-lg navbar-dark">
                <div class="container-fluid">
                    <!-- Logo -->
                    <a class="navbar-brand" href="#" @click=${(e: Event) => e.preventDefault()}>
                        <i class="fas fa-database me-2"></i>
                        SyndrDB Tester
                    </a>

                    <!-- Navigation Items -->
                    <div class="navbar-nav d-flex flex-row align-items-center w-100">
                        <!-- File Menu -->
                        <div class="nav-item dropdown me-3">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-file me-1"></i>File
                            </a>
                            <ul class="dropdown-menu">
                                <li>
                                    <a class="dropdown-item" href="#" @click=${(e: Event) => {
                                        e.preventDefault();
                                        this.showActionModal('Open');
                                    }}>
                                        <i class="fas fa-folder-open me-2"></i>Open
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" @click=${(e: Event) => {
                                        e.preventDefault();
                                        this.showActionModal('Save');
                                    }}>
                                        <i class="fas fa-save me-2"></i>Save
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <!-- About Menu -->
                        <div class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-info-circle me-1"></i>About
                            </a>
                            <ul class="dropdown-menu">
                                <li>
                                    <a class="dropdown-item" href="#" @click=${(e: Event) => {
                                        e.preventDefault();
                                        this.showActionModal('Check for updates');
                                    }}>
                                        <i class="fas fa-sync-alt me-2"></i>Check for updates
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" @click=${(e: Event) => {
                                        e.preventDefault();
                                        this.showActionModal('Info');
                                    }}>
                                        <i class="fas fa-info me-2"></i>Info
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                        <!-- Connection Status Indicator -->
                        <div class="connection-status ${this.serverConnected ? 'connected' : 'disconnected'}" 
                             @click=${this.toggleConnection}
                             style="cursor: pointer;"
                             title="Click to toggle connection (demo)">
                            <i class="fas ${this.serverConnected ? 'fa-link' : 'fa-unlink'}"></i>
                            ${this.serverConnected ? 'Connected!' : 'Disconnected'}
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Modal -->
            ${this.showModal ? html`
                <div class="modal-overlay" @click=${this.handleOverlayClick}>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Action Performed</h5>
                        </div>
                        <div class="modal-body">
                            <p>${this.modalMessage}</p>
                        </div>
                        <button class="close-btn" @click=${this.closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            ` : ''}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "main-navigation": MainNavigation;
    }
}
