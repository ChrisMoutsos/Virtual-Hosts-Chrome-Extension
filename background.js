var settings = {
      rows: [],
    },
    requestFilter = {urls: ["<all_urls>"]},
    onBeforeSendHeadersHandler = function(details) {
      var targetSettings = getTargetSettings(details, 'ip');
      if (targetSettings) {
        details.requestHeaders.push({ name: "Host", value: targetSettings.domain });
        return {requestHeaders: details.requestHeaders};
      }
    },
    onBeforeRequestHandler = function(details) {
      var targetSettings = getTargetSettings(details);
      if (targetSettings) {
        return { redirectUrl: details.url.replace(targetSettings.domain, targetSettings.ip) };
      }
    };

function getTargetSettings(details, settingsKey) {
  settingsKey = settingsKey || 'domain';
  var targetSettings = null;
  if (settings.rows) {
    for (var i = 0; i < settings.rows.length; i++) {
      var row = settings.rows[i];
      if (row.enabled && row.domain && row.ip && (details.url.indexOf(row[settingsKey]) > -1)) {
        targetSettings = row;
        break;
      }
    }
  }
  return targetSettings;
}

chrome.storage.sync.get(settings, function(result) {
  if (result.rows) {
    settings.rows = result.rows;
  }
});

chrome.webRequest.onBeforeRequest.addListener(onBeforeRequestHandler, requestFilter, ["blocking"]);
chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersHandler, requestFilter, ["blocking", "requestHeaders"]);

// update icon based on whether or not this tab is using vhost
var updateIcons = function() {
  var rows = settings.rows;
  var enabled = false;
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
    var url = tabs[0].url;

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      //if (row.enabled) {
        if (url.includes(row.ip)) {
          enabled = true;
          break;
        }
      //}
    }
 
    chrome.browserAction.setIcon({path: enabled ? 'enabled.png' : 'disabled.png'});
  });
 
};
 
chrome.tabs.onActivated.addListener(function(activeInfo) {
  updateIcons();
});
 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  updateIcons();
});

