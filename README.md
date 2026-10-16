# Stride — Running pace calculator

Convert running pace and speed into projected race finish times.

- Pace in minutes:seconds per kilometer or mile
- Speed in kilometers per hour or miles per hour
- Common race distances and custom distances
- Required pace and speed from a target finish time

Projections assume a constant pace throughout the race.

## Run locally

Open `index.html` in a browser. No installation or build step is required.

## Files

- `index.html`: layout, styling, and input controls
- `calculator.js`: conversions, finish-time calculations, and interactions

## Publish with GitHub Pages

Push this folder's contents to a GitHub repository. In the repository's
Settings → Pages, choose **Deploy from a branch**, then **main** and **/(root)**.
GitHub will display the published website address on that page.

## Everyday Git workflow

Run these commands inside this project folder:

```sh
git status
git diff
git add index.html calculator.js
git commit -m "Describe the change"
git push
```

`status` shows changed files; `diff` shows the changes themselves. `add` selects
changes for the next snapshot, `commit` saves that snapshot locally, and `push`
uploads it to GitHub. Once Pages is configured, pushing updates the website.
