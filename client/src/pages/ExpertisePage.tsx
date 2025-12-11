import { useEffect } from 'react';
import { Link } from 'wouter';
import expertiseAreas from '@/data/expertise';
import CTA from '@/components/home/CTA';
import { ExpertiseArea } from '@/types';

const ExpertiseDetailCard = ({ area, index }: { area: ExpertiseArea; index: number }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden mb-12 sm:mb-16" 
      data-aos="fade-up"
    >
      <div className="flex flex-col md:flex-row">
        <div className={`md:w-2/5 bg-primary/5 p-6 sm:p-8 flex items-center justify-center ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
              <i className={`fas ${area.icon} text-primary text-2xl sm:text-4xl`}></i>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark mb-3 sm:mb-4">{area.title}</h2>
            <div className="h-1 w-12 sm:w-16 bg-accent mx-auto"></div>
          </div>
        </div>
        <div className={`md:w-3/5 p-6 sm:p-8 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
          <p className="text-base sm:text-lg text-secondary mb-4 sm:mb-6">
            {area.description}
          </p>
          
          <h3 className="text-lg sm:text-xl font-semibold text-dark mb-3 sm:mb-4">Key Capabilities</h3>
          <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {area.capabilities.map((capability, idx) => (
              <li key={idx} className="flex items-start">
                <i className="fas fa-check-circle text-accent mt-1 mr-2 sm:mr-3 text-sm sm:text-base"></i>
                <span className="text-secondary text-sm sm:text-base">{capability}</span>
              </li>
            ))}
          </ul>
          
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border-l-4 border-primary">
            <h4 className="text-base sm:text-lg font-semibold text-dark mb-2">Why Our {area.title} Expertise Matters</h4>
            <p className="text-secondary text-sm sm:text-base">
              In today's rapidly evolving landscape, organizations need specialized knowledge and proven
              methodologies to navigate complex challenges and capitalize on opportunities in the {area.title} sector.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpertisePage = () => {
  // Initialize AOS when component mounts
  useEffect(() => {
    // @ts-ignore
    if (typeof AOS !== 'undefined') {
      // @ts-ignore
      AOS.refresh();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      {/* Hero Banner */}
      <div className="bg-primary text-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl" data-aos="fade-up">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6">Our Areas of Expertise</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8">
              PACT Consultancy brings deep industry knowledge and functional expertise 
              to help clients navigate their most complex challenges.
            </p>
            <Link href="/contact" className="bg-white text-primary hover:bg-white/90 py-2.5 sm:py-3 px-6 sm:px-8 rounded-md font-medium inline-block transition-all text-sm sm:text-base">
              Discuss Your Industry Challenges
            </Link>
          </div>
        </div>
      </div>
      
      {/* Expertise Content */}
      <div className="container mx-auto px-4 md:px-8 py-12 sm:py-16 md:py-24">
        {expertiseAreas.map((area, index) => (
          <ExpertiseDetailCard key={area.id} area={area} index={index} />
        ))}
        
        {/* Approach Section */}
        <div className="mb-16 sm:mb-20" data-aos="fade-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-8 sm:mb-12 text-center">Our Approach</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <i className="fas fa-brain text-primary text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-dark mb-3 sm:mb-4">Industry Expertise</h3>
              <p className="text-secondary mb-3 sm:mb-4 text-sm sm:text-base">
                Our consultants bring years of hands-on experience and stay current with the latest industry developments to provide informed perspectives.
              </p>
              <ul className="text-secondary space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li className="flex items-start">
                  <i className="fas fa-check text-accent mt-1 mr-2"></i>
                  <span>Deep domain knowledge</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-accent mt-1 mr-2"></i>
                  <span>Industry-specific benchmarks</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-accent mt-1 mr-2"></i>
                  <span>Regulatory understanding</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <i className="fas fa-cogs text-primary text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-dark mb-3 sm:mb-4">Methodology</h3>
              <p className="text-secondary mb-3 sm:mb-4 text-sm sm:text-base">
                We combine proven methodologies with innovative thinking to deliver solutions that are both rigorous and creative.
              </p>
              <ul className="text-secondary space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li className="flex items-start">
                  <i className="fas fa-check text-accent mt-1 mr-2"></i>
                  <span>Systematic problem solving</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-accent mt-1 mr-2"></i>
                  <span>Data-driven insights</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-accent mt-1 mr-2"></i>
                  <span>Agile implementation</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <i className="fas fa-handshake text-primary text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-dark mb-3 sm:mb-4">Collaboration</h3>
              <p className="text-secondary mb-3 sm:mb-4 text-sm sm:text-base">
                We work side by side with clients, fostering knowledge transfer and building internal capabilities that last.
              </p>
              <ul className="text-secondary space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li className="flex items-start">
                  <i className="fas fa-check text-accent mt-1 mr-2"></i>
                  <span>Client co-creation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-accent mt-1 mr-2"></i>
                  <span>Skills development</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-accent mt-1 mr-2"></i>
                  <span>Long-term partnership</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <CTA />
    </div>
  );
};

export default ExpertisePage;
