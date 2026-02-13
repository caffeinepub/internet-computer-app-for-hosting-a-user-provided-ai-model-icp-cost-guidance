import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle2, XCircle, Cpu, Database, Zap, Clock, Info } from 'lucide-react';

export default function LimitationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Limitations & Guidance</h2>
        <p className="text-muted-foreground mt-1">
          Understanding what's possible (and what's not) when hosting AI models on the Internet Computer
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The Internet Computer is a powerful blockchain platform, but it has different constraints 
          than traditional cloud infrastructure. This page helps you understand what types of AI models 
          are feasible to host and run on-chain.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Key Constraints
          </CardTitle>
          <CardDescription>Technical limitations of the IC platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">No GPU Acceleration</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Canisters run in WebAssembly without GPU access. CPU-only inference is significantly slower 
                for large neural networks.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Instruction Limits</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Update calls are limited to ~5 billion instructions. Complex models may exceed this limit 
                per inference call.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Memory Constraints</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Stable memory is limited (currently 400GB max per canister). Heap memory is more restricted 
                (~4GB practical limit).
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Cycles Cost</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Every operation costs cycles. Compute-intensive inference can become expensive at scale.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Feasible Model Types
            </CardTitle>
            <CardDescription>What works well on the IC</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  ✓
                </Badge>
                <div>
                  <div className="font-medium text-sm">Small Classification Models</div>
                  <p className="text-xs text-muted-foreground">
                    Logistic regression, small decision trees, naive Bayes (&lt;10MB)
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  ✓
                </Badge>
                <div>
                  <div className="font-medium text-sm">Quantized Neural Networks</div>
                  <p className="text-xs text-muted-foreground">
                    Heavily quantized models (INT8, binary) with few layers
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  ✓
                </Badge>
                <div>
                  <div className="font-medium text-sm">Rule-Based Systems</div>
                  <p className="text-xs text-muted-foreground">
                    Expert systems, decision rules, simple heuristics
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  ✓
                </Badge>
                <div>
                  <div className="font-medium text-sm">Embedding Models</div>
                  <p className="text-xs text-muted-foreground">
                    Small embedding generators for similarity search
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Not Recommended
            </CardTitle>
            <CardDescription>What doesn't work well</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 bg-red-500/10 text-red-700 dark:text-red-400">
                  ✗
                </Badge>
                <div>
                  <div className="font-medium text-sm">Large Language Models (LLMs)</div>
                  <p className="text-xs text-muted-foreground">
                    GPT, BERT, LLaMA variants - too large and compute-intensive
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 bg-red-500/10 text-red-700 dark:text-red-400">
                  ✗
                </Badge>
                <div>
                  <div className="font-medium text-sm">Image Generation Models</div>
                  <p className="text-xs text-muted-foreground">
                    Stable Diffusion, DALL-E - require GPU and exceed instruction limits
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 bg-red-500/10 text-red-700 dark:text-red-400">
                  ✗
                </Badge>
                <div>
                  <div className="font-medium text-sm">Deep CNNs</div>
                  <p className="text-xs text-muted-foreground">
                    ResNet-50+, VGG, Inception - too many parameters and operations
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 bg-red-500/10 text-red-700 dark:text-red-400">
                  ✗
                </Badge>
                <div>
                  <div className="font-medium text-sm">Real-Time Video Processing</div>
                  <p className="text-xs text-muted-foreground">
                    Frame-by-frame analysis - too slow without GPU acceleration
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Strategies</CardTitle>
          <CardDescription>How to make your models IC-compatible</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">1. Model Quantization</h4>
              <p className="text-sm text-muted-foreground">
                Convert FP32 models to INT8 or even binary weights. This reduces size by 4-32x and speeds up inference.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">2. Knowledge Distillation</h4>
              <p className="text-sm text-muted-foreground">
                Train a smaller "student" model to mimic a larger "teacher" model's behavior with fewer parameters.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">3. Pruning</h4>
              <p className="text-sm text-muted-foreground">
                Remove unnecessary weights and connections. Structured pruning can reduce model size by 50-90%.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">4. Hybrid Architecture</h4>
              <p className="text-sm text-muted-foreground">
                Store model on-chain but run heavy inference off-chain, using the IC for coordination and verification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Recommendation:</strong> For production AI applications requiring large models or real-time inference, 
          consider using the IC for orchestration, access control, and payment while delegating actual inference to 
          specialized off-chain compute (with cryptographic verification of results).
        </AlertDescription>
      </Alert>
    </div>
  );
}
