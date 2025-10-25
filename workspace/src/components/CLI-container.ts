import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js"

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
        </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "cli-container": CLIContainer;
    }
}
