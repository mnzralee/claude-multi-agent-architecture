---
paths:
  - "**/Dockerfile"
  - "**/Dockerfile.*"
  - "**/*.dockerfile"
  - "infra/**"
  - "**/*deploy*.sh"
  - "**/*build*.sh"
---

# Container Image Naming and Versioning Standards

## Overview

A container image tag is a promise: "this name always means this exact bytes." When the promise is broken (a re-pushed `latest`, a tag that does not trace to a commit, an environment name baked into the tag), you get a class of failures that are hard to diagnose: a stale build silently shipped twice, a running service showing wrong data while source was correct, and recurring "which commit is actually live?" confusion across ad-hoc tags like `feature-slug-20240608`, `env-name-uiux`, or `date-only`. This rule makes every image immutable, traceable to a commit, reproducible, and deployed by an identifier that cannot drift.

It complements `.claude/rules/git-workflow.md` (the commits the tag must trace to). Where your build configuration governs how the image is constructed, this rule governs the name, the version, and the deploy reference.

---

## Core Principle

> An image reference used to deploy MUST be immutable and MUST trace to the exact source commit it was built from. The tag is not a label of convenience; it is the cryptographic-grade identity of an artifact you may need to roll back to, audit, or prove the provenance of months later.

Three properties, non-negotiable:

1. **Immutable** - a given tag is pushed once and never overwritten. To change the image, change the tag.
2. **Traceable** - the tag (or an embedded label) maps to one git commit SHA, so any running container answers "what code is this?" deterministically.
3. **Reproducible** - the same source commit rebuilds to a functionally identical image under the same tag.

---

## The image reference format

```
<registry>/<repository>:<tag>
   |            |          |
   |            |          +-- immutable, commit-traceable (see Tag schema)
   |            +------------- the service/app name (svc-auth, web-frontend, api-gateway)
   +-------------------------- encodes the ENVIRONMENT, not the tag
```

- **Registry encodes environment, the tag does not.** A lower environment registry and a production registry hold separate deployments. The same artifact identity (`svc-auth:sha-9a3f1c2`) is meaningful in both; the registry says where it runs. Do NOT bake environment names (e.g., `staging`, `prod`) into the tag: it breaks "promote the exact artifact you tested" and produces meaningless names like `staging-auth-feature-20240608`.
- **Repository is the service name**, lowercase, matching the deployment (e.g., `svc-auth`, `web-frontend`, `api-gateway`, `worker-email`).

[CUSTOMIZE: replace the example service names above with the actual names in your project.]

---

## Tag schema (in priority order)

### 1. Immutable commit tag (REQUIRED for every build)

The primary tag is the **git short SHA of the HEAD at build time**, 7 or more hex characters, prefixed `sha-` for grep-ability:

```
svc-auth:sha-9a3f1c2
web-frontend:sha-0625583
```

This is the tag the manifest deploys. It is the gold standard for traceability: every running container maps to one commit, and a stale deploy is caught by comparing the live tag to HEAD.

For monorepo setups where each service has its own independent versioning history (e.g., git submodules or workspace packages with their own commits), build the SHA from that service's own HEAD rather than the root repo's HEAD. This ensures the tag reflects the exact source state for that service.

### 2. Release tag (for promotion-worthy artifacts)

Semantic Version (`MAJOR.MINOR.PATCH`, semver.org) plus the SHA, since Docker tags cannot contain `+`:

```
svc-auth:1.4.0
svc-auth:1.4.0-sha-9a3f1c2      # the same image, dual-tagged
```

A release tag is cut from a clean, pushed commit only.

### 3. Moving tag (convenience ONLY, NEVER deployed)

A floating pointer to the newest build of a stream, for developers pulling the latest image to inspect locally:

```
web-frontend:dev-latest      # re-pointed each dev build
```

Moving tags (`dev-latest`, and especially `latest`) are FORBIDDEN as a deployment reference. They are mutable; deploying them makes rollouts non-reproducible and rollback impossible. Use them to pull-and-inspect, never to update a running deployment.

### Anti-patterns to retire

| Tag | Why it is wrong |
|---|---|
| `latest` | Mutable; non-reproducible; no rollback; the canonical anti-pattern. |
| `staging-auth-feature-20240608` | Env in tag plus feature slug plus date, no commit; cannot answer "what code?". |
| `feature-slug-only` | Not ordered, not commit-traceable, collides on re-push. |
| `20240608` (date only) | A date is not a commit; two builds on the same day collide or mislead. |
| Re-pushing an existing tag with new bytes | Breaks immutability; the live tag silently changes meaning. |

---

## Provenance baked into the image (OCI labels)

Tags can be deleted or mis-applied; labels travel inside the image. Every Dockerfile MUST stamp the OCI standard annotations (`org.opencontainers.image.*`) so `docker inspect` (or `crane config`) answers provenance independent of the tag:

```dockerfile
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown
ARG IMAGE_VERSION=0.0.0
LABEL org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.version="${IMAGE_VERSION}" \
      org.opencontainers.image.source="https://github.com/[CUSTOMIZE: your-org]/<repo>" \
      org.opencontainers.image.title="<service>"
```

The build passes `--build-arg GIT_SHA=$(git rev-parse --short HEAD)` and similar args. The `revision` label is the source of truth for "what commit is this image", and the immutable tag SHOULD equal it.

