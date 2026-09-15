---
"matheusicaro-node-framework": minor
---

Adopt changesets for changelog generation, version bumps, and staged npm publishing. Every PR that changes `src/**` now needs an accompanying changeset (`npx changeset`), enforced by CI. Merging to `master` opens/updates a "Version Packages" PR; merging that PR bumps the version, updates `CHANGELOG.md`, and stages the release on npm — a maintainer still has to approve it with 2FA on npmjs.com before it's actually published.
