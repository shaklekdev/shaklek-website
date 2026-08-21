import sharp from "../../node_modules/sharp/dist/index.cjs";

// Geometric measurement of a trouser photo. The pants combos vary exactly two
// things -- hem height (cropped/ankle/full) and leg width (normal/wide) -- so
// measure those directly instead of inferring "did something change" from a
// pixel diff. A pixel diff cannot tell a real sleeve edit from noise (verified:
// 3.8 vs 3.4), whereas hem position is unambiguous.

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

// Garment = anything clearly darker or more saturated than the studio backdrop.
// Works for navy (dark) and ivory (warm, mildly saturated) alike.
function isGarmentLike(h, s, l) {
  if (l < 0.55) return true;            // dark fabric / shadow
  if (s > 0.12 && l < 0.92) return true; // tinted fabric against near-white wall
  return false;
}

export async function measurePants(path) {
  const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const rowCounts = new Array(height).fill(0);
  const mask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
      if (isGarmentLike(h, s, l)) {
        mask[y * width + x] = 1;
        rowCounts[y]++;
      }
    }
  }

  const minRun = Math.max(6, Math.floor(width * 0.02));

  // Hem = lowest row that still holds a meaningful amount of garment.
  let hemY = 0;
  for (let y = height - 1; y >= 0; y--) {
    if (rowCounts[y] >= minRun) { hemY = y; break; }
  }

  // Leg width sampled just above the hem, where the leg opening is clearest.
  const sampleY = Math.max(0, Math.floor(hemY - height * 0.06));
  let legWidth = 0;
  for (let x = 0; x < width; x++) if (mask[sampleY * width + x]) legWidth++;

  return {
    width,
    height,
    hemFrac: hemY / height,        // 1.0 = hem reaches bottom of frame
    legWidthFrac: legWidth / width, // fraction of frame width occupied by legs
  };
}

if (process.argv[2]) {
  const m = await measurePants(process.argv[2]);
  console.log(
    `${process.argv[2].split("/").pop()}  hem=${m.hemFrac.toFixed(3)}  legW=${m.legWidthFrac.toFixed(3)}`
  );
}
