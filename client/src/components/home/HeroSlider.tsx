import { useCallback, useEffect, useState } from 'react';
import { Link } from 'wouter';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowDown } from 'lucide-react';

// Define the slide interface
interface SlideContent {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  actionText: string;
  actionLink: string;
  backgroundImage: string;
  category?: string;
  videoBackground?: string;
  accentColor?: string;
  order_index?: number;
}

const HeroSlider = () => {
  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [slideProgress, setSlideProgress] = useState(0);
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [currentSlide, setCurrentSlide] = useState<SlideContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/hero-slides');
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Map API response fields (snake_case) to component interface (camelCase)
          const mappedSlides = data.data.map((slide: any) => ({
            id: slide.id,
            title: slide.title,
            subtitle: slide.subtitle,
            description: slide.description,
            actionText: slide.action_text,
            actionLink: slide.action_link,
            backgroundImage: slide.background_image,
            category: slide.category,
            order_index: slide.order_index
          }));
          
          // Sort slides by order_index
          const sortedSlides = [...mappedSlides].sort((a, b) => 
            (a.order_index || 0) - (b.order_index || 0)
          );
          setSlides(sortedSlides);
          setCurrentSlide(sortedSlides[0]);
        } else {
          console.warn('No hero slides found in API');
          setSlides([]);
          setCurrentSlide(null);
        }
      } catch (err) {
        console.error('Error fetching hero slides:', err);
        setError(true);
        setSlides([]);
        setCurrentSlide(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Callbacks for scrolling
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  // Setup and cleanup
  useEffect(() => {
    if (!emblaApi || slides.length === 0) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);
      setCurrentSlide(slides[index]);
      setSlideProgress(0);
    };

    const onScroll = () => {
      const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
      setSlideProgress(progress * 100);
    };

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("scroll", onScroll);
    onSelect();

    // Autoscroll functionality
    const autoScrollInterval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 8000); // Slightly longer time for BearingPoint style

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("scroll", onScroll);
      clearInterval(autoScrollInterval);
    };
  }, [emblaApi, slides]); // Added slides as dependency to reinitialize when slides are loaded

  // If loading and no slides yet, show nothing (will be fast anyway)
  if (loading && slides.length === 0) {
    return null;
  }

  // If no slides are available after loading, show a message
  if (!loading && slides.length === 0) {
    return (
      <section id="home" className="relative overflow-hidden bg-dark text-white h-[60vh] md:h-[70vh] flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            {error ? "Failed to load hero slides" : "No hero slides available"}
          </h1>
          <p className="text-white/80">
            {error ? "Please try refreshing the page" : "Please add some slides in the admin panel"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="relative overflow-hidden bg-dark text-white">
      {/* BearingPoint style progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/20">
        <div 
          className="h-full bg-accent transition-all duration-1000 ease-linear"
          style={{ 
            width: `${slideProgress}%`, 
            backgroundColor: currentSlide?.accentColor || '#FF8200'
          }}
        ></div>
      </div>

      {/* Embla Carousel Container */}
      <div className="embla h-[60vh] md:h-[70vh] overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide) => (
            <div key={slide.id} className="embla__slide relative min-w-full h-full flex">
              {/* Content Card (Left Side) */}
              <div className="relative z-10 w-full md:w-3/5 lg:w-1/2 flex items-center">
                <div className="bg-black bg-opacity-70 p-6 md:p-12 rounded-md max-w-4xl mx-auto md:ml-12 lg:ml-24">
                  {slide.category && (
                    <div 
                      className="mb-4 text-sm md:text-base uppercase tracking-wider font-bold inline-block px-3 py-1 rounded-sm"
                      style={{ backgroundColor: slide.accentColor || '#FF8200' }}
                    >
                      {slide.category}
                    </div>
                  )}
                  
                  <h1 className="text-4xl font-bold mb-4 text-navy-900">
                    {slide.title}
                    {slide.subtitle && <span className="block mt-2 text-accent">{slide.subtitle}</span>}
                  </h1>
                  
                  <div className="h-1.5 w-24 mb-6" style={{ backgroundColor: slide.accentColor || '#FF8200' }}></div>
                  
                  <p className="text-lg md:text-xl mb-10 text-white/90 max-w-2xl font-light">
                    {slide.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex flex-col sm:flex-row gap-5 w-full">
                      <Link 
                        href={slide.actionLink} 
                        className="flex items-center justify-center w-full sm:w-auto text-white py-3 px-6 rounded-sm transition-all text-center uppercase tracking-wide text-sm md:text-base font-medium"
                        style={{ backgroundColor: slide.accentColor || '#FF8200' }}
                      >
                        <span>{slide.actionText}</span>
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                      <Link 
                        href="/contact" 
                        className="flex items-center justify-center w-full sm:w-auto text-white py-3 px-6 rounded-sm transition-all text-center uppercase tracking-wide text-sm md:text-base font-medium border-2 border-white/60 hover:bg-white/10"
                      >
                        <span>Contact Us</span>
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Background (Right Side) */}
              <div className="absolute inset-0 z-0">
                {slide.videoBackground ? (
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={slide.videoBackground} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img 
                    src={slide.backgroundImage} 
                    alt={`Slide ${slide.id}`} 
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Remove or adjust overlay if necessary */}
                {/* <div className="absolute inset-0 bg-primary/75"></div> */}
                {/* <div 
                  className="absolute left-0 top-0 bottom-0 w-1/3 lg:w-1/4"
                  style={{ 
                    background: `linear-gradient(90deg, ${slide.accentColor || '#FF8200'}40 0%, transparent 100%)` 
                  }}
                ></div> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Numbers - BearingPoint Style */}
      <div className="absolute bottom-8 left-8 z-20 hidden md:flex items-center">
        <span className="text-4xl font-bold text-white">{selectedIndex + 1}</span>
        <span className="mx-2 text-xl text-white/60">/</span>
        <span className="text-xl text-white/60">{slides.length}</span>
      </div>

      {/* Navigation Buttons - BearingPoint style (rectangular) */}
      <div className="absolute bottom-8 right-8 z-20 flex space-x-3">
        <button 
          onClick={scrollPrev} 
          className="bg-white/10 hover:bg-white/20 text-white p-2.5 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={scrollNext} 
          className="bg-white/10 hover:bg-white/20 text-white p-2.5 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Indicators - BearingPoint horizontal lines style */}
      <div className="absolute bottom-24 left-8 right-8 z-20 hidden md:flex gap-2 w-48">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className="h-1 transition-all flex-grow"
            style={{
              backgroundColor: index === selectedIndex 
                ? (currentSlide?.accentColor || '#FF8200') 
                : 'rgba(255, 255, 255, 0.3)'
            }}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Scroll Down Indicator - BearingPoint style */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center animate-bounce md:hidden">
        <ArrowDown className="w-6 h-6 text-white/80" />
      </div>
    </section>
  );
};

export default HeroSlider;