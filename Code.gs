const SHEET_ID = "1gmUadSViu7wTz1VwiXco_vG-n1FSBJHEb1DLt0Irm5c";
const SHEET_NAME = "Inventory";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Inventory Manager');
}

// 🔹 SAVE / UPDATE DATA
function saveData(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const allData = sheet.getDataRange().getValues();

  function cleanText(text) {
    return text.toString()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  let inputItem = cleanText(data.item);
  let foundRow = -1;

  // 🔍 SEARCH ITEM
  for (let i = 1; i < allData.length; i++) {
    let sheetItem = allData[i][2];

    if (sheetItem) {
      let cleaned = cleanText(sheetItem);

      if (cleaned === inputItem) {
        foundRow = i + 1;
        break;
      }
    }
  }

  let opening = Number(data.opening) || 0;
  let received = Number(data.received) || 0;
  let issued = Number(data.issued) || 0;

  // ✅ UPDATE EXISTING ITEM
  if (foundRow !== -1) {

    let prevClosing = Number(sheet.getRange(foundRow, 7).getValue()) || 0;
    let prevReceived = Number(sheet.getRange(foundRow, 5).getValue()) || 0;
    let prevIssued = Number(sheet.getRange(foundRow, 6).getValue()) || 0;

    let newReceived = prevReceived + received;
    let newIssued = prevIssued + issued;
    let newClosing = prevClosing + received - issued;

    sheet.getRange(foundRow, 5).setValue(newReceived);
    sheet.getRange(foundRow, 6).setValue(newIssued);
    sheet.getRange(foundRow, 7).setValue(newClosing);

    // 🔥 RETURN FULL ROW DATA
    return [
      "UPDATED",
      foundRow,
      data.date,
      data.item,
      opening,
      newReceived,
      newIssued,
      newClosing
    ];
  }

  // ✅ ADD NEW ITEM
  else {
    let lastRow = sheet.getLastRow();
    let slNo = lastRow; // serial number

    let closingStock = opening + received - issued;

    sheet.appendRow([
      slNo,
      data.date,
      data.item,
      opening,
      received,
      issued,
      closingStock
    ]);

    // 🔥 RETURN FULL ROW DATA
    return [
      "NEW",
      slNo,
      data.date,
      data.item,
      opening,
      received,
      issued,
      closingStock
    ];
  }
}

// 🗑 DELETE ITEM
function deleteItem(itemName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const allData = sheet.getDataRange().getValues();

  function cleanText(text) {
    return text.toString()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  let inputItem = cleanText(itemName);
  let foundRow = -1;

  // 🔍 SEARCH ITEM
  for (let i = 1; i < allData.length; i++) {
    let sheetItem = allData[i][2];

    if (sheetItem) {
      let cleaned = cleanText(sheetItem);

      if (cleaned === inputItem) {
        foundRow = i + 1;
        break;
      }
    }
  }

  // ❌ NOT FOUND
  if (foundRow === -1) {
    return ["NOT_FOUND", itemName];
  }

  // 🗑 DELETE ROW
  sheet.deleteRow(foundRow);

  let data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
       data[i][0] = i;                   /*updating sheet sl no*/
     }

  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);  
  return ["DELETED", itemName];
}
