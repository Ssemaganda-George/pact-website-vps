/// <reference types="vite/client" />

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import servicesData from '@/data/services'; // Keep as fallback
import CTA from '@/components/home/CTA';
import { fetchServices } from '@/lib/api';
import { ServiceItem } from '@/types';
import { Loader2 } from 'lucide-react';
import { scrollToHash } from '@/lib/smoothScroll';

const ServiceDetailCard = ({ service }: { service: ServiceItem }) => {
  const [imageError, setImageError] = useState(false);
  console.log('ServiceDetailCard props:', service);

  const imageUrl = service.image?.startsWith('http')
    ? service.image
    : `${service.image}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      {/* Image Header with Title Overlay */}
      <div className="relative h-48 bg-primary flex items-center justify-center overflow-hidden">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={service.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <i className={`fas ${service.icon} text-6xl text-white/20 transform scale-150`}></i>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h2 className="text-xl font-bold text-white mb-1">
            {service.title}
          </h2>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-grow">
          {service.description.length > 120
            ? `${service.description.substring(0, 120)}...`
            : service.description}
        </p>

        {/* Read More Link */}
        <div className="mt-auto pt-3 text-right">
          <Link
            href={`/service/${service.id}`}
            className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

const ServicesPage = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const response = await fetchServices();
        console.log('Services API Response:', response);

        if (response.success && Array.isArray(response.data)) {
          setServices(response.data);
        } else {
          setServices(servicesData);
        }
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Failed to load services');
        setServices(servicesData);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  useEffect(() => {
    // Scroll to the section specified in the hash when the component mounts
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        // Add a slight delay to ensure the element is rendered
        setTimeout(() => {
          scrollToHash(hash, { duration: 800, offset: 80 }).catch(console.error);
        }, 150);
      }
    };

    // Call handleHashChange initially
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      // Clean up event listener
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [services]); // Re-run effect if services data changes

  return (
    <div className="pt-20">
      {/* Hero Banner */}
      <div className="bg-primary text-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6">Our Services</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8">
              We offer a comprehensive suite of developing consulting services designed to help organizations overcome challenges and transform communities.
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p>Loading services...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 p-4 mb-4 text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {services.map(service => (
                <div key={service.id} id={String(service.id)} className="w-full">
                  <ServiceDetailCard service={service} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Service Process */}
      <div className="bg-gray-50 py-12 sm:py-16 md:py-24 mt-12 sm:mt-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12" data-aos="fade-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark mb-4 sm:mb-5">Our Service Delivery Process</h2>
            <p className="text-base sm:text-lg text-gray-600">
              We follow a structured process to ensure that our technical assistance delivers maximum value and sustainable results
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="relative bg-white rounded-lg p-4 sm:p-6 shadow-md" data-aos="fade-up" data-aos-delay="100">
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold">1</div>
              <h3 className="text-lg sm:text-xl font-bold text-dark mt-3 sm:mt-4 mb-2 sm:mb-3">Project conception and design</h3>
              <p className="text-sm sm:text-base text-gray-600">We start by thoroughly understanding your needs, challenges, and objectives.</p>
            </div>

            <div className="relative bg-white rounded-lg p-4 sm:p-6 shadow-md" data-aos="fade-up" data-aos-delay="200">
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold">2</div>
              <h3 className="text-lg sm:text-xl font-bold text-dark mt-3 sm:mt-4 mb-2 sm:mb-3">Strategy</h3>
              <p className="text-sm sm:text-base text-gray-600">We develop a tailored approach that addresses your specific situation and goals.</p>
            </div>

            <div className="relative bg-white rounded-lg p-4 sm:p-6 shadow-md" data-aos="fade-up" data-aos-delay="300">
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold">3</div>
              <h3 className="text-lg sm:text-xl font-bold text-dark mt-3 sm:mt-4 mb-2 sm:mb-3">Implementation</h3>
              <p className="text-sm sm:text-base text-gray-600">We work with you to put solutions into action, ensuring smooth execution.</p>
            </div>

            <div className="relative bg-white rounded-lg p-4 sm:p-6 shadow-md" data-aos="fade-up" data-aos-delay="400">
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold">4</div>
              <h3 className="text-lg sm:text-xl font-bold text-dark mt-3 sm:mt-4 mb-2 sm:mb-3">Monitoring and evaluation</h3>
              <p className="text-sm sm:text-base text-gray-600">We measure results and refine approaches to ensure lasting impact and value.</p>
            </div>
          </div>
        </div>
      </div>

      <CTA />
    </div>
  );
};

export default ServicesPage;
