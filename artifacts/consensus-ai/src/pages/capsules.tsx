import { useCallback } from "react";
import { Layout } from "@/components/layout";
import { useListCapsules } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, Copy, CheckCircle, XCircle, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Capsules() {
  const { data: capsules, isLoading } = useListCapsules();
  const { toast } = useToast();

  const copyHash = useCallback((hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({ title: "Hash copied to clipboard", description: hash.slice(0, 20) + "..." });
  }, [toast]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-wider">Memory Capsule Ledger</h1>
          <p className="text-muted-foreground">Cryptographically chained SHA-256 audit trail — tamper-evident decision records</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 bg-card" />)}
          </div>
        ) : capsules && capsules.length > 0 ? (
          <div className="space-y-3">
            {capsules.map((capsule, idx) => (
              <Card
                key={capsule.id}
                className={`bg-card border transition-colors ${capsule.verified ? "border-border hover:border-primary/30" : "border-destructive/50"}`}
                data-testid={`card-capsule-${capsule.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {capsule.verified
                          ? <Shield className="w-5 h-5 text-green-400" />
                          : <XCircle className="w-5 h-5 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-primary">BLOCK #{capsule.blockIndex}</span>
                          <span className="text-xs text-muted-foreground font-mono">TASK-{String(capsule.taskId).padStart(4, "0")}</span>
                          <Badge variant={capsule.verified ? "default" : "destructive"} className="text-xs">
                            {capsule.verified ? "CHAIN VALID" : "CHAIN BROKEN"}
                          </Badge>
                          {idx < (capsules.length - 1) && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Link2 className="w-3 h-3" />
                              linked
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-24 shrink-0">BLOCK HASH</span>
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <code className="text-xs font-mono text-primary truncate" data-testid={`text-hash-${capsule.id}`}>
                                {capsule.blockHash}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 shrink-0"
                                onClick={() => copyHash(capsule.blockHash)}
                                data-testid={`button-copy-${capsule.id}`}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-24 shrink-0">PREV HASH</span>
                            <code className="text-xs font-mono text-muted-foreground/70 truncate flex-1">
                              {capsule.previousHash}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-xs text-muted-foreground font-mono">
                        {new Date(capsule.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                      </div>
                      <Link href={`/tasks/${capsule.taskId}`} className="text-xs text-primary hover:underline font-mono">
                        VIEW TASK →
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No capsule records yet</p>
              <p className="text-sm text-muted-foreground mt-1">Capsules are generated automatically after each task completes</p>
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
