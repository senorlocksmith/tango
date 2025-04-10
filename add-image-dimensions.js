const fs = require("fs");
const path = require("path");
const { imageSize } = require("image-size");

const htmlFile = "index.html"; // or another HTML file
let html = fs.readFileSync(htmlFile, "utf-8");

html = html.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (match, before, src, after) => {
  const cleanedSrc = src.replace(/^\.?\//, "").replace(/^\/+/, "");

  const possiblePaths = [
    path.join(__dirname, cleanedSrc),
    path.join(__dirname, "images", path.basename(cleanedSrc)),
    path.join(__dirname, "img", path.basename(cleanedSrc)),
  ];

  let imagePath = possiblePaths.find(p => fs.existsSync(p));
  if (!imagePath) {
    console.warn(`⚠️  Skipped (not found): ${src}`);
    return match;
  }

  try {
    const buffer = fs.readFileSync(imagePath);
    const { width, height } = imageSize(buffer);

    let updated = `<img${before}src="${src}"${after}`;
    if (!/width\s*=/.test(match)) updated += ` width="${width}"`;
    if (!/height\s*=/.test(match)) updated += ` height="${height}"`;
    if (!/loading\s*=\s*["']lazy["']/.test(match)) updated += ` loading="lazy"`;
    updated += ">";
    return updated;
  } catch (err) {
    console.warn(`⚠️  Skipped (error reading image): ${src} — ${err.message}`);
    return match;
  }
});

fs.writeFileSync(htmlFile, html);
console.log("✅ Dimensions and lazy loading added successfully!");
