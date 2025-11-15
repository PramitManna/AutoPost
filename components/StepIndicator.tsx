'use client';

import { FiCheckCircle } from 'react-icons/fi';

interface StepIndicatorProps {
  currentStep: 'upload' | 'listing' | 'template' | 'caption' | 'publish';
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { id: 'upload', label: 'Upload', description: 'Choose images' },
    { id: 'listing', label: 'Listing', description: 'Property info' },
    { id: 'template', label: 'Template', description: 'Apply design' },
    { id: 'caption', label: 'Caption', description: 'Add text' },
    { id: 'publish', label: 'Publish', description: 'Post' },
  ];

  const stepOrder = ['upload', 'listing', 'template', 'caption', 'publish'];
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    index < currentIndex
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentIndex
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                >
                  {index < currentIndex ? (
                    <FiCheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      index === currentIndex
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-1 mx-2 flex-1 ${
                    index < currentIndex
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
