# Deployment Guide - Food Tracker

This guide explains how to deploy the Food Tracker application to Digital Ocean or any other cloud provider using Docker.

## Prerequisites

- Docker installed on your server
- OpenAI API Key
- A cloud server (Digital Ocean Droplet, AWS EC2, etc.)

## Quick Start with Docker Compose

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd food-tracker
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
DATABASE_URL="file:/app/data/prod.db"
OPENAI_API_KEY="your-actual-openai-api-key"
NODE_ENV="production"
```

### 3. Create Data Directory

```bash
mkdir -p data logs
```

### 4. Build and Run with Docker Compose

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`

### 5. Check Logs

```bash
docker-compose logs -f app
```

### 6. Stop the Application

```bash
docker-compose down
```

## Deployment to Digital Ocean

### Option 1: Using Docker on a Droplet

1. **Create a Droplet**
   - Log in to Digital Ocean
   - Create a new Droplet (Ubuntu 22.04 recommended)
   - Choose a plan (minimum $6/month should work)
   - Add your SSH key

2. **SSH into Your Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

4. **Install Docker Compose**
   ```bash
   apt-get update
   apt-get install docker-compose-plugin
   ```

5. **Clone Your Repository**
   ```bash
   git clone <your-repo-url>
   cd food-tracker
   ```

6. **Set Up Environment Variables**
   ```bash
   nano .env
   ```
   Add:
   ```env
   DATABASE_URL="file:/app/data/prod.db"
   OPENAI_API_KEY="your-actual-openai-api-key"
   NODE_ENV="production"
   ```

7. **Create Directories**
   ```bash
   mkdir -p data logs
   ```

8. **Run the Application**
   ```bash
   docker compose up -d
   ```

9. **Configure Firewall**
   ```bash
   ufw allow 22
   ufw allow 3000
   ufw enable
   ```

10. **Access Your Application**
    - Visit `http://your-droplet-ip:3000`

### Option 2: Using Nginx as Reverse Proxy (Recommended for Production)

1. **Follow steps 1-8 from Option 1**

2. **Install Nginx**
   ```bash
   apt-get install nginx
   ```

3. **Configure Nginx**
   ```bash
   nano /etc/nginx/sites-available/food-tracker
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable the Site**
   ```bash
   ln -s /etc/nginx/sites-available/food-tracker /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

5. **Configure Firewall**
   ```bash
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

6. **Install SSL with Let's Encrypt (Optional but Recommended)**
   ```bash
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

## Manual Docker Build (Without Docker Compose)

### Build the Image

```bash
docker build -t food-tracker .
```

### Run the Container

```bash
docker run -d \
  --name food-tracker \
  -p 3000:3000 \
  -e DATABASE_URL="file:/app/data/prod.db" \
  -e OPENAI_API_KEY="your-api-key" \
  -e NODE_ENV="production" \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  food-tracker
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite database path | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `NODE_ENV` | Node environment (production) | Yes |

## Data Persistence

The application uses volumes to persist data:

- **Database**: `./data/prod.db` - Contains all user data, food entries, and consumables
- **Logs**: `./logs/error.log` - Application error logs

**Important**: Always backup the `./data` directory regularly!

## Backup and Restore

### Backup

```bash
# Backup database
cp data/prod.db data/prod.db.backup-$(date +%Y%m%d)

# Or create a tar archive
tar -czf backup-$(date +%Y%m%d).tar.gz data logs
```

### Restore

```bash
# Stop the application
docker-compose down

# Restore database
cp data/prod.db.backup-YYYYMMDD data/prod.db

# Restart
docker-compose up -d
```

## Monitoring

### View Logs
```bash
# Docker Compose
docker-compose logs -f app

# Docker
docker logs -f food-tracker
```

### Check Container Status
```bash
docker-compose ps
# or
docker ps
```

### Application Error Logs
```bash
tail -f logs/error.log
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Container Won't Start
- Check logs: `docker-compose logs app`
- Verify environment variables are set correctly
- Ensure ports are not already in use

### Database Issues
- Check that the `data` directory exists and has correct permissions
- Verify DATABASE_URL points to `/app/data/prod.db`

### API Errors
- Check `logs/error.log` for detailed error messages
- Verify OPENAI_API_KEY is valid

### Port Already in Use
```bash
# Find what's using port 3000
lsof -i :3000
# Kill the process or change the port in docker-compose.yml
```

## Security Recommendations

1. **Always use HTTPS in production** (via Nginx + Let's Encrypt)
2. **Keep your OpenAI API key secret** - never commit it to git
3. **Regularly backup your database**
4. **Keep Docker and system packages updated**
5. **Use a firewall** to restrict access to necessary ports only
6. **Consider using Docker secrets** for sensitive data in production

## Support

For issues or questions, check the error logs at `/logs/error.log` first. The logging system captures all errors with timestamps and context.
