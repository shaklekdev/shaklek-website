// mux <video.mp4> <audio-source.mp4> <out.mp4> [audioStart] : lays the audio of
// the second file under the first, cut to the video's length, faded in and out.
import AVFoundation
let a = CommandLine.arguments
let video = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let sound = AVURLAsset(url: URL(fileURLWithPath: a[2]))
let out = URL(fileURLWithPath: a[3])
let aStart = CMTime(seconds: a.count > 4 ? Double(a[4])! : 0, preferredTimescale: 600)
guard let vt = video.tracks(withMediaType: .video).first else { fatalError("no video track") }
guard let at = sound.tracks(withMediaType: .audio).first else { fatalError("no audio track in \(a[2])") }
let dur = video.duration
let comp = AVMutableComposition()
let cv = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
try! cv.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: vt, at: .zero)
let ca = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!
let avail = CMTimeSubtract(sound.duration, aStart)
let aDur = CMTimeMinimum(dur, avail) // audio may be shorter than the video: fade at its own end
try! ca.insertTimeRange(CMTimeRange(start: aStart, duration: aDur), of: at, at: .zero)
let p = AVMutableAudioMixInputParameters(track: ca)
let fin = CMTime(seconds: 0.3, preferredTimescale: 600), fout = CMTime(seconds: 0.9, preferredTimescale: 600)
p.setVolumeRamp(fromStartVolume: 0, toEndVolume: 1, timeRange: CMTimeRange(start: .zero, duration: fin))
p.setVolumeRamp(fromStartVolume: 1, toEndVolume: 0, timeRange: CMTimeRange(start: CMTimeSubtract(aDur, fout), duration: fout))
let mix = AVMutableAudioMix(); mix.inputParameters = [p]
try? FileManager.default.removeItem(at: out)
let ex = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetHighestQuality)!
ex.outputURL = out; ex.outputFileType = .mp4; ex.audioMix = mix; ex.shouldOptimizeForNetworkUse = true
let sem = DispatchSemaphore(value: 0)
ex.exportAsynchronously { sem.signal() }
sem.wait()
if ex.status != .completed { fatalError("export failed: \(String(describing: ex.error))") }
print("wrote", a[3], CMTimeGetSeconds(dur), "s with audio")
