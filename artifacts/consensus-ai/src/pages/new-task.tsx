import { useState, useRef, useCallback, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Zap, Brain, Shield, Package, AlertTriangle, CheckCircle, Loader2, Send } from "lucide-react";

type UrgencyLevel = "auto" | "low" | "medium" | "high" | "critical";

interface StreamEvent {
  type: string;
  agentName?: string;
  agentRole?: string;
  token?: string;
  proposal?: string;
  confidenceScore?: number;
  vetoed?: boolean;
  consensusScore?: number;
  finalAction?: string;
  taskId?: number;
  routingPath?: string;
  urgencyScore?: number;
  message?: string;
}

interface AgentState {
  name: string;
  role: string;
  tokens: string;
  proposal?: string;
  confidenceScore?: number;
  vetoed?: boolean;
  status: "waiting" | "streaming" | "done";
}

const agentIcons: Record<string, React.ReactNode> = {
  planner: <Brain className="w-4 h-4 text-blue-400" />,
  risk: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  resource: <Package className="w-4 h-4 text-green-400" />,
  ethics: <Shield className="w-4 h-4 text-purple-400" />,
};

const urgencyOptions: { value: UrgencyLevel; label: string; desc: string; color: string }[] = [
  { value: "auto", label: "AUTO-DETECT", desc: "System scores urgency from context", color: "text-muted-foreground" },
  { value: "low", label: "LOW", desc: "Standard operation", color: "text-green-400" },
  { value: "medium", label: "MEDIUM", desc: "Elevated monitoring required", color: "text-yellow-400" },
  { value: "high", label: "HIGH", desc: "Priority routing engaged", color: "text-orange-400" },
  { value: "critical", label: "CRITICAL", desc: "Fast-Path bypass triggered", color: "text-red-400" },
];

