import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Database, Zap, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { calculateCosts, formatNumber, CYCLES_PER_ICP } from '../lib/costEstimator';

export default function CostEstimatorPage() {
  const [modelSizeMB, setModelSizeMB] = useState(1);
  const [requestsPerDay, setRequestsPerDay] = useState(100);
  const [computeMs, setComputeMs] = useState(50);
  const [cyclesPerICP, setCyclesPerICP] = useState(CYCLES_PER_ICP);

  const costs = calculateCosts(modelSizeMB, requestsPerDay, computeMs);
  const icpCostPerMonth = costs.totalCyclesPerMonth / cyclesPerICP;
  const icpCostPerYear = icpCostPerMonth * 12;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ICP Cost Estimator</h2>
        <p className="text-muted-foreground mt-1">
          Estimate cycles and ICP costs for hosting and running your AI model
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Disclaimer:</strong> These are rough estimates. Actual costs vary based on subnet pricing, 
          implementation efficiency, canister configuration, and network conditions. Always measure with real usage.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Cost Parameters
            </CardTitle>
            <CardDescription>Adjust your usage assumptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="modelSize">Model Size (MB)</Label>
                <Badge variant="secondary">{modelSizeMB} MB</Badge>
              </div>
              <Slider
                id="modelSize"
                min={0.1}
                max={10}
                step={0.1}
                value={[modelSizeMB]}
                onValueChange={(value) => setModelSizeMB(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Storage cost for your model artifact in stable memory
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="requests">Requests per Day</Label>
                <Badge variant="secondary">{requestsPerDay}</Badge>
              </div>
              <Slider
                id="requests"
                min={1}
                max={10000}
                step={10}
                value={[requestsPerDay]}
                onValueChange={(value) => setRequestsPerDay(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Expected inference calls per day
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="compute">Compute per Request (ms)</Label>
                <Badge variant="secondary">{computeMs} ms</Badge>
              </div>
              <Slider
                id="compute"
                min={1}
                max={1000}
                step={10}
                value={[computeMs]}
                onValueChange={(value) => setComputeMs(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Average processing time per inference call
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="cyclesRate">Cycles per ICP (Conversion Rate)</Label>
              <Input
                id="cyclesRate"
                type="number"
                value={cyclesPerICP}
                onChange={(e) => setCyclesPerICP(Number(e.target.value) || CYCLES_PER_ICP)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Current rate as of Feb 2026. Check{' '}
                <a
                  href="https://internetcomputer.org/docs/current/developer-docs/gas-cost"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  official docs
                </a>{' '}
                for latest rates.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Cost Breakdown
              </CardTitle>
              <CardDescription>Estimated monthly and yearly costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{formatNumber(costs.storageCyclesPerMonth)}</div>
                    <div className="text-xs text-muted-foreground">cycles/month</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Compute</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{formatNumber(costs.computeCyclesPerMonth)}</div>
                    <div className="text-xs text-muted-foreground">cycles/month</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <span className="font-semibold">Total (Monthly)</span>
                  <div className="text-right">
                    <div className="font-mono font-bold text-lg">{formatNumber(costs.totalCyclesPerMonth)}</div>
                    <div className="text-xs text-muted-foreground">cycles</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <span className="font-semibold">ICP Equivalent</span>
                  <div className="text-right">
                    <div className="font-mono font-bold text-lg text-primary">
                      {icpCostPerMonth.toFixed(4)} ICP
                    </div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Yearly Estimate</span>
                  <div className="text-right">
                    <div className="font-mono font-semibold">{icpCostPerYear.toFixed(2)} ICP</div>
                    <div className="text-xs text-muted-foreground">per year</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> IC canisters have instruction limits (~5B per update call). 
              Complex models may exceed these limits. Consider model optimization, quantization, 
              or splitting inference across multiple calls.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Factors</CardTitle>
          <CardDescription>Understanding what drives your costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                Storage Costs
              </h4>
              <p className="text-xs text-muted-foreground">
                Charged per GB per month for stable memory. Larger models cost more to store.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Compute Costs
              </h4>
              <p className="text-xs text-muted-foreground">
                Based on instruction count. More complex inference = higher cost per call.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Scaling
              </h4>
              <p className="text-xs text-muted-foreground">
                Costs scale linearly with usage. Optimize your model for better efficiency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
