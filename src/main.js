// ============================================================================
// CYBERNET // VITE APPLICATION ENTRY POINT
// ============================================================================

import './styles/main.css';
import { CyberNetApp } from './scripts/app.js';

// Initialize CyberNet App
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cyberApp = new CyberNetApp();
  });
} else {
  window.cyberApp = new CyberNetApp();
}
