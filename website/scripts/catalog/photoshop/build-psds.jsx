// Step 2: turn each photograph + candidate mask into a ready-to-edit PSD.
//
// Run from Photoshop: File > Scripts > Browse... and pick this file.
//
// Each PSD opens as the photograph with an alpha channel named "garment"
// already holding the candidate selection. The founder's job is to CORRECT
// that channel -- paint white where the garment is, black where it is not --
// and save. Nothing else in the file matters to the pipeline.
//
// WHY A CHANNEL AND NOT A LAYER MASK: a channel survives Save As PSD with no
// layer structure to preserve, it is what Select > Load Selection reads, and
// step 3 can load it without caring what she did to the layers while working.

#target photoshop

var WORK = new Folder("~/Shaklek-colourways");
if (!WORK.exists) {
  alert("Working folder not found:\n" + WORK.fsName + "\n\nRun prepare-masks.mjs first.");
} else {
  var jpegs = WORK.getFiles("*.jpg");
  var built = 0, skipped = 0;

  for (var i = 0; i < jpegs.length; i++) {
    var jpeg = jpegs[i];
    var stem = decodeURI(jpeg.name).replace(/\.jpg$/i, "");
    if (stem.indexOf("mask-preview") === 0) continue;

    var maskFile = new File(WORK.fsName + "/" + stem + "-mask.png");
    var psdFile = new File(WORK.fsName + "/" + stem + ".psd");

    // Never clobber work already done. A second run after she has masked eight
    // of them must leave those eight alone.
    if (psdFile.exists) { skipped++; continue; }
    if (!maskFile.exists) continue;

    var doc = app.open(jpeg);
    var maskDoc = app.open(maskFile);

    // Copy the mask's greyscale into a new alpha channel on the photograph.
    maskDoc.changeMode(ChangeMode.GRAYSCALE);
    maskDoc.selection.selectAll();
    maskDoc.selection.copy();
    maskDoc.close(SaveOptions.DONOTSAVECHANGES);

    app.activeDocument = doc;
    var chan = doc.channels.add();
    chan.name = "garment";
    chan.kind = ChannelType.MASKEDAREA;
    doc.activeChannels = [chan];
    doc.paste();
    doc.selection.deselect();
    doc.activeChannels = [doc.channels[0], doc.channels[1], doc.channels[2]];

    var opts = new PhotoshopSaveOptions();
    opts.alphaChannels = true;
    opts.layers = true;
    doc.saveAs(psdFile, opts, false, Extension.LOWERCASE);
    doc.close(SaveOptions.DONOTSAVECHANGES);
    built++;
  }

  alert(
    "Built " + built + " PSD" + (built === 1 ? "" : "s") +
    (skipped ? ", left " + skipped + " already-edited file" + (skipped === 1 ? "" : "s") + " alone" : "") +
    ".\n\nIn each one: Select > Load Selection > garment, fix it, then " +
    "Select > Save Selection > Channel: garment (Replace), and save."
  );
}
