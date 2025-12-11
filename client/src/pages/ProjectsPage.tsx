import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Filter, Search, Check, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProjects } from '@/context/ProjectsContext';
import CategoryProjects from '@/components/projects/CategoryProjects';
import { stripHtml } from '@/lib/utils';

// Default image if project not found
const defaultImage = 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';

// Utility to parse and format duration strings to 'Mon YYYY – Mon YYYY' and extract end date for sorting
function parseAndFormatDuration(duration: string | null): { formatted: string, endDate: Date | null } {
  if (!duration) return { formatted: '', endDate: null };
  // Try to match patterns like 'Sep 2022 – Dec 2022', 'July – August 2016', '31 March – 5 April 2014', etc.
  // We'll extract the last month/year as the end date
  // We'll also try to format to 'Mon YYYY – Mon YYYY' or 'Mon YYYY' if only one date
  const months = [
    'january','february','march','april','may','june','july','august','september','october','november','december'
  ];
  const monthShort = [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
  ];
  // Normalize dashes
  let d = duration.replace(/–|—|-/g, '–');
  // Split on en dash
  const parts = d.split('–').map(s => s.trim());
  // Helper to parse a date string
  function parseDate(str: string): Date | null {
    // Try to find month and year
    let m = months.findIndex(mon => str.toLowerCase().includes(mon));
    let yearMatch = str.match(/\b(20\d{2}|19\d{2})\b/);
    if (m !== -1 && yearMatch) {
      return new Date(parseInt(yearMatch[0]), m, 1);
    }
    // Try short month
    m = monthShort.findIndex(mon => str.toLowerCase().includes(mon.toLowerCase()));
    if (m !== -1 && yearMatch) {
      return new Date(parseInt(yearMatch[0]), m, 1);
    }
    // Only year
    if (yearMatch) {
      return new Date(parseInt(yearMatch[0]), 0, 1);
    }
    // Try day month year (e.g. 31 March 2014)
    let dayMonthYear = str.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (dayMonthYear) {
      let m2 = months.findIndex(mon => dayMonthYear[2].toLowerCase().startsWith(mon.slice(0,3)));
      if (m2 === -1) m2 = monthShort.findIndex(mon => dayMonthYear[2].toLowerCase().startsWith(mon.toLowerCase()));
      if (m2 !== -1) {
        return new Date(parseInt(dayMonthYear[3]), m2, parseInt(dayMonthYear[1]));
      }
    }
    return null;
  }
  // Helper to format a date as 'Mon YYYY'
  function formatMonYYYY(date: Date | null): string {
    if (!date) return '';
    return `${monthShort[date.getMonth()]} ${date.getFullYear()}`;
  }
  // Parse start and end
  const start = parseDate(parts[0]);
  const end = parts.length > 1 ? parseDate(parts[1]) : start;
  // Format
  let formatted = '';
  if (start && end && (start.getTime() !== end.getTime())) {
    formatted = `${formatMonYYYY(start)} – ${formatMonYYYY(end)}`;
  } else if (start) {
    formatted = formatMonYYYY(start);
  } else {
    formatted = duration; // fallback
  }
  return { formatted, endDate: end };
}

export default function ProjectsPage() {
  // Get projects from context
  const { projects, loading } = useProjects();
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for selected category filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get unique categories from all projects
  const uniqueCategories = Array.from(
    new Set(
      projects.map(project => project.category).filter(Boolean)
    )
  ).sort();

  // Format durations and sort projects by end date (descending) within each category
  const formattedProjects = projects.map(project => {
    const { formatted, endDate } = parseAndFormatDuration(project.duration);
    return { ...project, duration: formatted, _endDate: endDate };
  });

  // Filter projects based on search query and selected category
  const filteredProjects = formattedProjects.filter(project => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stripHtml(project.description).toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.organization.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by selected category
    const matchesCategory = selectedCategory === null || 
      project.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group and sort projects by category
  const groupedProjects = selectedCategory
    ? { [selectedCategory]: filteredProjects.sort((a, b) => (b._endDate?.getTime() || 0) - (a._endDate?.getTime() || 0)) }
    : (uniqueCategories as string[]).reduce<Record<string, typeof filteredProjects>>((acc, category) => {
        const categoryProjects = filteredProjects.filter(p => p.category === category)
          .sort((a, b) => (b._endDate?.getTime() || 0) - (a._endDate?.getTime() || 0));
        if (categoryProjects.length > 0) {
          acc[category] = categoryProjects;
        }
        return acc;
      }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Image Background */}
      <div 
        className="relative w-full bg-primary py-16 sm:py-20 md:py-24 lg:py-32"
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70">
          {/* Playful background elements */}
          <div className="absolute top-20 left-10 w-40 h-40 sm:w-60 sm:h-60 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 sm:w-80 sm:h-80 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-1/4 w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full blur-xl"></div>
        </div>
        
        <div className="w-full px-4 relative mx-auto flex flex-col items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-6xl mx-auto text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Our <span className="text-accent">Impactful</span> Projects
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white mb-6 sm:mb-8">
              Explore our portfolio of successful projects implemented across various areas of expertise
            </p>
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 sm:mt-8 w-full max-w-md mx-auto"
            >
              <div className="flex items-center bg-white rounded-full px-3 sm:px-4 py-2 sm:py-3 shadow-md">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2 sm:mr-3" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="bg-transparent border-none outline-none flex-1 text-gray-800 text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Projects Section with Sidebar */}
      <div id="projects" className="container mx-auto px-4 md:px-8 py-8 sm:py-12">
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
              {/* Categories Sidebar */}
              <div className="w-full lg:w-64 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-3 sm:p-4 bg-primary/5 border-b border-gray-100">
                    <h3 className="font-semibold text-primary text-sm sm:text-base">Categories</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <button 
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-sm sm:text-base ${selectedCategory === null ? 'bg-primary/5 font-medium text-primary' : ''}`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <span>All Categories</span>
                      {selectedCategory === null && <Check className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </button>
                    
                    {uniqueCategories.map((category) => {
                      // Count projects for this category
                      const count = projects.filter(p => p.category === category).length;
                      
                      return (
                        <button 
                          key={category} 
                          className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-sm sm:text-base ${selectedCategory === category ? 'bg-primary/5 font-medium text-primary' : ''}`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="line-clamp-1">{category}</span>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-1.5 sm:px-2 py-0.5 mr-1.5 sm:mr-2">
                                {count}
                              </span>
                              {selectedCategory === category ? (
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Projects Display */}
              <div className="flex-1">
                {Object.keys(groupedProjects).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 sm:h-64 bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <p className="text-gray-500 mb-2 text-sm sm:text-base">No projects found</p>
                    <p className="text-xs sm:text-sm text-gray-400 text-center">Try adjusting your search or filter criteria</p>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-xs sm:text-sm"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  Object.entries(groupedProjects).map(([category, categoryProjects]) => {
                    // Create an ID for anchor links
                    const categoryId = category.replace(/\s+/g, '-').toLowerCase();
                    
                    return (
                      <div key={category} id={categoryId} className="mb-8 sm:mb-12">
                        <CategoryProjects
                          title={category}
                          projects={categoryProjects}
                          limit={0} // No limit on the projects page
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 