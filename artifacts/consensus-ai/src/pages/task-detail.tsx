import { useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import {
  useGetTask,
  useGetTaskDeliberations,
  useGetTaskCapsule,
  useExportAuditLog,
  useOverrideTask,
  getGetTaskQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Zap, Brain, Shield, Package, Scale, Copy, Download, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const agentIcons: Record<string, React.ReactNode> = {
  planner: <Brain className="w-5 h-5 text-blue-400" />,
  risk: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  resource: <Package className="w-5 h-5 text-green-400" />,
  ethics: <Shield className="w-5 h-5 text-purple-400" />,
};

const agentColors: Record<string, string> = {
  planner: "border-blue-500/30 bg-blue-500/5",
  risk: "border-amber-500/30 bg-amber-500/5",
  resource: "border-green-500/30 bg-green-500/5",
  ethics: "border-purple-500/30 bg-purple-500/5",
};

function ConfidenceBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-10 text-right">{(score * 100).toFixed(0)}%</span>
    </div>
  );
}

export default function TaskDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideAction, setOverrideAction] = useState("");
  const [overrideRationale, setOverrideRationale] = useState("");

  const { data: task, isLoading: taskLoading } = useGetTask(id, {
    query: { enabled: !!id, queryKey: getGetTaskQueryKey(id) },
  });
  const { data: deliberations, isLoading: delibLoading } = useGetTaskDeliberations(id, {
    query: { enabled: !!id, queryKey: ["getTaskDeliberations", id] },
  });
  const { data: capsule, isLoading: capsuleLoading } = useGetTaskCapsule(id, {
    query: { enabled: !!id, queryKey: ["getTaskCapsule", id] },
  });
  const { data: audit } = useExportAuditLog(id, {
    query: { enabled: !!id, queryKey: ["exportAuditLog", id] },
  });

  const overrideMutation = useOverrideTask();

  const copyHash = useCallback((hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({ title: "Hash copied", description: hash.slice(0, 16) + "..." });
  }, [toast]);

  const downloadAudit = useCallback(() => {
    if (!audit) return;
    const blob = new Blob([JSON.stringify(audit, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-${id}-audit.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [audit, id]);

  const submitOverride = useCallback(() => {
    if (!overrideAction.trim()) return;
    overrideMutation.mutate(
      { id, data: { action: overrideAction, rationale: overrideRationale } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(id) });
          setOverrideOpen(false);
          toast({ title: "Override applied", description: "Human-in-the-loop override recorded to audit trail." });
        },
      }
    );
  }, [id, overrideAction, overrideRationale, overrideMutation, queryClient, toast]);

  if (taskLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 bg-card" />
          <Skeleton className="h-32 bg-card" />
          <Skeleton className="h-64 bg-card" />
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Task not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-primary text-sm">TASK-{String(task.id).padStart(4, "0")}</span>
              <Badge variant={task.routingPath === "fast_path" ? "secondary" : "outline"} className="flex items-center gap-1">
                {task.routingPath === "fast_path" ? <Zap className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                {task.routingPath === "fast_path" ? "FAST-PATH BYPASS" : "COGNITIVE DEBATE"}
              </Badge>
              <Badge variant={task.status === "completed" ? "default" : task.status === "failed" ? "destructive" : "outline"}>
                {task.status.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-2xl font-display font-bold">{task.command}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadAudit} disabled={!audit} data-testid="button-download-audit">
              <Download className="w-4 h-4 mr-2" />
              Export Audit
            </Button>
            {task.status === "completed" && (
              <Button variant="secondary" size="sm" onClick={() => setOverrideOpen(true)} data-testid="button-override">
                Override
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground mb-1">URGENCY SCORE</div>
              <div className={`text-2xl font-mono font-bold ${(task.urgencyScore ?? 0) >= 0.75 ? "text-amber-400" : "text-primary"}`}>
                {((task.urgencyScore ?? 0) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground mb-1">CONSENSUS SCORE</div>
              <div className="text-2xl font-mono font-bold text-primary">
                {task.consensusScore != null ? `${(task.consensusScore * 100).toFixed(1)}%` : "N/A"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground mb-1">EXECUTION TIME</div>
              <div className="text-2xl font-mono font-bold">
                {task.executionTimeMs != null ? `${task.executionTimeMs}ms` : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {task.finalAction && (
          <Card className="bg-card border-border border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Final Operational Action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed" data-testid="text-final-action">{task.finalAction}</p>
            </CardContent>
          </Card>
        )}

        {task.overrideAction && (
          <Card className="bg-card border-border border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-400 uppercase tracking-wider">Human Override Applied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{task.overrideAction}</p>
              {task.overrideRationale && (
                <p className="text-xs text-muted-foreground italic">{task.overrideRationale}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Agent Deliberations */}
        <div>
          <h2 className="text-lg font-display font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Agent Deliberation Pool
          </h2>
          {delibLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 bg-card" />)}
            </div>
          ) : deliberations && deliberations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliberations.map((d) => (
                <Card
                  key={d.id}
                  className={`border ${agentColors[d.agentRole] ?? "border-border bg-card"} ${d.vetoed ? "opacity-60" : ""}`}
                  data-testid={`card-agent-${d.agentRole}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {agentIcons[d.agentRole]}
                        <div>
                          <div className="font-mono text-xs text-muted-foreground">{d.agentRole.toUpperCase()}</div>
                          <div className="font-bold text-sm">{d.agentName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {d.vetoed ? (
                          <div className="flex items-center gap-1 text-destructive text-xs font-mono">
                            <XCircle className="w-3 h-3" />
                            VETO
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-400 text-xs font-mono">
                            <CheckCircle className="w-3 h-3" />
                            ACTIVE
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">W:{d.priorityWeight.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed">{d.proposal}</p>
                    {d.reasoning && (
                      <p className="text-xs text-muted-foreground italic border-t border-border pt-2">{d.reasoning}</p>
                    )}
                    {d.vetoReason && (
                      <p className="text-xs text-destructive border-t border-border pt-2">
                        <span className="font-bold">VETO REASON:</span> {d.vetoReason}
                      </p>
                    )}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">CONFIDENCE</div>
                      <ConfidenceBar score={d.confidenceScore ?? 0} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                {task.routingPath === "fast_path"
                  ? "Fast-Path bypass engaged — agent deliberation skipped for sub-15ms response."
                  : "No deliberations recorded for this task."}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cryptographic Capsule */}
        <div>
          <h2 className="text-lg font-display font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Cryptographic Memory Capsule
          </h2>
          {capsuleLoading ? (
            <Skeleton className="h-32 bg-card" />
          ) : capsule ? (
            <Card className="bg-card border-border">
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">BLOCK INDEX</div>
                    <div className="font-mono font-bold">#{capsule.blockIndex}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">VERIFICATION</div>
                    <div className={`font-mono font-bold text-xs ${capsule.verified ? "text-green-400" : "text-destructive"}`}>
                      {capsule.verified ? "CHAIN VALID" : "CHAIN BROKEN"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">TIMESTAMP</div>
                    <div className="font-mono text-xs">{new Date(capsule.createdAt).toISOString()}</div>
                  </div>
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">BLOCK HASH (SHA-256)</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-primary bg-muted px-2 py-1 rounded flex-1 truncate" data-testid="text-block-hash">
                        {capsule.blockHash}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => copyHash(capsule.blockHash)} data-testid="button-copy-block-hash">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">PREVIOUS HASH</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded flex-1 truncate" data-testid="text-prev-hash">
                        {capsule.previousHash}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => copyHash(capsule.previousHash)} data-testid="button-copy-prev-hash">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No capsule recorded yet — task may still be processing.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Override Modal */}
        {overrideOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-card border-border w-full max-w-lg">
              <CardHeader>
                <CardTitle className="font-display uppercase tracking-wider">Human-in-the-Loop Override</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Override Action</label>
                  <textarea
                    className="w-full mt-1 bg-muted border border-border rounded p-3 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                    placeholder="Specify the manual override action..."
                    value={overrideAction}
                    onChange={(e) => setOverrideAction(e.target.value)}
                    data-testid="input-override-action"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Rationale</label>
                  <textarea
                    className="w-full mt-1 bg-muted border border-border rounded p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                    placeholder="Justification for override (required for audit trail)..."
                    value={overrideRationale}
                    onChange={(e) => setOverrideRationale(e.target.value)}
                    data-testid="input-override-rationale"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setOverrideOpen(false)} data-testid="button-cancel-override">Cancel</Button>
                  <Button
                    onClick={submitOverride}
                    disabled={!overrideAction.trim() || overrideMutation.isPending}
                    data-testid="button-submit-override"
                  >
                    {overrideMutation.isPending ? "Applying..." : "Apply Override"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
