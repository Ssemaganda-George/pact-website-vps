# VPS Deployment Guide

This guide explains how to set up automated deployment to your VPS using GitHub Actions.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **VPS Access**: SSH access to your VPS (138.68.104.122)
3. **SSH Key**: Your SSH private key (`pact_site_key`) should be available

## GitHub Secrets Setup

To enable automated deployment, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **SSH_PRIVATE_KEY** (Required)
   - Your SSH private key for accessing the VPS
   - Copy the contents of `~/.ssh/pact_site_key` (on Windows: `%USERPROFILE%\.ssh\pact_site_key`)
   - Go to: Repository Settings → Secrets and variables → Actions → New repository secret
   - Name: `SSH_PRIVATE_KEY`
   - Value: Paste the entire contents of your private key file

### Optional Secrets (for environment variables)

These will be automatically added to your `.env` file on the VPS:

2. **DATABASE_URL** (Recommended)
   - Your PostgreSQL database connection string
   - Example: `postgresql://user:password@host:5432/dbname`

3. **SESSION_SECRET** (Recommended)
   - A secure random string for session management
   - Generate with: `openssl rand -base64 32`

4. **SMTP_HOST** (Optional)
   - SMTP server hostname for email functionality
   - Example: `smtp.gmail.com`

5. **SMTP_PORT** (Optional)
   - SMTP server port
   - Example: `587`

6. **SMTP_USER** (Optional)
   - SMTP username/email
   - Example: `your-email@gmail.com`

7. **SMTP_PASS** (Optional)
   - SMTP password or app password
   - For Gmail, use an App Password

8. **SMTP_FROM** (Optional)
   - From email address
   - Example: `info@pactorg.com`

9. **PRODUCTION_URL** (Optional)
   - Your production URL for CORS configuration
   - Example: `https://pactorg.com`

## How to Add GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

## Deployment Process

The workflow automatically triggers on:
- Push to `main` or `master` branch
- Manual trigger via GitHub Actions UI (workflow_dispatch)

### What the Workflow Does

1. **Checks out code** from your repository
2. **Sets up SSH** connection to your VPS
3. **Transfers files** to the VPS (excluding unnecessary files)
4. **Sets up environment** file with your secrets
5. **Builds Docker images** on the VPS
6. **Deploys containers** using Docker Compose
7. **Runs database migrations**
8. **Verifies deployment** is successful

## Manual Deployment

If you need to deploy manually, you can SSH into your VPS and run:

```bash
ssh -i ~/.ssh/pact_site_key root@138.68.104.122
cd /root/pact-website-vps
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### SSH Connection Issues

- Verify your SSH key is correctly added to GitHub secrets
- Ensure the key has proper permissions (600)
- Test SSH connection manually: `ssh -i ~/.ssh/pact_site_key root@138.68.104.122`

### Docker Issues

- Check if Docker is installed: `docker --version`
- Check if Docker Compose is installed: `docker compose version` or `docker-compose --version`
- View container logs: `docker compose -f docker-compose.prod.yml logs`

### Application Not Responding

- Check container status: `docker ps`
- Check application logs: `docker compose -f docker-compose.prod.yml logs app`
- Check nginx logs: `docker compose -f docker-compose.prod.yml logs nginx`
- Verify port mappings: `docker compose -f docker-compose.prod.yml ps`

### Database Connection Issues

- Verify DATABASE_URL secret is set correctly
- Check database container is running: `docker ps | grep postgres`
- Test database connection from app container:
  ```bash
  docker exec -it <app-container-name> node -e "console.log(process.env.DATABASE_URL)"
  ```

## SSL Certificate Setup

For HTTPS support, you need to add SSL certificates to your VPS:

1. SSH into your VPS
2. Create SSL directory: `mkdir -p /root/pact-website-vps/nginx/ssl`
3. Copy your SSL certificates:
   - `fullchain.pem` → `/root/pact-website-vps/nginx/ssl/fullchain.pem`
   - `privkey.pem` → `/root/pact-website-vps/nginx/ssl/privkey.pem`

You can use Let's Encrypt to obtain free SSL certificates:

```bash
# Install certbot
apt-get update
apt-get install -y certbot

# Obtain certificate (replace with your domain)
certbot certonly --standalone -d pactorg.com -d www.pactorg.com

# Copy certificates to nginx directory
cp /etc/letsencrypt/live/pactorg.com/fullchain.pem /root/pact-website-vps/nginx/ssl/
cp /etc/letsencrypt/live/pactorg.com/privkey.pem /root/pact-website-vps/nginx/ssl/
```

## Monitoring

After deployment, you can monitor your application:

- **View logs**: `docker compose -f docker-compose.prod.yml logs -f`
- **Check status**: `docker compose -f docker-compose.prod.yml ps`
- **Restart services**: `docker compose -f docker-compose.prod.yml restart`
- **Stop services**: `docker compose -f docker-compose.prod.yml down`

## Security Notes

- Never commit your `.env` file or SSH keys to the repository
- Use GitHub Secrets for all sensitive information
- Regularly update your dependencies and Docker images
- Keep your VPS system updated: `apt-get update && apt-get upgrade`
- Use strong passwords and SSH keys
- Consider setting up a firewall (UFW) on your VPS

