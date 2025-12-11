import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Link } from 'wouter';
import { Loader2, ArrowLeft, ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import CTA from '@/components/home/CTA';
import { fetchServices } from '@/lib/api';
import { ServiceItem } from '@/types';
import servicesData from '@/data/services'; // Fallback
import { useProjects } from '@/context/ProjectsContext';

// Interface for Project for displaying related projects
interface ProjectPreview {
  id: number | string;
  title: string;
  description: string;
  organization: string;
  image?: string;
  category?: string;
  duration?: string;
  location?: string;
}

const ServiceDetailPage = () => {
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<ProjectPreview[]>([]);
  const [, params] = useRoute('/service/:id');
  const serviceId = params?.id;
  const { projects, loading: projectsLoading } = useProjects();

  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) return;
      
      try {
        setLoading(true);
        const response = await fetchServices();
        
        if (response.success && Array.isArray(response.data)) {
          const foundService = response.data.find((s: ServiceItem) => 
            s.id.toString() === serviceId.toString()
          );
          
          if (foundService) {
            setService(foundService);
          } else {
            // Try to find in local data as fallback
            const localService = servicesData.find((s: ServiceItem) => 
              s.id.toString() === serviceId.toString()
            );
            
            if (localService) {
              setService(localService);
            } else {
              setError('Service not found');
            }
          }
        } else {
          // Try to find in local data as fallback
          const localService = servicesData.find((s: ServiceItem) => 
            s.id.toString() === serviceId.toString()
          );
          
          if (localService) {
            setService(localService);
          } else {
            setError('Service not found');
          }
        }
      } catch (err) {
        console.error('Error loading service:', err);
        
        // Try to find in local data as fallback
        const localService = servicesData.find((s: ServiceItem) => 
          s.id.toString() === serviceId.toString()
        );
        
        if (localService) {
          setService(localService);
        } else {
          setError('Failed to load service details');
        }
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  // Find related projects based on service title when service or projects change
  useEffect(() => {
    if (service && !projectsLoading && projects.length > 0) {
      // Find projects that have services matching or containing the current service title
      const related = projects.filter(project => {
        // Check if project has services array and it includes anything related to this service
        if (project.services && Array.isArray(project.services)) {
          return project.services.some(projectService => 
            typeof projectService === 'string' && 
            (
              projectService.toLowerCase().includes(service.title.toLowerCase()) || 
              service.title.toLowerCase().includes(projectService.toLowerCase())
            )
          );
        }
        
        // Check if the project category matches this service title or category
        if (project.category) {
          // If service has a category, check if the project's category matches it
          if (service.category && project.category.toLowerCase().includes(service.category.toLowerCase())) {
            return true;
          }
          
          // Check if project category contains service title
          if (project.category.toLowerCase().includes(service.title.toLowerCase())) {
            return true;
          }
        }
        
        // Also check if the project title or description mentions the service
        return (
          project.title.toLowerCase().includes(service.title.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(service.title.toLowerCase()))
        );
      });

      // Map to simpler preview objects
      const previewProjects = related.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        organization: project.organization || '',
        image: project.bg_image || '',
        duration: project.duration || '',
        location: project.location || ''
      }));

      setRelatedProjects(previewProjects);
    }
  }, [service, projects, projectsLoading]);

  if (loading) {
    return (
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p className="mt-4">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center py-12">
            <div className="bg-red-50 p-6 rounded-lg max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
              <p className="text-red-600 mb-6">{error || 'Service not found'}</p>
              <Link href="/services" className="text-primary hover:underline">
                Return to Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Banner */}
      <div 
        className="bg-cover bg-center h-80 relative"
        style={{
          backgroundImage: `url(${service.image?.startsWith('http') ? service.image : `http://localhost:5000${service.image}`})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center relative z-10">
          <div>
            <Link href="/services" className="inline-flex items-center text-white hover:text-primary mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Services
            </Link>
            <h1 className="text-4xl font-bold text-white mb-4">{service.title}</h1>
          </div>
        </div>
      </div>
      
      {/* Service Details */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-700 mb-8 leading-relaxed">
            {service.description}
          </p>
          
          <h2 className="text-2xl font-bold text-primary mb-6">What We Provide</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {service.details && service.details.map((detail, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary font-bold">✓</span>
                </span>
                <div className="flex-1">
                  <p className="text-gray-800">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Related Projects Section */}
        {relatedProjects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Related Projects</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    {/* Organization Badge */}
                    <div className="text-primary text-sm mb-4">
                      {project.organization}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-4">
                      {project.title}
                    </h3>
                    
                    {/* Date/Duration */}
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <span>{project.duration || 'Ongoing'}</span>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{project.location || 'Multiple Locations'}</span>
                    </div>
                    
                    {/* Read More Link */}
                    <Link 
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mt-2"
                    >
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <CTA />
    </div>
  );
};

export default ServiceDetailPage; 