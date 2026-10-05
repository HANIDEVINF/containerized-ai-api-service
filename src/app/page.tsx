"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  GitBranch,
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
type ToolState = "ready" | "running" | "complete" | "blocked" | "approved"

const incidents = {
  checkout: {
    title: "Checkout API 500 Surge",
    severity: "SEV-1",
    service: "payments-api",
    impact: "14.8% checkout failures across EU-West Kubernetes cluster",
    signal: "HTTP 500 rate spiked from 0.2% → 9.7% after commit 8f42c1a",
    likelyCause: "Stripe webhook HMAC signature secret mismatch on new replica pods",
    eta: "9 min",
    revenueAtRisk: "$42.7k / hr",
    healthMap: { "web-edge": 96, "api-gateway": 89, "payments-api": 38, "orders-db": 84, "redis-queue": 72, "otel-collector": 99 },
  },
  latency: {
    title: "Vector Reranker P99 Regression",
    severity: "SEV-2",
    service: "rag-search-worker",
    impact: "p99 retrieval latency hit 2,940 ms for enterprise workspaces",
    signal: "HNSW index cache eviction spike following multilingual query surge",
    likelyCause: "Unbounded batch size on cross-encoder reranker worker pool",
    eta: "14 min",
    revenueAtRisk: "$11.4k / hr",
    healthMap: { "web-edge": 98, "api-gateway": 94, "payments-api": 99, "orders-db": 92, "redis-queue": 44, "otel-collector": 97 },
  },
  auth: {
    title: "Enterprise OIDC Handshake Failure",
    severity: "SEV-1",
    service: "identity-gateway",
    impact: "SSO login rejections across 23 enterprise hospital & fintech tenants",
    signal: "TLS x509 intermediate chain validation error on edge workers",
    likelyCause: "Stale JWKS & intermediate cert cached in Cloudflare/Envoy edge nodes",
    eta: "7 min",
    revenueAtRisk: "$34.8k / hr",
    healthMap: { "web-edge": 74, "api-gateway": 41, "payments-api": 97, "orders-db": 95, "redis-queue": 91, "otel-collector": 98 },
  },
} satisfies Record<
  IncidentKey,
  {
    title: string
    severity: string
    service: string
    impact: string
    signal: string
    likelyCause: string
    eta: string
    revenueAtRisk: string
    healthMap: Record<string, number>
  }
>

const toolCatalog = [
  { id: "log_search", name: "otel_trace_correlator()", purpose: "Correlate distributed spans & 5xx logs", risky: false },
  { id: "deploy_diff", name: "git_diff_inspector()", purpose: "Inspect commit 8f42c1a env & config delta", risky: false },
  { id: "runbook_lookup", name: "sre_playbook_rag()", purpose: "Retrieve verified mitigation runbook", risky: false },
  { id: "customer_impact", name: "sla_blast_radius()", purpose: "Quantify affected enterprise tenants", risky: false },
  { id: "feature_flag", name: "k8s_canary_rollback()", purpose: "Roll back deployment & flush worker cache", risky: true },
  { id: "status_page", name: "statuspage_broadcast()", purpose: "Publish signed incident advisory to tenants", risky: true },
]

