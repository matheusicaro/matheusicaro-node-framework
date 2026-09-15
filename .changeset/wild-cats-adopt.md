---
---

Adopt changesets for changelog generation, version bumps, and staged npm publishing. Every PR that changes `src/**` now needs an accompanying changeset (`npx changeset`), enforced by CI. Merging to `master` opens/updates a "Version Packages" PR; merging that PR bumps the version, updates `CHANGELOG.md`, and stages the release on npm — a maintainer still has to approve it with 2FA on npmjs.com before it's actually published.

Note: `package.json`'s version was already manually set to `2.0.0` for this release (see `CHANGELOG.md`) before changesets was adopted, so this changeset intentionally carries no version bump — `changeset version` should not move it further.
