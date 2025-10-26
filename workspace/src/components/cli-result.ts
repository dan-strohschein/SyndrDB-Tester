import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js"

@customElement("cli-result")
export class CliResult extends LitElement {
    @property() testName: string = "";
    @property() success: boolean = false;
    @property() responseMessage: string = "";
    @property() executionTimeMs: number = 0;
    @state() private isExpanded: boolean = false;

    static styles = [
        css`
            :host {
                display: block;
                font-family: 'Courier New', monospace;
                margin-bottom: 4px;
            }

            .test-result-line {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2px 0;
                cursor: pointer;
                color: white; /* Default text color */
                width: 100%;
            }

            .test-result-line.success {
                /* Remove color from here - will be applied to specific elements */
            }

            .test-result-line.failure {
                /* Remove color from here - will be applied to specific elements */
            }

            .test-name {
                flex-shrink: 0;
                color: white; /* Always white for test name */
                font-weight: bold;
            }

            .dots {
                flex-grow: 1;
                margin: 0 8px;
                border-bottom: 2px dotted white; /* Always white dots */
                height: 1px;
                align-self: flex-end;
                margin-bottom: 4px;
                min-width: 20px; /* Ensure minimum dot space */
            }

            .dots.success {
                /* Keep dots white for success */
                border-bottom: 2px dotted #10df40ff; /* Always white dots */
            }

            .dots.failure {
                border-bottom: 2px dotted #dc3545; /* Red for failed tests */
            }

            .result-status {
                flex-shrink: 0;
                font-weight: bold;
                white-space: nowrap; /* Prevent wrapping */
            }

            .result-status.success {
                color: #10df40ff; /* Green for PASS */
            }

            .result-status.failure {
                color: #dc3545; /* Red for FAIL */
            }

            .result-data-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 0;
                cursor: pointer;
                color: #dc3545; /* Red for failed tests */
                margin-top: 2px;
            }

            .result-data-toggle:hover {
                opacity: 0.8;
            }

            .arrow-icon {
                transition: transform 0.2s ease;
                font-size: 12px;
            }

            .arrow-icon.expanded {
                transform: rotate(90deg);
            }

            .result-data-content {
                color: white;
                padding: 8px 16px;
                margin-top: 4px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                white-space: pre-wrap;
                word-break: break-word;
                max-height: 200px;
                overflow-y: auto;
                border-left: 3px solid #dc3545;
            }

            .execution-time {
                font-size: 11px;
                opacity: 0.8;
                margin-left: 4px;
            }

            /* Hide result data toggle for successful tests */
            .success .result-data-toggle {
                display: none;
            }
        `
    ];

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Add the component styles to the document head since we're using Light DOM
        if (CliResult.styles && CliResult.styles.length > 0) {
            const styleSheet = new CSSStyleSheet();
            styleSheet.replaceSync(CliResult.styles[0].cssText);
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
        }
    }

    private toggleResultData() {
        if (!this.success && this.responseMessage) {
            this.isExpanded = !this.isExpanded;
        }
    }

    render() {
        const statusText = this.success ? 'PASS' : 'FAIL';
        const resultClass = this.success ? 'success' : 'failure';
        const executionTimeText = this.executionTimeMs > 0 ? ` (${this.executionTimeMs}ms)` : '';

        return html`
            <div class="test-result-line ${resultClass}" @click="${this.toggleResultData}">
                <span class="test-name ">${this.testName}</span>
                <span class="dots ${resultClass}"></span>
                <span class="result-status ${resultClass}">
                    ${statusText}${executionTimeText}
                </span>
            </div>
            
            ${!this.success && this.responseMessage ? html`
                <div class="result-data-toggle" @click="${this.toggleResultData}">
                    <span class="arrow-icon ${this.isExpanded ? 'expanded' : ''}">▶</span>
                    <span>Result Data</span>
                </div>
                
                ${this.isExpanded ? html`
                    <div class="result-data-content">
                        ${this.responseMessage}
                    </div>
                ` : ''}
            ` : ''}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "cli-result": CliResult;
    }
}
