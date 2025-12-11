/**
 * Professional smooth scroll utilities for better UX
 */

interface ScrollOptions {
  duration?: number;
  offset?: number;
  easing?: (t: number) => number;
}

/**
 * Easing functions for smooth animations
 */
export const easings = {
  // Smooth ease-in-out (professional)
  easeInOutCubic: (t: number): number => 
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  // Gentle ease-out
  easeOutQuad: (t: number): number => 
    t * (2 - t),
  
  // Smooth ease-in-out quad
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // Professional spring-like easing
  easeOutQuart: (t: number): number =>
    1 - (--t) * t * t * t,
};

/**
 * Smooth scroll to a specific position
 */
export function smoothScrollTo(
  targetPosition: number,
  options: ScrollOptions = {}
): Promise<void> {
  const {
    duration = 800,
    easing = easings.easeInOutCubic,
  } = options;

  return new Promise((resolve) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    function animation(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      
      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animation);
  });
}

/**
 * Smooth scroll to an element with offset for fixed headers
 */
export function smoothScrollToElement(
  element: HTMLElement | string,
  options: ScrollOptions = {}
): Promise<void> {
  const {
    offset = 80, // Default offset for fixed header
    ...scrollOptions
  } = options;

  const targetElement = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element;

  if (!targetElement) {
    return Promise.reject(new Error('Element not found'));
  }

  const elementPosition = targetElement.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  return smoothScrollTo(offsetPosition, scrollOptions);
}

/**
 * Smooth scroll to top of page
 */
export function smoothScrollToTop(options: ScrollOptions = {}): Promise<void> {
  return smoothScrollTo(0, options);
}

/**
 * Scroll to element with ID (hash navigation)
 */
export function scrollToHash(hash: string, options: ScrollOptions = {}): Promise<void> {
  const id = hash.startsWith('#') ? hash.substring(1) : hash;
  const element = document.getElementById(id);
  
  if (!element) {
    return Promise.reject(new Error(`Element with id "${id}" not found`));
  }

  return smoothScrollToElement(element, options);
}

/**
 * Add smooth scrolling to all anchor links on the page
 */
export function enableSmoothScrolling(options: ScrollOptions = {}): () => void {
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;
    
    if (anchor && anchor.hash) {
      e.preventDefault();
      scrollToHash(anchor.hash, options).catch(console.error);
      
      // Update URL without jumping
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', anchor.hash);
      }
    }
  };

  document.addEventListener('click', handleClick);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('click', handleClick);
  };
}
