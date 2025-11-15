'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiLoader } from 'react-icons/fi';
import StepIndicator from '@/components/StepIndicator';
import TemplateSelector from '@/components/TemplateSelector';
import { getWorkflowSession, updateWorkflowSession, validateWorkflowStage } from '@/lib/workflow-session';
import { applyTemplate } from '@/lib/template-renderer';
import { getTemplateById } from '@/lib/templates';
import type { WorkflowData } from '@/lib/workflow-session';

export default function TemplatePage() {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');
  const [templateCustomValues, setTemplateCustomValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    // Validate session and required data
    const validation = validateWorkflowStage('template');
    if (!validation.valid) {
      router.push('/dashboard/listing?connected=true');
      return;
    }

    const session = getWorkflowSession();
    if (session) {
      setWorkflow(session);
      if (session.selectedTemplateId) {
        setSelectedTemplateId(session.selectedTemplateId);
      }
      if (session.templateCustomValues) {
        setTemplateCustomValues(session.templateCustomValues);
      }
    }
  }, [router]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleCustomValuesChange = (values: Record<string, string>) => {
    setTemplateCustomValues(values);
  };

  const applyTemplates = async () => {
    if (!workflow) return;

    setLoading(true);
    setError(null);
    setProgress('Applying templates...');

    try {
      const previews: string[] = [];

      if (selectedTemplateId !== 'none') {
        const template = getTemplateById(selectedTemplateId);
        if (!template) {
          throw new Error('Template not found');
        }

        // Apply template to each image
        for (let i = 0; i < workflow.imageUrls.length; i++) {
          setProgress(`Applying template to image ${i + 1}/${workflow.imageUrls.length}...`);

          try {
            // Fetch image from URL and convert to File
            const response = await fetch(workflow.imageUrls[i]);
            const blob = await response.blob();
            const imageFile = new File([blob], `image-${i}.jpg`, { type: 'image/jpeg' });

            const templateBlob = await applyTemplate(
              imageFile,
              template,
              templateCustomValues,
              {
                maxWidth: 1080,
                maxHeight: 1080,
                format: 'image/jpeg',
                quality: 0.9,
              }
            );

            if (!(templateBlob instanceof Blob)) {
              throw new Error('Invalid blob returned from template application');
            }

            const previewUrl = URL.createObjectURL(templateBlob);
            previews.push(previewUrl);

            // Upload templated image
            const formData = new FormData();
            const templatedFile = new File(
              [templateBlob],
              `image-${i}-templated.jpg`,
              { type: 'image/jpeg' }
            );
            formData.append('file', templatedFile);

            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (!uploadResponse.ok) {
              throw new Error('Template upload failed');
            }

            const uploadData = await uploadResponse.json();
            workflow.imageUrls[i] = uploadData.url;
            workflow.imagePublicIds[i] = uploadData.filename;
          } catch {
            console.warn(`Failed to apply template to image ${i + 1}, using original`);
            // Continue with original if template fails
            previews.push(workflow.imageUrls[i]);
          }
        }
      } else {
        previews.push(...workflow.imageUrls);
      }

      // Update workflow
      updateWorkflowSession({
        selectedTemplateId,
        templateCustomValues,
        previewUrls: previews,
      });

      setProgress('');
      router.push('/dashboard/caption?connected=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply templates');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  if (!workflow) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FiLoader className="text-4xl animate-spin text-blue-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <StepIndicator currentStep="template" />

      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Template</h1>
            <p className="text-gray-600">
              Select a professional template to apply to your images (optional)
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {workflow.imageUrls.length > 0 && (
            <TemplateSelector
              imageUrl={workflow.imageUrls[0]}
              selectedTemplateId={selectedTemplateId}
              onTemplateSelect={handleTemplateSelect}
              customValues={templateCustomValues}
              onCustomValuesChange={handleCustomValuesChange}
            />
          )}

          {progress && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
              <FiLoader className="animate-spin text-blue-600" />
              <span className="text-sm text-blue-800">{progress}</span>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4">
            <button
              onClick={() => router.push('/dashboard/upload')}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FiChevronLeft /> Back
            </button>
            <button
              onClick={applyTemplates}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" /> Processing...
                </>
              ) : (
                'Continue to Caption'
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
