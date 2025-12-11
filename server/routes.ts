import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertContactMessageSchema,
  insertExpertiseContentSchema,
  insertServiceContentSchema,
  insertClientContentSchema,
  insertProjectContentSchema,
  insertBlogArticleSchema,
  insertHeroSlideSchema,
  insertAboutContentSchema,
  insertFooterContentSchema
} from "../shared/schema";
import jwt from 'jsonwebtoken';
import { compare } from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import slugify from 'slugify';
import asyncHandler from 'express-async-handler';
import { ParamsDictionary } from 'express-serve-static-core';
import { Query } from 'express-serve-static-core';
import { z } from 'zod';
import fs from 'fs';
import { uploadFileToSupabase, BUCKETS, ensureBucketsExist } from './supabase-storage';
import { sendEmail, formatContactEmail } from './services/email';

// Add type declarations for jsonwebtoken and multer
declare module 'jsonwebtoken';
declare module 'multer';

// Extend Request type to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Define type for our route handlers that properly extends Express's RequestHandler
type AsyncHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query
> = RequestHandler<P, ResBody, ReqBody, ReqQuery>;

type AsyncMulterHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query
> = RequestHandler<P, ResBody, ReqBody & MulterRequest, ReqQuery>;

type AsyncRequestHandler = RequestHandler<ParamsDictionary, any, any, Query>;

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// JWT authentication middleware
const jwtAuthenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Missing or invalid token" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }
};

// Set up multer for image uploads
const serviceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Set up multer for blog article images
const blogUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Set up multer for team member images
const teamMemberUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Set up multer for hero slide image uploads
const heroSlideUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Set up multer for about content image uploads
const aboutUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Set up multer for project image uploads
const projectUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Set up multer for client logo uploads
const clientUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Set up multer for location image uploads
const locationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Team Member Route Handlers
const getTeamMembers: AsyncHandler = async (req, res, next) => {
  try {
    const members = await storage.getAllTeamMembers();
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

const getTeamMemberBySlug: AsyncHandler = async (req, res, next) => {
  try {
    const member = await storage.getTeamMemberBySlug(req.params.slug);

    if (!member) {
      res.status(404).json({
        success: false,
        message: "Team member not found"
      });
      return;
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};

const getTeamMemberServices: AsyncHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const services = await storage.getTeamMemberServices(id);

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

const createTeamMember: AsyncMulterHandler = async (req, res, next) => {
  try {
    console.log("Create team member request body:", req.body);

    // Parse expertise and serviceIds properly
    let expertise = [];
    try {
      expertise = req.body.expertise ? JSON.parse(req.body.expertise) : [];
    } catch (e) {
      console.error("Error parsing expertise:", e);
      expertise = req.body.expertise ? req.body.expertise.split("\n").filter(Boolean) : [];
    }

    let serviceIds = [];
    try {
      serviceIds = req.body.serviceIds ? JSON.parse(req.body.serviceIds) : [];
    } catch (e) {
      console.error("Error parsing serviceIds:", e);
      serviceIds = [];
    }

    let image = req.body.image;
    if (req.file) {
      const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.TEAM);
      if (uploadResult) {
        image = uploadResult.url;
      }
    }

    const data = {
      ...req.body,
      expertise: expertise,
      serviceIds: serviceIds,
      image,
      slug: slugify(req.body.name, { lower: true, strict: true })
    };

    console.log("Processing team member data:", data);
    const member = await storage.createTeamMember(data);

    // Get associated services for response
    const services = await storage.getTeamMemberServices(member.id);

    res.status(201).json({
      success: true,
      data: {
        ...member,
        services
      }
    });
  } catch (error) {
    console.error("Error creating team member:", error);
    next(error);
  }
};

const updateTeamMember: AsyncMulterHandler = async (req, res, next) => {
  try {
    console.log("Update team member request body:", req.body);

    const id = parseInt(req.params.id);

    // Parse expertise and serviceIds properly
    let expertise;
    if (req.body.expertise) {
      try {
        expertise = JSON.parse(req.body.expertise);
      } catch (e) {
        console.error("Error parsing expertise:", e);
        expertise = req.body.expertise.split("\n").filter(Boolean);
      }
    }

    let serviceIds;
    if (req.body.serviceIds) {
      try {
        serviceIds = JSON.parse(req.body.serviceIds);
      } catch (e) {
        console.error("Error parsing serviceIds:", e);
        serviceIds = [];
      }
    }

    let image = req.body.image;
    if (req.file) {
      const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.TEAM);
      if (uploadResult) {
        image = uploadResult.url;
      }
    }

    const data = {
      ...req.body,
      expertise: expertise,
      serviceIds: serviceIds,
      image,
      slug: req.body.name ? slugify(req.body.name, { lower: true, strict: true }) : undefined
    };

    console.log("Processing team member update data:", data);
    const member = await storage.updateTeamMember(id, data);

    if (!member) {
      res.status(404).json({
        success: false,
        message: "Team member not found"
      });
      return;
    }

    // Get associated services for response
    const services = await storage.getTeamMemberServices(member.id);

    res.json({
      success: true,
      data: {
        ...member,
        services
      }
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    next(error);
  }
};

const deleteTeamMember: AsyncHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteTeamMember(id);

    if (!success) {
      res.status(404).json({
        success: false,
        message: "Team member not found"
      });
      return;
    }

    res.json({
      success: true,
      message: "Team member deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Client Route Handlers
const getAllClients: AsyncHandler = async (req, res, next) => {
  try {
    const { type } = req.query;
    const clients = await storage.getAllClientContent(type as string);
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    next(error);
  }
};

const getClient: AsyncHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const client = await storage.getClientContent(id);

    if (!client) {
      res.status(404).json({
        success: false,
        message: "Client not found"
      });
      return;
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

const createClient: AsyncMulterHandler = async (req, res, next) => {
  try {
    console.log("Create client request body:", req.body);

    let logo = req.body.logo;
    if (req.file) {
      const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.CLIENTS);
      if (uploadResult) {
        logo = uploadResult.url;
      }
    }

    const data = {
      ...req.body,
      logo,
      order_index: req.body.order_index ? parseInt(req.body.order_index) : 0
    };

    console.log("Processing client data:", data);
    const client = await storage.createClientContent(data);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error("Error creating client:", error);
    next(error);
  }
};

const updateClient: AsyncMulterHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Handle logo based on clearImage flag or new file upload
    let logoValue;
    if (req.body.clearImage === 'true') {
      // User wants to clear the image
      logoValue = null;
    } else if (req.file) {
      // New file uploaded
      const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.CLIENTS);
      if (uploadResult) {
        logoValue = uploadResult.url;
      } else {
        logoValue = req.body.logo;
      }
    } else {
      // Keep existing logo
      logoValue = req.body.logo;
    }

    const data = {
      ...req.body,
      logo: logoValue,
      order_index: req.body.order_index ? parseInt(req.body.order_index) : undefined
    };

    const client = await storage.updateClientContent(id, data);

    if (!client) {
      res.status(404).json({
        success: false,
        message: "Client not found"
      });
      return;
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error("Error updating client:", error);
    next(error);
  }
};

const deleteClient: AsyncHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteClientContent(id);

    if (!success) {
      res.status(404).json({
        success: false,
        message: "Client not found"
      });
      return;
    }

    res.json({
      success: true,
      message: "Client deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Content retrieval endpoints (public)
const getExpertiseContent: AsyncHandler = async (req, res, next) => {
  try {
    const content = await storage.getAllExpertiseContent();

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expertise content",
      error
    });
  }
};

const getServiceContent: AsyncHandler = async (req, res, next) => {
  try {
    const services = await storage.getAllServiceContent();

    // Format the response
    const formattedServices = services.map(service => ({
      ...service,
      id: String(service.id), // Convert ID to string
      details: Array.isArray(service.details)
        ? service.details.map(detail =>
          typeof detail === 'string'
            ? detail.replace(/^'|'$/g, '').replace(/,$/g, '').trim()
            : detail
        )
        : [],
      image: service.image || '/placeholder.jpg'
    }));

    res.json({
      success: true,
      data: formattedServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error
    });
  }
};

const getClientContent: AsyncHandler = async (req, res, next) => {
  try {
    const { type } = req.query;
    const content = await storage.getAllClientContent(type as string);

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client content",
      error
    });
  }
};

const getProjectContent: AsyncHandler = async (req, res, next) => {
  try {
    const content = await storage.getAllProjectContent();

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch project content",
      error
    });
  }
};

