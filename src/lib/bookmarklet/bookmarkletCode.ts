/**
 * Bookmarklet generator for Rightmove.
 * Extracts window.PAGE_MODEL (or JSON-LD / DOM) directly from the user's browser tab.
 */

export function generateBookmarkletJs(targetAppUrl?: string): string {
  // Pure JavaScript that executes in the context of rightmove.co.uk/properties/*
  const appUrl = targetAppUrl || 'https://shall-we-move.app';

  const rawJs = `
(function() {
  try {
    var data = null;
    if (typeof window.PAGE_MODEL !== 'undefined' && window.PAGE_MODEL && window.PAGE_MODEL.propertyData) {
      data = window.PAGE_MODEL.propertyData;
    } else {
      var ld = document.querySelector('script[type="application/ld+json"]');
      if (ld) {
        try {
          data = JSON.parse(ld.textContent);
        } catch(e) {}
      }
    }

    if (!data) {
      alert('Shall We Move: Could not detect property data on this page. Please ensure you are viewing a Rightmove listing page.');
      return;
    }

    var payload = JSON.stringify(data);
    
    // Attempt to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(payload).then(function() {
        showToast('Property data copied to clipboard! Paste it into "Shall We Move?"');
      }).catch(function() {
        promptCopy(payload);
      });
    } else {
      promptCopy(payload);
    }

    function showToast(msg) {
      var toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.backgroundColor = '#15803d';
      toast.style.color = '#ffffff';
      toast.style.padding = '14px 22px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      toast.style.zIndex = '999999';
      toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      toast.style.fontSize = '14px';
      toast.style.fontWeight = 'bold';
      toast.innerText = msg;
      document.body.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 4000);
    }

    function promptCopy(text) {
      prompt('Copy this listing JSON and paste into Shall We Move:', text);
    }

  } catch (err) {
    alert('Shall We Move error: ' + err.message);
  }
})();
  `.trim();

  // Return minified javascript: URL
  const minified = rawJs.replace(/\s+/g, ' ');
  return `javascript:${encodeURIComponent(minified)}`;
}

export function generateDirectTransferBookmarkletJs(appBaseUrl: string): string {
  const rawJs = `
(function() {
  try {
    var data = null;
    if (typeof window.PAGE_MODEL !== 'undefined' && window.PAGE_MODEL && window.PAGE_MODEL.propertyData) {
      data = window.PAGE_MODEL.propertyData;
    } else {
      var ld = document.querySelector('script[type="application/ld+json"]');
      if (ld) {
        try { data = JSON.parse(ld.textContent); } catch(e) {}
      }
    }

    if (!data) {
      alert('Shall We Move: Could not detect property data. Are you on a Rightmove property page?');
      return;
    }

    var encoded = encodeURIComponent(JSON.stringify(data));
    var targetUrl = '${appBaseUrl}#data=' + encoded;
    window.open(targetUrl, '_blank');
  } catch (err) {
    alert('Shall We Move error: ' + err.message);
  }
})();
  `.trim();

  const minified = rawJs.replace(/\s+/g, ' ');
  return `javascript:${encodeURIComponent(minified)}`;
}
