import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));

const codes = [
  {
    url: "https://github.com/rtbenfield/talks-carolina-codes-2026",
    file: "qrcode_github.png",
  },
  {
    url: "https://tylerbenfield.dev/links",
    file: "qrcode_tylerbenfield.dev.png",
  },
];

for (const { url, file } of codes) {
  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 450,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  await writeFile(join(publicDir, file), buffer);
  console.log(`Generated ${file} for ${url}`);
}
