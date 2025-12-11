import { useRef, useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { useScrollEffect } from '@/hooks/useScrollEffect';
import { Award, Globe, Users, Handshake, CheckCircle, Calendar, Briefcase, Target, ArrowRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton, TextSkeleton, FeatureSkeleton } from '@/components/ui/ContentSkeleton';

// Define the AboutContent interface
interface AboutContent {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  vision?: string;
  mission?: string;
  core_values?: string[];
  features?: {
    title: string;
    description: string;
    icon: string;
  }[];
}

const FeatureItem = ({ 
  icon, 
  title, 
  description,
  index
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  index: number
}) => {
  return (
    <div 
      className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      data-aos="fade-up" 
      data-aos-delay={100 + (index * 100)}
    >
      <div className="p-3 rounded-full bg-primary/10 text-primary mr-4 mt-1 flex-shrink-0">
          {icon}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-navy-800 mb-2">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const About = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const featureIcons: Record<string, React.ReactNode> = {
    CheckCircle: <CheckCircle className="h-5 w-5" />,
    Award: <Award className="h-5 w-5" />,
    Globe: <Globe className="h-5 w-5" />,
    Users: <Users className="h-5 w-5" />,
    Handshake: <Handshake className="h-5 w-5" />,
    Briefcase: <Briefcase className="h-5 w-5" />
  };

  // Default values for vision, mission, and core values
  const defaultVision = "To leverage our global synergy and expertise to provide leading, innovative and distinctive development consulting and technical assistance.";
  const defaultMission = "To empower communities socially and economically.";
  const defaultCoreValues = [
    "Expertise",
    "Integrity", 
    "Excellence", 
    "Sustainable Transformation & Empowerment", 
    "Respect"
  ];

  // Fetch about content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/about-content', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API response error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Ensure we have vision, mission, and core_values by providing defaults if missing
          const processedData = {
            ...data.data,
            vision: data.data.vision || defaultVision,
            mission: data.data.mission || defaultMission,
            core_values: data.data.core_values || defaultCoreValues
          };
          setContent(processedData);
        } else {
          // Use default content if API call fails or returns empty data
          setContent({
            id: 0,
            title: 'About PACT Consultancy',
            subtitle: 'Who We Are',
            description: 'At PACT Consultancy, we partner with organizations to design strategies, build capabilities, and deliver sustainable change. Our tailored approach drives growth, resilience, and impact in an ever-evolving world.\n\nWe bring over 15+ years of consulting excellence, with multisector expertise across Finance, Governance, Health, and beyond, supported by global and regional partnerships.',
            vision: defaultVision,
            mission: defaultMission,
            core_values: defaultCoreValues,
            features: [
              { title: 'Custom Strategies', description: 'Tailored to your specific needs', icon: 'CheckCircle' },
              { title: 'Expert Team', description: 'Highly skilled professionals', icon: 'Users' },
              { title: 'Proven Results', description: 'Measurable outcomes', icon: 'Award' },
              { title: 'Global Network', description: 'Worldwide partnerships', icon: 'Globe' }
            ]
          });
        }
      } catch (error) {
        // Set default content on error
        setContent({
          id: 0,
          title: 'About PACT Consultancy',
          subtitle: 'Who We Are',
          description: 'At PACT Consultancy, we partner with organizations to design strategies, build capabilities, and deliver sustainable change. Our tailored approach drives growth, resilience, and impact in an ever-evolving world.',
          vision: defaultVision,
          mission: defaultMission,
          core_values: defaultCoreValues,
          features: [
            { title: 'Custom Strategies', description: 'Tailored to your specific needs', icon: 'CheckCircle' },
            { title: 'Expert Team', description: 'Highly skilled professionals', icon: 'Users' },
            { title: 'Proven Results', description: 'Measurable outcomes', icon: 'Award' },
            { title: 'Global Network', description: 'Worldwide partnerships', icon: 'Globe' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading || !content) {
    return (
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          {/* Loading Header Skeleton */}
          <div className="text-center mb-8 space-y-3">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-10 w-80 mx-auto" />
            <Skeleton className="h-1 w-24 mx-auto" />
          </div>

          {/* Loading Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <Skeleton className="h-8 w-48" />
                <TextSkeleton lines={4} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <FeatureSkeleton />
                  <FeatureSkeleton />
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-5">
              <div className="bg-white p-8 rounded-lg shadow-md space-y-8">
                {/* Vision Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <TextSkeleton lines={2} />
                </div>
                {/* Mission Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <TextSkeleton lines={1} />
                </div>
                {/* Core Values Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-full rounded" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Get paragraphs from description - handle both \r\n and \n line breaks
  const paragraphs = content.description
    ?.replace(/\r\n/g, '\n') // Convert Windows line breaks to Unix
    ?.replace(/\r/g, '\n')   // Also handle lone \r characters
    ?.split(/\n\n+/)         // Split on one or more blank lines
    ?.filter(paragraph => paragraph.trim() !== '') || []; // Only keep non-empty paragraphs

  // Get only the first paragraph for the home page preview
  const previewText = paragraphs[0] || '';

  return (
    <section className="bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        {/* About Section Header */}
        <div className="text-center mb-8">
          <h3 className="text-primary uppercase tracking-wide text-sm font-semibold mb-2">{content.subtitle}</h3>
          <h2 className="text-4xl font-bold text-navy-900 mb-4">
            About <span className="text-primary">PACT</span> Consultancy
            </h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        {/* Main Content Section - Grid with equal heights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Description */}
          <div className="lg:col-span-7 flex flex-col h-full">
            {/* Card wrapper for left content */}
            <div className="bg-white p-8 rounded-lg shadow-md h-full flex flex-col">
              {/* Description Text - Show only first paragraph */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-navy-900 mb-4">
                  Who We Are
                </h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {previewText}
                </p>
              </div>

              {/* Features - Show only 2 features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 flex-grow">
                {content.features && content.features.slice(0, 2).map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary/30 transition-all duration-300"
                    data-aos="fade-up" 
                    data-aos-delay={100 + (index * 100)}
                  >
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3 mt-1 flex-shrink-0">
                      {featureIcons[feature.icon as keyof typeof featureIcons] || <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-800 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            
              {/* More Details Button with Dialog */}
              <div className="mt-auto pt-4 border-t border-slate-200">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group">
                      More Details
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col [&>button]:z-50 [&>button]:w-10 [&>button]:h-10 [&>button]:bg-gray-100 [&>button]:hover:bg-gray-200 [&>button]:rounded-md [&>button]:right-6 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button>svg]:w-6 [&>button>svg]:h-6 [&>button>svg]:stroke-[3]">
                    {/* Fixed Header */}
                    <DialogHeader className="pb-4 border-b sticky top-0 bg-white z-40">
                      <DialogTitle className="text-3xl font-bold text-navy-900 mb-2 pr-12">
                        About <span className="text-primary">PACT</span> Consultancy
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        {content.subtitle}
                      </DialogDescription>
                    </DialogHeader>
                  
                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-1 pr-2">
                      <div className="space-y-6">
                        {/* Full Description */}
                        <div className="space-y-4">
                          {paragraphs.map((paragraph, index) => (
                            <p key={index} className="text-gray-700 leading-relaxed text-base">
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        {/* All Features */}
                        {content.features && content.features.length > 0 && (
                          <div className="mt-8">
                            <h3 className="text-xl font-semibold text-navy-800 mb-4">Our Strengths</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              {content.features.map((feature, index) => (
                                <div 
                                  key={index}
                                  className="flex items-start p-4 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  <div className="p-2 rounded-full bg-primary/10 text-primary mr-3 mt-1 flex-shrink-0">
                                    {featureIcons[feature.icon as keyof typeof featureIcons] || <CheckCircle className="h-4 w-4" />}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-navy-800 mb-1">{feature.title}</h4>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Image if available */}
                        {content.image && (
                          <div className="mt-8 mb-4">
                            <img 
                              src={content.image} 
                              alt="About PACT Consultancy" 
                              className="w-full h-auto max-h-[400px] rounded-lg shadow-lg object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
                </div>

          {/* Right Column - Vision, Mission, Values */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-lg shadow-md w-full h-full flex flex-col justify-between">
              {/* Vision */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-primary mr-3" />
                  <h4 className="text-xl font-semibold text-navy-800 pb-1 border-b-2 border-primary">
                    Vision / Core Purpose
                  </h4>
                </div>
                <p className="italic text-gray-700 pl-9 border-l-2 border-primary/30 py-2">
                  {content.vision || defaultVision}
                </p>
              </div>

              {/* Mission */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Globe className="h-6 w-6 text-primary mr-3" />
                  <h4 className="text-xl font-semibold text-navy-800 pb-1 border-b-2 border-primary">
                    Mission
                  </h4>
                </div>
                <p className="italic text-gray-700 pl-9 border-l-2 border-primary/30 py-2">
                  {content.mission || defaultMission}
                </p>
              </div>

              {/* Core Values */}
                <div>
                <div className="flex items-center mb-4">
                  <Award className="h-6 w-6 text-primary mr-3" />
                  <h4 className="text-xl font-semibold text-navy-800 pb-1 border-b-2 border-primary">
                    Core Values
                  </h4>
                </div>
                <div className="space-y-2 pl-3">
                  {(content.core_values || defaultCoreValues).map((value, index) => (
                    <div 
                      key={index}
                      className="flex items-center p-2 bg-slate-50 border-l-4 border-primary rounded-r text-gray-700 hover:bg-slate-100 transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                      <span>{value}</span>
              </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
