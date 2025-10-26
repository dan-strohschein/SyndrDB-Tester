import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js"

@customElement("test-list")
export class TestList extends LitElement {

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Add the component styles to the document head since we're using Light DOM
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(TestList.styles[0].cssText);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
    }

    static styles = [
        css`
            :host {
                display: block;
            }
            
            .accordion-button {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
            }
            
            .accordion-title {
                flex-grow: 1;
            }
            
            .run-all-btn {
                margin-left: auto !important;
                margin-right: 1rem !important;
            }
        `
    ];

    render() {
        return html`
        <div class="accordion" id="accordionExample">
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
        <span class="accordion-title">End 2 End</span>
        <a class="btn btn-sm btn-primary run-all-btn"><i class="fas fa-play"></i> Run All</a>
       
      </button>
    </h2>
    <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
        <div class="accordion-body">
            <strong>All End 2 End tests</strong> 
            <p>These tests simulate User interactions with the database by firing off several kinds of queries and validating their responses.</p>
            <div>
                <end-to-end-list></end-to-end-list>
            </div>
        </div>
    </div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
        <span class="accordion-title">Performance</span>
        <a class="btn btn-sm btn-primary run-all-btn"><i class="fas fa-play"></i> Run All</a>
      </button>
    </h2>
    <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        <strong>All tests related to load and speed</strong> 
        <p>All tests that work with giant data loads to validate that SyndrDB is still fast.</p>
      </div>
    </div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
        <span class="accordion-title">Security</span>
        <a class="btn btn-sm btn-primary run-all-btn"><i class="fas fa-play"></i> Run All</a>
      </button>
    </h2>
    <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        <strong>All security-related tests</strong> 
        <p>Tests that validate SyndrDB's security features including authentication, authorization, and data protection.</p>
      </div>
    </div>
  </div>
</div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "test-list": TestList;
    }
}
