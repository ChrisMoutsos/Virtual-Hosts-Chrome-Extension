var background,
    appendRowButton,
    tbody;

var loadHandler = function() {
  appendRowButton = document.querySelector('#appendRow');
  tbody = document.querySelector('#table tbody');
  background = chrome.extension.getBackgroundPage();
  appendRowButton.addEventListener("click", appendRow, false);

  updateRows();
  updateIcons();
};

var updateRows = function() {
  var rows = background.settings.rows;
  if (rows) {
    rows.forEach(function(row) {
      appendRow(null, row)
    });
  }
};

var appendRow = function(event, settings) {
  var row = document.createElement("tr");
  row.innerHTML = '<td><input type="checkbox" class="enabled"></td><td><input type="text" class="domain" placeholder="dev.yourhost.com"></td><td><input class="ip" type="text" placeholder="127.0.0.1"></td><td><button type="button">Delete</button></td>';
  var deleteButton = row.querySelector('button');
  var enabled = row.querySelector('.enabled');
  var domain = row.querySelector('.domain');
  var ip = row.querySelector('.ip');

  if (settings) {
    domain.value = settings.domain;
    ip.value = settings.ip;
    enabled.checked = settings.enabled;
  }

  domain.addEventListener("keyup", updateHandler, false);
  ip.addEventListener("keyup", updateHandler, false);
  enabled.addEventListener("change", updateHandler, false);

  deleteButton.addEventListener('click', function() {
    tbody.removeChild(row);
    updateHandler();
  }, false);

  tbody.appendChild(row);
};

var updateIcons = function() {
  var rows = background.settings.rows;
  var hasVirtual = false;
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (row.enabled) {
      hasVirtual = true;
      break;
    }
  }
  chrome.browserAction.setIcon({path: hasVirtual ? 'enabled.png' : 'disabled.png'});
};

var updateHandler = function(e)
{
  var rows = tbody.getElementsByTagName('tr');
  var rowsSettings = [];
  if (rows) {
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var domain = row.querySelector('.domain');
      var ip = row.querySelector('.ip');
      var enabled = row.querySelector('.enabled');
      var settings = {
        'domain': domain.value,
        'ip': ip.value,
        'enabled': enabled.checked
      };
      rowsSettings.push(settings)
    };
  }
  background.settings.rows = rowsSettings;
  var persist = {
    rows: rowsSettings
  };

  updateIcons();

  // persist settings
  chrome.storage.sync.set(persist);
};

// init
document.addEventListener('DOMContentLoaded', loadHandler);
