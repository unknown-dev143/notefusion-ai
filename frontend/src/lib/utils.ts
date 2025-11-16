import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

/**
 * Combines multiple class names and merges Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a human-readable string
 * @example formatDate('2023-01-01') // 'January 1, 2023'
 */
export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Creates an absolute URL by prepending the app's base URL
 * Uses Vite's import.meta.env for environment variables
 */
export function absoluteUrl(path: string): string {
  // Get base URL from Vite environment variables
  const baseUrl = import.meta.env.VITE_APP_URL || '';
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Checks if the app is running in development mode
 */
export const isDev = import.meta.env.DEV;

/**
 * Checks if the app is running in production mode
 */
export const isProd = import.meta.env.PROD;

/**
 * Generates a unique ID
 */
export function generateId(prefix = '') {
  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);
  return `${prefix}${nanoid()}`;
}

/**
 * Downloads a file from a data URL
 */
export function downloadFile(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Copies an image to clipboard
 */
export async function copyImageToClipboard(dataUrl: string) {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Failed to copy image: ', err);
    return false;
  }
}
