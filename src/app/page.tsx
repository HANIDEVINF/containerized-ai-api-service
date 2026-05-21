"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Cloud,
  Code2,
  Database,
  FileText,
  GitBranch,
  Gauge,
  LockKeyhole,
  Play,
  Radar,
  RefreshCcw,
  Server,
  ShieldCheck,
  TerminalSquare,
  Users,
  Zap,
} from "lucide-react"

type IncidentKey = "checkout" | "latency" | "auth"
type ToolState = "ready" | "running" | "complete" | "blocked"

const incidents = {
  checkout: {
    title: "Checkout API error spike",
    severity: "SEV-1",
    service: "payments-api",
    impact: "14.8% checkout failures across EU traffic",
    signal: "HTTP 500 rate jumped from 0.2% to 9.7% after deploy 8f42c1",
    likelyCause: "Stripe webhook signature validation changed without updated secret",
    eta: "11 min",
  },
  latency: {
    title: "Search latency regression",
    severity: "SEV-2",
    service: "catalog-search",
    impact: "p95 latency at 2.9s for premium customers",
    signal: "Vector reranker queue depth increased after traffic shift",
    likelyCause: "Embedding cache misses caused by new locale routing",
    eta: "18 min",
  },
  auth: {
    title: "Login failures for enterprise tenants",
    severity: "SEV-1",
    service: "identity-gateway",
    impact: "SSO login failure for 23 enterprise tenants",
    signal: "OIDC callback rejects increased after certificate rotation",
    likelyCause: "Expired cert chain cached in edge workers",
    eta: "9 min",
  },
} satisfies Record<IncidentKey, { title: string; severity: string; service: string; impact: string; signal: string; likelyCause: string; eta: string }>

const serviceGraph = [
  { name: "web-app", health: 94, type: "frontend" },
  { name: "api-gateway", health: 88, type: "edge" },
  { name: "payments-api", health: 41, type: "api" },
  { name: "orders-db", health: 79, type: "database" },
  { name: "queue-worker", health: 68, type: "worker" },
  { name: "observability", health: 96, type: "telemetry" },
]

const toolCatalog = [
  { name: "log_search", purpose: "Query traces and correlated logs", icon: TerminalSquare },
  { name: "deploy_diff", purpose: "Compare latest release changes", icon: GitBranch },
  { name: "runbook_lookup", purpose: "Retrieve incident playbooks", icon: FileText },
  { name: "feature_flag", purpose: "Prepare safe rollback switch", icon: Code2 },
  { name: "customer_impact", purpose: "Estimate accounts and revenue at risk", icon: Users },
  { name: "policy_guard", purpose: "Require approval before risky actions", icon: LockKeyhole },
]

function buildRunbook(incident: (typeof incidents)[IncidentKey]) {
  return [
    `Freeze deploys touching ${incident.service}`,
    "Collect top traces, logs, recent deploy diff, and customer impact",
    `Validate hypothesis: ${incident.likelyCause}`,
    "Prepare low-risk mitigation with rollback path",
    "Publish customer-facing status update with ETA and owner",
    "Create postmortem draft with timeline and prevention tasks",
  ]
}

