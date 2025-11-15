// Client-side template rendering using HTML5 Canvas API
// Completely free - no server processing required

import { Template, TemplateElement } from './templates';

export interface RenderOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
}

/**
 * Apply a template to an image using Canvas API
 * @param imageFile - The original image file
 * @param template - The template to apply
 * @param customValues - Custom values for template elements (e.g., {title: 'My Title'})
 * @param options - Rendering options
 * @returns Promise<Blob> - The final image as a blob
 */
export async function applyTemplate(
  imageFile: File,
  template: Template,
  customValues: Record<string, string> = {},
  options: RenderOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1080,
    maxHeight = 1080,
    quality = 0.95,
    format = 'image/jpeg',
  } = options;

  try {
    // Validate inputs
    if (!imageFile) {
      throw new Error('Invalid image file');
    }
    if (!template || template.id === 'none') {
      throw new Error('Invalid or no template selected');
    }

    // Load the image
    const img = await loadImage(imageFile);

    // Calculate dimensions while maintaining aspect ratio
    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Draw the original image
    ctx.drawImage(img, 0, 0, width, height);

    // Apply template elements
    if (template.elements && template.elements.length > 0) {
      for (const element of template.elements) {
        try {
          await renderElement(ctx, element, width, height, customValues);
        } catch (elementError) {
          console.warn(`⚠️ Failed to render element ${element.id}:`, elementError);
          // Continue with next element even if one fails
        }
      }
    }

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        format,
        quality
      );
    });
  } catch (error) {
    console.error('Template application error:', error);
    throw error;
  }
}

/**
 * Load an image file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Render a single template element on the canvas
 */
async function renderElement(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  canvasWidth: number,
  canvasHeight: number,
  customValues: Record<string, string>
): Promise<void> {
  // Convert percentage positions to pixels
  const x = (element.x / 100) * canvasWidth;
  const y = (element.y / 100) * canvasHeight;
  const width = element.width ? (element.width / 100) * canvasWidth : 0;
  const height = element.height ? (element.height / 100) * canvasHeight : 0;

  switch (element.type) {
    case 'shape':
      renderShape(ctx, element, x, y, width, height);
      break;

    case 'overlay':
      renderOverlay(ctx, element, x, y, width, height);
      break;

    case 'text':
      renderText(ctx, element, x, y, canvasWidth, customValues);
      break;
  }
}

/**
 * Render a shape element
 */
function renderShape(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.save();

  if (element.opacity !== undefined) {
    ctx.globalAlpha = element.opacity;
  }

  ctx.fillStyle = element.backgroundColor || '#000000';

  if (element.borderRadius) {
    // Draw rounded rectangle
    const radius = element.borderRadius;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  } else {
    // Draw regular rectangle
    ctx.fillRect(x, y, width, height);
  }

  ctx.restore();
}

/**
 * Render an overlay element
 */
function renderOverlay(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.save();

  if (element.opacity !== undefined) {
    ctx.globalAlpha = element.opacity;
  }

  ctx.fillStyle = element.backgroundColor || 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x, y, width, height);

  ctx.restore();
}

/**
 * Render a text element
 */
function renderText(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  x: number,
  y: number,
  canvasWidth: number,
  customValues: Record<string, string>
): void {
  ctx.save();

  // Get text content (custom value or default)
  const text = customValues[element.id] || element.content || '';

  // Set font
  const fontSize = element.fontSize || 20;
  const fontWeight = element.fontWeight || 'normal';
  const fontFamily = element.fontFamily || 'Arial, sans-serif';
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // Set color
  ctx.fillStyle = element.color || '#000000';

  // Set text alignment
  const align = element.align || 'left';
  ctx.textAlign = align;

  if (align === 'center') {
    x = canvasWidth / 2;
  } else if (align === 'right') {
    x = canvasWidth - x;
  }

  // Set text baseline
  ctx.textBaseline = 'middle';

  // Handle multi-line text (split by \n)
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.2;

  lines.forEach((line, index) => {
    const lineY = y + index * lineHeight;
    ctx.fillText(line, x, lineY);
  });

  ctx.restore();
}

/**
 * Preview template without saving (for live preview)
 */
export async function previewTemplate(
  imageFile: File,
  template: Template,
  customValues: Record<string, string> = {}
): Promise<string> {
  const blob = await applyTemplate(imageFile, template, customValues, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.85,
    format: 'image/jpeg',
  });

  return URL.createObjectURL(blob);
}

/**
 * Get canvas data URL for preview (faster for thumbnails)
 */
export async function getTemplatePreviewUrl(
  imageFile: File,
  template: Template,
  customValues: Record<string, string> = {},
  size = 400
): Promise<string> {
  const img = await loadImage(imageFile);

  // Calculate thumbnail dimensions
  const ratio = Math.min(size / img.width, size / img.height);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw image
  ctx.drawImage(img, 0, 0, width, height);

  // Apply template elements
  for (const element of template.elements) {
    await renderElement(ctx, element, width, height, customValues);
  }

  return canvas.toDataURL('image/jpeg', 0.8);
}
