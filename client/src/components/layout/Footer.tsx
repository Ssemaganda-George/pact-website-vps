import { Link } from 'wouter';
import { useEffect, useState } from 'react';
import pactLogo from '@/assets/pact-logo.png';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface FooterData {
  id?: number;
  company_description?: string;
  address?: string;
  phone?: string;
  email?: string;
  social_links?: SocialLink[];
  copyright_text?: string;
  privacy_link?: string;
  terms_link?: string;
  sitemap_link?: string;
}

const Footer = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locations = [
    { city: "Doha", country: "Qatar" },
    { city: "Khartoum", country: "Sudan" },
    { city: "Kampala", country: "Uganda" },
    { city: "Richmond VA", country: "USA" },
    { city: "Juba", country: "South Sudan" },
    { city: "Kigali", country: "Rwanda" },
    { city: "Canonniers Point", country: "Mauritius" }
  ];

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch('/api/footer');
        const data = await response.json();
        
        console.log('Footer API response:', data);
        
        if (data.success && data.data) {
          console.log('Footer data:', data.data);
          console.log('Social links:', data.data.social_links);
          console.log('Social links type:', typeof data.data.social_links);
          console.log('Is array:', Array.isArray(data.data.social_links));
          setFooterData(data.data);
        } else {
          console.error('Failed to fetch footer data');
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFooterData();
  }, []);

  // Helper function to render footer links with consistent styling
  const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link href={to} className="footer-link text-gray-400 hover:text-accent transition-colors">
      {children}
    </Link>
  );
  
  return (
    <footer className="bg-primary text-white pt-12 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <img src={pactLogo} alt="PACT Consultancy Logo" className="h-9" />
              <span className="text-accent ml-2 font-medium">Consultancy</span>
            </div>
            {footerData?.company_description && (
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                {footerData.company_description}
              </p>
            )}
            {footerData?.social_links && Array.isArray(footerData.social_links) && footerData.social_links.length > 0 ? (
              <div className="flex space-x-4">
                {footerData.social_links.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    className="text-gray-400 hover:text-accent transition-colors" 
                    aria-label={link.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className={link.icon + " text-xl"}></i>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-accent transition-colors" 
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-accent transition-colors" 
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-accent transition-colors" 
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-facebook text-xl"></i>
                </a>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/services">Services</FooterLink></li>
              <li><FooterLink to="/projects">Projects</FooterLink></li>
              <li><FooterLink to="/clients">Key Clients & Partners</FooterLink></li>
              <li><FooterLink to="/news">News & Insights</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 sm:mb-6">Services</h4>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li><FooterLink to="/service/2">Poverty Reduction & MSME Development</FooterLink></li>
              <li><FooterLink to="/service/4">Monitoring, Evaluation & Learning</FooterLink></li>
              <li><FooterLink to="/service/3">Capacity Building, Mentoring & Training</FooterLink></li>
              <li><FooterLink to="/service/5">Program Design & Implementation</FooterLink></li>
              <li><FooterLink to="/service/6">Strategy & Business Development</FooterLink></li>
              <li><FooterLink to="/service/7">Macro-economic & Social Studies</FooterLink></li>
              <li><FooterLink to="/service/8">Technology Consulting</FooterLink></li>
              <li><FooterLink to="/service/9">Health & Social Development</FooterLink></li>
              <li><FooterLink to="/service/10">Agricultural Services</FooterLink></li>
              <li><FooterLink to="/service/11">Education & Capacity Development</FooterLink></li>
              <li><FooterLink to="/service/12">Peacebuilding & Conflict Resolution</FooterLink></li>
              <li><FooterLink to="/service/13">Data Acquisition & Knowledge Management</FooterLink></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 sm:mb-6">Contact</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="text-gray-400">
                {locations.map((location, index) => (
                  <div key={index} className="mb-1 sm:mb-2 text-sm">
                    {location.city}, {location.country}
                  </div>
                ))}
              </li>
              {footerData?.email && (
                <li className="flex items-center">
                  <i className="fas fa-envelope text-accent mr-3"></i>
                  <a href={`mailto:${footerData.email}`} className="text-gray-400 hover:text-accent transition-colors text-sm break-all">
                    {footerData.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <hr className="border-opacity-20 border-white mb-6 sm:mb-8" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-gray-500 text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()} {footerData?.copyright_text || 'PACT Consultancy'}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
            {footerData?.privacy_link && (
              <a href={footerData.privacy_link} className="text-gray-500 hover:text-accent text-sm">Privacy Policy</a>
            )}
            {footerData?.terms_link && (
              <a href={footerData.terms_link} className="text-gray-500 hover:text-accent text-sm">Terms of Service</a>
            )}
            {footerData?.sitemap_link && (
              <a href={footerData.sitemap_link} className="text-gray-500 hover:text-accent text-sm">Sitemap</a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
