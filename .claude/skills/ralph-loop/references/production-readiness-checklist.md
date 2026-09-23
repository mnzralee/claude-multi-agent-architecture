# Ralph-Loop: Production-Readiness Checklist

Reference for `.claude/skills/ralph-loop/SKILL.md`, Section 21. Read this when scoping what belongs in marathon scope versus post-marathon scope for a production-readiness or "what great looks like" pass.

Borrowed from the review-board Quality Lead:

| Item | Description | Marathon scope | Post-marathon scope |
|---|---|---|---|
| Pre-flight script per iteration | Idempotent, exit 0 on green, validates environment | YES, mandatory per iteration | Production: scheduled timer unit |
| Migration apply uses a dedicated CI/CD role | Not the human developer; separate from runtime role | OPTIONAL (per documented deferral) | Production: two-role pattern per CIS database benchmark |
| Per-migration rollback SQL | Reverse-migration diff committed alongside | OPTIONAL during marathon | YES post-marathon |
| Boot probes report to centralized observability | OTel span + metric on probe latency | PARTIAL (structured log only) | YES with OTel SDK |
| Test data seeded via factories | Not hardcoded fixtures with embedded secrets | YES, mandatory | Production: factory pattern + contract tests |
| Schema-per-service explicit search path | `SET search_path TO <schema>` in code (defense in depth) | OPTIONAL (URL parameter sufficient in a dev environment) | Production: explicit |
| Pre-push gate parallel execution | Build-cache invalidation isolated per workspace | YES (existing build config) | Production: CI matrix |
| Observability dashboards exist BEFORE deployment | Dashboards-as-code committed pre-deploy | YES (manifests in repo) | Production: GitOps |
