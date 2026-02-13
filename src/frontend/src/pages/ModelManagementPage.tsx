import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyModels, useUpdateModelMetadata, useDeleteModel } from '../hooks/useQueries';
import AuthGate from '../components/auth/AuthGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Loader2, Database, AlertCircle, Calendar, Activity } from 'lucide-react';
import type { ModelMetadataUpdate } from '../backend';

const MAX_PAYLOAD_SIZE = 2 * 1024 * 1024; // 2MB limit for demo

export default function ModelManagementPage() {
  return (
    <AuthGate>
      <ModelManagementContent />
    </AuthGate>
  );
}

function ModelManagementContent() {
  const { identity } = useInternetIdentity();
  const { data: models, isLoading } = useGetMyModels();
  const updateModel = useUpdateModelMetadata();
  const deleteModel = useDeleteModel();

  const [showForm, setShowForm] = useState(false);
  const [modelName, setModelName] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_PAYLOAD_SIZE) {
        toast.error(`File too large. Maximum size is ${(MAX_PAYLOAD_SIZE / 1024 / 1024).toFixed(1)}MB`);
        return;
      }
      setModelFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }
    if (!modelFile) {
      toast.error('Please select a model file');
      return;
    }

    setUploading(true);
    try {
      const arrayBuffer = await modelFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const modelUpdate: ModelMetadataUpdate = {
        id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: modelName.trim(),
        artifact: bytes,
        payloadSize: BigInt(bytes.length),
      };

      await updateModel.mutateAsync(modelUpdate);
      toast.success('Model registered successfully!');
      setModelName('');
      setModelFile(null);
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to register model');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (modelId: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) return;

    try {
      await deleteModel.mutateAsync(modelId);
      toast.success('Model deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete model');
    }
  };

  const formatBytes = (bytes: bigint) => {
    const num = Number(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Models</h2>
          <p className="text-muted-foreground mt-1">Register and manage your AI model artifacts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Register Model
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Size Limit:</strong> Model artifacts are limited to {(MAX_PAYLOAD_SIZE / 1024 / 1024).toFixed(1)}MB for this demo.
          Larger models require chunked storage or external hosting.
        </AlertDescription>
      </Alert>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Register New Model</CardTitle>
            <CardDescription>Upload your model artifact and provide metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelName">Model Name</Label>
                <Input
                  id="modelName"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g., sentiment-classifier-v1"
                  disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelFile">Model File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="modelFile"
                    type="file"
                    onChange={handleFileChange}
                    disabled={uploading}
                    accept=".bin,.onnx,.tflite,.pkl,.pt,.pth,.h5,.json"
                  />
                  {modelFile && (
                    <Badge variant="secondary">{(modelFile.size / 1024).toFixed(1)} KB</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: .bin, .onnx, .tflite, .pkl, .pt, .pth, .h5, .json
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Register Model
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={uploading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : models && models.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <Card key={model.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription className="mt-1 font-mono text-xs truncate">
                      {model.id}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(model.id, model.name)}
                    disabled={deleteModel.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Size
                    </span>
                    <Badge variant="secondary">{formatBytes(model.payloadSize)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Inferences
                    </span>
                    <Badge variant="outline">{model.totalInferenceCount.toString()}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created
                    </span>
                    <span className="text-xs">{formatDate(model.timestamp)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Models Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Register your first AI model to get started
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Register Model
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
