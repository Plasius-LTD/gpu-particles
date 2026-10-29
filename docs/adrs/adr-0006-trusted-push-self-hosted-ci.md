# ADR-0006: Trusted Branch CI on Quarantined Self-Hosted Capacity

- Status: Accepted
- Date: 2026-10-29
- Project: Task gpu-particles#27, Story plasius-ltd-site#1626, Feature #1597
- Supersedes: ADR-0005's hosted-CI scheduling decision only

## Context

Task #27 requires explicit self-hosted CI while retaining hosted npm OIDC
publication. Both current CI jobs instead select hosted runners and the workflow
test requires that stale policy. A same-repository pull request is insufficient
evidence that its code is trusted to run on persistent self-hosted capacity.

## Decision

Both CI jobs select `Public CI - Quarantined` with literal
`[self-hosted, Linux, X64]` labels. The workflow accepts branch pushes and manual
branch dispatches; each job independently requires an allowed event, the exact
`Plasius-LTD/gpu-particles` repository and a branch ref. No pull-request trigger,
tag, fork, caller-supplied runner selector or hosted fallback is allowed.

The organization's runner-group workflow-ref restrictions remain a separate
admission boundary. A feature branch needs reviewed immutable source and scoped
admission before CI can execute. No global group policy is widened by this
workflow change. Operators remove temporary admission before unlocking or
changing that source. Missing admission/capacity blocks validation.

Checkout does not persist credentials; package-manager caching stays disabled.
Job timeouts and per-ref cancellation bound work. The existing coverage and
artifact checks remain mandatory. Publication continues through exact-main,
successful push CI followed by hosted `cd.yml`/`production`, sealed tarballs,
OIDC and provenance. Task #35's maintainer authentication, trusted-publisher
verification and unused-version evidence remain prerequisites to CD dispatch.

The backend's stored `platform.public-artifact-integrity.enabled` flag governs
staged public restoration. Enabled permits restoration only after all admission
checks pass; disabled prevents promotion. Mandatory source, artifact and CI/CD
security checks never depend on the flag. This operational change adds no product
capability or local environment override. Rollback disables the affected workflow
or publication channel and removes temporary admission, without restoring the
prohibited path or selecting hosted CI.

## Alternatives and impact

Hosted CI conflicts with the tracked acceptance criteria. Running PR-head code
on persistent runners would weaken the trust boundary. Broad runner-group access
or caller-controlled selectors would bypass scoped admission. Trusted branch
events plus central ref restrictions provide pre-merge evidence when approved
source is admitted. Runtime exports, shaders and package APIs are unchanged.

The existing `brace-expansion` override advances from 5.0.9 to 5.0.12 because
baseline full audit identifies denial-of-service advisories in the former. This
compatible transitive tooling patch is required for clean verification; it adds
no runtime dependency or broader refresh. The frozen lockfile records the change.

## Validation and release implications

Workflow contract tests exercise both job guards for branch push/manual admission
and denial of same-repository/fork PRs, privileged PR events, fork pushes and tags.
They also enforce explicit runner selection, disabled caches, credential-free
checkout and retained coverage/artifact/publication boundaries. Run pinned-runtime
frozen install, tests, coverage, lint, types, build, full dependency audit/tree,
artifact/package checks, publication dry-run and actionlint before review.
After push, verify actual runner identity and CI success. Do not infer release
completion from local checks or a prepared PR; #35 and normal merge/exact-main
CI/CD/public-artifact qualification remain required before Task #27 is Done.
