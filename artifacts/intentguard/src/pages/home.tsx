import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeTransaction } from "@workspace/api-client-react";
import type { AnalysisResult } from "@workspace/api-client-react";
import { 
  Shield, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  ArrowRight,
  Activity,
  FileCode2,
  Lock,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RiskGauge } from "@/components/risk-gauge";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  transaction: z.string().min(1, "Transaction signature is required").max(2000),
  userIntent: z.string().min(10, "Please provide more detail about your intent").max(1000),
  rpcUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function Home() {
  const { toast } = useToast();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transaction: "",
      userIntent: "",
      rpcUrl: "",
    },
  });

  const analyzeTransaction = useAnalyzeTransaction({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        toast({
          title: "Analysis Complete",
          description: "Transaction intent verified successfully.",
        });
      },
      onError: () => {
        toast({
          title: "Analysis Failed",
          description: "An unexpected error occurred. Please check the transaction signature and try again.",
          variant: "destructive",
        });
      }
    }
  });

  function onSubmit(data: FormValues) {
    setResult(null);
    analyzeTransaction.mutate({ 
      data: {
        transaction: data.transaction,
        userIntent: data.userIntent,
        rpcUrl: data.rpcUrl || undefined
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        
        {/* Left Column: Form */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">IntentGuard</h1>
            <p className="text-muted-foreground text-lg">Verify your Solana transaction intent before signing.</p>
          </div>

          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Terminal className="h-5 w-5 text-primary" />
                New Analysis
              </CardTitle>
              <CardDescription>
                Paste a transaction signature and describe what you are trying to do.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="transaction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Signature</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. 5xXy... or base64 raw tx" 
                            className="font-mono text-sm bg-background/50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userIntent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Intent</FormLabel>
                        <FormDescription>
                          Explain in plain English what this transaction should do.
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="I want to swap 1 SOL for USDC on Jupiter..." 
                            className="resize-none min-h-[100px] bg-background/50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rpcUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Custom RPC URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://api.mainnet-beta.solana.com" 
                            className="bg-background/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-medium tracking-wide group" 
                    disabled={analyzeTransaction.isPending}
                  >
                    {analyzeTransaction.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing via AI...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        Analyze Intent
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col min-h-[500px]">
          <AnimatePresence mode="wait">
            {!result && !analyzeTransaction.isPending && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-muted/20"
              >
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Awaiting Transaction</h3>
                <p className="text-muted-foreground max-w-sm">
                  Enter a transaction signature and your intent to get a detailed security analysis and risk assessment.
                </p>
              </motion.div>
            )}

            {analyzeTransaction.isPending && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl bg-card border shadow-lg"
              >
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping [animation-duration:3s]" />
                  <div className="absolute inset-2 border-4 border-primary/40 rounded-full animate-spin [animation-duration:2s]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Simulating Execution</h3>
                <p className="text-muted-foreground animate-pulse">Decompiling instructions and comparing to intent...</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ staggerChildren: 0.1 }}
                className="flex-1 flex flex-col gap-6"
              >
                <Card className={`overflow-hidden border-2 transition-colors duration-500 ${
                  result.intentMatch 
                    ? result.riskScore < 50 ? "border-green-500/50" : "border-yellow-500/50" 
                    : "border-destructive/50"
                }`}>
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2 mb-2">
                          {result.intentMatch ? (
                            <><CheckCircle2 className="h-6 w-6 text-green-500" /> Intent Match</>
                          ) : (
                            <><ShieldAlert className="h-6 w-6 text-destructive" /> Intent Mismatch</>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <FileCode2 className="h-4 w-4" /> 
                          <span className="font-mono text-xs">{result.transactionSignature.slice(0, 16)}...</span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs font-mono uppercase bg-background">
                        {result.transactionType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x border-b">
                      <div className="p-6 flex flex-col justify-center items-center bg-card/50">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Risk Assessment</h4>
                        <RiskGauge score={result.riskScore} />
                      </div>
                      <div className="p-6 bg-card/30 flex flex-col justify-center">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">AI Explanation</h4>
                        <p className="text-sm leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-card">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Terminal className="h-4 w-4" /> Programs Involved
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.programs.map((program, idx) => (
                          <Badge key={idx} variant="secondary" className="font-mono text-xs py-1 px-2 border-primary/20 bg-primary/5">
                            {program}
                          </Badge>
                        ))}
                        {result.programs.length === 0 && (
                          <span className="text-sm text-muted-foreground">No named programs detected.</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  {result.warnings.length > 0 && (
                    <CardFooter className="p-6 bg-destructive/5 border-t border-destructive/10 flex-col items-stretch gap-3">
                      <h4 className="text-sm font-bold text-destructive uppercase tracking-wider flex items-center gap-2 w-full">
                        <AlertTriangle className="h-4 w-4" /> Security Warnings ({result.warnings.length})
                      </h4>
                      <div className="flex flex-col gap-2 w-full">
                        {result.warnings.map((warning, idx) => (
                          <Alert key={idx} variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="text-sm">{warning}</AlertTitle>
                          </Alert>
                        ))}
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
