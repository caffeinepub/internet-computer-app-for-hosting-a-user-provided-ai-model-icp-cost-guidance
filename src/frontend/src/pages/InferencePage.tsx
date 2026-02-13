import { useState } from 'react';
import { useGetAvailableModels } from '../hooks/useQueries';
import AuthGate from '../components/auth/AuthGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, Loader2, AlertCircle, Zap, Info } from 'lucide-react';

export default function InferencePage() {
  return (
    <AuthGate>
      <InferenceContent />
    </AuthGate>
  );
}

function InferenceContent() {
  const { data: models, isLoading } = useGetAvailableModels();
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState<string>('');
  const [running, setRunning] = useState(false);

  const selectedModel = models?.find((m) => m.id === selectedModelId);

  const handleRunInference = async () => {
    if (!selectedModelId) {
      toast.error('Please select a model');
      return;
    }
    if (!inputData.trim()) {
      toast.error('Please provide input data');
      return;
    }

    setRunning(true);
    setResult('');

    try {
      // Simulate inference (backend doesn't have actual inference implementation)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mockResult = {
        model: selectedModel?.name,
        input: inputData.substring(0, 50) + (inputData.length > 50 ? '...' : ''),
        output: 'Mock inference result: Classification completed',
        confidence: 0.87,
        processingTime: '1.2s',
        note: 'This is a simulated response. Actual inference requires model-specific runtime implementation.',
      };

      setResult(JSON.stringify(mockResult, null, 2));
      toast.success('Inference completed');
    } catch (error: any) {
      toast.error(error.message || 'Inference failed');
      setResult(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Run Inference</h2>
        <p className="text-muted-foreground mt-1">Execute inference against your registered models</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> This interface demonstrates the inference workflow. 
          Actual model execution requires runtime-specific implementation (TensorFlow.js, ONNX Runtime, etc.) 
          compatible with WebAssembly constraints.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Inference Request
            </CardTitle>
            <CardDescription>Select a model and provide input data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading models...
                </div>
              ) : models && models.length > 0 ? (
                <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No models available. Please register a model first.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {selectedModel && (
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <Badge variant="secondary">
                    {(Number(selectedModel.payloadSize) / 1024).toFixed(1)} KB
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Runs:</span>
                  <Badge variant="outline">{selectedModel.totalInferenceCount.toString()}</Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="input">Input Data</Label>
              <Textarea
                id="input"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Enter your input data (text, JSON, etc.)"
                rows={6}
                disabled={running}
              />
            </div>

            <Button
              onClick={handleRunInference}
              disabled={running || !selectedModelId || !inputData.trim()}
              className="w-full gap-2"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Inference...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Inference
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Inference output will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-96 font-mono">
                {result}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Run an inference to see results</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
