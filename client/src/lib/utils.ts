import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function smoothScrollTo(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    const offset = 80; // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

export function smoothScrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * Generates a URL-friendly slug from a string
 * @param text The text to convert to a slug
 * @returns A lowercase string with spaces replaced by hyphens and special characters removed
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with a single hyphen
    .trim();                  // Trim hyphens from the beginning and end
}

/**
 * Extracts a slug from a URL path
 * @param path The URL path (e.g., '/news/some-article-title')
 * @returns The extracted slug (e.g., 'some-article-title')
 */
export function extractSlugFromPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

/**
 * Strips HTML tags from a string and decodes HTML entities
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  
  // First decode HTML entities using a simple mapping
  const htmlEntities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&deg;': '°',
    '&hellip;': '...',
    '&trade;': '™',
    '&mdash;': '—',
    '&ndash;': '–',
    '&euro;': '€',
    '&pound;': '£',
    '&cent;': '¢',
    '&sect;': '§',
  };
  
  let decodedText = html;
  
  // Replace HTML entities with their corresponding characters
  Object.entries(htmlEntities).forEach(([entity, char]) => {
    decodedText = decodedText.replace(new RegExp(entity, 'g'), char);
  });
  
  // Also handle numeric HTML entities
  decodedText = decodedText.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  
  // Then remove HTML tags
  return decodedText
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();                 // Trim leading/trailing whitespace
}
