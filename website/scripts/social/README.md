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

## Builders

| Script | Output |
|---|---|
| `kinda-chic.mjs` | The "kinda chic" stills, IG 4:5 and TikTok 9:16. Copy and the reasoning behind it: `planning/marketing/kinda-chic.md`. |
| `reel-structured.mjs` | `VIDEO-9-structured-recut.mp4`. All four sleeve/length cuts, the zoom out on the banded trousers look, colourway change, three colour panel. |
| `reel-what-if.mjs` | `VIDEO-10-what-if-recut.mp4`. Sleeves, hem, legs, colour, each cropped to the part of the body it is about. |

## Three things learned the hard way

- **Never `object-fit: cover` a garment whose length is the subject.** A
  top-anchored square crop of a full-length shot hides the hem, so all four
  cells of a "four ways to cut it" post looked identical. Trousers crop from
  the bottom; comparison grids hold the SAME crop height across every cell so
  the option being changed is the only difference.
- **Pacing.** 2-7 frames per state reads as a glitch, not a decision. ~40
  frames (1.3s) per choice is legible.
- **The crop follows the subject, not the flattery.** Learned again on
  2026-08-25, from the other direction. `reel-what-if` used ONE crop for the
  whole reel; a single flattering crop of a model shows the face and the
  neckline, which is exactly where sleeves and legs are not. The video
  announced a change and then showed a frame where nothing appeared to move.
  Sleeves crop to the arms. Length crops to the hem. Legs crop to the legs, and
  the hem must be inside the frame or cropped and full length are the same
  picture. The same rule bit the stills: a 4:5 crop tuned for a blouse sliced a
  trouser model's head in half, because those images are full length.

## Copy rules these builders enforce

Not style preferences. Each is a correction from the founder:

- **No em dashes.** They read as generated text.
- **No AI mentions, customer facing, anywhere.**
- **Never call the imagery a photograph**, and never "the actual piece you will
  receive". It is generated, and saying otherwise is a false claim about the
  product.
- **"Timeless" and "essentials" are load-bearing.** The niche is timeless
  fashion essentials: elegant, customizable, skin friendly, cotton or linen.
- Her closing line, verbatim when needed: *"This isn't just a brand. It's
  yours."*

`kinda-chic.mjs` fails the build rather than trusting the writer: it lints each
caption for dashes, "photograph" and "AI" before rendering.

Output lands in `brand-assets/INSTA/`, which is gitignored — the assets are on
disk only, so do not delete that folder expecting to recover it from git.
