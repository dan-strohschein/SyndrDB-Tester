import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js"
import { TestSummary } from "../test_engine/test-types";

@customElement("cli-summary")
export class CliSummary extends LitElement {

    @property() TestSummary: TestSummary | null = null;


    static styles = [
        css`
            :host {
                display: block;
            }

            .double-border {
                margin-bottom:4px;
                border-bottom:1px solid white;
                padding-bottom:4px;
            }
            .cli-summary-category {
                font-weight: bold;
                color: white;
                padding: 2px 0;
                width: 100%;
                border: 1px solid white;
                font-weight: bold;
                text-align: center;
                
            }
            .cli-summary-stats {
                display: flex;
                justify-content: space-around;
                margin-top: 8px;
                margin-left: 15px;
            }
            .stat-failed {
                color: #fb3636ff; /* Red for FAIL */
            }

            .stat-passed {
                color: #10df40ff; /* Green for PASS */
            }
        `
    ];

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Add the component styles to the document head since we're using Light DOM
        if (CliSummary.styles && CliSummary.styles.length > 0) {
            const styleSheet = new CSSStyleSheet();
            styleSheet.replaceSync(CliSummary.styles[0].cssText);
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
        }
    }

    render() {
        return html`
        <div class="double-border"></div>
        <div class="cli-summary-category">${this.TestSummary?.category}</div>
        <div class="double-border"></div>
        <div class="cli-summary-stats">
            <div class="stat-passed">Passed: ${this.TestSummary?.totalPassed ?? 0} / ${this.TestSummary?.totalTests ?? 0}</div>
            <div class="stat-failed">Failed: ${this.TestSummary?.totalFailed ?? 0} / ${this.TestSummary?.totalTests ?? 0}</div>
        </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "cli-summary": CliSummary;
    }
}
