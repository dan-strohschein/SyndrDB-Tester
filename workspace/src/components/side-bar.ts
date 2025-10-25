import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js"

@customElement("side-bar")
export class SideBar extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    createRenderRoot() {
        return this;
    }

    render() {
        return html`
        <div style="margin-top:60px;overflow-y:auto;height:calc(100vh - 60px);">
            <div class="p-3">
                
                    <test-list></test-list>
                
            </div>
       </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "side-bar": SideBar;
    }
}