---

## Deploy reference: pin the immutable identity

- **Manifests deploy the `sha-<commit>` tag** (or a digest, see below). Never `latest`, never a moving tag, never a date-only or slug tag.
- **Strongest form: pin by digest** (`@sha256:...`). A tag is a mutable pointer; a digest is content-addressed and can never change meaning. Production manifests SHOULD pin digests:

  ```yaml
  image: [CUSTOMIZE: your-registry.example.com]/svc-auth@sha256:3f7a...e1
  ```

  Lower environments may pin the `sha-<commit>` tag for iteration speed, but the deploy reference is still immutable per build (a new build is a new SHA, a new update to the manifest).
- One image, many tags is fine (`sha-9a3f1c2`, `1.4.0`, `dev-latest` can all point at the same digest). Deploy by the immutable one.

---

## The verify-the-running-build discipline (closes the stale-build class)

Two real incident classes share one root cause: **nobody verified that the bytes running matched the commit intended.** A backend service shipping a stale compiled artifact, or a frontend serving outdated output while source was correct, are both caught by the same check. The tag standard makes that verification trivial and mandatory:

1. **After build, before deploy:** confirm the built image actually contains the change AND its `revision` label equals the source SHA:
   ```bash
   docker inspect --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' <image>
   # must equal: git rev-parse --short HEAD
   ```
2. **After deploy:** the running container's image tag MUST equal the intended `sha-<commit>`:
   ```bash
   # For Kubernetes:
   kubectl get deploy <svc> -n <namespace> -o jsonpath='{.spec.template.spec.containers[0].image}'
   # must end in :sha-<the commit you built>
   ```
3. A deploy is not "done" until the running image SHA matches HEAD of the deployed source. A mismatch means a stale or wrong build is live: stop and rebuild.

This is the image-layer form of the principle in `ai-agent-engineering.md`: "verify the artifact, not the claim." "I deployed it" is a claim; the running image SHA equal to HEAD is the artifact.

---

## Build-time mechanics

- **Build from a committed, ideally pushed, tree.** A tag built from uncommitted work is unreliable (its SHA does not include the change). Commit first, then build with that SHA.
- **Never-overwrite.** If `sha-9a3f1c2` already exists in the registry, do not rebuild over it. If the source changed, the SHA changed, so the tag changes too. Identical source to identical tag is the only allowed re-push.
- **Local-only registries (no external push).** For `imagePullPolicy: Never` scenarios where images are imported directly into the container runtime (e.g., `docker save | ctr images import`), the immutability and traceability rules are unchanged. A new SHA is a new import; the old one is not overwritten.
- **Per-service SHA in monorepos.** If each service lives in an independently versioned workspace (submodule, package, or subtree), build the image tag from that service's own HEAD. The root-repo SHA is a proxy at best; the service's own SHA is precise.

---

## Migration from ad-hoc tags

Existing live tags that do not follow this standard are frozen history; do not rename them (that breaks running deployments and the registry's references). Going forward, every new build uses `sha-<commit>` plus the OCI `revision` label. As each service is next rebuilt, it adopts the standard and the manifest's image reference moves to the `sha-` tag at that time. No big-bang re-tag is required.

---

## Checklist (before pushing or deploying an image)

- [ ] Tag is `sha-<gitShortSha>` of the building service's committed HEAD (not `latest`, not a slug, not date-only, not env-in-tag).
- [ ] Dockerfile stamps `org.opencontainers.image.revision/created/version/source` from build args.
- [ ] The image's `revision` label equals the source SHA (verified via `docker inspect`).
- [ ] The built image actually contains the intended change (grep the compiled artifact or run a smoke check) before deploy.
- [ ] The manifest deploys the immutable `sha-` tag (or `@sha256:` digest), never a moving tag.
- [ ] After rollout, the running container's image equals the intended `sha-` tag.
- [ ] Release artifacts also carry a SemVer tag and SHOULD be digest-pinned in the manifest.

---

## Sources

- OCI Image Format Specification, annotations (`org.opencontainers.image.*`): https://github.com/opencontainers/image-spec/blob/main/annotations.md
- Semantic Versioning 2.0.0: https://semver.org
- Docker, "Best practices for tagging and versioning Docker images" / image-tag guidance: https://docs.docker.com/build/building/best-practices/
- Kubernetes, "Configuration Best Practices" (avoid `:latest`, pin tags/digests): https://kubernetes.io/docs/concepts/configuration/overview/
- Kubernetes, Images (imagePullPolicy and tag/digest semantics): https://kubernetes.io/docs/concepts/containers/images/
- Google Cloud, "Best practices for building containers" (immutable tags, no `latest` in prod): https://cloud.google.com/architecture/best-practices-for-building-containers
- Snyk / industry guidance on pinning by digest for immutability: https://snyk.io/blog/container-image-digests/

---

## Related rules

- `.claude/rules/git-workflow.md` (the commits a `sha-` tag must trace to; commit discipline)
- `.claude/rules/ai-agent-engineering.md` ("verify the artifact, not the claim" - the running image SHA is the artifact)
- `.claude/rules/context-budget.md` (this rule is path-scoped to Dockerfiles, infra, and build/deploy scripts to stay out of the always-loaded baseline)
