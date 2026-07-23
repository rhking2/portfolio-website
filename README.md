# Robin Harwell — Portfolio

Personal portfolio site for Robin Harwell, marketing & communications professional.

Plain HTML/CSS/JS — no build tools, no installs, nothing to run to make an
edit. You can make every change described below directly on GitHub.com from
a browser.

## Structure

- `index.html` — page content (all the text, images, and links)
- `styles.css` — styling (colors, spacing, fonts)
- `script.js` — nav toggle, active-link highlighting (you shouldn't need to touch this)
- `assets/img/` — headshot image
- `assets/Robin_Harwell_Resume.pdf` — downloadable resume
- `CNAME` — custom domain for GitHub Pages (robinharwell.com)

---

## How to update this site (no coding experience needed)

Every change below is made in **`index.html`**, using GitHub's built-in
editor:

1. Go to the file on GitHub (`index.html` in this repo).
2. Click the **pencil icon** ("Edit this file") in the top right.
3. Make your change.
4. Scroll down, add a short note about what you changed, and click
   **"Commit changes"**.
5. If the site is connected to GitHub Pages (see below), your change goes
   live automatically within a minute or two — nothing else to do.

Search for the word **"EDIT HERE"** in the file — it's used as a comment
above every section you're likely to want to change, so you can jump
straight to the right spot instead of reading the whole file.

### Change any text (bio, project descriptions, job bullets, etc.)

Find the sentence in `index.html` and type over it, right in the GitHub
editor. Text inside `< >` angle brackets is formatting — leave those alone,
just edit the words between them.

### Swap a photo

1. In `assets/img/`, upload your new image (drag-and-drop works in GitHub's
   web UI) using the **same file name** as the one you're replacing, e.g.
   `headshot.jpg`. It will automatically replace the old one — no other
   changes needed.
2. Prefer a different file name instead? Upload the new image, then in
   `index.html` find the matching `<img src="assets/img/...">` line and
   update the file name there.

Photos and screenshots of any size or shape will display nicely — you don't
need to crop or resize before uploading (though smaller files, ideally under
~1–2 MB, will make the page load faster).

### Add a new job to "Experience"

Copy one whole `<article class="timeline-item">...</article>` block, paste
it above the others (newest role at the top), and edit the date, title,
company, and bullet points.

### Add or remove a skill

In the "Skills" section, each skill is one `<li>Skill Name</li>` line —
add, remove, or edit a line to update the list.

### Update contact info or resume

- Phone/email/LinkedIn: edit the matching line in the "Get In Touch"
  section.
- Resume: upload a new PDF to `assets/`, then update the two
  `assets/Robin_Harwell_Resume.pdf` links in `index.html` to match its file
  name (or just re-upload using that exact same file name to skip this
  step).

### Change colors

All colors live in one place at the very top of `styles.css`, each with a
comment explaining what it controls. Change a value there and it updates
everywhere that color is used on the site.

---

## Local preview (optional, for developers)

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying to robinharwell.com via GitHub Pages

1. In the repo settings, enable **GitHub Pages** for this branch (or
   `main` after merging), serving from the root.
2. At your domain registrar, point `robinharwell.com` at GitHub Pages:
   - `A` records for the apex domain to GitHub's IPs (185.199.108.153,
     185.199.109.153, 185.199.110.153, 185.199.111.153), or
   - a `CNAME` record if using a `www` subdomain.
3. GitHub Pages will pick up the `CNAME` file in this repo automatically.

Once this is set up, every edit you commit (see above) republishes the live
site automatically — there's no separate "deploy" step to remember.
