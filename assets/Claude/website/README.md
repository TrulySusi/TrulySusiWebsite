# Truly Susi · Website Prototype

A self-contained single-page website for Truly Susi. Built in HTML + CSS, no build step, no dependencies (except Google Fonts loaded from CDN).

## How to view it

Open `index.html` in any browser. Double-click the file or right-click → Open With → Chrome / Safari / Edge / Firefox.

## What to replace before going live

There are **only 3 things** to swap. Search the HTML file for each:

| Search for | Replace with |
|---|---|
| `91XXXXXXXXXX` | Your WhatsApp Business number (no +, no spaces) — appears 5 times |
| `+91 XXXXX XXXXX` | The display version of the same number — appears 1 time |
| `hello@trulysusi.com` | Your real email — appears 1 time |
| `___` (between `₹` and `/`) | Each product price — appears 3 times |

A small floating bubble at the bottom-right of the page reminds you these placeholders exist while you're previewing. Tap it to dismiss.

## What's in the folder

```
website/
├── index.html         ← the page itself
├── README.md          ← this file
└── assets/
    ├── logo.png            ← Truly Susi logo card (kuruvi)
    ├── meet_susi.jpg       ← POST 3 family collage for "Meet Susi" section
    ├── badam_halwa.jpg     ← extracted from Reel 1 (saffron sprinkle frame)
    ├── mysore_pak.jpg      ← extracted from Reel 2 (set-in-glass frame)
    ├── susi_hands.jpg      ← Susi's hands stirring (backup image)
    ├── home_is.jpg         ← POST 2 (Home is... illustration)
    ├── brand_reveal.jpg    ← POST 4 (kuruvi brand reveal)
    └── home_extra.jpg      ← additional home illustration
```

## What you still need to provide eventually

1. **A real Thenkulal photo** — currently uses a "Photo coming soon" placeholder card
2. **A proper Susi portrait** (optional) — currently uses the POST 3 family collage, which works well, but a clean portrait or hand shot in good light would land harder

## How to take this live

When you're ready:

**Option A · Quickest (under 30 min):**
- Upload the entire `website` folder to a free static host:
  - **Netlify Drop** (netlify.com/drop) — drag the folder into the browser, get a URL instantly
  - **Vercel** — same idea
  - **GitHub Pages** — free, requires a GitHub account
- Point your domain (trulysusi.com or trulysusi.in) at it

**Option B · Most flexible (1–2 days):**
- Open Squarespace or Carrd
- Recreate the structure visually using their drag-and-drop builder
- Use this HTML as the design reference
- Premium templates that match: Squarespace's *Sanora*, *Camille*, *Maru*

**Option C · For the future:**
- When you're ready for real e-commerce checkout, port the design to **Shopify** with a premium theme (Impulse, Symmetry, or Tahoe).

## Design notes

- **Mobile-responsive** — works on phone, tablet, desktop
- **Smooth scrolling** between sections via the navigation
- **Hover states** on product cards and step cards
- **Brand colours** locked: Navy `#041C35`, Lavender `#EACAE8`, Red `#E2372B`, Blush `#FDECE2`, Sage `#8AB284`
- **Typography:** Cormorant Garamond (serif display) + Inter (sans body) — the closest free Google Fonts to your locked brand fonts (Operetta 18 + Acumin Variable)
- **Sections:** Hero → Meet Susi → The Sweets → How to Order → Find Us → Footer

Built 4 Jun 2026.
