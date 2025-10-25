// Renderer process script
// This script runs in the renderer process and handles UI interactions

import './components/welcome-component';
import './components/main-navigation';
import './components/side-bar';
import './components/test-list';
import './components/end-to-end-list';
import './components/CLI-container';

console.log('SyndrDB Tester renderer process loaded');

// Optional: Add any global renderer logic here
document.addEventListener('DOMContentLoaded', (): void => {
  console.log('DOM Content Loaded - SyndrDB Tester is ready!');
  
  // Test Bootstrap JavaScript availability
  setTimeout(() => {
  //  console.log('Testing Bootstrap JavaScript...');
  //  console.log('Bootstrap object:', typeof (window as any).bootstrap !== 'undefined' ? (window as any).bootstrap : 'not found');
    
    // Test if Bootstrap components can be initialized
    const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    //console.log('Found dropdown elements:', dropdownElements.length);
    
    if (dropdownElements.length > 0 && typeof (window as any).bootstrap !== 'undefined') {
      dropdownElements.forEach((element) => {
        try {
          const dropdown = new (window as any).bootstrap.Dropdown(element);
         // console.log('Dropdown initialized successfully:', dropdown);
        } catch (error) {
          console.error('Error initializing dropdown:', error);
        }
      });
    }
  }, 1000);
  
  // Example: Handle keyboard shortcuts
  document.addEventListener('keydown', (event: KeyboardEvent): void => {
    // F11 to toggle fullscreen (though app starts in fullscreen)
    if (event.key === 'F11') {
      event.preventDefault();
      // You could send a message to main process to toggle fullscreen
    }
    
    // Escape key handling
    if (event.key === 'Escape') {
      event.preventDefault();
      // Handle escape key if needed
    }
  });
});

// Define interface for global object
interface SyndrDBTester {
  version: string;
  ready: boolean;
}

// Example: Expose some utilities globally if needed
(window as any).syndrDBTester = {
  version: '1.0.0',
  ready: true
};