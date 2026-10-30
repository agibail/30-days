# 30 Days

One new project a day for 30 days: websites, images, video, whatever.

**Gallery:** published on GitHub Pages (link in the repo's About section once Pages is on).

## Daily flow

```bash
./30 new today "My idea" website     # or image / video / mixed
# …make the thing in days/day-NN/site/ …
./30 add today ~/Desktop/shots/      # a single image, many images, a folder, or a video
./30 save today "First pass"         # snapshot → changelog → commit → push
# …iterate…
./30 save today "Bigger type, new colors"
./30 open                            # view the gallery locally
```

Every `save` of a website day freezes a copy (`v01`, `v02`, …). On the day page you can click through the iterations or compare one side by side with the version before it. All changes are logged in [CHANGELOG.md](CHANGELOG.md).

Run `./30 help` for every command.

## Media hosting

By default images and video are committed to the repo (`days/day-NN/media/`). That works for anything under ~90MB per file.

**Cloudflare R2 (for big videos / lots of photos), when you're ready:**
1. In Cloudflare: create an R2 bucket, enable public access (r2.dev URL or custom domain), and create an API token with Object Read & Write.
2. `cp config/r2.env.example config/r2.env` and fill in the values. The file is gitignored.
3. `./30 add today --r2 big-video.mov`, or set `MEDIA_BACKEND=r2` in `config/site.env` to make R2 the default.

R2 uploads use plain `curl` (SigV4), so nothing needs installing.

## Requirements

macOS with git (GitHub Desktop's bundled git is detected automatically). No Node or Python needed.

See [AGENTS.md](AGENTS.md) for the rules AI agents follow here.
