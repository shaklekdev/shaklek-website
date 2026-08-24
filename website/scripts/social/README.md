# Social video toolchain

Renders Instagram/TikTok reels from the catalog photography. No ffmpeg and no
Homebrew on this machine, so the encoder is Swift/AVFoundation, which ships
with macOS.

## Encoder

```bash
swiftc -O encode.swift -o encode
./encode out.mp4 30 1080 1920 frame1.png frame2.png ...
```

Repeat a frame on the command line to hold it. `timeline-example.mjs` shows the
pattern: render a small set of unique states with headless Chrome, then hold
each for a frame count that sets the pacing.

## Rendering frames

Frames are HTML screenshotted by headless Chrome, not a screen recording of the
site. A real recording carries cursor jitter and scroll drift that reads as
amateur once sped up, and cuts have to land on exact frame counts.

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --virtual-time-budget=2500 \
  --window-size=1080,1920 --screenshot=out.png "file:///abs/path.html"
```

## Two things learned the hard way

- **Never `object-fit: cover` a garment whose length is the subject.** A
  top-anchored square crop of a full-length shot hides the hem, so all four
  cells of a "four ways to cut it" post looked identical. Trousers crop from
  the bottom; comparison grids hold the SAME crop height across every cell so
  the option being changed is the only difference.
- **Pacing.** 2-7 frames per state reads as a glitch, not a decision. ~40
  frames (1.3s) per choice is legible.

Output lands in `brand-assets/INSTA/`, which is gitignored — the assets are on
disk only, so do not delete that folder expecting to recover it from git.
