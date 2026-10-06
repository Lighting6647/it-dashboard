import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = "C:/Users/Fernclinic/Downloads/IT_Dashboard_Export_2026-09-29.xlsx";
const outputDir = "D:/All Ai/แดชบอร์ด/outputs/20260929-checklist-report";
const outputPath = `${outputDir}/IT_Dashboard_Export_2026-09-29_ปรับตามระบบ.xlsx`;
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const movement = wb.worksheets.getItem("พนักงานเบิก-คืนอุปกรณ์");
const used = movement.getUsedRange(true);
const sourceRows = used.values;
const headers = [...sourceRows[0], "ประเภทการดำเนินการ"];

const classify = (row) => {
  const text = [row[5], row[13]].map(v => String(v || "").toLowerCase()).join(" ");
  if (/ลาออก|ออกจากงาน|พ้นสภาพ/.test(text)) return "ลาออก";
  if (/เปลี่ยน|เปลื่ยน|เครื่องก่อนหน้า|ทดแทนเครื่อง/.test(text)) return "เปลี่ยนอุปกรณ์";
  return "เบิก";
};

const rows = sourceRows.slice(1).filter(row => row.some(v => v !== null && v !== "")).map(row => [...row, classify(row)]);
movement.getRange(`O1:O${rows.length + 1}`).values = [["ประเภทการดำเนินการ"], ...rows.map(row => [row[14]])];
movement.getRange("O1").copyFrom(movement.getRange("N1"), "formats");
if (rows.length) movement.getRange(`O2:O${rows.length + 1}`).copyFrom(movement.getRange(`N2:N${rows.length + 1}`), "formats");
movement.getRange("O1").values = [["ประเภทการดำเนินการ"]];
if (rows.length) movement.getRange(`O2:O${rows.length + 1}`).values = rows.map(row => [row[14]]);
movement.getRange(`O1:O${rows.length + 1}`).format.columnWidth = 19;

const returnedStatuses = new Set(["รอ IT ตรวจรับ", "คืนแล้ว"]);
const checklistRows = rows;
const returnRows = rows.filter(row => returnedStatuses.has(String(row[11] || "")) || row[9]);
const incidentRows = rows.filter(row => row[14] === "เปลี่ยนอุปกรณ์" || ["ชำรุด", "สูญหาย"].includes(String(row[10] || "")));

const sheetNames = ["Checklist พนักงานเข้า-ออก", "Asset Return", "Incident"];

const addReportSheet = (name, dataRows, tabColor) => {
  const sheet = wb.worksheets.add(name);
  const matrix = [headers, ...dataRows];
  sheet.getRange("A1").write(matrix);
  const endRow = Math.max(matrix.length, 1);
  sheet.getRange(`A1:O${endRow}`).format.font = { name: "Arial", size: 10, color: "#1F2937" };
  sheet.getRange("A1:O1").format = {
    fill: "#1E3A5F",
    font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#D9E2F3" },
  };
  if (dataRows.length) {
    sheet.getRange(`A2:O${endRow}`).format.verticalAlignment = "center";
    sheet.getRange(`A2:O${endRow}`).format.borders = { preset: "inside", style: "thin", color: "#E5E7EB" };
  }
  sheet.getRange(`G2:J${endRow}`).setNumberFormat("yyyy-mm-dd");
  sheet.getRange(`A1:A${endRow}`).format.columnWidth = 11;
  sheet.getRange(`B1:C${endRow}`).format.columnWidth = 23;
  sheet.getRange(`D1:E${endRow}`).format.columnWidth = 19;
  sheet.getRange(`F1:F${endRow}`).format.columnWidth = 32;
  sheet.getRange(`G1:J${endRow}`).format.columnWidth = 14;
  sheet.getRange(`K1:M${endRow}`).format.columnWidth = 16;
  sheet.getRange(`N1:N${endRow}`).format.columnWidth = 36;
  sheet.getRange(`O1:O${endRow}`).format.columnWidth = 19;
  sheet.freezePanes.freezeRows(1);
  sheet.showGridLines = false;
  sheet.tabColor = tabColor;
  return sheet;
};

addReportSheet("Checklist พนักงานเข้า-ออก", checklistRows, "#2563EB");
addReportSheet("Asset Return", returnRows, "#0F766E");
addReportSheet("Incident", incidentRows, "#DC2626");

const dashboard = wb.worksheets.getItem("Dashboard");
dashboard.getRange("AB1:AD1").values = [["Checklist พนักงานเข้า-ออก", "Asset Return", "Incident"]];
dashboard.getRange("AB1:AD1").copyFrom(dashboard.getRange("Y1:AA1"), "formats");
dashboard.getRange("AB1:AD1").values = [["Checklist พนักงานเข้า-ออก", "Asset Return", "Incident"]];
const countsByMonth = new Map();
for (const row of rows) {
  const rawDate = row[6];
  const dateText = rawDate instanceof Date ? rawDate.toISOString().slice(0, 7) : String(rawDate || "").slice(0, 7);
  if (!dateText) continue;
  const current = countsByMonth.get(dateText) || { checklist: 0, returns: 0, incident: 0 };
  current.checklist += 1;
  if (returnedStatuses.has(String(row[11] || "")) || row[9]) current.returns += 1;
  if (row[14] === "เปลี่ยนอุปกรณ์" || ["ชำรุด", "สูญหาย"].includes(String(row[10] || ""))) current.incident += 1;
  countsByMonth.set(dateText, current);
}
const dashRows = dashboard.getUsedRange(true).values;
const countValues = dashRows.slice(1).map(row => {
  const c = countsByMonth.get(String(row[1] || "")) || { checklist: 0, returns: 0, incident: 0 };
  return [c.checklist, c.returns, c.incident];
});
if (countValues.length) {
  dashboard.getRange(`AB2:AD${countValues.length + 1}`).values = countValues;
  dashboard.getRange(`AB2:AD${countValues.length + 1}`).copyFrom(dashboard.getRange(`Y2:AA${countValues.length + 1}`), "formats");
  dashboard.getRange(`AB2:AD${countValues.length + 1}`).values = countValues;
  dashboard.getRange(`AB2:AD${countValues.length + 1}`).setNumberFormat("#,##0");
}
dashboard.getRange(`AB1:AD${countValues.length + 1}`).format.columnWidth = 20;

wb.recalculate();
const errorScan = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
console.log(errorScan.ndjson);
for (const name of ["Dashboard", "พนักงานเบิก-คืนอุปกรณ์", ...sheetNames]) {
  const preview = await wb.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(`${outputDir}/${name.replace(/[\\/:*?\"<>|]/g, "_")}.png`, new Uint8Array(await preview.arrayBuffer()));
}
await fs.mkdir(outputDir, { recursive: true });
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
console.log(JSON.stringify({ outputPath, counts: { checklist: checklistRows.length, returns: returnRows.length, incidents: incidentRows.length } }));
