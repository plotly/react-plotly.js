# Releasing react-plotly.js

This document covers how to cut a new release of `react-plotly.js` to npm.
It's evergreen — substitute `X.Y.Z` with the target version (e.g. `3.0.0`)
and `vX.Y.Z` with the git tag (e.g. `v3.0.0`).

## Prerequisites

- npm publish access to the [`react-plotly.js`](https://www.npmjs.com/package/react-plotly.js) package. Granted by an existing maintainer via the npm `plotly` org.
- npm two-factor authentication configured (`npm profile get`). Publishes require an OTP.
- Push access to `plotly/react-plotly.js` on GitHub, including tag-creation permission.
- A clean local clone of the repo, ideally with `node_modules` reinstalled fresh against `main`.

## Release sequence

### 1. Pre-flight checks

From the branch that will become the release and in a clean state (typically `main`, or an integration branch like `vN` that's about to merge into `main`):

```bash
npm install              # fresh install against the current lockfile
npm test                 # lint + typecheck + jest
npm run build            # verifies the tsup build pipeline (ESM + CJS + UMD bundles)
npm run clean            # removes build artifacts (also runs as part of prepublishOnly)
```

`npm test` and `npm run build` must succeed. CI on the source branch should also be green.

### 2. Update the changelog

`CHANGELOG.md` follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). For each release:

1. Rename the `## [Unreleased]` heading to `## [X.Y.Z] - YYYY-MM-DD` using the actual release date.
2. Add a fresh empty `## [Unreleased]` heading above it.

Section order within a release: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security` (omit any that have no entries). Use past-tense verbs. Link each entry to the PR that introduced it, and credit external contributors with `, with thanks to @user for the contribution!` at the end of the line.

### 3. Bump the version

```bash
npm version X.Y.Z --no-git-tag-version
```

`--no-git-tag-version` prevents npm from tagging immediately; the tag is created later, after the release PR has merged.

### 4. Open the release PR

Branch the release off the appropriate parent — the integration branch (e.g. `vN`) for a major cumulative release, or `main` for a minor/patch. Branch name convention: `release-X.Y.Z`.

```bash
git checkout vN    # or main, depending on the release type
git pull
git checkout -b release-X.Y.Z
git add *
git commit -m "chore: release X.Y.Z"
git push -u origin release-X.Y.Z
gh pr create --base main --title "chore: release X.Y.Z" \
  --body "See CHANGELOG.md entry for [$X.Y.Z]."
```

When branching from an integration branch, the PR carries all of that branch's commits plus the release-prep commits — reviewers see the full changeset alongside the version bump.

### 5. Merge and tag

Once the PR is reviewed, CI is green, and merged into `main`:

```bash
git checkout main
git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

The tag must point at the merge commit on `main`.

### 6. Publish to npm

```bash
npm publish
```

This triggers `prepublishOnly`, which runs `npm run build` (tsup, which cleans `dist/` and emits the ESM + CJS + UMD bundles + declaration files) against the current working tree before publishing. npm will prompt for the OTP from your authenticator.

After publish, confirm:

```bash
npm view react-plotly.js version    # should report X.Y.Z
npm view react-plotly.js dist-tags  # `latest` should be X.Y.Z
```

### 7. Create the GitHub release

Via the GitHub UI: *Releases → Draft a new release*, target tag `vX.Y.Z`, paste the relevant `CHANGELOG.md` section into the body.

## Pre-release versions

For release candidates or beta builds, append a pre-release identifier and publish under a non-`latest` dist-tag so existing consumers aren't auto-upgraded:

```bash
npm version X.Y.Z-rc.0 --no-git-tag-version
# ...PR + merge + tag as above, with tag vX.Y.Z-rc.0...
npm publish --tag next
```

Consumers can opt in with `npm install react-plotly.js@next`.
