import {
  users, contactMessages, expertiseContent, serviceContent,
  clientContent, projectContent, blogArticles, heroSlides, aboutContent,
  type User, type InsertUser,
  type ContactMessage, type InsertContactMessage,
  type ExpertiseContent, type InsertExpertiseContent,
  type ServiceContent, type InsertServiceContent,
  type ClientContent, type InsertClientContent,
  type ProjectContent, type InsertProjectContent,
  type BlogArticle, type InsertBlogArticle,
  type HeroSlide, type InsertHeroSlide,
  type AboutContent, type InsertAboutContent,
  blogArticleServices, InsertBlogArticleService, BlogArticleService,
  blogArticleProjects, InsertBlogArticleProject, BlogArticleProject,
  teamMembersTable, teamMemberServices,
  type TeamMember, type TeamMemberService,
  type InsertTeamMemberService, type InsertTeamMember,
  impactStats, type InsertImpactStat, type ImpactStat,
  footerContent, type InsertFooterContent, type FooterContent,
  locations, type Location, type InsertLocation
} from "@shared/schema";
import { supabase } from "./db";
import bcrypt from "bcrypt";
import slugify from "slugify";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Contact form functionality
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  markContactMessageAsRead(id: number): Promise<ContactMessage | undefined>;

  // Team Member functionality
  createTeamMember(data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'> & { serviceIds?: number[] }): Promise<TeamMember>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  getTeamMemberBySlug(slug: string): Promise<TeamMember | undefined>;
  getAllTeamMembers(): Promise<TeamMember[]>;
  updateTeamMember(id: number, data: Partial<TeamMember> & { serviceIds?: number[] }): Promise<TeamMember>;
  deleteTeamMember(id: number): Promise<boolean>;
  getTeamMemberServices(teamMemberId: number): Promise<ServiceContent[]>;

  // CMS functionality - Expertise Content
  getExpertiseContent(id: number): Promise<ExpertiseContent | undefined>;
  getAllExpertiseContent(): Promise<ExpertiseContent[]>;
  createExpertiseContent(content: InsertExpertiseContent): Promise<ExpertiseContent>;
  updateExpertiseContent(id: number, content: Partial<InsertExpertiseContent>): Promise<ExpertiseContent | undefined>;
  deleteExpertiseContent(id: number): Promise<boolean>;

  // CMS functionality - Service Content
  getServiceContent(id: number): Promise<ServiceContent | undefined>;
  getAllServiceContent(): Promise<ServiceContent[]>;
  createServiceContent(content: InsertServiceContent): Promise<ServiceContent>;
  updateServiceContent(id: number, content: Partial<InsertServiceContent>): Promise<ServiceContent | undefined>;
  deleteServiceContent(id: number): Promise<boolean>;

  // CMS functionality - Client Content
  getClientContent(id: number): Promise<ClientContent | undefined>;
  getAllClientContent(type?: string): Promise<ClientContent[]>;
  createClientContent(content: InsertClientContent): Promise<ClientContent>;
  updateClientContent(id: number, content: Partial<InsertClientContent>): Promise<ClientContent | undefined>;
  deleteClientContent(id: number): Promise<boolean>;

  // CMS functionality - Project Content
  getProjectContent(id: number): Promise<ProjectContent | undefined>;
  getAllProjectContent(): Promise<ProjectContent[]>;
  createProjectContent(content: InsertProjectContent): Promise<ProjectContent>;
  updateProjectContent(id: number, content: Partial<InsertProjectContent>): Promise<ProjectContent | undefined>;
  deleteProjectContent(id: number): Promise<boolean>;

  // CMS functionality - Blog Articles
  getBlogArticle(id: number): Promise<BlogArticle | undefined>;
  getBlogArticleBySlug(slug: string): Promise<BlogArticle | undefined>;
  getAllBlogArticles(publishedOnly?: boolean): Promise<BlogArticle[]>;
  createBlogArticle(article: InsertBlogArticle): Promise<BlogArticle>;
  updateBlogArticle(id: number, article: Partial<InsertBlogArticle>): Promise<BlogArticle | undefined>;
  deleteBlogArticle(id: number): Promise<boolean>;

  // Blog Article Services Relationships
  getBlogArticleServices(blogArticleId: number): Promise<ServiceContent[]>;
  addBlogArticleService(blogArticleId: number, serviceId: number): Promise<BlogArticleService>;
  removeBlogArticleService(blogArticleId: number, serviceId: number): Promise<boolean>;
  updateBlogArticleServices(blogArticleId: number, serviceIds: number[]): Promise<boolean>;

  // Blog Article Projects Relationships
  getBlogArticleProjects(blogArticleId: number): Promise<ProjectContent[]>;
  addBlogArticleProject(blogArticleId: number, projectId: number): Promise<BlogArticleProject>;
  removeBlogArticleProject(blogArticleId: number, projectId: number): Promise<boolean>;
  updateBlogArticleProjects(blogArticleId: number, projectIds: number[]): Promise<boolean>;

  // CMS functionality - Hero Slides
  getHeroSlide(id: number): Promise<HeroSlide | undefined>;
  getAllHeroSlides(): Promise<HeroSlide[]>;
  createHeroSlide(slide: InsertHeroSlide): Promise<HeroSlide>;
  updateHeroSlide(id: number, slide: Partial<InsertHeroSlide>): Promise<HeroSlide | undefined>;
  deleteHeroSlide(id: number): Promise<boolean>;

  // CMS functionality - About Content
  getAboutContent(): Promise<AboutContent | undefined>;
  createAboutContent(content: InsertAboutContent): Promise<AboutContent>;
  updateAboutContent(id: number, content: Partial<InsertAboutContent>): Promise<AboutContent | undefined>;

  // Impact Stats
  getAllImpactStats(): Promise<ImpactStat[]>;
  getImpactStat(id: number): Promise<ImpactStat | undefined>;
  createImpactStat(stat: InsertImpactStat): Promise<ImpactStat>;
  updateImpactStat(id: number, stat: Partial<InsertImpactStat>): Promise<ImpactStat | undefined>;
  deleteImpactStat(id: number): Promise<boolean>;

  // Footer Content
  getFooterContent(): Promise<FooterContent | undefined>;
  createFooterContent(content: InsertFooterContent): Promise<FooterContent>;
  updateFooterContent(id: number, content: Partial<InsertFooterContent>): Promise<FooterContent | undefined>;

  // Location functionality
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(data: InsertLocation): Promise<Location>;
  updateLocation(id: number, data: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return data;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    if (error) return undefined;
    return data;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...insertUser,
        password: hashedPassword
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Contact form functionality
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([message])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async markContactMessageAsRead(id: number): Promise<ContactMessage | undefined> {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Team Member functionality
  async createTeamMember(data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'> & { serviceIds?: number[] }): Promise<TeamMember> {
    const { serviceIds, ...memberData } = data;

    // Insert team member
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        ...memberData,
        slug: slugify(memberData.name, { lower: true, strict: true }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (memberError) throw memberError;

    // If serviceIds provided, create relationships
    if (serviceIds && serviceIds.length > 0) {
      const { error: servicesError } = await supabase
        .from('team_member_services')
        .insert(
          serviceIds.map(serviceId => ({
            team_member_id: member.id,
            service_id: serviceId
          }))
        );

      if (servicesError) throw servicesError;
    }

    return member;
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async getTeamMemberBySlug(slug: string): Promise<TeamMember | undefined> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return undefined;
    return data;
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async updateTeamMember(id: number, data: Partial<TeamMember> & { serviceIds?: number[] }): Promise<TeamMember> {
    const { serviceIds, ...memberData } = data;

    // Update team member
    const { data: updatedMember, error: updateError } = await supabase
      .from('team_members')
      .update({
        ...memberData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // If serviceIds provided, update relationships
    if (serviceIds !== undefined) {
      // Delete existing relationships
      const { error: deleteError } = await supabase
        .from('team_member_services')
        .delete()
        .eq('team_member_id', id);

      if (deleteError) throw deleteError;

      // Add new relationships if any
      if (serviceIds.length > 0) {
        const { error: insertError } = await supabase
          .from('team_member_services')
          .insert(
            serviceIds.map(serviceId => ({
              team_member_id: id,
              service_id: serviceId
            }))
          );

        if (insertError) throw insertError;
      }
    }

    return updatedMember;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    // Junction table entries will be automatically deleted due to ON DELETE CASCADE
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    return !error;
  }

  async getTeamMemberServices(teamMemberId: number): Promise<ServiceContent[]> {
    // First get the service IDs for this team member
    const { data: relations, error: relationsError } = await supabase
      .from('team_member_services')
      .select('service_id')
      .eq('team_member_id', teamMemberId);

    if (relationsError) throw relationsError;
    if (!relations || relations.length === 0) return [];

    // Then get the service content
    const serviceIds = relations.map(r => r.service_id);
    const { data: services, error: servicesError } = await supabase
      .from('service_content')
      .select('*')
      .in('id', serviceIds);

    if (servicesError) throw servicesError;
    return services || [];
  }

  // CMS functionality - Expertise Content
  async getExpertiseContent(id: number): Promise<ExpertiseContent | undefined> {
    const { data, error } = await supabase
      .from('expertise_content')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return data;
  }

  async getAllExpertiseContent(): Promise<ExpertiseContent[]> {
    const { data, error } = await supabase
      .from('expertise_content')
      .select('*')
      .order('order_index');
    if (error) throw error;
    return data || [];
  }

  async createExpertiseContent(content: InsertExpertiseContent): Promise<ExpertiseContent> {
    const { data, error } = await supabase
      .from('expertise_content')
      .insert({
        ...content,
        capabilities: content.capabilities as string[]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExpertiseContent(id: number, content: Partial<InsertExpertiseContent>): Promise<ExpertiseContent | undefined> {
    const { data, error } = await supabase
      .from('expertise_content')
      .update({
        ...content,
        capabilities: content.capabilities ? (content.capabilities as string[]) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteExpertiseContent(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('expertise_content')
      .delete()
      .eq('id', id);

    return !error;
  }

  // CMS functionality - Service Content
  async getServiceContent(id: number): Promise<ServiceContent | undefined> {
    const { data, error } = await supabase
      .from('service_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async getAllServiceContent(): Promise<ServiceContent[]> {
    const { data, error } = await supabase
      .from('service_content')
      .select('*')
      .order('order_index');
    if (error) throw error;
    return data || [];
  }

  async createServiceContent(content: InsertServiceContent): Promise<ServiceContent> {
    const { data, error } = await supabase
      .from('service_content')
      .insert({
        ...content,
        details: content.details as string[]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateServiceContent(id: number, content: Partial<InsertServiceContent>): Promise<ServiceContent | undefined> {
    const { data, error } = await supabase
      .from('service_content')
      .update({
        ...content,
        details: content.details ? (content.details as string[]) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteServiceContent(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('service_content')
      .delete()
      .eq('id', id);

    return !error;
  }

  // CMS functionality - Client Content
  async getClientContent(id: number): Promise<ClientContent | undefined> {
    const { data, error } = await supabase
      .from('client_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async getAllClientContent(type?: string): Promise<ClientContent[]> {
    let query = supabase
      .from('client_content')
      .select('*')
      .order('type')
      .order('order_index');

    if (type) {
      const { data, error } = await supabase
        .from('client_content')
        .select('*')
        .eq('type', type)
        .order('order_index');
      if (error) throw error;
      return data || [];
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createClientContent(content: InsertClientContent): Promise<ClientContent> {
    const { data, error } = await supabase
      .from('client_content')
      .insert(content)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateClientContent(id: number, content: Partial<InsertClientContent>): Promise<ClientContent | undefined> {
    const { data, error } = await supabase
      .from('client_content')
      .update({
        ...content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteClientContent(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('client_content')
      .delete()
      .eq('id', id);

    return !error;
  }

  // CMS functionality - Project Content
  async getProjectContent(id: number): Promise<ProjectContent | undefined> {
    const { data, error } = await supabase
      .from('project_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async getAllProjectContent(): Promise<ProjectContent[]> {
    const { data, error } = await supabase
      .from('project_content')
      .select('*')
      .order('order_index');
    if (error) throw error;
    return data || [];
  }

  async createProjectContent(content: InsertProjectContent): Promise<ProjectContent> {
    const { data, error } = await supabase
      .from('project_content')
      .insert({
        ...content,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProjectContent(id: number, content: Partial<InsertProjectContent>): Promise<ProjectContent | undefined> {
    const { data, error } = await supabase
      .from('project_content')
      .update({
        ...content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteProjectContent(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('project_content')
      .delete()
      .eq('id', id);

    return !error;
  }

  // CMS functionality - Blog Articles
  async getBlogArticle(id: number): Promise<BlogArticle | undefined> {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async getBlogArticleBySlug(slug: string): Promise<BlogArticle | undefined> {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return undefined;
    return data;
  }

  async getAllBlogArticles(publishedOnly: boolean = false): Promise<BlogArticle[]> {
    let query = supabase
      .from('blog_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (publishedOnly) {
      query = query
        .eq('status', 'published')
        .not('published_at', 'is', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createBlogArticle(article: InsertBlogArticle): Promise<BlogArticle> {
    // Set published_at if status is published
    if (article.status === 'published' && !article.published_at) {
      article.published_at = new Date();
    }

    const { data, error } = await supabase
      .from('blog_articles')
      .insert({
        ...article,
        keywords: article.keywords ? (article.keywords as string[]) : []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBlogArticle(id: number, article: Partial<InsertBlogArticle>): Promise<BlogArticle | undefined> {
    // If changing status to published, set published_at if not already set
    if (article.status === 'published') {
      const existingArticle = await this.getBlogArticle(id);
      if (existingArticle && existingArticle.status !== 'published') {
        article.published_at = new Date();
      }
    }

    const { data, error } = await supabase
      .from('blog_articles')
      .update({
        ...article,
        keywords: article.keywords ? (article.keywords as string[]) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteBlogArticle(id: number): Promise<boolean> {
    // Delete associated service and project relationships first
    const { error: servicesError } = await supabase
      .from('blog_article_services')
      .delete()
      .eq('blog_article_id', id);

    if (servicesError) throw servicesError;

    const { error: projectsError } = await supabase
      .from('blog_article_projects')
      .delete()
      .eq('blog_article_id', id);

    if (projectsError) throw projectsError;

    const { error } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Blog Article Services Relationship Methods
  async getBlogArticleServices(blogArticleId: number): Promise<ServiceContent[]> {
    // First get the service IDs for this blog article
    const { data: relations, error: relationsError } = await supabase
      .from('blog_article_services')
      .select('service_id')
      .eq('blog_article_id', blogArticleId);

    if (relationsError) throw relationsError;
    if (!relations || relations.length === 0) return [];

    // Then get the service content
    const serviceIds = relations.map(r => r.service_id);
    const { data: services, error: servicesError } = await supabase
      .from('service_content')
      .select('*')
      .in('id', serviceIds);

    if (servicesError) throw servicesError;
    return services || [];
  }

  async addBlogArticleService(blogArticleId: number, serviceId: number): Promise<BlogArticleService> {
    // Check if relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('blog_article_services')
      .select('*')
      .eq('blog_article_id', blogArticleId)
      .eq('service_id', serviceId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError; // PGRST116 is "not found"
    if (existing) return existing;

    const { data, error } = await supabase
      .from('blog_article_services')
      .insert({
        blog_article_id: blogArticleId,
        service_id: serviceId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeBlogArticleService(blogArticleId: number, serviceId: number): Promise<boolean> {
    const { error } = await supabase
      .from('blog_article_services')
      .delete()
      .eq('blog_article_id', blogArticleId)
      .eq('service_id', serviceId);

    return !error;
  }

  async updateBlogArticleServices(blogArticleId: number, serviceIds: number[]): Promise<boolean> {
    // Delete existing relationships
    const { error: deleteError } = await supabase
      .from('blog_article_services')
      .delete()
      .eq('blog_article_id', blogArticleId);

    if (deleteError) throw deleteError;

    // Add new relationships
    if (serviceIds.length > 0) {
      const { error: insertError } = await supabase
        .from('blog_article_services')
        .insert(
          serviceIds.map(serviceId => ({
            blog_article_id: blogArticleId,
            service_id: serviceId
          }))
        );

      if (insertError) throw insertError;
    }

    return true;
  }

  // Blog Article Projects Relationship Methods
  async getBlogArticleProjects(blogArticleId: number): Promise<ProjectContent[]> {
    // First get the project IDs for this blog article
    const { data: relations, error: relationsError } = await supabase
      .from('blog_article_projects')
      .select('project_id')
      .eq('blog_article_id', blogArticleId);

    if (relationsError) throw relationsError;
    if (!relations || relations.length === 0) return [];

    // Then get the project content
    const projectIds = relations.map(r => r.project_id);
    const { data: projects, error: projectsError } = await supabase
      .from('project_content')
      .select('*')
      .in('id', projectIds);

    if (projectsError) throw projectsError;
    return projects || [];
  }

  async addBlogArticleProject(blogArticleId: number, projectId: number): Promise<BlogArticleProject> {
    // Check if relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('blog_article_projects')
      .select('*')
      .eq('blog_article_id', blogArticleId)
      .eq('project_id', projectId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError; // PGRST116 is "not found"
    if (existing) return existing;

    const { data, error } = await supabase
      .from('blog_article_projects')
      .insert({
        blog_article_id: blogArticleId,
        project_id: projectId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeBlogArticleProject(blogArticleId: number, projectId: number): Promise<boolean> {
    const { error } = await supabase
      .from('blog_article_projects')
      .delete()
      .eq('blog_article_id', blogArticleId)
      .eq('project_id', projectId);

    return !error;
  }

  async updateBlogArticleProjects(blogArticleId: number, projectIds: number[]): Promise<boolean> {
    // Delete existing relationships
    const { error: deleteError } = await supabase
      .from('blog_article_projects')
      .delete()
      .eq('blog_article_id', blogArticleId);

    if (deleteError) throw deleteError;

    // Add new relationships
    if (projectIds.length > 0) {
      const { error: insertError } = await supabase
        .from('blog_article_projects')
        .insert(
          projectIds.map(projectId => ({
            blog_article_id: blogArticleId,
            project_id: projectId
          }))
        );

      if (insertError) throw insertError;
    }

    return true;
  }

  // CMS functionality - Hero Slides
  async getHeroSlide(id: number): Promise<HeroSlide | undefined> {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async getAllHeroSlides(): Promise<HeroSlide[]> {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order_index');
    if (error) throw error;
    return data || [];
  }

  async createHeroSlide(slide: InsertHeroSlide): Promise<HeroSlide> {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([{
        ...slide,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateHeroSlide(id: number, slide: Partial<InsertHeroSlide>): Promise<HeroSlide | undefined> {
    const { data, error } = await supabase
      .from('hero_slides')
      .update({
        ...slide,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteHeroSlide(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // CMS functionality - About Content
  async getAboutContent(): Promise<AboutContent | undefined> {
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .limit(1)
      .single();

    if (error) return undefined;
    return data;
  }

  async createAboutContent(content: InsertAboutContent): Promise<AboutContent> {
    const { data, error } = await supabase
      .from('about_content')
      .insert(content as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAboutContent(id: number, content: Partial<InsertAboutContent>): Promise<AboutContent | undefined> {
    const { data, error } = await supabase
      .from('about_content')
      .update({
        ...content,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  // Impact Stats Methods
  async getAllImpactStats(): Promise<ImpactStat[]> {
    const { data, error } = await supabase
      .from('impact_stats')
      .select('*')
      .order('order_index');

    if (error) throw error;
    return data || [];
  }

  async getImpactStat(id: number): Promise<ImpactStat | undefined> {
    const { data, error } = await supabase
      .from('impact_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async createImpactStat(stat: InsertImpactStat): Promise<ImpactStat> {
    const { data, error } = await supabase
      .from('impact_stats')
      .insert(stat)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateImpactStat(id: number, stat: Partial<InsertImpactStat>): Promise<ImpactStat | undefined> {
    const { data, error } = await supabase
      .from('impact_stats')
      .update(stat)
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteImpactStat(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('impact_stats')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Footer Content methods
  async getFooterContent(): Promise<FooterContent | undefined> {
    const { data, error } = await supabase
      .from('footer_content')
      .select('*')
      .limit(1)
      .single();

    if (error) return undefined;
    return data;
  }

  async createFooterContent(content: InsertFooterContent): Promise<FooterContent> {
    const { data, error } = await supabase
      .from('footer_content')
      .insert(content as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateFooterContent(id: number, content: Partial<InsertFooterContent>): Promise<FooterContent | undefined> {
    try {
      const { data, error } = await supabase
        .from('footer_content')
        .update({
          ...content,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) return undefined;
      return data;
    } catch (error) {
      console.error('Error updating footer content:', error);
      return undefined;
    }
  }

  // Location functionality
  async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('city');
    if (error) throw error;
    return data || [];
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return data;
  }

  async createLocation(data: InsertLocation): Promise<Location> {
    const { data: location, error } = await supabase
      .from('locations')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return location;
  }

  async updateLocation(id: number, data: Partial<InsertLocation>): Promise<Location | undefined> {
    const { data: location, error } = await supabase
      .from('locations')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) return undefined;
    return location;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    return !error;
  }
}

export const storage = new DatabaseStorage();
