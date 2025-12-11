# 🎯 PACT Consultancy Website

Full-stack web application for PACT Consultancy - a professional consulting firm showcasing services, projects, team members, and client portfolio.

**Live Site:** http://138.68.104.122:5000  
**Cloned:** December 9, 2025

---

## 🚀 Quick Start - Run Locally in 5 Minutes

### Prerequisites
- **Docker Desktop** installed and running ([Download here](https://www.docker.com/products/docker-desktop))
- **Git** installed
- **macOS/Linux** (Windows users: use WSL2)

### Installation Steps

1. **Clone this repository:**
   ```bash
   git clone https://github.com/Ssemaganda-George/pact-website-vps.git
   cd pact-website-vps
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your database URL:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_aTqvez1r0bkA@ep-holy-sea-ahwpuzyd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   PORT=5000
   NODE_ENV=development
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up database and storage:**
   ```bash
   # Push database schema
   npm run db:push
   
   # Set up Supabase Storage buckets
   npm run setup-storage
   ```
   
   Or manually run the SQL files:
   ```bash
   # Run in Supabase SQL Editor
   # Copy contents of database_setup.sql and supabase_storage_setup.sql
   ```

5. **Start with Docker:**
   ```bash
   docker-compose up -d
   ```
   
   Or run without Docker:
   ```bash
   npm run dev
   ```

5. **Access the website:**
   - **Homepage:** http://localhost:5000
   - **Admin Panel:** http://localhost:5000/admin
   - **Login:** username: `admin`, password: `admin123`

That's it! 🎉 The website is now running on your machine.

---

## 🗄️ Database & Storage Setup

### Database Tables
The application uses the following database tables (created via Drizzle migrations):

- **users** - Admin authentication
- **contact_messages** - Contact form submissions
- **expertise_content** - Company expertise areas
- **service_content** - Service offerings
- **client_content** - Client and partner information
- **project_content** - Project portfolio
- **project_services** - Project-service relationships
- **blog_articles** - Blog content
- **blog_article_services** - Blog-service relationships
- **blog_article_projects** - Blog-project relationships
- **locations** - Office locations
- **team_members** - Team member profiles
- **team_member_services** - Team-service relationships
- **hero_slides** - Homepage hero carousel
- **about_content** - About page content
- **footer_content** - Footer information
- **impact_stats** - Statistics display

### Supabase Storage Buckets
The application uses the following storage buckets for images:

- **hero-images** - Hero slide background images
- **client-logos** - Client and partner logos
- **team-members** - Team member profile photos
- **blog-images** - Blog article images
- **about-images** - About section images
- **service-images** - Service content images
- **location-images** - Location images
- **project-images** - Project background images

### Automated Setup
```bash
# Push database schema
npm run db:push

# Set up Supabase Storage buckets (Note: May require manual setup due to RLS policies)
npm run setup-storage
```

### Manual Setup (Recommended)
Since Supabase Storage has Row Level Security (RLS) policies, the most reliable way is to set up buckets manually:

1. **Database Tables:**
   - Run the SQL in `database_setup.sql` in your Supabase SQL Editor
   - Or use Drizzle migrations: `npm run db:push`

2. **Storage Buckets:**
   - **First try:** Run the SQL in `supabase_storage_setup.sql` in your Supabase SQL Editor
   - **If you get policy errors:** Use `supabase_storage_setup_simple.sql` instead (handles existing policies gracefully)
   - Or create buckets manually in Supabase Dashboard → Storage with these settings:
     - `hero-images` (Public, 10MB limit, image types: jpeg, png, gif, webp)
     - `client-logos` (Public, 10MB limit, image types)
     - `team-members` (Public, 10MB limit, image types)
     - `blog-images` (Public, 10MB limit, image types)
     - `about-images` (Public, 10MB limit, image types)
     - `service-images` (Public, 10MB limit, image types)
     - `location-images` (Public, 10MB limit, image types)
     - `project-images` (Public, 10MB limit, image types)

3. **Verify Setup:**
   ```sql
   -- Check tables
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' ORDER BY table_name;
   
   -- Check storage buckets
   SELECT id, name, public FROM storage.buckets;
   ```

### Troubleshooting

**"Policy 'Public Access' already exists" Error:**
- Use `supabase_storage_setup_simple.sql` instead of `supabase_storage_setup.sql`
- Or manually create buckets in Supabase Dashboard → Storage

**Storage bucket creation fails:**
- Ensure you have proper permissions in your Supabase project
- Try creating buckets manually through the Supabase Dashboard
- Check that your Supabase service role key has storage admin permissions

**Database connection issues:**
- Verify your `DATABASE_URL` in `.env` is correct
- Ensure your Supabase project is active and accessible
- Check that your IP is whitelisted if you have IP restrictions

---

## 📁 What's Inside

```
pact-website-vps/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── api/         # API client functions
│   │   └── context/     # React context providers
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── db.ts           # Database connection
│   └── migrations/      # SQL migrations
├── uploads/             # User uploaded images
├── docker-compose.yml   # Docker configuration
├── Dockerfile          # Container definition
└── .env                # Environment variables (create from .env.example)
```

---

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server (port 5000) |
| `docker-compose up -d` | Start with Docker (recommended) |
| `docker-compose down` | Stop Docker containers |
| `docker-compose logs -f` | View Docker logs |
| `npm run build` | Build for production |
| `npm run test` | Run test scripts |
| `npm run migrate-storage` | Migrate local files to Supabase Storage |

---

## 🧪 Testing & Migration

### Test Hero Slide Background Images
After setting up storage buckets, test that background images save correctly:

```bash
# Make sure the server is running
npm run dev

# Run the hero slide test in another terminal
node test-hero-slides.js
```

This test will:
- Create a hero slide with a background image
- Update the slide without changing the image (verifies the fix)
- Update with a new background image
- Clean up test data

### Migrate Existing Files to Supabase Storage
If you have existing images in the `uploads/` directory, migrate them to Supabase:

```bash
# Set your Supabase service role key in .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here" >> .env

# Run the migration script
node migrate-to-supabase.js
```

The migration will:
- Upload all images from `uploads/` subdirectories to appropriate Supabase buckets
- Generate a `migration-results.json` file with old → new URL mappings
- Provide a summary of migrated files by bucket

**Note:** Make sure storage buckets are created before running migration.

### Manual Testing Checklist
- [ ] Admin login works (`admin` / `admin123`)
- [ ] Hero slides display with background images
- [ ] Creating hero slide with image upload works
- [ ] Updating hero slide preserves existing image
- [ ] Updating hero slide with new image works
- [ ] All CRUD operations work for other content types
- [ ] Images load from Supabase Storage URLs
- [ ] Contact form submissions work

---

## 🔧 Troubleshooting

### Port 5000 already in use (macOS)
macOS AirPlay uses port 5000 by default. To fix:
1. Go to **System Settings** → **General** → **AirDrop & Handoff**
2. Turn off **AirPlay Receiver**
3. Restart the app

### Docker not starting
1. Make sure Docker Desktop is running
2. Check Docker status: `docker ps`
3. Restart Docker Desktop if needed

### Database connection errors
1. Check your `.env` file has the correct `DATABASE_URL`
2. Make sure you copied from `.env.example`
3. Verify the Neon database is accessible

### White screen or errors
1. Clear browser cache
2. Check Docker logs: `docker-compose logs -f`
3. Restart containers: `docker-compose restart`

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Radix UI** - Component primitives
- **React Query** - Data fetching

### Backend
- **Node.js 20** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database toolkit

### Database
- **PostgreSQL 15** - Relational database
- **Neon** - Cloud database hosting

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Render** - Production hosting (coming soon)

---

## 📚 Admin Panel Features

Access at http://localhost:5000/admin

- ✅ Content Management (Services, Projects, Team, Blog)
- ✅ Client Portfolio Management
- ✅ Hero Slider Editor
- ✅ About Page Editor
- ✅ Contact Form Messages
- ✅ Location Management
- ✅ Statistics Dashboard

**Default Admin Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change these credentials in production!**

---

## 🚢 Deployment

### Deploy to Render (Free Hosting)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com)**

3. **Create New Web Service:**
   - Connect your GitHub repository
   - Runtime: **Docker**
   - Plan: **Free**

4. **Add Environment Variables:**
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_aTqvez1r0bkA@ep-holy-sea-ahwpuzyd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   NODE_ENV=production
   PORT=5000
   SESSION_SECRET=your-random-secret-here
   JWT_SECRET=your-jwt-secret-here
   ```

5. **Deploy!** Render will automatically build and deploy your app.

See [DEPLOY_TO_RENDER.md](DEPLOY_TO_RENDER.md) for detailed deployment instructions.

---

## 🤝 Contributing

This is a private project for PACT Consultancy. If you have access and want to contribute:

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Create a Pull Request

---

## 📄 License

Private & Confidential - PACT Consultancy © 2025

---

## 💬 Support

Need help? Contact the development team or check:
- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide
- [LOCAL_SETUP.md](LOCAL_SETUP.md) - Detailed setup docs
- [DEPLOY_TO_RENDER.md](DEPLOY_TO_RENDER.md) - Deployment guide

---

**Made with ❤️ for PACT Consultancy**
