// frames <video> <outDir> <start> <end> <fps> : every frame in [start,end) as
// <outDir>/NNNN.jpg. AVFoundation, because this machine has no ffmpeg.
import AVFoundation
import AppKit
let a = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let g = AVAssetImageGenerator(asset: asset)
g.appliesPreferredTrackTransform = true
g.requestedTimeToleranceBefore = .zero; g.requestedTimeToleranceAfter = .zero
let start = Double(a[3])!, end = Double(a[4])!, fps = Double(a[5])!
try? FileManager.default.createDirectory(atPath: a[2], withIntermediateDirectories: true)
var i = 0
var t = start
while t < end - 1e-6 {
  let cg = try! g.copyCGImage(at: CMTime(seconds: t, preferredTimescale: 6000), actualTime: nil)
  let rep = NSBitmapImageRep(cgImage: cg)
  try! rep.representation(using: .jpeg, properties: [.compressionFactor: 0.95])!
    .write(to: URL(fileURLWithPath: String(format: "%@/%04d.jpg", a[2], i)))
  i += 1; t = start + Double(i) / fps
}
print(i, "frames")
