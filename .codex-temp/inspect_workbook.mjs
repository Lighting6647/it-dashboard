import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = "C:/Users/Fernclinic/Downloads/IT_Dashboard_Export_2026-09-29.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const sheets = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 8000 });
console.log(sheets.ndjson);
for (const name of ["พนักงานเบิก-คืนอุปกรณ์", "การใช้งานบัญชีบริษัท", "Vendor Contract"]) {
  const detail = await workbook.inspect({ kind: "table", sheetId: name, maxChars: 10000, tableMaxRows: 20, tableMaxCols: 24, tableMaxCellChars: 100 });
  console.log(detail.ndjson);
}
const preview = await workbook.render({ sheetName: "พนักงานเบิก-คืนอุปกรณ์", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile("D:/All Ai/แดชบอร์ด/.codex-temp/movement-before.png", new Uint8Array(await preview.arrayBuffer()));
