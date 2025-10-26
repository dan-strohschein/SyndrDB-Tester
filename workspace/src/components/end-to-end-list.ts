import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js"
import { End2EndTests, EndToEndTestRunner } from "../test_engine/E2E_runner";
import {TestResult, TestSummary} from "../test_engine/test-types";

import test from "node:test";

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
    @state() private expandedCategories: Set<string> = new Set(); // Track which categories are expanded
    @state() private selectedTests: Set<string> = new Set(); // Track which tests are selected
    @state() private TestResults: TestResult[] = [];
    @state() private TestSummaries: TestSummary[] = [];

    constructor() {
        super();
        // Initialize all categories as expanded by default
        this.expandedCategories = new Set([
            'E2E-add-bundle-tests.json',
            'E2E-add-documents-tests.json', 
            'E2E-delete-bundle-tests.json',
            'E2E-delete-documents-tests.json',
            'E2E-select-documents-tests.json',
            'E2E-update-bundle-tests.json',
            'E2E-update-documents-tests.json',
            'performance-bulk-add-tests.json',
            'performance-bulk-update-tests.json',
            'performance-select-documents-tests.json'
        ]);
        this.loadFiles();
    }

    private toggleCategory(fileName: string) {
        if (this.expandedCategories.has(fileName)) {
            this.expandedCategories.delete(fileName);
        } else {
            this.expandedCategories.add(fileName);
        }
        // Trigger re-render
        this.requestUpdate();
    }

    private toggleTestSelection(testCommand: string, event: Event) {
        const checkbox = event.target as HTMLInputElement;
        if (checkbox.checked) {
            this.selectedTests.add(testCommand);
        } else {
            this.selectedTests.delete(testCommand);
        }
        
        // Update allSelected state based on current selections
        const totalTests = this.testFiles.reduce((sum, file) => sum + file.tests.length, 0);
        this.allSelected = this.selectedTests.size === totalTests;
        
        console.log(`Test ${testCommand} ${checkbox.checked ? 'selected' : 'deselected'}. Total selected: ${this.selectedTests.size}`);
        this.requestUpdate();
    }

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
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 0.375rem;
                transition: background-color 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
                user-select: none;
            }
            
            .test-file-title:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            .test-file-title-content {
                display: flex;
                align-items: center;
                flex-grow: 1;
            }
            
            .collapse-icon {
                transition: transform 0.2s ease;
                margin-right: 0.5rem;
                font-size: 0.9rem;
            }
            
            .collapse-icon.expanded {
                transform: rotate(90deg);
            }
            
            .test-list {
                overflow: hidden;
                transition: max-height 0.3s ease, opacity 0.2s ease;
            }
            
            .test-list.collapsed {
                max-height: 0;
                opacity: 0;
            }
            
            .test-list.expanded {
                max-height: 2000px; /* Large enough to accommodate all tests */
                opacity: 1;
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

    private areAllTestsSelectedInCategory(testFile: TestFile): boolean {
        return testFile.tests.every(test => this.selectedTests.has(test.runAllCommand));
    }

    selectAll(e: Event, testFile: TestFile) {
        // Toggle between selecting all tests in this category or deselecting them
        e.preventDefault();
        
        const allSelectedInCategory = this.areAllTestsSelectedInCategory(testFile);
        
        if (allSelectedInCategory) {
            // Deselect all tests in this category
            testFile.tests.forEach(test => {
                this.selectedTests.delete(test.runAllCommand);
            });
            console.log(`Deselected all tests in ${testFile.fileName}`);
        } else {
            // Select all tests in this category
            testFile.tests.forEach(test => {
                this.selectedTests.add(test.runAllCommand);
            });
            console.log(`Selected all tests in ${testFile.fileName}`);
        }
        
        // Update global allSelected state
        const totalTests = this.testFiles.reduce((sum, file) => sum + file.tests.length, 0);
        this.allSelected = this.selectedTests.size === totalTests;
        
        this.requestUpdate();
    }

    // Public method to get currently selected tests
    getSelectedTests(): string[] {
        return Array.from(this.selectedTests);
    }

    // Public method to get selected tests count
    getSelectedTestsCount(): number {
        return this.selectedTests.size;
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
                ${this.selectedTests.size > 0 ? html`
                    <div class="selected-tests-indicator" style="background-color: rgba(13, 202, 240, 0.1); border: 1px solid rgba(13, 202, 240, 0.3); border-radius: 0.375rem; padding: 0.5rem; margin-bottom: 1rem; text-align: center;">
                        <i class="fas fa-check-circle" style="color: #0dcaf0; margin-right: 0.5rem;"></i>
                        <strong>${this.selectedTests.size}</strong> test${this.selectedTests.size === 1 ? '' : 's'} selected
                         <a @click="${() => this.runSelectedTests()}" class="btn btn-sm btn-primary run-all-btn"><i class="fas fa-play"></i> Run All</a>
                    </div>
                ` : ''}
                ${this.testFiles.map(testFile => {
                    const isExpanded = this.expandedCategories.has(testFile.fileName);
                    return html`
                        <div class="test-file-section">
                            <div class="test-file-title" @click=${() => this.toggleCategory(testFile.fileName)}>
                                <div class="test-file-title-content">
                                    <i class="fas fa-chevron-right collapse-icon ${isExpanded ? 'expanded' : ''}"></i>
                                    <i class="fas fa-file-code" style="margin-right: 0.5rem;"></i>
                                    ${testFile.fileName}
                                    <span class="badge bg-secondary ms-2">${testFile.tests.length} tests</span>
                                </div>
                                <span><a @click=${(e: Event) => { e.stopPropagation(); this.selectAll(e, testFile); }} href="#" ><small style="font-size: .675em;">${this.areAllTestsSelectedInCategory(testFile) ? 'Deselect All' : 'Select All'}</small></a>
                            </div>
                            
                            <div class="test-list ${isExpanded ? 'expanded' : 'collapsed'}">
                                ${testFile.tests.map(test => html`
                                    <div class="test-item">
                                        <div class="test-description">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" 
                                                       type="checkbox" 
                                                       role="switch" 
                                                       id="switch-${test.runAllCommand}"
                                                       ?checked=${this.selectedTests.has(test.runAllCommand)}
                                                       @change=${(e: Event) => this.toggleTestSelection(test.runAllCommand, e)}>
                                                <label class="form-check-label" for="switch-${test.runAllCommand}"><small>${test.description}</small></label>
                                            </div>
                                            
                                        </div>
                                        <div class="test-command">
                                            <button class="btn btn-sm btn-outline-primary" 
                                                    @click=${() => this.runTest(test.runAllCommand, testFile.fileName)}>
                                                <i class="fas fa-play"></i> 
                                            </button>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </div>
                    `;
                })}
            </div>
        `;
    }

    private async runTest(command: string, category: string, oneOff = true) {
        console.log(`Running test command: ${command}`);
        
        const end2endTests = new End2EndTests();
        const testRunner = new EndToEndTestRunner(end2endTests);
       
        let result: TestResult;
        try {
            result = await testRunner.runTestByName(command);
        } catch (error) {
            // Create a proper TestResult object for failed test execution
            result = {
                testName: command,
                success: false,
                responseMessage: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                executionTimeMs: 0
            };
            console.error(`Test ${command} failed:`, error);
        }
        
        this.TestResults = [...this.TestResults, result];

        if (oneOff) {
            this.processTestSummary(command);
        }
        
        // Emit event with the test result so parent components can listen
        this.dispatchEvent(new CustomEvent('test-result', {
            detail: result,
            bubbles: true,
            composed: true
        }));
        
        console.log('Test result:', result);
    }

    private async runSelectedTests() {
        console.log('Running selected tests:', Array.from(this.selectedTests));

        for (const testCommand of this.selectedTests) {
            await this.runTest(testCommand, 'End 2 End', false);
        }

        this.processTestSummary('End 2 End');
    }

    private processTestSummary(category: string) {
        // Filter out any null/undefined results first, then calculate stats
        const validResults = this.TestResults?.filter(r => r != null) || [];
        
        // Calculate the number of passed tests
        const passedTests = validResults.filter(r => r.success === true).length;

        // Calculate the number of failed tests
        const failedTests = validResults.filter(r => r.success === false).length;
        
        const summary: TestSummary = {
            category: category,
            totalTests: validResults.length,
            totalPassed: passedTests,
            totalFailed: failedTests
        };
        this.TestSummaries = [...this.TestSummaries, summary];
        
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "end-to-end-list": EndToEndList;
    }
}