export default function Home() {
  const [incidentKey, setIncidentKey] = useState<IncidentKey>("checkout")
  const [customSignal, setCustomSignal] = useState("")
  const [running, setRunning] = useState(false)
  const [approvalMode, setApprovalMode] = useState(true)
  const [toolStates, setToolStates] = useState<ToolState[]>([
    "complete",
    "complete",
    "complete",
    "complete",
    "blocked",
    "blocked",
  ])
  const [timeline, setTimeline] = useState(14)

  const incident = incidents[incidentKey]
  const activeSignal = customSignal.trim() || incident.signal

  function selectIncident(key: IncidentKey) {
    setIncidentKey(key)
    setCustomSignal("")
    setToolStates(["complete", "complete", "complete", "complete", approvalMode ? "blocked" : "complete", approvalMode ? "blocked" : "complete"])
  }

  function runCopilot() {
    setRunning(true)
    setToolStates(["running", "ready", "ready", "ready", approvalMode ? "blocked" : "ready", approvalMode ? "blocked" : "ready"])
    window.setTimeout(() => {
      setToolStates(["complete", "running", "running", "ready", approvalMode ? "blocked" : "ready", approvalMode ? "blocked" : "ready"])
    }, 300)
    window.setTimeout(() => {
      setToolStates(["complete", "complete", "complete", "running", approvalMode ? "blocked" : "running", approvalMode ? "blocked" : "ready"])
    }, 650)
    window.setTimeout(() => {
      setToolStates([
        "complete",
        "complete",
        "complete",
        "complete",
        approvalMode ? "blocked" : "complete",
        approvalMode ? "blocked" : "complete",
      ])
      setRunning(false)
      setTimeline((v) => v + 1)
    }, 1050)
  }

  function approveTool(index: number) {
    setToolStates((prev) => prev.map((st, idx) => (idx === index ? "approved" : st)))
  }

  const approvedCount = toolStates.filter((s) => s === "complete" || s === "approved").length
  const readiness = Math.round((approvedCount / toolStates.length) * 100)

  const postmortemMarkdown = useMemo(() => {
    return `### Incident Postmortem Draft (${incident.severity})
- **Primary Degraded Service:** \`${incident.service}\`
- **Telemetry Trigger:** ${activeSignal}
- **Root Cause Hypothesis:** ${incident.likelyCause}
- **Blast Radius & Exposure:** ${incident.impact} (${incident.revenueAtRisk})
- **Mitigation Status:** ${
      toolStates[4] === "approved" || toolStates[4] === "complete"
        ? "✅ Rollback & cache purge executed with human-in-the-loop sign-off."
        : "⏳ Diagnostic tools complete; awaiting human SRE approval for production rollback."
    }`
  }, [incident, activeSignal, toolStates])

  return (
    <main className="min-h-screen bg-[#07050d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(168,85,247,0.14),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(236,72,153,0.1),transparent_42%)]" />

      <header className="relative border-b border-purple-500/20 bg-[#0b0716]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-gradient-to-br from-purple-600/30 to-fuchsia-600/20 text-purple-300">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">OpsPilot SRE Incident Copilot</span>
                <span className="rounded-full border border-purple-500/30 bg-purple-950/60 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-purple-300">
                  Human-in-the-Loop Governance
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated OTel Trace Triage · Service Dependency Topology · Gated Rollback Execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setApprovalMode((v) => !v)}
              className={`rounded-xl border px-3 py-2 font-mono text-xs font-bold transition ${
                approvalMode
                  ? "border-amber-500/40 bg-amber-950/40 text-amber-200"
                  : "border-rose-500/40 bg-rose-950/40 text-rose-200"
              }`}
            >
              {approvalMode ? "🔒 Strict Human Approval Gate: ON" : "⚡ Autonomous Write Execution: ON"}
            </button>
            <button
              onClick={runCopilot}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-fuchsia-600"
            >
              {running ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run Diagnostic Sweep
            </button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[380px_1fr]">
        {/* Left Incident Queue */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-purple-500/25 bg-[#0e091d]/90 p-5">
            <div className="mb-3 text-xs font-mono uppercase tracking-wider text-purple-300">
              Active PagerDuty / OTel Alerts
            </div>
            <div className="space-y-2.5">
              {(Object.keys(incidents) as IncidentKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => selectIncident(key)}
                  className={`w-full rounded-xl border p-3.5 text-left transition ${
                    incidentKey === key
                      ? "border-purple-400 bg-purple-950/50"
                      : "border-purple-500/15 bg-[#080511] hover:border-purple-500/35"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{incidents[key].title}</span>
                    <span className="rounded-md border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-black text-rose-200">
                      {incidents[key].severity}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-purple-300">{incidents[key].service}</div>
                  <p className="mt-1 text-xs text-slate-400">{incidents[key].impact}</p>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block font-mono text-xs text-purple-300">
                INJECT CUSTOM TELEMETRY ANOMALY
              </label>
              <textarea
                value={customSignal}
                onChange={(e) => setCustomSignal(e.target.value)}
                className="h-24 w-full resize-none rounded-xl border border-purple-500/25 bg-[#07050d] p-3 font-mono text-xs text-white outline-none focus:border-purple-400"
                placeholder="Paste custom stack trace, OTel alert, or K8s pod crash log to override the incident signal..."
              />
            </div>
          </div>

          {/* Service Mesh Health */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#0e091d]/90 p-5">
            <div className="mb-3 text-xs font-mono uppercase tracking-wider text-purple-300">
              Live Service Dependency Mesh
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(incident.healthMap).map(([svc, health]) => {
                const degraded = health < 60
                const warn = health >= 60 && health < 85
                return (
                  <div
                    key={svc}
                    className={`rounded-xl border p-3 ${
                      degraded
                        ? "border-rose-500/40 bg-rose-950/30"
                        : warn
                          ? "border-amber-500/30 bg-amber-950/20"
                          : "border-purple-500/15 bg-[#080511]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="truncate font-bold text-white">{svc}</span>
                      <span
                        className={
                          degraded ? "font-black text-rose-300" : warn ? "text-amber-300" : "text-emerald-300"
                        }
                      >
                        {health}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full ${
                          degraded ? "bg-rose-500" : warn ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${health}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Right Operations Workbench */}
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Degraded Service", incident.service],
              ["Revenue Exposure", incident.revenueAtRisk],
              ["Estimated MTTR", incident.eta],
              ["Execution Progress", `${readiness}% (${approvedCount}/6 tools)`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-purple-500/20 bg-[#0e091d]/90 p-4">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">{label}</div>
                <div className="mt-2 text-xl font-black text-white">{value}</div>
              </div>
            ))}
          </div>

          {/* Root Cause & Signal Banner */}
          <div className="rounded-2xl border border-purple-500/25 bg-[#0e091d]/95 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-purple-500/15 bg-[#080511] p-4">
                <div className="text-xs font-mono uppercase text-purple-300">Correlated Anomaly Signal</div>
                <p className="mt-1.5 font-mono text-xs leading-relaxed text-slate-200">{activeSignal}</p>
              </div>
              <div className="rounded-xl border border-purple-500/15 bg-[#080511] p-4">
                <div className="text-xs font-mono uppercase text-fuchsia-300">Root Cause Hypothesis (Confidence 94%)</div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-200">{incident.likelyCause}</p>
              </div>
            </div>
          </div>

          {/* Agent Tool-Call Governance Grid */}
          <div className="rounded-2xl border border-purple-500/25 bg-[#0e091d]/95 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Agentic Tool-Call Execution & Human Approval Gates</h2>
              </div>
              <span className="font-mono text-xs text-slate-400">Read-only tools run automatically; write actions require sign-off</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {toolCatalog.map((tool, index) => {
                const st = toolStates[index]
                return (
                  <div
                    key={tool.id}
                    className={`rounded-xl border p-4 transition ${
                      st === "blocked"
                        ? "border-amber-500/40 bg-amber-950/15"
                        : st === "approved"
                          ? "border-emerald-500/40 bg-emerald-950/20"
                          : "border-purple-500/20 bg-[#080511]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{tool.name}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          st === "complete" || st === "approved"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : st === "blocked"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-purple-500/20 text-purple-300"
                        }`}
                      >
                        {st === "blocked" ? "AWAITING SRE APPROVAL" : st}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">{tool.purpose}</p>

                    {st === "blocked" && (
                      <button
                        onClick={() => approveTool(index)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 font-mono text-xs font-bold text-slate-950 shadow hover:from-amber-400 hover:to-orange-400"
                      >
                        <LockKeyhole className="h-3.5 w-3.5" /> Approve & Execute Write Action
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Automated Postmortem Draft */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#0e091d]/90 p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Live Auto-Generated SRE Postmortem</h2>
              </div>
              <span className="font-mono text-xs text-purple-300">Timeline T+{timeline}m</span>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border border-purple-500/15 bg-[#080511] p-4 font-mono text-xs leading-relaxed text-slate-200">
              {postmortemMarkdown}
            </pre>
          </div>
        </section>
      </section>
    </main>
  )
}
