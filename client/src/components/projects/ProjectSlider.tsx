import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

export interface Project {
  id: number;
  title: string;
  description: string;
  organization: string;
  logo?: string;
  bg_image: string;
  bgImage?: string;
  category: string;
  date?: string;
  icon?: React.ReactNode;
}

interface ProjectSliderProps {
  projects: Project[];
  className?: string;
}

export default function ProjectSlider({ projects, className }: ProjectSliderProps) {
  if (projects.length === 0) {
    return null;
  }

  // Get the first project as featured and only 2 side projects
  const [featuredProject, ...sideProjects] = projects.slice(0, 3);
  const displayedSideProjects = sideProjects.slice(0, 2);

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Featured Project - Left side (spans 4/7 columns) */}
        <div className="lg:col-span-4">
          <Link to={`/projects/${featuredProject.id}`}>
            <div className="relative rounded-md overflow-hidden aspect-[16/9] group cursor-pointer">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transform transition-transform duration-500 group-hover:scale-105" 
                style={{
                  backgroundImage: featuredProject.bg_image || featuredProject.bgImage ? 
                    `url(${featuredProject.bg_image || featuredProject.bgImage})` : 'none',
                  backgroundColor: featuredProject.bg_image || featuredProject.bgImage ? 'transparent' : '#f0f0f0'
                }}
              >
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(26, 58, 95, 0.85)' }}></div>
              </div>
              
              {/* Content */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col items-start justify-center">
                {/* Category Badge */}
                <div className="bg-primary/90 px-3 py-1.5 text-xs uppercase tracking-wider text-white inline-block mb-3 w-fit rounded-sm font-medium">
                  {featuredProject.category}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 leading-tight line-clamp-3">
                  {featuredProject.title}
                </h3>
                
                {/* Read more button */}
                <div className="inline-flex items-center bg-primary/90 text-white px-4 py-2 mt-2 w-fit rounded-sm hover:bg-primary transition-colors">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Side Projects - Right side (spans 3/7 columns) */}
        <div className="lg:col-span-3 grid grid-rows-2 gap-6 h-full">
          {displayedSideProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="h-full">
              <div className="relative rounded-md overflow-hidden h-full group cursor-pointer">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transform transition-transform duration-500 group-hover:scale-105" 
                  style={{
                    backgroundImage: project.bg_image || project.bgImage ? 
                      `url(${project.bg_image || project.bgImage})` : 'none',
                    backgroundColor: project.bg_image || project.bgImage ? 'transparent' : '#f0f0f0'
                  }}
                >
                  <div className="absolute inset-0" style={{ backgroundColor: 'rgba(26, 58, 95, 0.85)' }}></div>
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col items-start justify-center">
                  {/* Category Badge */}
                  <div className="bg-primary/90 px-2 py-1 text-xs uppercase tracking-wider text-white inline-block w-fit rounded-sm font-medium">
                    {project.category}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                    {project.title}
                  </h3>
                  
                  {/* Read more button */}
                  <div className="inline-flex items-center bg-primary/90 text-white px-4 py-2 mt-2 w-fit rounded-sm hover:bg-primary transition-colors">
                    Read more <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}