---
title: Shoe Finder
date: 2026-11-01
type: website
---

Reverse image search for shoes, aimed at fashion archives. Drop in a photo of a shoe you like and it finds the closest-looking shoes in the **V&A** (London) and **The Met Costume Institute** (New York). [Open the app](days/day-03/site/index.html)

- **Matches by look, not keywords.** OpenAI's CLIP model runs *in the browser* (Transformers.js), so your photo never leaves the device. It turns every shoe into a 512-number "look" vector and ranks the archive by how close each one is.
- **Discovery walk.** Tap any result → *More like this* to search from that shoe instead. The trail at the top lets you jump back to any step.
- **Steer.** Type "red velvet" or "a platform" to push the search toward those words while keeping the shape of your shoe.
- **What the model sees.** It also names the shoe (type, colour, material, era), and those words drive which archive records get pulled and the *Find ones to buy* links (Google Shopping, eBay, Grailed, Depop, Vestiaire, The RealReal). Each archive shoe has a Google Lens link to find similar ones for sale.
- **Board.** ♡ shoes to save them on this device, then *Discover from my board* blends all of them into one taste and searches for it.

How it works: the archive APIs are searched live with the model's words, plus a random slice of the V&A's ~7,900 shoes so results don't narrow too fast. Each archive photo gets embedded once and cached in IndexedDB, so repeat searches are fast. *Dig deeper* pulls more pages.

Notes:
- First visit downloads the model (~150 MB). After that the browser keeps it cached.
- The Met's image server won't let browsers read its photos directly, so Met thumbnails go through the wsrv.nl image proxy. Pasted image URLs from sites that block reading also fall back to that proxy (uploaded files are never sent anywhere).
- Could add next: more archives (Cooper Hewitt and Europeana need API keys), a precomputed index so search is instant, and a camera button for snapping shoes on the street.
