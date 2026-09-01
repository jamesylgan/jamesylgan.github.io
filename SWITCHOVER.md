> **DNS follow-up (2026-08-31):** `www.bellevue.tech` has no DNS record at all, which GitHub Pages flags as `InvalidDNSError`. Add a `CNAME` record for `www` → `jamesylgan.github.io` in Cloudflare DNS (proxy status "DNS only", not proxied) to clear it. The apex `bellevue.tech` A records already point correctly at GitHub Pages (185.199.108-111.153).

# Switching GitHub Pages over to this repo

This repo (`jamesylgan.github.io2`) is a clean copy of `master` from the
original `jamesylgan/jamesylgan.github.io`, with the `tools/spanish-tool/`
directory and its "Spanish A1-B1 Course" landing-page card removed from
*all* history (not just the current tree). It has no pull requests, so
there's no `refs/pull/*` leak vector the way the old repo had.

Only `master` was copied over — none of the old repo's other dev branches
(`trip-planner-*`, `task-tracker-*`, etc.) were migrated, since GitHub Pages
only ever served from `master`.

## Steps to make this the live site

GitHub's user Pages site (`https://jamesylgan.github.io`) and the
`bellevue.tech` custom domain both require the repo to be named exactly
`<username>.github.io`. Only one repo can hold that name at a time, so the
old repo needs to be renamed out of the way first.

1. **Rename the old repo** (Settings → General → Repository name):
   `jamesylgan/jamesylgan.github.io` → e.g. `jamesylgan/jamesylgan.github.io-archive`
   - This immediately stops it from serving `https://jamesylgan.github.io`.
   - Consider also setting it to **private** at this point (Settings → Danger
     Zone → Change visibility), since it still has the leaked spanish-tool
     content sitting in its `refs/pull/*` history that only GitHub Support
     can fully purge. Making it private cuts off public access to that
     immediately, whether or not you ever file the support ticket.

2. **Rename this repo** to take the freed-up name:
   `jamesylgan/jamesylgan.github.io2` → `jamesylgan/jamesylgan.github.io`

3. **Enable GitHub Pages** on the newly-renamed repo (Settings → Pages):
   - Source: Deploy from a branch
   - Branch: `master` / `(root)`

4. **Set the custom domain** (Settings → Pages → Custom domain):
   - Enter `bellevue.tech`
   - This writes/updates the `CNAME` file in the repo. No DNS changes should
     be needed since your DNS already points at GitHub's Pages infrastructure
     generically, not at a specific repo.
   - Wait for the "DNS check successful" confirmation and let GitHub
     reprovision the HTTPS certificate (can take a few minutes).

5. **Verify**:
   - `https://jamesylgan.github.io` loads the site
   - `https://bellevue.tech` loads the site
   - Spot-check `https://bellevue.tech/tools/` — the Spanish course card
     should be gone, and `https://bellevue.tech/tools/spanish-tool/` should
     404.

6. Once confirmed working, you can leave the old repo archived/private, or
   revisit the GitHub Support ticket for purging its `refs/pull/*` cache if
   you want it public again someday.
