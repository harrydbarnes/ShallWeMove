/** Read the listing already open in the user's tab, without fetching a portal server. */
const extractListingJs = `
  var host = location.hostname.toLowerCase();
  var data = null;
  if (/(^|\\.)rightmove\\.co\\.uk$/.test(host) && /\\/properties\\/\\d+/.test(location.pathname)) {
    if (window.PAGE_MODEL && window.PAGE_MODEL.propertyData) data = window.PAGE_MODEL.propertyData;
    if (!data) {
      var scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (var i = 0; i < scripts.length; i++) {
        try {
          var candidate = JSON.parse(scripts[i].textContent || '');
          if (candidate['@type'] || candidate['@graph']) { data = candidate; break; }
        } catch (e) {}
      }
    }
  } else if (/(^|\\.)zoopla\\.co\\.uk$/.test(host) && /\\/for-sale\\/details\\/\\d+/.test(location.pathname)) {
    var heading = document.querySelector('h1');
    var main = document.querySelector('main');
    var content = main || document.body;
    var text = content.innerText || content.textContent || '';
    if (heading && /\\bbed(?:room)?\\b.*\\bfor sale\\b/i.test(heading.innerText || heading.textContent || '')) {
      data = {
        kind: 'shall-we-move-zoopla',
        url: location.href.split('#')[0],
        heading: (heading.innerText || heading.textContent || '').trim(),
        text: text.slice(0, 50000)
      };
    }
  }
  if (!data) {
    alert('Shall We Move: Open an individual Rightmove or Zoopla for-sale listing, then try again.');
    return;
  }
`;

function bookmarklet(rawJs: string): string {
  return `javascript:${encodeURIComponent(rawJs.replace(/\s+/g, ' '))}`;
}

export function generateBookmarkletJs(_targetAppUrl?: string): string {
  return bookmarklet(`(function() { try { ${extractListingJs}
    var payload = JSON.stringify(data);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(payload).then(function() {
        alert('Listing copied. Return to Shall We Move and paste it into Add a listing.');
      }).catch(function() { prompt('Copy this listing data:', payload); });
    } else {
      prompt('Copy this listing data:', payload);
    }
  } catch (err) { alert('Shall We Move: ' + err.message); } })();`);
}

export function generateDirectTransferBookmarkletJs(appBaseUrl: string): string {
  return bookmarklet(`(function() { try { ${extractListingJs}
    window.open(${JSON.stringify(appBaseUrl)} + '#data=' + encodeURIComponent(JSON.stringify(data)), '_blank');
  } catch (err) { alert('Shall We Move: ' + err.message); } })();`);
}
