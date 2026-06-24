# Space Coast Automation

Marketing website for **Space Coast Automation**, a team of current and former aerospace engineers who build automation, websites, and apps for small businesses across Brevard County, Florida.

Live domain: **[space-coast-automation.com](https://space-coast-automation.com)**

> It's not rocket science.

---

## Stack

Plain static HTML, CSS, and vanilla JavaScript. No build step, no framework, no dependencies. It deploys as-is on GitHub Pages and loads fast.

- **Design system:** dark "instrument panel" aesthetic. Space Navy base, Signal Cyan accent.
- **Fonts:** Space Grotesk (headings), Inter (body), JetBrains Mono (labels), via Google Fonts.
- **Contact form:** [FormSubmit](https://formsubmit.co) AJAX (no backend, no API key). Delivers to inquiries@, with honeypot, time-trap, link filtering, and rate limiting. See setup below.
- **Accessibility:** semantic HTML, skip link, focus states, `prefers-reduced-motion` support, WCAG AA contrast.

## Project structure

```
.
├── index.html            Home
├── services/index.html   Services
├── about/index.html      About
├── contact/index.html    Contact (FormSubmit form)
├── 404.html              Not-found page
├── assets/
│   ├── css/styles.css     Full design system
│   ├── js/main.js         Nav, scroll reveal, count-up, form handling
│   └── img/               Logo, favicons, OG image, PWA icons
├── scripts/gen_assets.py  Regenerates raster brand assets (dev only)
├── CNAME                  Custom domain for GitHub Pages
├── .nojekyll             Serve files as-is (no Jekyll processing)
├── robots.txt
├── sitemap.xml
└── site.webmanifest
```

## Local preview

The pages use root-absolute asset paths (`/assets/...`), so open them through a local server rather than `file://`:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

---

## Before you go live: replace the placeholders

Everything below is intentionally a placeholder. Search and replace before launch.

| What | Where | Replace with |
|------|-------|--------------|
| **Phone number** `(321) 555-0100` | footer on every page + `contact/index.html` | Real phone (update both the visible text and the `tel:+1...` link). |
| **Business address** | JSON-LD in `index.html` | Add a street address and ZIP for a full local listing (currently city and region only). |

The contact email is set to `inquiries@space-coast-automation.com`, which forwards to the owner inbox via Cloudflare Email Routing.

### Contact form (FormSubmit)

The form posts via AJAX to [FormSubmit](https://formsubmit.co), which forwards submissions to `inquiries@space-coast-automation.com`. No API key, no backend.

1. **Activate once:** submit the live form a single time. FormSubmit emails `inquiries@` (forwarded to your inbox) an activation link. Click it. After that, every submission is delivered.
2. **Reply-to:** the submitter's email is passed through, so you can reply straight from your inbox.
3. **Change the destination:** edit the email in the form's `data-endpoint` attribute in `contact/index.html`, then re-activate.

Spam protections live in `assets/js/main.js`: a hidden honeypot field, a submit time-trap, a links/HTML content filter, and a per-browser rate limit (30 seconds between sends, 5 per hour). FormSubmit also filters server-side. To add a visible challenge later, drop in [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) (free).

---

## Hosting and DNS

The site is hosted on **Cloudflare Workers** (static assets). `wrangler.jsonc` defines the Worker, and Cloudflare auto-deploys on push to `main`.

- **Custom domain:** attached in the Cloudflare dashboard (Workers & Pages → `space-coast-automation` → Domains). Cloudflare creates the DNS record and SSL automatically. To serve `www` too, add it as a second custom domain.
- **Email:** Cloudflare → your domain → Email → Email Routing forwards `inquiries@space-coast-automation.com` to your personal inbox.

The domain's nameservers must be on Cloudflare for the above to work.

### Alternative: GitHub Pages

If you turn off Cloudflare Workers, the `CNAME` file targets the apex domain. Enable repo **Settings → Pages → Source: `main` / root**, then point DNS at GitHub:

```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   rsnegach.github.io
```

Use one host, not both.

---

## Editing content

- **Copy** lives directly in each page's HTML. Header and footer markup are duplicated across pages; if you change one, change all of them.
- **Colors, spacing, and type** are CSS custom properties at the top of `assets/css/styles.css` (`:root`).
- **Behavior** (mobile nav, scroll reveal, count-up metrics, form) is in `assets/js/main.js`.

## Regenerating brand assets

The favicon is hand-authored SVG (`assets/img/favicon.svg`). The raster assets (OG share image, PWA icons, `.ico`) are generated:

```bash
python scripts/gen_assets.py   # requires Pillow; uses Windows system fonts
```

Edit the script to change the OG card text or icon styling.

---

© Space Coast Automation. Serving Brevard County, Florida.
