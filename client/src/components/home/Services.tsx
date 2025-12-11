import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import servicesData from '@/data/services'; // Keep as fallback
import { ServiceItem } from '@/types';
import { ArrowRight, Plus, Minus, Loader2 } from 'lucide-react';
import { fetchServices } from '@/lib/api';

const ServiceCard = ({ service }: { service: ServiceItem }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Image Header with Badge */}
      <div className="relative h-52">
        <img 
          src={service.image} 
          alt={service.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Service+Image';
          }}
        />
        <div className="absolute top-4 left-4">
          <span className="inline-block bg-[#FF6B35] text-white text-xs font-medium px-3 py-1.5 rounded">
            PACT SERVICES
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-[#1B365D] mb-3">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {service.description}
        </p>

        {/* Action Links */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link 
            href={`/services#${service.id}`}
            className="flex items-center text-[#FF6B35] hover:text-[#1B365D] transition-colors"
          >
            <span className="mr-2">Details</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const Services = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const response = await fetchServices();
        
        if (response.success && Array.isArray(response.data)) {
          setServices(response.data);
        } else {
          // Fallback to static data if API fails
          console.warn('Using fallback service data');
          setServices(servicesData);
        }
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Failed to load services');
        // Fallback to static data
        setServices(servicesData);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 flex justify-center items-center" style={{ minHeight: '300px' }}>
          <div className="text-center">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary mb-4" />
            <p className="text-gray-500">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-12 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-[#1B365D]">Comprehensive</span>{' '}
            <span className="text-[#FF6B35]">Consulting</span>{' '}
            <span className="text-[#1B365D]">Services</span>
          </h2>
          <p className="text-gray-600 text-lg">
          From project / program conception to implementation, assessment and evaluation, 
          PACT delivers technical assistance that enables sustainable transformation and lasting impact
          </p>
          <div className="mt-8">
            <Link 
              href="/services"
              className="inline-flex items-center bg-[#1B365D] text-white px-6 py-3 rounded hover:bg-primary transition-colors"
            >
              <span>View All Services</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-8">
            <p>{error}</p>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.length > 0 ? (
            services.slice(0, 6).map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
              />
            ))
          ) : (
            <div className="col-span-3 bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">No services available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Services;
