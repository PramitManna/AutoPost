'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiLoader } from 'react-icons/fi';
import StepIndicator from '@/components/StepIndicator';
import { getWorkflowSession, updateWorkflowSession, validateWorkflowStage } from '@/lib/workflow-session';
import type { WorkflowData } from '@/lib/workflow-session';

export default function ListingPage() {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [propertySize, setPropertySize] = useState('');
  const [parking, setParking] = useState('');
  const [view, setView] = useState('');
  const [city, setCity] = useState('');
  const [highlights, setHighlights] = useState('');

  useEffect(() => {
    // Validate session and required data
    const validation = validateWorkflowStage('listing');
    if (!validation.valid) {
      router.push('/dashboard/upload?connected=true');
      return;
    }

    const session = getWorkflowSession();
    if (session) {
      setWorkflow(session);
      // Load existing values if they exist
      setPropertyType(session.propertyType || '');
      setBedrooms(session.bedrooms || '');
      setBathrooms(session.bathrooms || '');
      setPropertySize(session.propertySize || '');
      setParking(session.parking || '');
      setView(session.view || '');
      setCity(session.city || '');
      setHighlights(session.highlights || '');
    }
  }, [router]);

  const handleContinue = async () => {
    if (!propertyType) {
      setError('Please select a property type');
      return;
    }

    if (!bedrooms) {
      setError('Please select number of bedrooms');
      return;
    }

    if (!bathrooms) {
      setError('Please select number of bathrooms');
      return;
    }

    if (!propertySize) {
      setError('Please select property size');
      return;
    }

    if (!parking) {
      setError('Please select parking type');
      return;
    }

    if (!city) {
      setError('Please enter city and neighborhood');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      updateWorkflowSession({
        propertyType,
        bedrooms,
        bathrooms,
        propertySize,
        parking,
        view,
        city,
        highlights,
      });

      router.push('/dashboard/template?connected=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing information');
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
      <StepIndicator currentStep="listing" />

      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Listing Information</h1>
            <p className="text-gray-600">
              Tell us about the property to help generate better templates and captions
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property Type *
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              >
                <option value="">Select property type</option>
                <option value="Condo">Condo</option>
                <option value="Townhome">Townhome</option>
                <option value="Detached">Detached</option>
                <option value="Semi-Detached">Semi-Detached</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Bedrooms and Bathrooms Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bedrooms *
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                >
                  <option value="">Select bedrooms</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bathrooms *
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                >
                  <option value="">Select bathrooms</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>
            </div>

            {/* Property Size */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property Size *
              </label>
              <select
                value={propertySize}
                onChange={(e) => setPropertySize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              >
                <option value="">Select property size</option>
                <option value="<500 sq ft">&lt;500 sq ft</option>
                <option value="500-800 sq ft">500–800 sq ft</option>
                <option value="800-1000 sq ft">800–1000 sq ft</option>
                <option value=">1000 sq ft">&gt;1000 sq ft</option>
              </select>
            </div>

            {/* Parking */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Parking *
              </label>
              <select
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              >
                <option value="">Select parking</option>
                <option value="Covered">Covered</option>
                <option value="Uncovered">Uncovered</option>
                <option value="None">None</option>
              </select>
            </div>

            {/* View */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                View (Optional)
              </label>
              <select
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              >
                <option value="">Select view</option>
                <option value="Lake">Lake</option>
                <option value="City">City</option>
                <option value="Park">Park</option>
                <option value="Mountain">Mountain</option>
                <option value="None">None</option>
              </select>
            </div>

            {/* City and Neighborhood */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                City & Neighborhood *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city and neighborhood"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              />
            </div>

            {/* Optional Highlights */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Anything else you&apos;d like to highlight? (Optional)
              </label>
              <textarea
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="E.g., recently renovated kitchen, hardwood floors, rooftop access..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">
                {highlights.length}/500 characters
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4">
            <button
              onClick={() => router.push('/dashboard/upload?connected=true')}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FiChevronLeft /> Back
            </button>
            <button
              onClick={handleContinue}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" /> Processing...
                </>
              ) : (
                'Continue to Template'
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
