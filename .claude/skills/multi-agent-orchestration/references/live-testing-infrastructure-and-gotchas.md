# Live Testing Infrastructure Commands and Gotchas

Referenced from the core `SKILL.md`'s "Interactive Live Testing Integration" section. Read this when you need the example infrastructure commands for a live-testing track, or the table of transferable failure modes seen in past live UI testing runs. Both are illustrative/deep-dive material, not required to execute the core dispatch loop.

### Common Infrastructure Commands

The commands below assume a container-orchestrator deployment for illustration. [CUSTOMIZE: replace with your own deploy, log, and database-inspection commands. Substitute your namespace, service name, port, and credentials wherever a placeholder appears.]

```bash
# Port-forwards (die on pod restart, re-establish after deploy)
kubectl port-forward -n <namespace> deploy/<service-a> <port>:<port> &
kubectl port-forward -n <namespace> deploy/<service-b> <port>:<port> &

# Quick rebuild cycle
docker build --no-cache -t <svc>:<tag> -f <Dockerfile> . && \
docker save <svc>:<tag> | <import into local cluster> && \
kubectl set image deployment/<svc> <svc>=<svc>:<tag> -n <namespace> && \
kubectl rollout status deployment/<svc> -n <namespace> --timeout=60s

# Database state check
kubectl exec -n <data-namespace> <db-pod> -- psql -U <db-user> -d <db-name> -c "<SQL>"

# Service logs
kubectl logs -n <namespace> deploy/<svc> --tail=10
```

### Gotchas Learned from Production Testing

These are real, transferable failure modes from live UI testing. The "Fix" column names the class of fix; adapt the specifics to your stack.

| Issue | Symptom | Root Cause | Fix |
|-------|---------|-----------|-----|
| Port-forward dead | Connection refused | Pod restarted after deploy | Kill the stale forward and re-establish it |
| Test driver not found | `Cannot find module` | Wrong working directory | Run from the app directory |
| Stale build cache | Old component rendering | Hot-reload did not pick up the change | Clear the build cache and restart the dev server |
| Route shadowing | Literal path resolves as "not found" | A parameterized route was matched before the literal one | Declare literal routes BEFORE parameterized catch-alls |
| Enum in DB query | "Invalid value for argument" | Passing a sentinel like "ALL" into an enum filter | Skip the filter for "ALL"/empty values |
| Auth token rejected | "Invalid token payload" | A claim in the token did not map to the field the service expected | Bridge the claim in the auth middleware |
| API response shape | Page crash | The client expects a flat object, the API wraps it in a key | Unwrap in the fetch function |
| Stale build artifact | A generated count is one behind | A recursive copy nested into an existing directory | Remove the target directory before copying |
| Wrong database | "Table does not exist" | Different DB name or password than expected | Check the connection string inside the container |
