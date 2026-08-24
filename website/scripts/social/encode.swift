import AVFoundation
import AppKit

// Encodes a PNG sequence to H.264 MP4. macOS has no ffmpeg here, but
// AVFoundation is built in. Usage:
//   swift encode.swift <out.mp4> <fps> <w> <h> <frame1.png> <frame2.png> ...
// A frame may be repeated on the command line to hold it for longer.

let args = CommandLine.arguments
guard args.count > 5 else { fputs("usage: encode <out> <fps> <w> <h> <frames...>\n", stderr); exit(1) }
let outURL = URL(fileURLWithPath: args[1])
let fps = Int32(args[2])!
let width = Int(args[3])!, height = Int(args[4])!
let frames = Array(args[5...])

try? FileManager.default.removeItem(at: outURL)

let writer = try! AVAssetWriter(outputURL: outURL, fileType: .mp4)
let settings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: width,
  AVVideoHeightKey: height,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: 10_000_000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
  ],
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
  assetWriterInput: input,
  sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32ARGB),
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
  ])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

func buffer(_ path: String) -> CVPixelBuffer? {
  guard let img = NSImage(contentsOfFile: path),
        let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return nil }
  var pb: CVPixelBuffer?
  CVPixelBufferCreate(kCFAllocatorDefault, width, height, kCVPixelFormatType_32ARGB, nil, &pb)
  guard let px = pb else { return nil }
  CVPixelBufferLockBaseAddress(px, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(px), width: width, height: height,
                      bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(px),
                      space: CGColorSpaceCreateDeviceRGB(),
                      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)
  ctx?.draw(cg, in: CGRect(x: 0, y: 0, width: width, height: height))
  CVPixelBufferUnlockBaseAddress(px, [])
  return px
}

var i: Int64 = 0
for f in frames {
  guard let px = buffer(f) else { fputs("skip \(f)\n", stderr); continue }
  while !input.isReadyForMoreMediaData { usleep(2000) }
  adaptor.append(px, withPresentationTime: CMTime(value: i, timescale: fps))
  i += 1
}
input.markAsFinished()
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }
sem.wait()
if writer.status == .completed { print("wrote \(outURL.path) — \(i) frames @ \(fps)fps") }
else { fputs("FAILED: \(String(describing: writer.error))\n", stderr); exit(1) }
