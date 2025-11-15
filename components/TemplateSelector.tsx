'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Template, templates, getTemplateById } from '@/lib/templates';
import { getTemplatePreviewUrl } from '@/lib/template-renderer';
import { FiLoader, FiCheck } from 'react-icons/fi';

interface TemplateSelectorProps {
  imageUrl: string | null;
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
  customValues: Record<string, string>;
  onCustomValuesChange: (values: Record<string, string>) => void;
}

export default function TemplateSelector({
  imageUrl,
  selectedTemplateId,
  onTemplateSelect,
  customValues,
  onCustomValuesChange,
}: TemplateSelectorProps) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  const selectedTemplate = getTemplateById(selectedTemplateId);

  useEffect(() => {
    if (!imageUrl) return;

    let isMounted = true;
    const generatePreviews = async () => {
      setLoading(true);
      const newPreviews: Record<string, string> = {};

      try {
        // Fetch the image from URL
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

        if (!isMounted) return;

        // Create object URL for original image
        const url = URL.createObjectURL(file);
        setOriginalImageUrl(url);

        // Generate preview for selected template first
        if (selectedTemplate && selectedTemplate.id !== 'none') {
          const previewUrl = await getTemplatePreviewUrl(
            file,
            selectedTemplate,
            customValues,
            300
          );
          if (isMounted) {
            newPreviews[selectedTemplate.id] = previewUrl;
          }
        }

        if (isMounted) {
          setPreviews(newPreviews);
        }
      } catch (error) {
        console.error('Error generating previews:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    generatePreviews();

    return () => {
      isMounted = false;
    };
  }, [imageUrl, selectedTemplateId, customValues, selectedTemplate]);

  // Handle template selection
  const handleTemplateClick = (template: Template) => {
    onTemplateSelect(template.id);

    // Initialize custom values with defaults
    if (template.defaultValues) {
      onCustomValuesChange(template.defaultValues);
    }
  };

  // Handle custom value changes
  const handleCustomValueChange = (elementId: string, value: string) => {
    onCustomValuesChange({
      ...customValues,
      [elementId]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
              selectedTemplateId === template.id
                ? 'border-blue-600 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {/* Preview Image */}
            <div className="aspect-square bg-gray-100 relative">
              {imageUrl && previews[template.id] ? (
                <Image
                  src={previews[template.id]}
                  alt={template.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              ) : template.id === 'none' && originalImageUrl ? (
                <Image
                  src={originalImageUrl}
                  alt="Original"
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Selected Badge */}
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-[10px] font-semibold shadow flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Selected
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-3 bg-white">
              <h3 className="font-medium text-sm text-gray-900">
                {template.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {template.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <FiLoader className="inline-block animate-spin h-8 w-8 text-blue-600" />
          <p className="text-sm text-gray-500 mt-2">Generating previews...</p>
        </div>
      )}

      {/* Customization Panel */}
      {selectedTemplate &&
        selectedTemplate.id !== 'none' &&
        selectedTemplate.elements.some((e) => e.type === 'text') && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">
              Customize Template
            </h3>

            {selectedTemplate.elements
              .filter((e) => e.type === 'text')
              .map((element) => (
                <div key={element.id} className="space-y-2">
                  <label
                    htmlFor={element.id}
                    className="block text-sm font-medium text-gray-700 capitalize"
                  >
                    {element.id.replace(/-/g, ' ')}
                  </label>
                  <input
                    type="text"
                    id={element.id}
                    value={customValues[element.id] || element.content || ''}
                    onChange={(e) =>
                      handleCustomValueChange(element.id, e.target.value)
                    }
                    placeholder={element.content}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}

            <p className="text-xs text-gray-500 mt-4">
              Changes are applied in real-time to the preview above
            </p>
          </div>
        )}

      {/* No Image Warning */}
      {!imageUrl && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-800">
            Upload an image first to see template previews
          </p>
        </div>
      )}
    </div>
  );
}