// Hero Slides Route Handlers
const getHeroSlides: AsyncHandler = async (req, res, next) => {
  try {
    const slides = await storage.getAllHeroSlides();
    res.json({
      success: true,
      data: slides
    });
  } catch (error) {
    next(error);
  }
};

const getHeroSlide: AsyncHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const slide = await storage.getHeroSlide(id);

    if (!slide) {
      res.status(404).json({
        success: false,
        message: "Hero slide not found"
      });
      return;
    }

    res.json({
      success: true,
      data: slide
    });
  } catch (error) {
    next(error);
  }
};

const createHeroSlide: AsyncMulterHandler = async (req, res, next) => {
  try {
    // Convert order_index to number if it exists
    const processedBody = {
      ...req.body,
      order_index: req.body.order_index ? parseInt(req.body.order_index) : undefined
    };

    // Process file uploads if they exist
    if (req.files && typeof req.files === 'object') {
      if ('backgroundImage' in req.files && req.files['backgroundImage'].length > 0) {
        const uploadResult = await uploadFileToSupabase(req.files['backgroundImage'][0], BUCKETS.HERO);
        if (uploadResult) {
          processedBody.backgroundImage = uploadResult.url;
        }
      }

      if ('videoBackground' in req.files && req.files['videoBackground'].length > 0) {
        const uploadResult = await uploadFileToSupabase(req.files['videoBackground'][0], BUCKETS.HERO);
        if (uploadResult) {
          processedBody.videoBackground = uploadResult.url;
        }
      }
    }

    // Validate input data
    const validatedData = insertHeroSlideSchema.parse(processedBody);

    // Create a new hero slide
    const slide = await storage.createHeroSlide(validatedData);

    res.status(201).json({
      success: true,
      data: slide
    });
  } catch (error) {
    next(error);
  }
};

const updateHeroSlide: AsyncMulterHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Process data - only include fields that are provided and not empty
    const data: any = {};

    // Handle text fields - allow empty strings for optional fields
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.subtitle !== undefined) data.subtitle = req.body.subtitle;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.actionText !== undefined) data.action_text = req.body.actionText;
    if (req.body.actionLink !== undefined) data.action_link = req.body.actionLink;
    if (req.body.backgroundImage !== undefined) data.background_image = req.body.backgroundImage;
    if (req.body.category !== undefined) data.category = req.body.category;
    if (req.body.videoBackground !== undefined) data.video_background = req.body.videoBackground;
    if (req.body.accentColor !== undefined) data.accent_color = req.body.accentColor;
    if (req.body.order_index !== undefined && req.body.order_index !== '') data.order_index = parseInt(req.body.order_index);
    if (req.body.updated_by !== undefined && req.body.updated_by !== '') data.updated_by = parseInt(req.body.updated_by);

    // Process file uploads if they exist
    if (req.files && typeof req.files === 'object') {
      if ('backgroundImage' in req.files && req.files['backgroundImage'].length > 0) {
        const uploadResult = await uploadFileToSupabase(req.files['backgroundImage'][0], BUCKETS.HERO);
        if (uploadResult) {
          data.background_image = uploadResult.url;
        }
      }

      if ('videoBackground' in req.files && req.files['videoBackground'].length > 0) {
        const uploadResult = await uploadFileToSupabase(req.files['videoBackground'][0], BUCKETS.HERO);
        if (uploadResult) {
          data.video_background = uploadResult.url;
        }
      }
    }

    // Update the hero slide
    const slide = await storage.updateHeroSlide(id, data);

    if (!slide) {
      res.status(404).json({
        success: false,
        message: "Hero slide not found"
      });
      return;
    }

    res.json({
      success: true,
      data: slide
    });
  } catch (error) {
    next(error);
  }
};