export default function NewTask() {
  const [, setLocation] = useLocation();
  const [command, setCommand] = useState("");
  const [context, setContext] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("auto");
  const [streaming, setStreaming] = useState(false);
  const [done, setDone] = useState(false);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [routingPath, setRoutingPath] = useState<string | null>(null);
  const [urgencyScore, setUrgencyScore] = useState<number | null>(null);
  const [finalAction, setFinalAction] = useState<string | null>(null);
  const [consensusScore, setConsensusScore] = useState<number | null>(null);
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  const [fastPathMessage, setFastPathMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agents, finalAction]);

  const handleSubmit = useCallback(async () => {
    if (!command.trim() || streaming) return;

    setStreaming(true);
    setDone(false);
    setAgents([]);
    setRoutingPath(null);
    setUrgencyScore(null);
    setFinalAction(null);
    setConsensusScore(null);
    setFastPathMessage(null);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: command.trim(),
          context: context.trim() || "{}",
          urgencyLevel: urgency === "auto" ? undefined : urgency,
        }),
        signal: abortRef.current.signal,
      });

      const taskId = res.headers.get("X-Task-Id");
      if (taskId) setCompletedTaskId(parseInt(taskId));

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: StreamEvent = JSON.parse(line.slice(6));

            if (event.type === "routing") {
              setRoutingPath(event.routingPath ?? null);
              setUrgencyScore(event.urgencyScore ?? null);
              if (event.taskId) setCompletedTaskId(event.taskId);
            } else if (event.type === "fast_path_action") {
              setFastPathMessage(event.message ?? null);
            } else if (event.type === "agent_start") {
              setAgents((prev) => [
                ...prev,
                { name: event.agentName!, role: event.agentRole!, tokens: "", status: "streaming" },
              ]);
            } else if (event.type === "agent_token") {
              setAgents((prev) =>
                prev.map((a) =>
                  a.name === event.agentName ? { ...a, tokens: a.tokens + (event.token ?? "") } : a
                )
              );
            } else if (event.type === "agent_complete") {
              setAgents((prev) =>
                prev.map((a) =>
                  a.name === event.agentName
                    ? { ...a, status: "done", proposal: event.proposal, confidenceScore: event.confidenceScore, vetoed: event.vetoed }
                    : a
                )
              );
            } else if (event.type === "consensus") {
              setConsensusScore(event.consensusScore ?? null);
              setFinalAction(event.finalAction ?? null);
            } else if (event.type === "complete") {
              if (event.taskId) setCompletedTaskId(event.taskId);
              if (event.finalAction) setFinalAction(event.finalAction);
              setDone(true);
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setDone(true);
      }
    } finally {
      setStreaming(false);
    }
  }, [command, context, urgency, streaming]);

  const estimatedPath = urgency === "critical" ? "fast_path"
    : urgency === "high" ? "fast_path"
    : "cognitive_debate";

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-wider">Command Input</h1>
          <p className="text-muted-foreground">Dispatch an operational task to the multi-agent governance engine</p>
        </div>

        {!streaming && !done && (
          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-5">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 block">
                  Operational Command *
                </label>
                <textarea
                  className="w-full bg-muted border border-border rounded p-3 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50 min-h-[100px]"
                  placeholder="e.g. Route medical drone to Zone-7 avoiding weather anomaly sector..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  data-testid="input-command"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 block">
                  Telemetry Context
                </label>
                <textarea
                  className="w-full bg-muted border border-border rounded p-3 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50 min-h-[80px]"
                  placeholder='e.g. {"altitude": 120, "battery": 68, "weather": "storm_front", "cargo": "critical_meds"}'
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  data-testid="input-context"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 block">
                  Urgency Classification
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {urgencyOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setUrgency(opt.value)}
                      className={`border rounded p-2 text-center transition-all ${
                        urgency === opt.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-border/80"
                      }`}
                      data-testid={`button-urgency-${opt.value}`}
                    >
                      <div className={`text-xs font-mono font-bold ${opt.color}`}>{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Estimated routing:{" "}
                  <span className={estimatedPath === "fast_path" ? "text-amber-400 font-mono" : "text-primary font-mono"}>
                    {estimatedPath === "fast_path" ? "FAST-PATH BYPASS" : "COGNITIVE DEBATE"}
                  </span>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!command.trim()}
                  className="gap-2 font-bold"
                  data-testid="button-dispatch"
                >
                  <Send className="w-4 h-4" />
                  DISPATCH
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {(streaming || done) && (
          <div className="space-y-4">
            {routingPath && (
              <Card className={`border ${routingPath === "fast_path" ? "border-amber-500/50 bg-amber-500/5" : "border-primary/50 bg-primary/5"}`}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {routingPath === "fast_path" ? <Zap className="w-5 h-5 text-amber-400" /> : <Brain className="w-5 h-5 text-primary" />}
                    <div>
                      <div className={`font-mono font-bold ${routingPath === "fast_path" ? "text-amber-400" : "text-primary"}`}>
                        {routingPath === "fast_path" ? "FAST-PATH BYPASS ENGAGED" : "COGNITIVE DEBATE ENGINE ACTIVE"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Urgency score: {urgencyScore != null ? `${(urgencyScore * 100).toFixed(1)}%` : "—"}
                      </div>
                    </div>
                  </div>
                  {streaming && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                </CardContent>
              </Card>
            )}

            {fastPathMessage && (
              <Card className="border-amber-500/50 bg-amber-500/5">
                <CardContent className="pt-4">
                  <p className="text-sm font-mono text-amber-200">{fastPathMessage}</p>
                </CardContent>
              </Card>
            )}

            {agents.map((agent) => (
              <Card
                key={agent.name}
                className={`border transition-all ${
                  agent.status === "streaming" ? "border-primary/50" : agent.vetoed ? "border-destructive/30 opacity-70" : "border-border"
                }`}
                data-testid={`card-stream-agent-${agent.role}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {agentIcons[agent.role]}
                      <span className="font-mono text-xs text-muted-foreground">{agent.role.toUpperCase()}</span>
                      <span className="font-bold text-sm">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.status === "streaming" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                      {agent.status === "done" && agent.vetoed && (
                        <span className="text-xs font-mono text-destructive flex items-center gap-1"><CheckCircle className="w-3 h-3" />VETO</span>
                      )}
                      {agent.status === "done" && !agent.vetoed && (
                        <span className="text-xs font-mono text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />ACTIVE</span>
                      )}
                      {agent.confidenceScore != null && (
                        <span className="text-xs font-mono text-muted-foreground">{(agent.confidenceScore * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {agent.proposal ? (
                  <CardContent>
                    <p className="text-sm leading-relaxed">{agent.proposal}</p>
                  </CardContent>
                ) : agent.tokens ? (
                  <CardContent>
                    <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">{agent.tokens}</p>
                  </CardContent>
                ) : null}
              </Card>
            ))}

            {finalAction && (
              <Card className="border-primary/60 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Nash-Equilibrium Consensus — Final Action
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm leading-relaxed" data-testid="text-stream-final-action">{finalAction}</p>
                  {consensusScore != null && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Consensus Score:</span>
                      <span className="font-mono text-primary font-bold">{(consensusScore * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div ref={streamEndRef} />

            {done && (
              <div className="flex gap-3 pt-2">
                {completedTaskId && (
                  <Button onClick={() => setLocation(`/tasks/${completedTaskId}`)} data-testid="button-view-task">
                    View Task Detail
                  </Button>
                )}
                <Button variant="outline" onClick={() => { setDone(false); setCommand(""); setContext(""); }} data-testid="button-new-command">
                  New Command
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
