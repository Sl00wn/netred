// ============================================================================
// NETRED // APPLICATION ENTRY POINT
// ============================================================================

import { CyberNetApp } from './scripts/app.js';

// Initialize NetRed App
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cyberApp = new CyberNetApp();
  });
} else {
  window.cyberApp = new CyberNetApp();
}
