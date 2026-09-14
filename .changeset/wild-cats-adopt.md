---
"matheusicaro-node-framework": minor
---

Adopt changesets for changelog generation, version bumps, and automated npm publishing. Every PR that changes `src/**` now needs an accompanying changeset (`npx changeset`), enforced by CI. Merging to `master` opens/updates a "Version Packages" PR; merging that PR bumps the version, updates `CHANGELOG.md`, and publishes to npm automatically.
