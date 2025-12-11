import { z } from "zod";

export interface ServiceItem {
  id: string | number;
  title: string;
  description: string;
  details: string[];
  icon?: string;
  image: string;
  category?: string;
}

export interface ExpertiseArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  capabilities: string[];
}

export interface Testimonial {
  id: string;
  text: string;
  author: string;
  position: string;
  company: string;
  avatar: string;
  rating: number;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  url: string;
  slug?: string; // SEO-friendly URL slug
  author?: {
    name: string;
    position: string;
    avatar: string;
  };
  content?: string;
  metaDescription?: string; // SEO meta description
  keywords?: string[]; // SEO keywords
}

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  logo: string | any; // Allows for imported assets
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  location: string;
  bio: string;
  expertise: string[];
  education: string;
  achievements: string[];
  quote: string;
  image: string;
  slug?: string; // SEO-friendly URL slug
  metaDescription?: string; // SEO meta description
  contact: {
    email: string;
    linkedin: string;
  }
}

export type NewsCategory = 'All' | 'Industry Insights' | 'Case Studies' | 'Company News' | 'Careers' | string;
export type TeamFilter = 'All' | 'Leadership' | string; // department names
