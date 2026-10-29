# OpsPilot — SRE Incident Response UI Prototype

OpsPilot is a frontend prototype for exploring an incident-response workflow with a human-approval concept.

> **Simulation notice:** incident details, telemetry, service health, suspected root causes, timelines, revenue exposure and tool outcomes are predefined sample data. The app does not query OpenTelemetry or Datadog, access Kubernetes, change feature flags, publish status pages, or execute a rollback. The approval toggle and action states only change the local demonstration UI.

## Run locally

~~~bash
npm ci
npm run dev
~~~

Open http://localhost:3000.

## What the prototype demonstrates

- Switching among predefined incident scenarios.
- Displaying a hypothetical diagnostic sequence and service topology.
- Showing where a real system would need an approval gate before high-impact actions.
- Drafting a postmortem from the selected mock incident.

## What is not implemented

- Live telemetry, metrics or distributed-trace retrieval.
- Real service dependency discovery or runbook retrieval.
- Authentication, authorization or tenant isolation.
- Real write operations, rollback, change approval, or audit persistence.
- An LLM-powered planner or tool-execution backend.

Before describing this as an operational copilot, implement real read-only adapters, secure tool schemas, durable audit logs, authentication, timeouts and tests. Keep all destructive actions disabled until authorization and approval are enforced server-side.

This repository currently demonstrates UI/workflow design only; it is not an operational SRE tool.
