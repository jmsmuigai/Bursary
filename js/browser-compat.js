// Browser Compatibility Layer for Garissa Bursary System
// Ensures cross-browser compatibility for all modern browsers

(function() {
  'use strict';
  
  // Polyfills and compatibility fixes
  
  // Ensure localStorage is available
  if (typeof Storage === 'undefined') {
    console.error('localStorage is not supported in this browser');
    alert('Your browser does not support localStorage. Please use a modern browser.');
  }
  
  // Polyfill for Object.values (for older browsers)
  if (!Object.values) {
    Object.values = function(obj) {
      return Object.keys(obj).map(function(key) {
        return obj[key];
      });
    };
  }
  
  // Polyfill for Array.includes (for older browsers)
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {
      return this.indexOf(searchElement, fromIndex) !== -1;
    };
  }
  
  // Polyfill for String.padStart (for older browsers)
  if (!String.prototype.padStart) {
    String.prototype.padStart = function(targetLength, padString) {
      targetLength = targetLength >> 0;
      padString = String(typeof padString !== 'undefined' ? padString : ' ');
      if (this.length > targetLength) {
        return String(this);
      } else {
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length);
        }
        return padString.slice(0, targetLength) + String(this);
      }
    };
  }
  
  // Ensure FormData is available
  if (typeof FormData === 'undefined') {
    console.warn('FormData not available - using fallback');
    window.FormData = function() {
      this.data = {};
      this.append = function(key, value) {
        this.data[key] = value;
      };
      this.entries = function() {
        const entries = [];
        for (let key in this.data) {
          entries.push([key, this.data[key]]);
        }
        return entries;
      };
    };
  }
  
  // Ensure URL.createObjectURL is available
  if (!window.URL || !window.URL.createObjectURL) {
    window.URL = window.URL || {};
    window.URL.createObjectURL = function(blob) {
      if (window.webkitURL) {
        return window.webkitURL.createObjectURL(blob);
      }
      return null;
    };
    window.URL.revokeObjectURL = function(url) {
      if (window.webkitURL) {
        window.webkitURL.revokeObjectURL(url);
      }
    };
  }
  
  // Ensure Bootstrap Modal is available
  if (typeof bootstrap === 'undefined' && typeof Bootstrap !== 'undefined') {
    window.bootstrap = Bootstrap;
  }
  
  // Fix for Safari and older browsers
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                 Element.prototype.webkitMatchesSelector;
  }
  
  // Fix for addEventListener in older IE
  if (!Element.prototype.addEventListener && Element.prototype.attachEvent) {
    Element.prototype.addEventListener = function(type, listener) {
      this.attachEvent('on' + type, listener);
    };
  }
  
  // Ensure console methods exist
  if (!window.console) {
    window.console = {
      log: function() {},
      error: function() {},
      warn: function() {},
      info: function() {}
    };
  }
  
  console.log('✅ Browser compatibility layer loaded');
})();

