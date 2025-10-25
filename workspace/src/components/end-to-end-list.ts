import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js"

interface TestEntry {
    category: string;
    description: string;
    runAllCommand: string;
}

interface TestFile {
    fileName: string;
    tests: TestEntry[];
}

@customElement("end-to-end-list")
export class EndToEndList extends LitElement {
    @state() private testFiles: TestFile[] = [];
    @state() private loading = false;
    @state() private error: string | null = null;
    @state() private allSelected = false;

    static styles = [
        css`
            :host {
                display: block;
            }
            
            .loading {
                text-align: center;
                padding: 2rem;
                color: #6c757d;
            }
            
            .error {
                color: #dc3545;
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 0.375rem;
                padding: 1rem;
                margin: 1rem 0;
            }
            
            .test-file-section {
                margin-bottom: 2rem;
            }
            
            .test-file-title {
                font-weight: bold;
                font-size: 1.1rem;
                margin-bottom: 1rem;
                color: #495057;
            }
            
            .test-item {
                background-color: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.375rem;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            
            .test-description {
                flex-grow: 1;
            }
            
            .test-command {
                margin-left: 1rem;
                align-self: flex-start;
            }
            
            .test-command button {
                height: auto !important;
                min-height: auto !important;
                padding: 0.25rem 0.5rem !important;
                line-height: 1 !important;
            }
        `
    ];

    async loadFiles() {
        // Load the test files from the ./data directory that start with E2E- and end with tests.json
        this.loading = true;
        this.error = null;
        
        const e2eFileNames = [
            'E2E-add-bundle-tests.json',
            'E2E-add-documents-tests.json', 
            'E2E-delete-bundle-tests.json',
            'E2E-delete-documents-tests.json',
            'E2E-select-documents-tests.json',
            'E2E-update-bundle-tests.json',
            'E2E-update-documents-tests.json'
        ];
        
        try {
            const loadedFiles: TestFile[] = [];
            
            for (const fileName of e2eFileNames) {
                try {
                    const response = await fetch(`../data/${fileName}`);
                    if (!response.ok) {
                        throw new Error(`Failed to load ${fileName}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    loadedFiles.push({
                        fileName: fileName.replace('.json', '').replace('E2E-', '').replace('-tests', ''),
                        tests: data.tests || []
                    });
                } catch (fileError) {
                    console.warn(`Could not load ${fileName}:`, fileError);
                }
            }
            
            this.testFiles = loadedFiles;
        } catch (err) {
            this.error = `Error loading test files: ${err instanceof Error ? err.message : 'Unknown error'}`;
            console.error('Error loading test files:', err);
        } finally {
            this.loading = false;
        }
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Add the component styles to the document head since we're using Light DOM
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(EndToEndList.styles[0].cssText);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
        
        // Load files when component is first rendered
        this.loadFiles();
    }

    selectAll() {
        // Loop through all the tests and turn on their checkboxes
        return (e: Event) => {
            e.preventDefault();
            
            // Query all checkbox inputs within this component
            const checkboxes = this.querySelectorAll('input[type="checkbox"][role="switch"]') as NodeListOf<HTMLInputElement>;
            
            // Check if all checkboxes are already selected
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
            
            // If all are checked, uncheck all; otherwise, check all
            checkboxes.forEach(checkbox => {
                checkbox.checked = !allChecked;
            });
            
            // Update the state to trigger re-render with updated link text
            this.allSelected = !allChecked;
            
            console.log(`${allChecked ? 'Unchecked' : 'Checked'} all ${checkboxes.length} test checkboxes`);
        };
    }

    render() {
        if (this.loading) {
            return html`
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading E2E test files...
                </div>
            `;
        }

        if (this.error) {
            return html`
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${this.error}
                </div>
            `;
        }

        if (this.testFiles.length === 0) {
            return html`
                <div class="loading">
                    No E2E test files found.
                </div>
            `;
        }

        return html`
            <div class="e2e-test-container">
                ${this.testFiles.map(testFile => html`
                    <div class="test-file-section">
                        <div class="test-file-title">
                            <i class="fas fa-file-code"></i>
                            ${testFile.fileName}
                            <span class="badge bg-secondary ms-2">${testFile.tests.length} tests</span>
                            <span><a @click=${this.selectAll()} href="#" ><small style="font-size: .675em;">${this.allSelected ? 'Deselect All' : 'Select All'}</small></a>
                        </div>
                        
                        ${testFile.tests.map(test => html`
                            <div class="test-item">
                                <div class="test-description">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" role="switch" id="switch-${test.runAllCommand}">
                                        <label class="form-check-label" for="switch-${test.runAllCommand}"><small>${test.description}</small></label>
                                    </div>
                                    
                                </div>
                                <div class="test-command">
                                    <button class="btn btn-sm btn-outline-primary" 
                                            @click=${() => this.runTest(test.runAllCommand)}>
                                        <i class="fas fa-play"></i> 
                                    </button>
                                </div>
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `;
    }

    private runTest(command: string) {
        console.log(`Running test command: ${command}`);
        // TODO: Implement actual test execution
        // This could send a message to the main process or call a test runner
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "end-to-end-list": EndToEndList;
    }
}
