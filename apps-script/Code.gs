/**
 * Financial Tracker — dashboard data backend.
 *
 * Bind this script to a blank Google Sheet (Extensions → Apps Script from
 * within the sheet). It creates whatever tabs it needs the first time data
 * is posted to it, so you don't need to pre-build any tabs by hand.
 *
 * doGet  → returns the current dashboard dataset as JSON (what the GitHub
 *          Pages dashboard fetches on load).
 * doPost → accepts a full dataset replacement, gated by a shared secret so
 *          random requests to this URL can't overwrite your data. Claude
 *          calls this each time the workbook is refreshed.
 *
 * One-time setup:
 *   1. Project Settings (gear icon) → Script Properties → add a property
 *      named WRITE_SECRET with a value only you and Claude know.
 *   2. Deploy → New deployment → type "Web app" → Execute as "Me",
 *      Who has access "Anyone" → Deploy.
 *   3. Copy the resulting /exec URL and give it back to Claude, along with
 *      the WRITE_SECRET value (Claude needs the secret to push updates —
 *      it's an app-level key for this one script, not an account password).
 */

var SHEET_NAMES = {
  meta: 'Meta',
  kpis: 'KPIs',
  cashflow: 'CashFlowMonthly',
  categories: 'Categories',
  debtLatitude: 'DebtLatitude',
  debtCar: 'DebtCar',
  negativeEvents: 'NegativeBalanceEvents',
  findings: 'Findings'
};

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var payload = {
    meta: readKeyValueSheet_(ss, SHEET_NAMES.meta),
    kpis: readKeyValueSheet_(ss, SHEET_NAMES.kpis),
    cashflow: readTableSheet_(ss, SHEET_NAMES.cashflow),
    categories: readTableSheet_(ss, SHEET_NAMES.categories),
    debtLatitude: readTableSheet_(ss, SHEET_NAMES.debtLatitude),
    debtCar: readTableSheet_(ss, SHEET_NAMES.debtCar),
    negativeEvents: readTableSheet_(ss, SHEET_NAMES.negativeEvents),
    findings: readTableSheet_(ss, SHEET_NAMES.findings)
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('WRITE_SECRET');
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonError_('Invalid JSON body');
  }

  if (!secret || body.secret !== secret) {
    return jsonError_('Unauthorized');
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = body.data || {};

  if (data.meta) writeKeyValueSheet_(ss, SHEET_NAMES.meta, data.meta);
  if (data.kpis) writeKeyValueSheet_(ss, SHEET_NAMES.kpis, data.kpis);
  if (data.cashflow) writeTableSheet_(ss, SHEET_NAMES.cashflow, data.cashflow);
  if (data.categories) writeTableSheet_(ss, SHEET_NAMES.categories, data.categories);
  if (data.debtLatitude) writeTableSheet_(ss, SHEET_NAMES.debtLatitude, data.debtLatitude);
  if (data.debtCar) writeTableSheet_(ss, SHEET_NAMES.debtCar, data.debtCar);
  if (data.negativeEvents) writeTableSheet_(ss, SHEET_NAMES.negativeEvents, data.negativeEvents);
  if (data.findings) writeTableSheet_(ss, SHEET_NAMES.findings, data.findings);

  return ContentService.createTextOutput(JSON.stringify({ ok: true, updatedAt: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError_(message) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- table sheets: array of objects -> header row + data rows, and back ----

function getOrCreateSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function writeTableSheet_(ss, name, rows) {
  var sheet = getOrCreateSheet_(ss, name);
  sheet.clearContents();
  if (!rows || rows.length === 0) return;
  var headers = Object.keys(rows[0]);
  var values = [headers];
  rows.forEach(function (row) {
    values.push(headers.map(function (h) { return row[h] === undefined ? '' : row[h]; }));
  });
  sheet.getRange(1, 1, values.length, headers.length).setValues(values);
}

function readTableSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  return values.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

// ---- key/value sheets: flat object -> two columns, and back ----

function writeKeyValueSheet_(ss, name, obj) {
  var sheet = getOrCreateSheet_(ss, name);
  sheet.clearContents();
  var rows = Object.keys(obj).map(function (k) { return [k, obj[k]]; });
  if (rows.length === 0) return;
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
}

function readKeyValueSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return {};
  var values = sheet.getDataRange().getValues();
  var obj = {};
  values.forEach(function (row) {
    if (row[0] !== '') obj[row[0]] = row[1];
  });
  return obj;
}
