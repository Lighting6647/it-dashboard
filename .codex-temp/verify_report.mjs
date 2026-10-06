import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const file = "D:/All Ai/แดชบอร์ด/outputs/20260929-checklist-report/IT_Dashboard_Export_2026-09-29_ปรับตามระบบ.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
console.log((await wb.inspect({ kind: "sheet", include: "id,name", maxChars: 8000 })).ndjson);
for (const name of ["Dashboard", "พนักงานเบิก-คืนอุปกรณ์", "Checklist พนักงานเข้า-ออก", "Asset Return", "Incident"]) {
  console.log((await wb.inspect({ kind: "table", sheetId: name, maxChars: 3000, tableMaxRows: 4, tableMaxCols: 15 })).ndjson);
}
console.log((await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 300 }, summary: "saved workbook formula error scan" })).ndjson);
