# Robin Harwell — Portfolio

Personal portfolio site for Robin Harwell, marketing & communications professional.

Static HTML/CSS/JS site — no build step required.

## Structure

- `index.html` — page content
- `styles.css` — styling
- `script.js` — nav toggle, active-link highlighting
- `assets/img/` — project and headshot images
- `assets/Robin_Harwell_Resume.pdf` — downloadable resume
- `CNAME` — custom domain for GitHub Pages (robinharwell.com)

## Local preview

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying to robinharwell.com via GitHub Pages

1. In the repo settings, enable **GitHub Pages** for this branch (or `main` after merging), serving from the root.
2. At your domain registrar, point `robinharwell.com` at GitHub Pages:
   - `A` records for the apex domain to GitHub's IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153), or
   - a `CNAME` record if using a `www` subdomain.
3. GitHub Pages will pick up the `CNAME` file in this repo automatically.
