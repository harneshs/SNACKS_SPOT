

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";

function getSpreadsheet() {
return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function jsonResponse(data) {
return ContentService
.createTextOutput(JSON.stringify(data))
.setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {

const action = e.parameter.action;

switch (action) {

```
case "getMenu":
  return jsonResponse(getMenu());

case "getSettings":
  return jsonResponse(getSettings());

case "getOrders":
  return jsonResponse(getOrders());

case "getReport":
  return jsonResponse(getSalesReport());

default:
  return jsonResponse({
    success: false,
    message: "Invalid GET Action"
  });
```

}
}

function doPost(e) {

try {

```
const data = JSON.parse(e.postData.contents);

switch (data.action) {

  case "login":
    return jsonResponse(login(data));

  case "addMenu":
    return jsonResponse(addMenu(data));

  case "updateMenu":
    return jsonResponse(updateMenu(data));

  case "deleteMenu":
    return jsonResponse(deleteMenu(data));

  case "saveOrder":
    return jsonResponse(saveOrder(data));

  default:
    return jsonResponse({
      success: false,
      message: "Invalid POST Action"
    });
}
```

} catch (err) {

```
return jsonResponse({
  success: false,
  message: "Invalid Request",
  error: err.toString()
});
```

}
}

function login(data) {

const sheet = getSpreadsheet()
.getSheetByName("Admin");

const rows = sheet
.getDataRange()
.getValues();

for (let i = 1; i < rows.length; i++) {

```
if (
  rows[i][0] === data.username &&
  rows[i][1] === data.password
) {

  return {
    success: true,
    message: "Login Successful"
  };
}
```

}

return {
success: false,
message: "Invalid Username or Password"
};
}

function getMenu() {

const sheet = getSpreadsheet()
.getSheetByName("Menu");

const rows = sheet
.getDataRange()
.getValues();

const menu = [];

for (let i = 1; i < rows.length; i++) {

```
if (rows[i][4] !== "Active") {
  continue;
}

menu.push({
  id: rows[i][0],
  name: rows[i][1],
  price: rows[i][2],
  image: rows[i][3],
  status: rows[i][4]
});
```

}

return {
success: true,
menu: menu
};
}

function getSettings() {

const sheet = getSpreadsheet()
.getSheetByName("Settings");

const rows = sheet
.getDataRange()
.getValues();

const settings = {};

for (let i = 1; i < rows.length; i++) {
settings[rows[i][0]] = rows[i][1];
}

return {
success: true,
settings: settings
};
}

function addMenu(data) {

if (!data.name || Number(data.price) <= 0) {

```
return {
  success: false,
  message: "Invalid Menu Data"
};
```

}

const sheet = getSpreadsheet()
.getSheetByName("Menu");

const id = new Date().getTime();

sheet.appendRow([
id,
data.name,
data.price,
data.image || "",
"Active"
]);

return {
success: true,
message: "Menu Added"
};
}

function updateMenu(data) {

const sheet = getSpreadsheet()
.getSheetByName("Menu");

const rows = sheet
.getDataRange()
.getValues();

for (let i = 1; i < rows.length; i++) {

```
if (String(rows[i][0]) === String(data.id)) {

  sheet.getRange(i + 1, 2).setValue(data.name);
  sheet.getRange(i + 1, 3).setValue(data.price);
  sheet.getRange(i + 1, 4).setValue(data.image || "");

  return {
    success: true,
    message: "Menu Updated"
  };
}
```

}

return {
success: false,
message: "Item Not Found"
};
}

function deleteMenu(data) {

const sheet = getSpreadsheet()
.getSheetByName("Menu");

const rows = sheet
.getDataRange()
.getValues();

for (let i = 1; i < rows.length; i++) {

```
if (String(rows[i][0]) === String(data.id)) {

  sheet.deleteRow(i + 1);

  return {
    success: true,
    message: "Menu Deleted"
  };
}
```

}

return {
success: false,
message: "Item Not Found"
};
}

function saveOrder(data) {

if (!data.items || data.items.length === 0) {

```
return {
  success: false,
  message: "No Items In Order"
};
```

}

const sheet = getSpreadsheet()
.getSheetByName("Orders");

const orderId =
"ORD" + new Date().getTime();

sheet.appendRow([
orderId,
new Date(),
JSON.stringify(data.items),
Number(data.total)
]);

return {
success: true,
orderId: orderId
};
}

function getOrders() {

const sheet = getSpreadsheet()
.getSheetByName("Orders");

const rows = sheet
.getDataRange()
.getValues();

const orders = [];

for (let i = 1; i < rows.length; i++) {

```
orders.push({
  orderId: rows[i][0],
  date: rows[i][1],
  items: rows[i][2],
  total: rows[i][3]
});
```

}

return {
success: true,
orders: orders
};
}

function getSalesReport() {

const sheet = getSpreadsheet()
.getSheetByName("Orders");

const rows = sheet
.getDataRange()
.getValues();

let totalRevenue = 0;

for (let i = 1; i < rows.length; i++) {
totalRevenue += Number(rows[i][3]);
}

return {
success: true,
report: {
totalOrders: rows.length - 1,
totalRevenue: totalRevenue
}
};
}
