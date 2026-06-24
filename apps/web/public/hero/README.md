# Hero media

Drop the home-page hero video here. The hero renders these files (all optional — the
hero shows a solid ink panel with the headline until they exist):

| File              | Purpose                                                                | Spec                                                                              |
| ----------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `hero.mp4`        | Hero video (H.264/AAC)                                                 | **16:9**, 1920×1080 (or 2560×1440). ~6–12 s, silent, seamless loop. Keep < ~5 MB. |
| `hero.webm`       | Smaller modern codec (VP9/AV1), optional                               | same 16:9 master                                                                  |
| `hero-poster.jpg` | First-frame still (shown while loading + for `prefers-reduced-motion`) | 1920×1080, same crop as the video                                                 |

Notes:

- Rendered full-bleed with `object-cover`, so 16:9 is the safe master but the exact ratio
  is forgiving — the video is cropped to fill. Keep the key subject centred (mobile crops
  toward a ~square/portrait safe area).
- Autoplays muted + looping + `playsInline`. Reduced-motion users see the poster only.
- Served from `/hero/...` (CSP `default-src 'self'` covers it).
