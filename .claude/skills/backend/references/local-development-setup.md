# Local Development Setup

Extracted verbatim from the backend skill's core `SKILL.md`. Read this when setting up or troubleshooting the local dev environment (running a service, port-forwarding from the cluster, or assigning a port). Not needed for a typical feature-implementation invocation.

---

## Local Development Setup

**Run a service locally (preferred for active development and debugging):**

```bash
cd backend
npm run dev --filter=svc-auth        # [CUSTOMIZE: per-service port]
npm run dev --filter=svc-account
npm run dev --filter=svc-billing
```

**Port-forward from your cluster (for services not under active development):**

```bash
# [CUSTOMIZE: namespace and service names for your cluster]
kubectl port-forward -n <your-dev-namespace> svc/svc-auth 3041:80 &
kubectl port-forward -n <your-dev-namespace> svc/svc-account 3042:80 &
kubectl port-forward -n <your-dev-namespace> svc/svc-billing 3043:80 &
```

Run the services you are actively changing on your local machine; port-forward the stable dependencies from a shared environment so you are not running the whole system locally.

---

## Port Convention

Assign each service a fixed local port and document it so the team has a single source of truth. A contiguous block keeps things memorable:

| Service | Port | Purpose |
|---------|------|---------|
| svc-admin | 3040 | Admin operations |
| svc-auth | 3041 | Authentication |
| svc-account | 3042 | Account management |
| svc-billing | 3043 | Billing, balances |
| svc-notification | 3044 | Notifications |

> [CUSTOMIZE: pick your own port block and service mapping; keep it in one place.]
