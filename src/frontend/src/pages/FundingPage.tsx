import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetFundingStatus } from '../hooks/useQueries';
import { Copy, RefreshCw, AlertCircle, Wallet, TrendingUp, Info } from 'lucide-react';
import { toast } from 'sonner';
import { calculateCosts, CYCLES_PER_ICP, formatNumber } from '../lib/costEstimator';

export default function FundingPage() {
  const { data: fundingStatus, isLoading, isError, error, refetch, isFetching } = useGetFundingStatus();

  // 10-year runway estimator state
  const [modelSizeMB, setModelSizeMB] = useState(50);
  const [requestsPerDay, setRequestsPerDay] = useState(100);
  const [computeMs, setComputeMs] = useState(500);
  const [cyclesPerICP, setCyclesPerICP] = useState(CYCLES_PER_ICP);

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleRefresh = () => {
    refetch();
    toast.info('Refreshing funding status...');
  };

  // Calculate 10-year runway
  const costs = calculateCosts(modelSizeMB, requestsPerDay, computeMs);
  const cyclesPerYear = costs.totalCyclesPerMonth * 12;
  const icpPerYear = cyclesPerYear / cyclesPerICP;
  const icpFor10Years = icpPerYear * 10;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Canister Funding</h1>
        <p className="text-muted-foreground">
          Keep your AI models running on-chain by maintaining adequate ICP balance
        </p>
      </div>

      {/* Live Funding Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Current Funding Status
              </CardTitle>
              <CardDescription>Live canister cycles balance and deposit information</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading funding status...
            </div>
          )}

          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Funding Status</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'Could not load funding status. Please try again later.'}
              </AlertDescription>
            </Alert>
          )}

          {fundingStatus && (
            <div className="space-y-6">
              {/* Canister ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Canister Principal</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                    {fundingStatus.canisterId.toString()}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(fundingStatus.canisterId.toString(), 'Canister ID')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Cycles Balance */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cycles Balance</Label>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {formatNumber(Number(fundingStatus.cycles))} cycles
                  </Badge>
                  {Number(fundingStatus.cycles) === 0 && (
                    <span className="text-sm text-muted-foreground">
                      ℹ️ Cycles balance not available via query call
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Actual cycles balance can be checked using <code className="bg-muted px-1 rounded">dfx canister status --network ic backend</code>
                </p>
              </div>

              <Separator />

              {/* Deposit Account */}
              {fundingStatus.topUpAccount && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Deposit Account Address</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                      {fundingStatus.topUpAccount}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(fundingStatus.topUpAccount!, 'Deposit address')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Deposit Instructions */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How to Fund Your Canister</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p className="font-medium">{fundingStatus.depositInstructions}</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm mt-3">
                    <li>Use the <code className="bg-muted px-1 rounded">dfx canister deposit-cycles</code> command with your cycles wallet</li>
                    <li>Or send ICP to your canister's account identifier (requires conversion to cycles)</li>
                    <li>Monitor your cycles balance regularly to avoid service interruption</li>
                    <li>See the deployment runbook (<code className="bg-muted px-1 rounded">frontend/DEPLOYMENT_RUNBOOK.md</code>) for detailed instructions</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 10-Year Runway Estimator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            10-Year Runway Estimator
          </CardTitle>
          <CardDescription>
            Calculate how much ICP you need to keep your models running for 10 years
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model Size */}
            <div className="space-y-2">
              <Label htmlFor="modelSize">Model Size (MB)</Label>
              <Input
                id="modelSize"
                type="number"
                min="1"
                max="10000"
                value={modelSizeMB}
                onChange={(e) => setModelSizeMB(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Total size of your model artifacts stored on-chain
              </p>
            </div>

            {/* Requests per Day */}
            <div className="space-y-2">
              <Label htmlFor="requestsPerDay">Inference Requests per Day</Label>
              <Input
                id="requestsPerDay"
                type="number"
                min="0"
                max="1000000"
                value={requestsPerDay}
                onChange={(e) => setRequestsPerDay(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Expected daily inference workload
              </p>
            </div>

            {/* Compute Time */}
            <div className="space-y-2">
              <Label htmlFor="computeMs">Compute Time per Request (ms)</Label>
              <Input
                id="computeMs"
                type="number"
                min="1"
                max="10000"
                value={computeMs}
                onChange={(e) => setComputeMs(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Average processing time per inference
              </p>
            </div>

            {/* Cycles per ICP */}
            <div className="space-y-2">
              <Label htmlFor="cyclesPerICP">Cycles per ICP</Label>
              <Input
                id="cyclesPerICP"
                type="number"
                min="1"
                value={cyclesPerICP}
                onChange={(e) => setCyclesPerICP(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Current conversion rate (default: 1T cycles)
              </p>
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Cost Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">Storage (per month)</p>
                <p className="text-xl font-bold">{formatNumber(costs.storageCyclesPerMonth)} cycles</p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">Compute (per month)</p>
                <p className="text-xl font-bold">{formatNumber(costs.computeCyclesPerMonth)} cycles</p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">Total (per month)</p>
                <p className="text-xl font-bold">{formatNumber(costs.totalCyclesPerMonth)} cycles</p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">Total (per year)</p>
                <p className="text-xl font-bold">{formatNumber(cyclesPerYear)} cycles</p>
              </div>
            </div>

            <Separator />

            {/* ICP Estimates */}
            <div className="space-y-4">
              <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Estimated ICP per Year</span>
                  <span className="text-2xl font-bold text-primary">{icpPerYear.toFixed(4)} ICP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Estimated ICP for 10 Years</span>
                  <span className="text-3xl font-bold text-primary">{icpFor10Years.toFixed(2)} ICP</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Disclaimer</AlertTitle>
                <AlertDescription className="text-sm space-y-2">
                  <p>
                    These estimates are approximate and may vary significantly based on:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Actual ICP-to-cycles conversion rates (which fluctuate)</li>
                    <li>Network pricing changes and subnet-specific costs</li>
                    <li>Your specific implementation and optimization strategies</li>
                    <li>Real-world usage patterns vs. estimates</li>
                  </ul>
                  <p className="mt-2 font-medium">
                    Always monitor your actual cycles consumption and maintain a buffer for unexpected usage spikes.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
