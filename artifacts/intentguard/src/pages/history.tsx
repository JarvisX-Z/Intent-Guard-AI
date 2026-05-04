import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  History as HistoryIcon, 
  ShieldAlert, 
  CheckCircle2,
  FileCode2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useListAnalyses } from "@workspace/api-client-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export function History() {
  const { data, isLoading, isError } = useListAnalyses({ limit: 50 });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <HistoryIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analysis History</h1>
          <p className="text-muted-foreground text-sm">Past transaction intent verifications.</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/50">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2 w-full">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="w-full sm:w-auto">
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {!isLoading && !isError && data?.analyses.length === 0 && (
          <div className="text-center py-20 px-4 border border-dashed rounded-xl bg-card/30">
            <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No history yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              You haven't run any transaction analyses yet. Verify your first transaction intent to see it here.
            </p>
            <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Run Analysis
            </Link>
          </div>
        )}

        {!isLoading && data?.analyses.map((analysis, i) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Card className="overflow-hidden border border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                  
                  {/* Status Indicator Bar */}
                  <div className={`w-full sm:w-2 h-2 sm:h-auto self-stretch ${
                    analysis.intentMatch 
                      ? analysis.riskScore < 50 ? "bg-green-500" : "bg-yellow-500" 
                      : "bg-destructive"
                  }`} />
                  
                  <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    
                    {/* Icon & Match Status */}
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        analysis.intentMatch ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                      }`}>
                        {analysis.intentMatch ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {analysis.intentMatch ? "Intent Match" : "Mismatch"}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <FileCode2 className="h-3 w-3" />
                          <span className="font-mono">{analysis.transactionSignature.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    {/* Intent text */}
                    <div className="flex-1 min-w-0 w-full">
                      <p className="text-sm line-clamp-2 text-foreground/80 font-medium">
                        "{analysis.userIntent}"
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] font-mono bg-background">
                          {analysis.transactionType}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center">
                          {format(new Date(analysis.analyzedAt), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                    </div>

                    {/* Risk Score */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Risk Score</span>
                        <div className="flex items-center gap-2">
                          <div className={`text-xl font-bold font-mono ${
                            analysis.riskScore < 50 ? "text-green-500" : 
                            analysis.riskScore < 75 ? "text-yellow-500" : "text-destructive"
                          }`}>
                            {analysis.riskScore}
                          </div>
                          {analysis.warnings.length > 0 && (
                            <Badge variant="destructive" className="h-5 px-1 bg-destructive/20 text-destructive border-none">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {analysis.warnings.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
