// Template system for social media posts
// Completely free - uses HTML5 Canvas API client-side

export interface TemplateElement {
  type: 'text' | 'shape' | 'overlay';
  id: string;
  x: number; // Position in percentage (0-100)
  y: number; // Position in percentage (0-100)
  width?: number; // Width in percentage (0-100)
  height?: number; // Height in percentage (0-100)
  content?: string; // For text elements
  fontSize?: number; // Font size in pixels
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  borderRadius?: number;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface Template {
  id: string;
  name: string;
  category: 'real-estate' | 'product' | 'event' | 'announcement' | 'sale' | 'custom';
  description: string;
  thumbnail?: string;
  elements: TemplateElement[];
  defaultValues?: Record<string, string>;
}

// ===============================
// 3 ULTRA-MODERN PREMIUM TEMPLATES
// ===============================

export const templates: Template[] = [
  {
    id: 'none',
    name: 'No Template',
    category: 'custom',
    description: 'Post image without any template',
    elements: [],
  },

  // -------------------------------------------------------
  // 1️⃣ LUXURY REAL ESTATE – WHITE GLASS PANEL (Very Modern)
  // -------------------------------------------------------
  {
    id: 'real-estate-glass',
    name: 'Luxury Glass Real Estate',
    category: 'real-estate',
    description: 'Minimal premium white-glass card for real estate listings',
    elements: [
      {
        type: 'shape',
        id: 'glass-card',
        x: 5,
        y: 70,
        width: 90,
        height: 25,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 14,
      },
      {
        type: 'text',
        id: 'title',
        x: 10,
        y: 78,
        fontSize: 38,
        fontWeight: '700',
        fontFamily: 'Arial, sans-serif',
        color: '#1A1A1A',
        content: 'Modern Luxury Home',
      },
      {
        type: 'text',
        id: 'details',
        x: 10,
        y: 88,
        fontSize: 20,
        fontWeight: '400',
        fontFamily: 'Arial, sans-serif',
        color: '#555555',
        content: '4 Bed • 3 Bath • 3,200 sqft',
      },
    ],
    defaultValues: {
      title: 'Modern Luxury Home',
      details: '4 Bed • 3 Bath • 3,200 sqft',
    },
  },
  // -------------------------------------------------------
  // WATERMARK (Minimal)
  // -------------------------------------------------------
  {
    id: 'brand-watermark',
    name: 'Modern Watermark',
    category: 'custom',
    description: 'Minimal lightweight branding watermark',
    elements: [
      {
        type: 'text',
        id: 'watermark',
        x: 95,
        y: 96,
        align: 'right',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontWeight: '500',
        color: 'rgba(255,255,255,0.85)',
        content: '© Your Brand',
      },
    ],
    defaultValues: {
      watermark: '© Your Brand',
    },
  },
];

// ===============================
// Helper Functions
// ===============================

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((t) => t.category === category);
}

export function isValidTemplate(template: Template | undefined): boolean {
  if (!template) return false;
  if (template.id === 'none') return false;
  if (!template.elements || template.elements.length === 0) return false;
  return true;
}
