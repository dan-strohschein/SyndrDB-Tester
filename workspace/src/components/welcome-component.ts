import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('welcome-component')
export class WelcomeComponent extends LitElement {
  
  // Use Light DOM instead of Shadow DOM for Bootstrap compatibility
  createRenderRoot() {
    return this;
  }

  static styles: CSSResult = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    .welcome-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 0.5rem;
      width:100%;
    }
    
    .welcome-title {
      font-size: 3.5rem;
      font-weight: 300;
      margin-bottom: 2rem;
      color: #ffffff;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      animation: fadeInUp 1s ease-out;
    }
    
    .welcome-subtitle {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 3rem;
      animation: fadeInUp 1s ease-out 0.2s both;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 800px;
      margin-top: 2rem;
      animation: fadeInUp 1s ease-out 0.4s both;
    }
    
    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 2rem;
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease;
      color: #ffffff;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
    }
    
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #007bff;
    }
    
    .status-indicator {
      display: inline-flex;
      align-items: center;
      margin-top: 2rem;
      color: rgba(255, 255, 255, 0.9);
      animation: fadeInUp 1s ease-out 0.6s both;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #28a745;
      margin-right: 0.5rem;
      animation: pulse 2s infinite;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
      }
    }
  `;

  firstUpdated() {
    // Add the component styles to the document head since we're using Light DOM
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(WelcomeComponent.styles.cssText);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
  }

  render(): TemplateResult {
    return html`
      <div class="welcome-container">
        <h1 class="welcome-title">
          <i class="fas fa-database" style="margin-right: 1rem; color: #007bff;"></i>
          Welcome to SyndrDB Tester
        </h1>
        
        <p class="welcome-subtitle">
          A modern Electron application built with Lit components, Bootstrap CSS, and FontAwesome icons
        </p>
        
        <!-- Bootstrap Test Section -->
        <div class="m-2 w-100 h-100">
         <cli-container></cli-container>
        </div>
        
        
      </div>
    `;
  }
}