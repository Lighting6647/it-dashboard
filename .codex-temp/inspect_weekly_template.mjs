import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const file = "C:/Users/Fernclinic/Desktop/weekly-it-data-report-new.xlsx";
const outDir = "D:/All Ai/แดชบอร์ด/.codex-temp/weekly-template";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
await fs.mkdir(outDir, { recursive: true });
console.log((await wb.inspect({ kind: "sheet", include: "id,name", maxChars: 12000 })).ndjson);
console.log((await wb.inspect({ kind: "workbook,table,drawing", maxChars: 24000, tableMaxRows: 18, tableMaxCols: 24, tableMaxCellChars: 100 })).ndjson);
console.log((await wb.inspect({ kind: "formula", maxChars: 16000, options: { maxResults: 300 } })).ndjson);
const sheets = (await wb.inspect({ kind: "sheet", include: "id,name", maxChars: 12000 })).ndjson.split("\n").filter(Boolean).map(line => JSON.parse(line).name);
for (const name of sheets) {
  const image = await wb.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`${outDir}/${name.replace(/[\\/:*?\"<>|]/g, "_")}.png`, new Uint8Array(await image.arrayBuffer()));
}
