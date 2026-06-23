# Space Coast Automation

Marketing website for **Space Coast Automation**, a team of current and former aerospace engineers who build automation, websites, and apps for small businesses across Brevard County, Florida.

Live domain: **[space-coast-automation.com](https://space-coast-automation.com)**

> Built by rocket scientists. Working for Main Street.

---

## Stack

Plain static HTML, CSS, and vanilla JavaScript. No build step, no framework, no dependencies. It deploys as-is on GitHub Pages and loads fast.

- **Design system:** dark "instrument panel" aesthetic. Space Navy base, Signal Cyan accent.
- **Fonts:** Space Grotesk (headings), Inter (body), JetBrains Mono (labels), via Google Fonts.
- **Contact form:** [Web3Forms](https://web3forms.com) (no backend needed). See setup below.
- **Accessibility:** semantic HTML, skip link, focus states, `prefers-reduced-motion` support, WCAG AA contrast.

## Project structure

```
.
├── index.html            Home
├── services/index.html   Services
├── about/index.html      About
├── contact/index.html    Contact (Web3Forms form)
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
| **Web3Forms access key** | `contact/index.html`, hidden input `access_key` | Your key from [web3forms.com](https://web3forms.com) (free). Until this is set, the form shows a friendly "not connected yet" message instead of failing silently. |
| **Phone number** `(321) 555-0100` | footer on every page + `contact/index.html` | Real phone (update both the visible text and the `tel:+1...` link). |
| **Email** `hello@space-coast-automation.com` | footers, contact page, JSON-LD | Real inbox (this should also be the address that receives Web3Forms submissions). |
| **Testimonials** | `index.html` ("What owners say") | Real client quotes with name, role, company. Remove the placeholder badge. |
| **Team** `[ Add name ]` | `about/index.html` ("The team") | Real names, photos, and bios. Remove the placeholder badge. |
| **Business address** | JSON-LD in `index.html` | Add street address and ZIP if you want a full local listing. Currently city/region only. |

### Wiring up the contact form (Web3Forms)

1. Go to [web3forms.com](https://web3forms.com), enter the email that should receive inquiries, and copy the **access key**.
2. In `contact/index.html`, find:
   ```html
   <input type="hidden" name="access_key" value="REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY" />
   ```
   and paste your key in place of the placeholder.
3. Done. The form posts via JavaScript and shows inline success/error states. A honeypot field blocks basic spam.

---

## Deploy on GitHub Pages

This repo is configured to serve from the `main` branch root.

1. **GitHub → Settings → Pages**
2. **Build and deployment → Source:** "Deploy from a branch"
3. **Branch:** `main`, folder `/ (root)` → **Save**
4. The `CNAME` file already sets the custom domain to `space-coast-automation.com`.
5. After DNS propagates, enable **Enforce HTTPS**.

### DNS for the custom domain

At your domain registrar / DNS provider, point the apex domain to GitHub Pages:

**A records** for `space-coast-automation.com`:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**AAAA records** (optional, IPv6):
```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**CNAME record** for the `www` subdomain (recommended):
```
www  ->  rsnegach.github.io
```

GitHub provisions the TLS certificate automatically once DNS resolves. Full reference: [Configuring a custom domain for GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

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
