import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js"
import { TestResult, TestSummary } from "../test_engine/test-types";

@customElement("cli-container")
export class CLIContainer extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            .cli-container {
                width: 100%;
                height: 100%;
                min-height: 300px;
                overflow-y: auto;
                border: 3px solid #343a40;
                border-radius: 0.375rem;
                background-color: #000000;
                color: #ffffff;
                font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'DejaVu Sans Mono', monospace;
                font-size: 14px;
                line-height: 1.4;
                padding: 1rem;
                box-sizing: border-box;
                text-align: left;
            }
        `
    ];


   @property() TestResults: TestResult[] = [];
   @property() summaryCategory: string = "End-to-End Tests";

   private calculateSummary(): TestSummary {
       // Filter out null/undefined results first
       const validResults = this.TestResults.filter(result => result != null);
       const totalTests = validResults.length;
       const totalPassed = validResults.filter(result => result.success).length;
       const totalFailed = totalTests - totalPassed;
       
       return {
           category: this.summaryCategory,
           totalTests,
           totalPassed,
           totalFailed
       };
   }


    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Add the component styles to the document head since we're using Light DOM
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(CLIContainer.styles[0].cssText);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
    }

    render() {
        return html`
        <div class="cli-container">
            <div>SyndrDB Tester CLI v1.0.0</div>
            <div>Seleect tests on the left to execute</div>
            <div><span style="color: #00ff00;">syndrdb@localhost:~$</span> <span style="color: #ffff00;">|</span></div>
            ${this.TestResults.filter(result => result != null).map(result => html`
                <cli-result 
                    .testName=${result.testName} 
                    .success=${result.success} 
                    .responseMessage=${result.responseMessage} 
                    .executionTimeMs=${result.executionTimeMs}>
                </cli-result>
            `)}
            
            ${this.TestResults.filter(result => result != null).length > 0 ? html`
                <cli-summary .TestSummary=${this.calculateSummary()}></cli-summary>
            ` : ''}
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "cli-container": CLIContainer;
    }
}
