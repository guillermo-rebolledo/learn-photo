# Production release runbook

This is the operational path for releasing Learn Photo to production on Vercel (ADR 0011) and for recovering from a bad release. It complements, and does not replace, [MVP Quality Bar](./QUALITY.md), [rendering and performance release evidence](./release-quality-evidence.md), and [accessibility release checks](./accessibility-release-checks.md).

## Before releasing

Run the full release-gate suite locally or in CI and confirm every named manual gate in the two evidence docs above has a current, recorded pass:

```sh
npm run typecheck
npm run build
npm test
npm run test:performance
npm run test:visual
npm run test:browsers
```

Confirm the production-only boundaries in [MVP-SPEC.md](./MVP-SPEC.md#explicit-exclusions) still hold: no accounts, no photo upload or camera access, no AI-generated imagery, no audio, and no offline guarantee. These are architectural properties of the codebase, not deploy-time configuration, so this is a read of the code and running app rather than a Vercel setting.

## Deploying

The Vercel project (`learn-photo`) is connected to this repository's Git remote. Merging or pushing to `main` triggers a new production deployment automatically; no manual `vercel deploy` step is required for a normal release. Every pull request also gets its own preview deployment, which is the place to run the manual accessibility and device checks before merging.

Static export (`output: "export"` in `next.config.ts`) means the production deployment is a plain static file set. There are no environment variables, server functions, or Vercel-only runtime features for core Learning Loop or Progress behavior — Progress lives entirely in the learner's browser via `localStorage`.

## Production smoke tests

After a production deployment finishes, run the smoke suite against the live URL:

```sh
PRODUCTION_URL=https://learn-photo.vercel.app npm run test:production
```

This exercises, against the deployed site rather than a local build:

- Landing and every top-level destination (Sandbox, Reference, Night Sky, Learning Path).
- A representative Challenge (Lesson 1).
- Full Capstone completion.
- Reset progress.
- The Night Sky bonus Challenge.

If `PRODUCTION_URL` is omitted it defaults to `https://learn-photo.vercel.app`. Point it at a preview deployment URL to run the same checks before merging.

## Rollback / previous-deployment recovery

Because the site is static and stateless (no database, no server-side environment to drift), rolling back is a redeploy of a previous build artifact — there is no data migration to reverse.

| Method | Steps |
| --- | --- |
| Vercel dashboard (recommended) | Open the `learn-photo` project → **Deployments**. Find the last known-good production deployment (identified by its commit). Open its menu and choose **Promote to Production**. This is Vercel's instant rollback and takes effect immediately without a rebuild. |
| Vercel CLI | `vercel rollback [deployment-url]` from a machine with the project linked and an authenticated Vercel CLI session, or `vercel promote <deployment-url> --scope <team>` to promote a specific prior deployment to production. |
| Git revert | If the bad release also needs to leave the commit history, `git revert` the offending commit(s) on `main` and push; the Git integration deploys the reverted state as a new production deployment. Prefer the dashboard/CLI rollback above when the only goal is to restore service quickly. |

After any rollback, re-run the production smoke command above against `https://learn-photo.vercel.app` to confirm the restored deployment is healthy.

## Verification record

_Record each production release here: date, commit, deploying operator, smoke-test result, and any manual gate re-checks performed against the live URL._