export default function Home() {
  const [incidentKey, setIncidentKey] = useState<IncidentKey>("checkout")
  const [running, setRunning] = useState(false)
  const [toolStates, setToolStates] = useState<ToolState[]>(["complete", "complete", "complete", "ready", "complete", "blocked"])
  const [approvalMode, setApprovalMode] = useState(true)
  const [timeline, setTimeline] = useState(14)
  const incident = incidents[incidentKey]
  const runbook = useMemo(() => buildRunbook(incident), [incident])
  const risk = incident.severity === "SEV-1" ? 91 : 73
  const automationReadiness = approvalMode ? 82 : 64
  const affectedRevenue = incidentKey === "checkout" ? "$42.7k/hr" : incidentKey === "auth" ? "$31.2k/hr" : "$8.6k/hr"

  function runCopilot() {
    setRunning(true)
    setToolStates(["running", "ready", "ready", "ready", "ready", approvalMode ? "blocked" : "ready"])
    window.setTimeout(() => setToolStates(["complete", "running", "ready", "ready", "ready", approvalMode ? "blocked" : "ready"]), 260)
    window.setTimeout(() => setToolStates(["complete", "complete", "running", "ready", "ready", approvalMode ? "blocked" : "ready"]), 520)
    window.setTimeout(() => setToolStates(["complete", "complete", "complete", "running", "running", approvalMode ? "blocked" : "running"]), 780)
    window.setTimeout(() => {
      setToolStates(["complete", "complete", "complete", "complete", "complete", approvalMode ? "blocked" : "complete"])
      setRunning(false)
      setTimeline((value) => value + 1)
    }, 1100)
  }

  return (
    <main className="min-h-screen bg-[#070b12] text-slate-50">
      <header className="border-b border-white/10 bg-[#070b12]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-300 text-slate-950">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-black">OpsPilot AI</div>
              <div className="text-xs text-slate-400">Agentic incident response platform</div>
            </div>
          </div>
          <button
            onClick={runCopilot}
            className="flex items-center gap-2 rounded-md bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950"
          >
            {running ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Copilot
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-emerald-200">
              <Radar className="h-4 w-4" />
              Incident queue
            </div>
            <div className="space-y-3">
              {(Object.keys(incidents) as IncidentKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setIncidentKey(key)}
                  className={`w-full rounded-md border p-4 text-left transition ${
                    incidentKey === key ? "border-emerald-300 bg-emerald-300/10" : "border-white/10 bg-slate-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{incidents[key].title}</span>
                    <span className="rounded bg-red-300 px-2 py-1 text-xs font-black text-slate-950">{incidents[key].severity}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{incidents[key].service}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#f5f2ea] p-5 text-slate-950">
            <div className="flex items-center gap-2 font-black">
              <ShieldCheck className="h-5 w-5" />
              Governance mode
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Risky actions require approval, audit logs, and rollback instructions before execution.
            </p>
            <button
              onClick={() => setApprovalMode((value) => !value)}
              className="mt-4 w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white"
            >
              Approval {approvalMode ? "Required" : "Relaxed"}
            </button>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Severity", incident.severity],
              ["Risk", `${risk}%`],
              ["Revenue at risk", affectedRevenue],
              ["ETA", incident.eta],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm text-slate-400">{label}</div>
                <div className="mt-2 text-2xl font-black text-emerald-200">{value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  Active incident
                </div>
                <h1 className="text-4xl font-black">{incident.title}</h1>
                <p className="mt-3 max-w-3xl leading-7 text-slate-300">{incident.impact}. {incident.signal}.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
                <div className="text-sm text-slate-400">Likely root cause</div>
                <div className="mt-2 max-w-sm font-bold text-cyan-100">{incident.likelyCause}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-6">
              {serviceGraph.map((service) => (
                <div key={service.name} className="rounded-md border border-white/10 bg-slate-950 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    {service.type === "database" ? <Database className="h-4 w-4 text-cyan-200" /> : service.type === "api" ? <Server className="h-4 w-4 text-orange-200" /> : <Cloud className="h-4 w-4 text-emerald-200" />}
                    <span className={service.health < 60 ? "text-red-200" : service.health < 80 ? "text-amber-200" : "text-emerald-200"}>{service.health}%</span>
                  </div>
                  <div className="text-sm font-bold">{service.name}</div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className={`h-2 rounded-full ${service.health < 60 ? "bg-red-300" : service.health < 80 ? "bg-amber-300" : "bg-emerald-300"}`} style={{ width: `${service.health}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center gap-2">
                <TerminalSquare className="h-5 w-5 text-cyan-300" />
                <h2 className="text-xl font-bold">Tool Calls</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {toolCatalog.map((tool, index) => (
                  <div key={tool.name} className="rounded-md border border-white/10 bg-slate-950 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <tool.icon className="h-5 w-5 text-cyan-200" />
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold ${
                          toolStates[index] === "complete"
                            ? "bg-emerald-300 text-slate-950"
                            : toolStates[index] === "running"
                              ? "bg-cyan-300 text-slate-950"
                              : toolStates[index] === "blocked"
                                ? "bg-amber-300 text-slate-950"
                                : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {toolStates[index]}
                      </span>
                    </div>
                    <div className="font-bold">{tool.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{tool.purpose}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-emerald-300" />
                  <h2 className="text-xl font-bold">Automation Readiness</h2>
                </div>
                <div className="text-5xl font-black text-emerald-200">{automationReadiness}%</div>
                <div className="mt-4 h-3 rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-emerald-300" style={{ width: `${automationReadiness}%` }} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Recommended: execute read-only diagnostics automatically, require approval for rollback and customer messaging.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#f5f2ea] p-5 text-slate-950">
                <div className="mb-3 flex items-center gap-2 font-black">
                  <Activity className="h-5 w-5" />
                  Executive summary
                </div>
                <p className="text-sm leading-6 text-slate-700">
                  {incident.service} is the primary degraded service. Estimated mitigation is {incident.eta}; revenue exposure is {affectedRevenue}. A postmortem draft and customer update are ready.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-300" />
              <h2 className="text-xl font-bold">Runbook Plan</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {runbook.map((step, index) => (
                <div key={step} className="rounded-md border border-white/10 bg-slate-950 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    {index < 3 ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Clock className="h-4 w-4 text-slate-500" />}
                    <span className="text-xs text-slate-500">T+{timeline + index * 3}m</span>
                  </div>
                  <div className="font-bold">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
