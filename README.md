# Mohammad Elham Azimi — Cinematic Portfolio V3

## What's included
- `index.html` — portfolio structure/content
- `style.css` — cinematic responsive design
- `script.js` — Three.js 3D scene, scroll interaction, reveal animations
- `assets/Mohammad_Elham_Azimi_CV_AKF.pdf` — CV download

## Local preview
Because the site imports Three.js as an ES module, preview it through a local server.

### Python
From this folder:
```bash
python -m http.server 8000
```
Then open:
`http://localhost:8000`

## Free hosting
Recommended: Cloudflare Pages or GitHub Pages.

For Cloudflare Pages:
1. Create a GitHub repository and upload the files in this folder.
2. In Cloudflare Pages, connect the repository.
3. Use the root directory as the project directory.
4. No build command is required.
5. Deploy.
6. You will receive a free `pages.dev` address.
7. Later connect a custom subdomain such as `portfolio.youtubemoneyfarsi.com`.

## Notes
- The site is static: no PHP/database is required.
- Three.js is loaded from jsDelivr.
- Replace the CV PDF in `assets/` if you later create a newer version.
- The website content uses the professional information supplied by Mohammad Elham Azimi.
