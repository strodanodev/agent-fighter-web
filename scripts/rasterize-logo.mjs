import fs from "fs";
import sharp from "sharp";

const svgPath = "public/assets/logo/main_logo_AF.svg";
const titleSvg = "public/assets/logo/main_title_AF.svg";

async function rasterize(svgFile, outBase, size) {
  const svg = fs.readFileSync(svgFile);
  const pngOut = `${outBase}.png`;
  const webpOut = `${outBase}.webp`;

  await sharp(svg, { density: 144 })
    .resize(size, size, { fit: "inside", withoutEnlargement: false })
    .png()
    .toFile(pngOut);

  const meta = await sharp(pngOut).metadata();
  console.log(pngOut, `${meta.width}x${meta.height}`, fs.statSync(pngOut).size);

  await sharp(pngOut)
    .webp({ quality: 90, effort: 4, alphaQuality: 90 })
    .toFile(webpOut);
  console.log(webpOut, fs.statSync(webpOut).size);

  // sample corner/center pixels to verify it's not empty/black
  const { data, info } = await sharp(pngOut)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let nonBlack = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 20 || data[i + 1] > 20 || data[i + 2] > 20 || data[i + 3] > 10) {
      nonBlack++;
    }
  }
  console.log(
    "nonBlack-ish pixels",
    nonBlack,
    "of",
    info.width * info.height,
    `(${((100 * nonBlack) / (info.width * info.height)).toFixed(1)}%)`,
  );
}

const hasSharpSvg = true;
try {
  await rasterize(svgPath, "public/assets/logo/main_logo_AF", 1024);
  await sharp("public/assets/logo/main_logo_AF.png")
    .resize(192, 192, { fit: "inside" })
    .webp({ quality: 85 })
    .toFile("public/assets/logo/main_logo_AF_sm.webp");
  console.log("sm", fs.statSync("public/assets/logo/main_logo_AF_sm.webp").size);

  if (fs.existsSync(titleSvg)) {
    await rasterize(titleSvg, "public/assets/logo/main_title_AF", 1200);
  }
} catch (e) {
  console.error("rasterize failed:", e);
  process.exit(1);
}