const deleteHeroSlide: AsyncHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteHeroSlide(id);

    if (!success) {
      res.status(404).json({
        success: false,
        message: "Hero slide not found"
      });
      return;
    }

    res.json({
      success: true,
      message: "Hero slide deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// About Content Route Handlers
const getAboutContent: AsyncHandler = async (req, res, next) => {
  try {
    const content = await storage.getAboutContent();
    res.json({
      success: true,
      data: content || {}
    });
  } catch (error) {
    next(error);
  }
};

const createOrUpdateAboutContent: AsyncMulterHandler = async (req, res, next) => {
  try {
    const body = req.body;
    let features = [];
    let coreValues = [];

    // Parse features array from the JSON string (if provided)
    if (body.features && typeof body.features === 'string') {
      try {
        features = JSON.parse(body.features);
      } catch (err) {
        res.status(400).json({
          success: false,
          message: 'Invalid features format'
        });
        return;
      }
    }

    // Parse core_values array from the JSON string
    if (body.core_values && typeof body.core_values === 'string') {
      try {
        coreValues = JSON.parse(body.core_values);
      } catch (err) {
        res.status(400).json({
          success: false,
          message: 'Invalid core_values format'
        });
        return;
      }
    }

    // Get user ID from JWT token
    const userId = (req as any).user?.id;

    // Prepare the content data
    const contentData: any = {
      title: body.title,
      subtitle: body.subtitle || null,
      description: body.description,
      features,
      vision: body.vision || null,
      mission: body.mission || null,
      core_values: coreValues,
      client_retention_rate: body.client_retention_rate ? parseInt(body.client_retention_rate, 10) : null,
      updated_by: userId
    };

    // Handle image upload
    if (req.file) {
      const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.ABOUT);
      if (uploadResult) {
        contentData.image = uploadResult.url;
      }
    }

    // Check if content already exists
    const existingContent = await storage.getAboutContent();

    let result;
    if (existingContent) {
      // Update existing content
      result = await storage.updateAboutContent(existingContent.id, contentData);
    } else {
      // Create new content
      result = await storage.createAboutContent(contentData as any);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Article Route Handlers
const getArticles: AsyncHandler = async (req, res, next) => {
  try {
    const publishedOnly = req.query.publishedOnly === 'true';
    const articles = await storage.getAllBlogArticles(publishedOnly);
    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

const getArticleById: AsyncHandler = async (req, res, next) => {
  try {
    const article = await storage.getBlogArticle(Number(req.params.id));

    if (!article) {
      res.status(404).json({
        success: false,
        message: "Article not found"
      });
      return;
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

const getArticleBySlug: AsyncHandler = async (req, res, next) => {
  try {
    const article = await storage.getBlogArticleBySlug(req.params.slug);

    if (!article) {
      res.status(404).json({
        success: false,
        message: "Article not found"
      });
      return;
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

const createArticle: AsyncMulterHandler = async (req, res, next) => {
  try {
    const parsedBody = JSON.parse(req.body.data);

    // Validate required fields
    if (!parsedBody.title || typeof parsedBody.title !== 'string' || parsedBody.title.trim() === '') {
      res.status(400).json({
        success: false,
        message: "Title is required and must be a valid string"
      });
      return next();
    }

    // Generate slug if not provided
    if (!parsedBody.slug) {
      try {
        parsedBody.slug = slugify(parsedBody.title.trim(), { lower: true, strict: true });
        if (!parsedBody.slug) {
          // If slugify returns empty, generate a fallback slug
          parsedBody.slug = `article-${Date.now()}`;
        }
      } catch (error) {
        console.error("Error generating slug:", error);
        // Fallback slug generation
        parsedBody.slug = `article-${Date.now()}`;
      }
    }

    // Handle image upload
    if (req.file) {
      const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.BLOG);
      if (uploadResult) {
        parsedBody.image = uploadResult.url;
      }
    }

    // Set user ID from authenticated user
    const userId = (req as any).user.id;
    parsedBody.updated_by = userId;

    // Validate publish status and date
    if (parsedBody.status === 'published' && !parsedBody.published_at) {
      parsedBody.published_at = new Date();
    }

    const article = await storage.createBlogArticle(parsedBody);

    // Handle related services if provided
    if (parsedBody.serviceIds && parsedBody.serviceIds.length > 0) {
      await storage.updateBlogArticleServices(article.id, parsedBody.serviceIds);
    }

    // Handle related projects if provided
    if (parsedBody.projectIds && parsedBody.projectIds.length > 0) {
      await storage.updateBlogArticleProjects(article.id, parsedBody.projectIds);
    }

    res.status(201).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error("Error creating blog article:", error);
    next(error);
  }
};

const updateArticle: AsyncMulterHandler = async (req, res, next) => {
  try {
    const articleId = Number(req.params.id);
    const parsedBody = JSON.parse(req.body.data);

    // Validate title
    if (!parsedBody.title || typeof parsedBody.title !== 'string' || parsedBody.title.trim() === '') {
      res.status(400).json({
        success: false,
        message: "Title is required and must be a valid string"
      });
      return next();
    }

    // Handle image upload
    if (req.file) {
      const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.BLOG);
      if (uploadResult) {
        parsedBody.image = uploadResult.url;
      }
    }

    // Set user ID from authenticated user
    const userId = (req as any).user.id;
    parsedBody.updated_by = userId;

    // Update published_at if status changes to published
    if (parsedBody.status === 'published') {
      const currentArticle = await storage.getBlogArticle(articleId);
      if (currentArticle && currentArticle.status !== 'published') {
        parsedBody.published_at = new Date();
      }
    }

    // Update slug if title changed
    if (parsedBody.title) {
      try {
        parsedBody.slug = slugify(parsedBody.title.trim(), { lower: true, strict: true });
        if (!parsedBody.slug) {
          // If slugify returns empty, generate a fallback slug
          parsedBody.slug = `article-${Date.now()}`;
        }
      } catch (error) {
        console.error("Error generating slug:", error);
        // Fallback slug generation
        parsedBody.slug = `article-${Date.now()}`;
      }
    }

    const article = await storage.updateBlogArticle(articleId, parsedBody);

    if (!article) {
      res.status(404).json({
        success: false,
        message: "Article not found"
      });
      return;
    }

    // Handle related services if provided
    if (parsedBody.serviceIds) {
      await storage.updateBlogArticleServices(articleId, parsedBody.serviceIds);
    }

    // Handle related projects if provided
    if (parsedBody.projectIds) {
      await storage.updateBlogArticleProjects(articleId, parsedBody.projectIds);
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error("Error updating blog article:", error);
    next(error);
  }
};

const deleteArticle: AsyncHandler = async (req, res, next) => {
  try {
    const success = await storage.deleteBlogArticle(Number(req.params.id));

    if (!success) {
      res.status(404).json({
        success: false,
        message: "Article not found"
      });
      return;
    }

    res.json({
      success: true,
      message: "Article deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

const getArticleServices: AsyncHandler = async (req, res, next) => {
  try {
    const services = await storage.getBlogArticleServices(Number(req.params.id));
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

const getArticleProjects: AsyncHandler = async (req, res, next) => {
  try {
    const projects = await storage.getBlogArticleProjects(Number(req.params.id));
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// Impact Stats Route Handlers
const getImpactStats: AsyncHandler = async (req, res, next) => {
  try {
    const stats = await storage.getAllImpactStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getImpactStat: AsyncHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stat = await storage.getImpactStat(parseInt(id));

    if (!stat) {
      res.status(404).json({
        success: false,
        message: "Impact stat not found"
      });
      return next();
    }

    res.json({
      success: true,
      data: stat
    });
  } catch (error) {
    next(error);
  }
};

const createImpactStat: AsyncHandler = async (req, res, next) => {
  try {
    const { value, suffix, label, color, order_index, updated_by } = req.body;
    const statData = {
      value: parseInt(value),
      suffix,
      label,
      color,
      order_index: order_index ? parseInt(order_index) : undefined,
      updated_by: updated_by ? parseInt(updated_by) : undefined
    };

    const result = await storage.createImpactStat(statData);

    res.status(201).json({
      success: true,
      message: "Impact stat created successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateImpactStat: AsyncHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, suffix, label, color, order_index, updated_by } = req.body;

    const statData: any = {};
    if (value !== undefined) statData.value = parseInt(value);
    if (suffix !== undefined) statData.suffix = suffix;
    if (label !== undefined) statData.label = label;
    if (color !== undefined) statData.color = color;
    if (order_index !== undefined) statData.order_index = parseInt(order_index);
    if (updated_by !== undefined) statData.updated_by = parseInt(updated_by);

    const result = await storage.updateImpactStat(parseInt(id), statData);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Impact stat not found"
      });
      return next();
    }

    res.json({
      success: true,
      message: "Impact stat updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const deleteImpactStat: AsyncHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await storage.deleteImpactStat(parseInt(id));

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Impact stat not found"
      });
      return next();
    }

    res.json({
      success: true,
      message: "Impact stat deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Footer Content Routes
const getFooterContent = asyncHandler(async (req, res, next) => {
  try {
    const footerContent = await storage.getFooterContent();

    if (!footerContent) {
      res.status(404).json({
        success: false,
        message: "Footer content not found"
      });
      return;
    }

    res.json({
      success: true,
      data: footerContent
    });
  } catch (error) {
    console.error("Error fetching footer content:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching footer content"
    });
  }
});

const updateFooterContent: AsyncHandler = async (req, res, next) => {
  try {
    const validatedData = insertFooterContentSchema.parse({
      ...req.body,
      updated_by: (req as any).user?.id
    });

    const existingFooter = await storage.getFooterContent();
    let result;

    if (existingFooter) {
      result = await storage.updateFooterContent(existingFooter.id, validatedData);
    } else {
      result = await storage.createFooterContent(validatedData);
    }

    res.json({
      success: true,
      data: result
    });
    return next();
  } catch (error) {
    console.error("Error updating footer content:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid data provided",
        errors: error.errors
      });
      return next();
    }

    res.status(500).json({
      success: false,
      message: "An error occurred while updating footer content"
    });
    return next();
  }
};

// Location handlers
const getLocations: AsyncHandler = async (req, res, next) => {
  try {
    const locations = await storage.getLocations();
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations"
    });
  }
};

const getLocation: AsyncHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await storage.getLocation(parseInt(id));

    if (!location) {
      res.status(404).json({
        success: false,
        message: "Location not found"
      });
      return next();
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch location"
    });
  }
};

const createLocation: AsyncMulterHandler = async (req, res, next) => {
  try {
    const { city, country, address } = req.body;

    // Validate required fields
    if (!city || !country) {
      res.status(400).json({
        success: false,
        message: "City and country are required"
      });
      return next();
    }

    let image = null;
    if (req.file) {
      const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.LOCATIONS);
      if (uploadResult) {
        image = uploadResult.url;
      }
    }

    const locationData = {
      city,
      country,
      address: address || null,
      image,
      updated_by: (req as any).user?.id
    };

    const result = await storage.createLocation(locationData);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create location",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

const updateLocation: AsyncMulterHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city, country, address } = req.body;

    // Validate required fields if provided
    if ((city !== undefined && !city) || (country !== undefined && !country)) {
      res.status(400).json({
        success: false,
        message: "City and country must not be empty if provided"
      });
      return next();
    }

    let image = undefined;
    if (req.file) {
      const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.LOCATIONS);
      if (uploadResult) {
        image = uploadResult.url;
      }
    }

    const locationData = {
      ...(city !== undefined && { city }),
      ...(country !== undefined && { country }),
      ...(address !== undefined && { address }),
      ...(image !== undefined && { image }),
      updated_by: (req as any).user?.id
    };

    const result = await storage.updateLocation(parseInt(id), locationData);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Location not found"
      });
      return next();
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

const deleteLocation: AsyncHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await storage.deleteLocation(parseInt(id));

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Location not found"
      });
      return next();
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete location"
    });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api

  // *** Public Routes ***

  // Team Member Routes (Public)
  app.get("/api/team", getTeamMembers);
  app.get("/api/team/:slug", getTeamMemberBySlug);
  app.get("/api/team/:id/services", getTeamMemberServices);
  app.post("/api/admin/team", jwtAuthenticate, teamMemberUpload.single('image'), createTeamMember);
  app.put("/api/admin/team/:id", jwtAuthenticate, teamMemberUpload.single('image'), updateTeamMember);
  app.delete("/api/admin/team/:id", jwtAuthenticate, deleteTeamMember);

  // Client Routes (Admin)
  app.get("/api/admin/clients", jwtAuthenticate, getAllClients);
  app.get("/api/admin/clients/:id", jwtAuthenticate, getClient);
  app.post("/api/admin/clients", jwtAuthenticate, clientUpload.single('logo'), createClient);
  app.put("/api/admin/clients/:id", jwtAuthenticate, clientUpload.single('logo'), updateClient);
  app.delete("/api/admin/clients/:id", jwtAuthenticate, deleteClient);

  // Content retrieval endpoints (public)
  app.get("/api/content/expertise", getExpertiseContent);
  app.get("/api/content/services", getServiceContent);
  app.get("/api/content/clients", getClientContent);
  app.get("/api/content/projects", getProjectContent);

  // Handle contact form submission
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate input using zod schema
      const contactData = insertContactMessageSchema.parse(req.body);

      // Store contact message
      const result = await storage.createContactMessage(contactData);

      // Format and send email notification
      const { text, html } = formatContactEmail({
        ...contactData,
        company: contactData.company || undefined
      });
      const emailSent = await sendEmail({
        to: 'info@pactorg.com',
        subject: `New Contact Form Submission: ${contactData.subject}`,
        text,
        html
      });

      // Return success response
      res.status(201).json({
        success: true,
        message: "Contact message received successfully",
        data: result,
        emailSent
      });
    } catch (error) {
      // Handle validation errors or other errors
      res.status(400).json({
        success: false,
        message: "Invalid contact form data",
        error: error
      });
    }
    return;
  });

  // *** Admin Routes ***

  // Get all contact messages (admin only)
  app.get("/api/admin/contact", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getContactMessages();
      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch contact messages",
        error
      });
    }
  });

  // Mark contact message as read
  app.patch("/api/admin/contact/:id/read", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await storage.markContactMessageAsRead(parseInt(id));

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Contact message not found"
        });
        return;
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to mark contact message as read",
        error
      });
    }
  });

  // CMS routes - Expertise Content Management
  app.post("/api/admin/content/expertise", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const contentData = insertExpertiseContentSchema.parse(req.body);
      const result = await storage.createExpertiseContent(contentData);

      res.status(201).json({
        success: true,
        message: "Expertise content created successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid expertise content data",
        error
      });
    }
  });

  app.patch("/api/admin/content/expertise/:id", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const contentData = req.body;
      const result = await storage.updateExpertiseContent(parseInt(id), contentData);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Expertise content not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Expertise content updated successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid expertise content data",
        error
      });
    }
  });

  app.delete("/api/admin/content/expertise/:id", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteExpertiseContent(parseInt(id));

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Expertise content not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Expertise content deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete expertise content",
        error
      });
    }
  });

  // CMS routes - Service Content Management
  app.post("/api/admin/content/service", jwtAuthenticate, serviceUpload.single('image'), async (req: MulterRequest, res: Response) => {
    try {
      const { title, description, details, order_index, updated_by } = req.body;
      let image = req.body.image;
      if (req.file) {
        const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.SERVICES);
        if (uploadResult) {
          image = uploadResult.url;
        }
      }

      // Parse and clean the details array
      let parsedDetails = [];
      try {
        parsedDetails = JSON.parse(details);
        if (Array.isArray(parsedDetails)) {
          parsedDetails = parsedDetails.map(detail =>
            typeof detail === 'string'
              ? detail.replace(/^'|'$/g, '').replace(/,$/g, '').trim()
              : detail
          );
        }
      } catch (e) {
        console.error('Error parsing details:', e);
        parsedDetails = [];
      }

      const contentData = {
        title,
        description,
        details: parsedDetails,
        image,
        order_index: Number(order_index),
        updated_by: updated_by ? Number(updated_by) : undefined
      };

      const result = await storage.createServiceContent(contentData);
      res.status(201).json({
        success: true,
        message: "Service content created successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid service content data",
        error
      });
    }
  });

  app.patch("/api/admin/content/service/:id", jwtAuthenticate, serviceUpload.single('image'), async (req: MulterRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, details, category, order_index, updated_by } = req.body;
      let image = req.body.image;
      if (req.file) {
        const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.SERVICES);
        if (uploadResult) {
          image = uploadResult.url;
        }
      }

      // Parse and clean the details array
      let parsedDetails = [];
      try {
        parsedDetails = JSON.parse(details);
        if (Array.isArray(parsedDetails)) {
          parsedDetails = parsedDetails.map(detail =>
            typeof detail === 'string'
              ? detail.replace(/^'|'$/g, '').replace(/,$/g, '').trim()
              : detail
          );
        }
      } catch (e) {
        console.error('Error parsing details:', e);
        parsedDetails = [];
      }

      const contentData = {
        title,
        description,
        details: parsedDetails,
        category,
        image,
        order_index: Number(order_index),
        updated_by: updated_by ? Number(updated_by) : undefined
      };

      const result = await storage.updateServiceContent(parseInt(id), contentData);
      if (!result) {
        res.status(404).json({
          success: false,
          message: "Service content not found"
        });
        return;
      }
      res.json({
        success: true,
        message: "Service content updated successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid service content data",
        error
      });
    }
  });

  app.delete("/api/admin/content/service/:id", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteServiceContent(parseInt(id));

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Service content not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Service content deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete service content",
        error
      });
    }
  });

  // CMS routes - Client Content Management
  app.post("/api/admin/content/client", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const contentData = insertClientContentSchema.parse(req.body);
      const result = await storage.createClientContent(contentData);

      res.status(201).json({
        success: true,
        message: "Client content created successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid client content data",
        error
      });
    }
  });

  app.patch("/api/admin/content/client/:id", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const contentData = req.body;
      const result = await storage.updateClientContent(parseInt(id), contentData);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Client content not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Client content updated successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid client content data",
        error
      });
    }
  });

  app.delete("/api/admin/content/client/:id", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteClientContent(parseInt(id));

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Client content not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Client content deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete client content",
        error
      });
    }
  });

  // CMS routes - Project Content Management
  app.get("/api/admin/content/project", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const content = await storage.getAllProjectContent();
      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch project content",
        error
      });
    }
  });

  app.get("/api/admin/content/project/:id", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const content = await storage.getProjectContent(parseInt(id));

      if (!content) {
        res.status(404).json({
          success: false,
          message: "Project content not found"
        });
        return;
      }

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch project content",
        error
      });
    }
  });

  app.post("/api/admin/content/project", jwtAuthenticate, projectUpload.single('bg_image_file'), async (req: MulterRequest, res: Response) => {
    try {
      const { title, description, organization, category, icon, duration, location, services, order_index } = req.body;
      let bg_image = req.body.bg_image;

      // Handle file upload if present
      if (req.file) {
        const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.PROJECTS);
        if (uploadResult) {
          bg_image = uploadResult.url;
        }
      }

      // Parse services array if it exists
      let parsedServices = [];
      if (services) {
        try {
          parsedServices = JSON.parse(services);
        } catch (e) {
          console.error('Error parsing services:', e);
        }
      }

      const projectData = {
        title,
        description,
        organization,
        category,
        bg_image,
        icon,
        duration,
        location,
        services: parsedServices,
        order_index: order_index ? Number(order_index) : undefined
      };

      const result = await storage.createProjectContent(projectData);

      res.status(201).json({
        success: true,
        message: "Project content created successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid project content data",
        error
      });
    }
  });

  app.patch("/api/admin/content/project/:id", jwtAuthenticate, projectUpload.single('bg_image_file'), async (req: MulterRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, organization, category, icon, duration, location, services, order_index } = req.body;
      let bg_image = req.body.bg_image;

      // Handle file upload if present
      if (req.file) {
        const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.PROJECTS);
        if (uploadResult) {
          bg_image = uploadResult.url;
        }
      }

      // Parse services array if it exists
      let parsedServices = undefined;
      if (services) {
        try {
          parsedServices = JSON.parse(services);
        } catch (e) {
          console.error('Error parsing services:', e);
        }
      }

      const projectData: any = {};

      if (title !== undefined) projectData.title = title;
      if (description !== undefined) projectData.description = description;
      if (organization !== undefined) projectData.organization = organization;
      if (category !== undefined) projectData.category = category;
      if (bg_image !== undefined) projectData.bg_image = bg_image;
      if (icon !== undefined) projectData.icon = icon;
      if (duration !== undefined) projectData.duration = duration;
      if (location !== undefined) projectData.location = location;
      if (parsedServices !== undefined) projectData.services = parsedServices;
      if (order_index !== undefined) projectData.order_index = Number(order_index);

      const result = await storage.updateProjectContent(parseInt(id), projectData);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Project content not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Project content updated successfully",
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update project content",
        error
      });
    }
  });

  app.delete("/api/admin/content/project/:id", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteProjectContent(parseInt(id));

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Project content not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Project content deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete project content",
        error
      });
    }
  });

  // Blog Articles API (public routes)
  app.get("/api/blog/articles", async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      // Get only published articles for public consumption
      const articles = await storage.getAllBlogArticles(true);

      // Filter by category if specified
      const filteredArticles = category
        ? articles.filter(article => article.category === category)
        : articles;

      res.json({
        success: true,
        data: filteredArticles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch blog articles",
        error
      });
    }
  });

  app.get("/api/blog/articles/:slugOrId", async (req: Request, res: Response) => {
    try {
      const { slugOrId } = req.params;
      let article;

      // Check if slugOrId is numeric (ID) or string (slug)
      if (/^\d+$/.test(slugOrId)) {
        article = await storage.getBlogArticle(parseInt(slugOrId));
      } else {
        article = await storage.getBlogArticleBySlug(slugOrId);
      }

      if (!article) {
        res.status(404).json({
          success: false,
          message: "Blog article not found"
        });
        return;
      }

      // For public routes, ensure only published articles are accessible
      if (article.status !== "published") {
        res.status(404).json({
          success: false,
          message: "Blog article not found"
        });
        return;
      }

      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch blog article",
        error
      });
    }
  });

  // Blog Articles API (admin routes)
  app.get("/api/admin/blog/articles", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      // Get all articles (including drafts) for admin
      const articles = await storage.getAllBlogArticles(false);

      res.json({
        success: true,
        data: articles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch blog articles",
        error
      });
    }
  });

  app.get("/api/admin/blog/articles/:id", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const article = await storage.getBlogArticle(parseInt(id));

      if (!article) {
        res.status(404).json({
          success: false,
          message: "Blog article not found"
        });
        return;
      }

      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch blog article",
        error
      });
    }
  });

  app.post("/api/admin/blog/articles", jwtAuthenticate, blogUpload.single('image'), async (req: MulterRequest, res: Response) => {
    try {
      console.log("POST /api/admin/blog/articles - Request headers:", req.headers);
      console.log("POST /api/admin/blog/articles - Request body:", req.body);
      console.log("POST /api/admin/blog/articles - Request file:", req.file);

      // Check if req.body.data exists and is a string
      if (!req.body.data || typeof req.body.data !== 'string') {
        res.status(400).json({
          success: false,
          message: "Missing or invalid 'data' field in request body"
        });
        return;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(req.body.data);
        console.log("POST /api/admin/blog/articles - Parsed data:", parsedData);
      } catch (error) {
        console.error("Error parsing req.body.data:", error);
        res.status(400).json({
          success: false,
          message: "Invalid JSON in 'data' field"
        });
        return;
      }

      const {
        title, excerpt, content, category, status,
        meta_description, keywords, author_name, author_position, author_avatar,
        serviceIds, projectIds
      } = parsedData;

      // Validate title is a valid string
      if (!title || typeof title !== 'string' || title.trim() === '') {
        console.log("POST /api/admin/blog/articles - Title validation failed:", { title, type: typeof title });
        res.status(400).json({
          success: false,
          message: "Title is required and must be a valid string"
        });
        return;
      }

      let image = parsedData.image;
      if (req.file) {
        const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.BLOG);
        if (uploadResult) {
          image = uploadResult.url;
        }
      }

      // Generate slug from title
      let slug;
      try {
        slug = slugify(title.trim(), {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g
        });

        if (!slug) {
          // If slugify returns empty, generate a fallback slug
          slug = `article-${Date.now()}`;
        }
      } catch (error) {
        console.error("Error generating slug:", error);
        // Fallback slug generation
        slug = `article-${Date.now()}`;
      }

      // Create article with validated data
      const articleData = {
        title,
        excerpt: excerpt || null, // Make excerpt optional
        content,
        category,
        image,
        status,
        slug,
        meta_description,
        keywords,
        author_name,
        author_position,
        author_avatar,
        updated_by: (req as any).user.id
      };

      console.log("Creating article with data:", articleData);
      const result = await storage.createBlogArticle(articleData);

      // Handle services relationships if provided
      if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
        await storage.updateBlogArticleServices(result.id, serviceIds);
      }

      // Handle projects relationships if provided
      if (projectIds && Array.isArray(projectIds) && projectIds.length > 0) {
        await storage.updateBlogArticleProjects(result.id, projectIds);
      }

      res.status(201).json({
        success: true,
        message: "Blog article created successfully",
        data: result
      });
    } catch (error) {
      console.error('Error creating blog article:', error);
      res.status(400).json({
        success: false,
        message: "Invalid blog article data",
        error
      });
    }
  });

  app.patch("/api/admin/blog/articles/:id", jwtAuthenticate, blogUpload.single('image'), async (req: MulterRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Check if article exists
      const existingArticle = await storage.getBlogArticle(parseInt(id));
      if (!existingArticle) {
        res.status(404).json({
          success: false,
          message: "Blog article not found"
        });
        return;
      }

      console.log("PATCH /api/admin/blog/articles/:id - Request body:", req.body);
      console.log("PATCH /api/admin/blog/articles/:id - Request file:", req.file);

      // Check if we have the data field (JSON)
      let parsedData;
      if (req.body.data && typeof req.body.data === 'string') {
        try {
          parsedData = JSON.parse(req.body.data);
          console.log("PATCH /api/admin/blog/articles/:id - Parsed data:", parsedData);
        } catch (error) {
          console.error("Error parsing req.body.data:", error);
          res.status(400).json({
            success: false,
            message: "Invalid JSON in 'data' field"
          });
          return;
        }
      } else {
        // Legacy handling for direct body fields
        parsedData = req.body;
      }

      const {
        title, excerpt, content, category, status,
        meta_description, keywords, author_name, author_position, author_avatar,
        serviceIds, projectIds
      } = parsedData;

      // Handle image upload or existing image reference
      let image = parsedData.image;
      if (req.file) {
        const uploadResult = await uploadFileToSupabase(req.file, BUCKETS.BLOG);
        if (uploadResult) {
          image = uploadResult.url;
        }
      }

      // Generate new slug if title changed
      let slug = existingArticle.slug;
      if (title && title !== existingArticle.title) {
        if (typeof title !== 'string' || title.trim() === '') {
          res.status(400).json({
            success: false,
            message: "Title must be a valid string"
          });
          return;
        }

        try {
          slug = slugify(title.trim(), {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
          });

          if (!slug) {
            // If slugify returns empty, generate a fallback slug
            slug = `article-${Date.now()}`;
          }
        } catch (error) {
          console.error("Error generating slug:", error);
          // Fallback slug generation
          slug = `article-${Date.now()}`;
        }
      }

      // Update article with validated data
      const articleData: any = {
        updated_by: (req as any).user.id
      };

      // Always include all fields that are provided, even if they're empty strings or null
      if (title !== undefined) articleData.title = title;
      if (excerpt !== undefined) articleData.excerpt = excerpt || null; // Allow empty excerpts
      if (content !== undefined) articleData.content = content;
      if (category !== undefined) articleData.category = category;
      if (image !== undefined) articleData.image = image;
      if (status !== undefined) articleData.status = status;
      if (slug !== undefined) articleData.slug = slug;
      if (meta_description !== undefined) articleData.meta_description = meta_description;
      if (keywords !== undefined) articleData.keywords = keywords;
      if (author_name !== undefined) articleData.author_name = author_name;
      if (author_position !== undefined) articleData.author_position = author_position;
      if (author_avatar !== undefined) articleData.author_avatar = author_avatar;

      console.log("Updating article with data:", articleData);
      const result = await storage.updateBlogArticle(parseInt(id), articleData);

      // Handle services relationships if provided
      if (serviceIds !== undefined) {
        await storage.updateBlogArticleServices(parseInt(id), Array.isArray(serviceIds) ? serviceIds : []);
      }

      // Handle projects relationships if provided
      if (projectIds !== undefined) {
        await storage.updateBlogArticleProjects(parseInt(id), Array.isArray(projectIds) ? projectIds : []);
      }

      res.json({
        success: true,
        message: "Blog article updated successfully",
        data: result
      });
    } catch (error) {
      console.error('Error updating blog article:', error);
      res.status(400).json({
        success: false,
        message: "Invalid blog article data",
        error
      });
    }
  });

  app.delete("/api/admin/blog/articles/:id", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteBlogArticle(parseInt(id));

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Blog article not found"
        });
        return;
      }

      res.json({
        success: true,
        message: "Blog article deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete blog article",
        error
      });
    }
  });

  // Get blog article services
  app.get("/api/admin/blog/articles/:id/services", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const services = await storage.getBlogArticleServices(parseInt(id));

      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch blog article services",
        error
      });
    }
  });

  // Get blog article projects
  app.get("/api/admin/blog/articles/:id/projects", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const projects = await storage.getBlogArticleProjects(parseInt(id));

      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch blog article projects",
        error
      });
    }
  });

  // Admin routes for getting all services and projects
  app.get("/api/admin/content/service", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const services = await storage.getAllServiceContent();
      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch services",
        error
      });
    }
  });

  app.get("/api/admin/content/project", jwtAuthenticate, async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllProjectContent();
      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch projects",
        error
      });
    }
  });

  // Hero Slides routes
  app.get('/api/hero-slides', getHeroSlides);
  app.get('/api/hero-slides/:id', getHeroSlide);
  app.post('/api/hero-slides', jwtAuthenticate, heroSlideUpload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'videoBackground', maxCount: 1 }
  ]), createHeroSlide);
  app.put('/api/hero-slides/:id', jwtAuthenticate, heroSlideUpload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'videoBackground', maxCount: 1 }
  ]), updateHeroSlide);
  app.delete('/api/hero-slides/:id', jwtAuthenticate, deleteHeroSlide);

  // About Content Routes
  app.get('/api/about-content', getAboutContent);
  app.post('/api/about-content', jwtAuthenticate, aboutUpload.single('image'), createOrUpdateAboutContent);

  // Article routes
  app.get("/api/articles", getArticles);
  app.get("/api/articles/:id", getArticleById);
  app.get("/api/articles/slug/:slug", getArticleBySlug);
  app.get("/api/articles/:id/services", getArticleServices);
  app.get("/api/articles/:id/projects", getArticleProjects);

  // Admin Article routes
  app.post("/api/admin/articles", jwtAuthenticate, blogUpload.single('image'), createArticle);
  app.put("/api/admin/articles/:id", jwtAuthenticate, blogUpload.single('image'), updateArticle);
  app.delete("/api/admin/articles/:id", jwtAuthenticate, deleteArticle);

  // Impact Stats routes
  app.get('/api/impact-stats', getImpactStats);
  app.get('/api/impact-stats/:id', getImpactStat);
  app.post('/api/impact-stats', jwtAuthenticate, createImpactStat);
  app.put('/api/impact-stats/:id', jwtAuthenticate, updateImpactStat);
  app.delete('/api/impact-stats/:id', jwtAuthenticate, deleteImpactStat);

  // Footer Content Routes
  app.get("/api/footer", getFooterContent);
  app.post("/api/footer", jwtAuthenticate, updateFooterContent);

  // Locations
  app.get("/api/locations", getLocations);
  app.get("/api/locations/:id", getLocation);
  app.post("/api/locations", jwtAuthenticate, locationUpload.single('image'), createLocation);
  app.put("/api/locations/:id", jwtAuthenticate, locationUpload.single('image'), updateLocation);
  app.delete("/api/locations/:id", jwtAuthenticate, deleteLocation);

  // --- AUTH ENDPOINT ---
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: "Username and password required" });
      return;
    }
    const user = await storage.getUserByUsername(username);
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
  });

  // --- AUTH REGISTER ENDPOINT ---
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      res.status(400).json({ success: false, message: "Username, password, and role are required" });
      return;
    }
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      res.status(409).json({ success: false, message: "Username already exists" });
      return;
    }
    try {
      const user = await storage.createUser({ username, password, role });
      res.status(201).json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Failed to register user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
