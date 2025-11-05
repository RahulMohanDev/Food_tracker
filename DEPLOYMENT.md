# Deployment Guide

This guide will help you deploy the Food Tracker application to your DigitalOcean server with automated GitHub Actions deployment.

## Prerequisites

- DigitalOcean Droplet (1GB Memory / 25GB Disk / Docker on Ubuntu 22.04)
- GitHub repository with push access
- OpenAI API key

## Production vs Development

This guide covers **production deployment** to your DigitalOcean server. Key differences:

### Production Deployment (This Guide)
- Runs on your DigitalOcean server with a public IP address
- Uses Docker containers for consistent deployment
- Accessible 24/7 at `http://YOUR_SERVER_IP:3000`
- **No ngrok or tunneling needed** - your server has a real public IP
- GitHub Actions automatically deploys when you push to main branch

### Local Development
- The `start-server.sh` script is for local development only
- Uses ngrok to create temporary public URLs for testing webhooks/mobile devices
- **Not used in production** - only for local development convenience
- Your production app runs directly on the server's public IP

## Initial Server Setup

### 1. Connect to Your Server

```bash
ssh root@your_server_ip
```

### 2. Set Up a Non-Root User (if not already done)

```bash
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy
```

**About the commands:**
- `adduser deploy` - Creates a new user named 'deploy' (you'll be prompted for a password)
- `usermod -aG sudo deploy` - Adds the user to the sudo group (allows running commands with admin privileges)
- `usermod -aG docker deploy` - Adds the user to the docker group (allows running Docker without sudo)

**Password Security:**
- Use a **strong, unique password** (16+ characters with mix of upper/lowercase, numbers, special characters)
- Save it in your password manager
- You'll need it for sudo operations and emergency access
- Optional: After setting up SSH keys, you can disable password authentication for better security

**To disable password authentication later (optional, for maximum security):**
```bash
sudo nano /etc/ssh/sshd_config
# Change or add: PasswordAuthentication no
# Then: sudo systemctl restart sshd
```

### 3. Set Up SSH Key for GitHub Actions

```bash
# Switch to deploy user
su - deploy

# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key -N ""

# Display the public key (add this to authorized_keys)
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Display the private key (you'll need this for GitHub Secrets)
cat ~/.ssh/github_actions_key
```

**Save the private key** - you'll need it for GitHub Secrets setup.

### 4. Clone the Repository

```bash
# Create application directory
sudo mkdir -p /opt/food-tracker
sudo chown deploy:deploy /opt/food-tracker

# Clone the repository
cd /opt/food-tracker
git clone https://github.com/YOUR_USERNAME/food-tracker.git .
```

### 5. Create Production Environment File

```bash
cd /opt/food-tracker
nano .env
```

Add the following:

```env
DATABASE_URL="file:/app/data/prod.db"
OPENAI_API_KEY="your_actual_openai_api_key"
```

### 6. Create Data and Logs Directories

```bash
mkdir -p /opt/food-tracker/data
mkdir -p /opt/food-tracker/logs
```

### 7. Initial Deployment

```bash
cd /opt/food-tracker
./deploy.sh
```

### 8. Configure Firewall (if needed)

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Accessing Your Application

After deployment, your application is accessible via:

### Direct Access (Default)
```
http://YOUR_SERVER_IP:3000
```
Replace `YOUR_SERVER_IP` with your DigitalOcean droplet's IP address.

**Example:** If your server IP is `164.90.123.45`, visit `http://164.90.123.45:3000`

### With Nginx Reverse Proxy (After Setup)
```
http://YOUR_SERVER_IP
```
No port needed when using Nginx on port 80.

### With Domain Name and SSL (After Setup)
```
https://yourdomain.com
```
Professional setup with HTTPS encryption.

### Testing the Connection

From your local machine:
```bash
# Test basic connectivity
curl http://YOUR_SERVER_IP:3000/api/consumables

# Check if app is responding
curl -I http://YOUR_SERVER_IP:3000
```

**Note:** Your app runs directly on the server's public IP. No ngrok, tunneling, or port forwarding is needed!

## GitHub Actions Setup

### 1. Add GitHub Secrets

Go to your GitHub repository: **Settings > Secrets and variables > Actions**

Add the following secrets:

- **SERVER_HOST**: Your server IP address (e.g., `164.90.xxx.xxx`)
- **SERVER_USERNAME**: `deploy`
- **SSH_PRIVATE_KEY**: The private key from step 3 above (entire content)
- **OPENAI_API_KEY**: Your OpenAI API key

### 2. Test GitHub Actions

Push a commit to the main branch:

```bash
git add .
git commit -m "test: Trigger deployment"
git push origin main
```

Watch the deployment in the **Actions** tab of your GitHub repository.

## Testing Your Deployment

After deploying (either via GitHub Actions or manually), verify everything is working:

### 1. Check Container Status

```bash
ssh deploy@your_server_ip
cd /opt/food-tracker
docker compose ps
```

You should see the `app` container in the "Up" state.

### 2. View Application Logs

```bash
docker compose logs -f app
```

Look for "ready started server on 0.0.0.0:3000" or similar messages.

### 3. Test API Endpoints

From your local machine:

```bash
# Replace YOUR_SERVER_IP with your actual server IP
export SERVER_IP="YOUR_SERVER_IP"

# Test health endpoint
curl http://$SERVER_IP:3000/api/consumables

# Test with verbose output
curl -v http://$SERVER_IP:3000
```

### 4. Test in Browser

Open your browser and visit:
```
http://YOUR_SERVER_IP:3000
```

You should see your Food Tracker application!

### 5. Check Database

```bash
ssh deploy@your_server_ip
ls -lh /opt/food-tracker/data/
```

You should see `prod.db` file created.

### Troubleshooting Tests

If something isn't working:

```bash
# Check if container is running
docker compose ps

# View recent logs
docker compose logs --tail=50 app

# Check if port 3000 is listening
sudo netstat -tulpn | grep 3000

# Test localhost access from the server
curl http://localhost:3000

# Restart the application
docker compose restart
```

## Manual Deployment

If you need to deploy manually:

```bash
ssh deploy@your_server_ip
cd /opt/food-tracker
./deploy.sh
```

## Nginx Reverse Proxy (Optional but Recommended)

To serve your app on port 80 with a domain:

### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/food-tracker
```

Add:

```nginx
server {
    listen 80;
    server_name your_domain.com;  # or use server IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/food-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL with Let's Encrypt (Optional)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com
```

## Monitoring and Maintenance

### View Application Logs

```bash
docker compose logs -f
```

### View Container Status

```bash
docker compose ps
```

### Restart Application

```bash
cd /opt/food-tracker
docker compose restart
```

### Update Application

```bash
cd /opt/food-tracker
./deploy.sh
```

### Backup Database

```bash
cp /opt/food-tracker/data/prod.db /opt/food-tracker/data/prod.db.backup-$(date +%Y%m%d)
```

## Troubleshooting

### Container won't start

```bash
docker compose logs app
```

### Check disk space

```bash
df -h
docker system df
```

### Clean up Docker resources

```bash
docker system prune -a
```

### Database migration issues

```bash
docker compose exec app npx prisma migrate deploy
```

## Architecture

- **Application**: Next.js app running on port 3000
- **Database**: SQLite stored in `/opt/food-tracker/data/prod.db`
- **Logs**: Stored in `/opt/food-tracker/logs`
- **Container Management**: Docker Compose
- **CI/CD**: GitHub Actions

## Security Recommendations

1. Never commit `.env` files to git
2. Regularly update your server: `sudo apt update && sudo apt upgrade`
3. Use strong SSH keys and disable password authentication
4. Keep your Docker images updated
5. Regular database backups
6. Monitor application logs for errors
7. Use HTTPS in production (see Nginx SSL setup)

## Support

If you encounter issues, check:
- Application logs: `docker compose logs`
- GitHub Actions logs in the Actions tab
- Server resources: `htop` or `docker stats`
