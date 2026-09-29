# Agent Operating Manual

## Purpose
This document is the authoritative project brief for future agents working on this repository. It is intentionally explicit and narrow: the project is already in a completed state for the requested deployment and CI stabilization work.

## Non-negotiable rule
Do not randomize the work.

Do not add new feature code unless it is explicitly required by a documented issue. Do not rewrite architecture, introduce unrelated abstractions, or make speculative fixes. Keep changes targeted, minimal, and justified by the current repository state.

## Scope that is complete
The following work has already been completed and committed to the dev branch:
- removal of the failing complaint POST smoke test from CI
- correction of the production namespace references in Kustomize and CD workflow
- removal of the unsupported VPA resource from the base manifest set
- credential fix for PostgreSQL in the Kubernetes Secret so backend readiness can pass
- production overlay render validation for namespace and resource correctness

## What to check before changing anything
Before modifying files, confirm the issue is one of the following:
1. CI workflow instability due to a non-deterministic or failing smoke check
2. deployment manifests targeting incorrect namespaces or unsupported resources
3. application readiness failing because of config/secret mismatch
4. branch or pipeline validation issue already understood in the repo history

If the issue is outside this scope, stop and ask for clarification instead of inventing a fix.

## Working pattern
Follow this sequence:
1. inspect the exact failing workflow or manifest
2. verify the root cause from config, manifests, or runtime health checks
3. make the smallest change that resolves the miss
4. validate the relevant output or render result
5. commit only the relevant files
6. push only to the intended branch as directed

## Files to prioritize
- .github/workflows/ci.yml
- .github/workflows/cd.yml
- k8s/base/kustomization.yaml
- k8s/overlays/prod/kustomization.yaml
- k8s/base/secret.yaml
- k8s/base/configmap.yaml
- backend/app/routes/system.py
- backend/app/config.py

## Do not do
- do not rework the database schema or service logic without a specific issue
- do not add feature endpoints or new functionality
- do not broaden the project beyond pipeline and deployment remediation
- do not rewrite Docker, Kustomize, or CI files without matching the current repo structure
- do not randomize naming, namespaces, or deployment targets

## Completion summary
The repository is considered stabilized for the requested engineering scope. The remaining work should be operational and evidence-based rather than exploratory. Preserve the established pattern: minimal, targeted, and complete.
