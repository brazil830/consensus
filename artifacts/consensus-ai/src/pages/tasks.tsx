import { Layout } from "@/components/layout";
import { useListTasks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Zap, Brain, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, { variant: "default" | "outline" | "destructive" | "secondary"; label: string }> = {
    completed: { variant: "default", label: "COMPLETED" },
    fast_path: { variant: "secondary", label: "FAST-PATH" },
    debating: { variant: "outline", label: "DEBATING" },
    pending: { variant: "outline", label: "PENDING" },
    failed: { variant: "destructive", label: "FAILED" },
    overridden: { variant: "secondary", label: "OVERRIDDEN" },
  };
  return map[status] ?? { variant: "outline" as const, label: status.toUpperCase() };
}

function routingIcon(path: string) {
  return path === "fast_path"
    ? <Zap className="w-4 h-4 text-amber-400" />
    : <Brain className="w-4 h-4 text-primary" />;
}

export default function Tasks() {
  const { data: tasks, isLoading } = useListTasks();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold uppercase tracking-wider">Mission Tasks</h1>
            <p className="text-muted-foreground">All operational tasks and their execution records</p>
          </div>
          <Link
            href="/new-task"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded text-sm hover:bg-primary/90 transition-colors"
            data-testid="button-new-task"
          >
            <Zap className="w-4 h-4" />
            NEW COMMAND
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 bg-card" />)}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => {
              const { variant, label } = statusBadge(task.status);
              return (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <Card
                    className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
                    data-testid={`card-task-${task.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5">{routingIcon(task.routingPath)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-primary">TASK-{String(task.id).padStart(4, "0")}</span>
                              <span className="text-xs text-muted-foreground">
                                {task.routingPath === "fast_path" ? "Fast-Path Bypass" : "Cognitive Debate"}
                              </span>
                            </div>
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {task.command}
                            </p>
                            {task.finalAction && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">{task.finalAction}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge variant={variant} className="text-xs">{label}</Badge>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {task.executionTimeMs != null && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.executionTimeMs}ms
                              </span>
                            )}
                            {task.urgencyScore != null && (
                              <span className={`font-mono ${task.urgencyScore >= 0.75 ? "text-amber-400" : "text-muted-foreground"}`}>
                                URG: {(task.urgencyScore * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No tasks dispatched yet</p>
              <p className="text-sm text-muted-foreground mt-1">Submit a command to initialize the multi-agent debate engine</p>
              <Link href="/new-task" className="inline-flex mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded hover:bg-primary/90 transition-colors">
                DISPATCH FIRST COMMAND
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
