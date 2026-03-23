const SHEET_ID = "1gmUadSViu7wTz1VwiXco_vG-n1FSBJHEb1DLt0Irm5c";
const SHEET_NAME = "Inventory";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Inventory Manager');
}

function saveData(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

  let lastRow = sheet.getLastRow();
  let slNo = lastRow; // auto serial

  let closingStock = Number(data.opening) + Number(data.received) - Number(data.issued);

  sheet.appendRow([
    slNo,
    data.date,
    data.item,
    data.opening,
    data.received,
    data.issued,
    closingStock
  ]);

  return "Saved Successfully!";
}