import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Prevent custom element conflicts by adding error handling
const originalDefine = window.customElements?.define;
if (originalDefine) {
  window.customElements.define = function(name: string, constructor: any, options?: any) {
    if (!window.customElements.get(name)) {
      originalDefine.call(window.customElements, name, constructor, options);
    } else {
      console.warn(`Custom element '${name}' already defined, skipping redefinition`);
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)