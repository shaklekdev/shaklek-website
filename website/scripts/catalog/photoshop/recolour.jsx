// Step 3: every colourway, from the masks she corrected.
//
// Run from Photoshop: File > Scripts > Browse... and pick this file.
// Reads ~/Shaklek-colourways/*.psd, writes ~/Shaklek-colourways/out/*.jpg.
//
// For each PSD it loads the "garment" channel as a selection and, INSIDE that
// selection only, applies two adjustments per target colour:
//
//   1. Levels, to move the fabric's luminosity range onto the target's.
//   2. Hue/Saturation with Colorize, to set hue and saturation.
//
// ⚠️ COLORIZE, NOT A HUE ROTATION. Colorize maps the existing LUMINOSITY onto
// one hue, so every fold, crease and thread of the linen survives -- which is
// the entire reason this is a recolour and not a regeneration. A generative
// pass flattened the weave and invented a hem that is not on the garment
// (2026-09-19, "back pictures are a total messs, you only had to recolor wtf").
//
// ⚠️ LEVELS COMES FIRST AND IT IS THE HARD PART. Going light to dark is easy:
// the Buttoned Abaya is ivory and has headroom to lose. Going DARK to LIGHT is
// not -- the Open Abaya is burgundy at l~0.25 and Ivory sits at l~0.94, so
// lifting it four stops amplifies sensor noise and flattens shadow detail. Look
// at the Open Abaya's Ivory and White before trusting the whole batch; if the
// linen goes plastic there, that pair needs a different source, not a different
// slider. Navy from burgundy is a small move and should be clean.

#target photoshop

var WORK = new Folder("~/Shaklek-colourways");
var OUT = new Folder(WORK.fsName + "/out");
if (!OUT.exists) OUT.create();

// Kept in step with src/data/colors.ts. h is 0-360, s and l are 0-100.
// ⚠️ THESE ARE THE SWATCH COLOURS, NOT THE FABRIC'S. A garment photographed
// under studio light never sits exactly on its swatch -- the shipped burgundy
// measures h=353 against a #4a1a2d swatch of h=337. The targets below are
// deliberately the SWATCH values so all four colourways agree with the colour
// dots the customer taps; step 4 measures what actually came out and says so.
var TARGETS = {
  Ivory:    { h:  37, s: 22, l: 94, name: "ivory" },
  White:    { h:   0, s:  0, l: 98, name: "white" },
  Navy:     { h: 205, s: 76, l: 17, name: "navy" },
  Burgundy: { h: 337, s: 47, l: 20, name: "burgundy" }
};

function colorize(h, s, l) {
  var desc = new ActionDescriptor();
  desc.putBoolean(charIDToTypeID("Clrz"), true);
  var list = new ActionList();
  var adj = new ActionDescriptor();
  adj.putInteger(charIDToTypeID("H   "), h > 180 ? h - 360 : h);
  adj.putInteger(charIDToTypeID("Strt"), s);
  adj.putInteger(charIDToTypeID("Lght"), l);
  list.putObject(charIDToTypeID("Hst2"), adj);
  desc.putList(charIDToTypeID("Adjs"), list);
  executeAction(charIDToTypeID("HStr"), desc, DialogModes.NO);
}

function saveJpeg(doc, file) {
  var opts = new JPEGSaveOptions();
  // q92 mozjpeg is the catalogue standard (CLAUDE.md §6 trap 1: the build
  // output has a 230MB cap and PNG blew past it at 291MB). Photoshop's 1-12
  // scale puts 11 at roughly q92.
  opts.quality = 11;
  opts.embedColorProfile = true;
  opts.formatOptions = FormatOptions.STANDARDBASELINE;
  doc.saveAs(file, opts, true, Extension.LOWERCASE);
}

var psds = WORK.getFiles("*.psd");
if (psds.length === 0) {
  alert("No PSDs in " + WORK.fsName + ".\nRun build-psds.jsx first.");
} else {
  var written = 0, noChannel = [];
  var ruler = app.preferences.rulerUnits;
  app.preferences.rulerUnits = Units.PIXELS;
  app.displayDialogs = DialogModes.NO;

  for (var i = 0; i < psds.length; i++) {
    var stem = decodeURI(psds[i].name).replace(/\.psd$/i, "");
    // The source colour is the word already in the filename; that is the one
    // colourway we do NOT regenerate, because it is the photograph.
    var source = null;
    for (var key in TARGETS) {
      if (stem.toLowerCase().indexOf("-" + TARGETS[key].name + "-") !== -1) { source = key; break; }
    }
    if (!source) continue;

    for (var target in TARGETS) {
      if (target === source) continue;

      var doc = app.open(psds[i]);
      doc.flatten();

      var chan = null;
      for (var c = 0; c < doc.channels.length; c++) {
        if (doc.channels[c].name === "garment") { chan = doc.channels[c]; break; }
      }
      if (!chan) {
        noChannel.push(stem);
        doc.close(SaveOptions.DONOTSAVECHANGES);
        break;
      }

      doc.selection.load(chan, SelectionType.REPLACE);
      // A one-pixel feather hides the mask's own staircase without bleeding
      // the new colour onto skin. More than that and the edge goes muddy.
      doc.selection.feather(1);

      var t = TARGETS[target];
      // Levels: pull the fabric toward the target's luminosity before the hue
      // is set, using output range rather than gamma so highlights and shadows
      // move together and the weave keeps its contrast.
      var lo = Math.max(0, Math.round((t.l - 26) * 2.55));
      var hi = Math.min(255, Math.round((t.l + 12) * 2.55));
      doc.activeLayer.adjustLevels(0, 255, 1.0, lo, hi);
      colorize(t.h, t.s, 0);

      doc.selection.deselect();
      var outName = stem.replace("-" + TARGETS[source].name + "-", "-" + t.name + "-") + ".jpg";
      saveJpeg(doc, new File(OUT.fsName + "/" + outName));
      doc.close(SaveOptions.DONOTSAVECHANGES);
      written++;
    }
  }

  app.preferences.rulerUnits = ruler;
  alert(
    "Wrote " + written + " file" + (written === 1 ? "" : "s") + " to\n" + OUT.fsName +
    (noChannel.length ? "\n\nNO \"garment\" CHANNEL, skipped:\n" + noChannel.join("\n") : "")
  );
}
