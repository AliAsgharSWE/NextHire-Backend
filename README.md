## Deploying an App to EC2

### 1. Push Code to GitHub
- Make sure your code is committed and pushed to your GitHub repository.

### 2. Prepare EC2
- Launch an EC2 instance.
- Update the operating system:
  ```bash
  sudo apt update && sudo apt upgrade -y


* Install required software:

  ```bash
  sudo apt install nodejs npm git -y
  ```
* Set up a GitHub self-hosted runner on EC2:

  * Connect to your EC2 via SSH.
  * Get the runner token from GitHub.
  * Configure the runner on the instance.

### 3. GitHub Actions Workflow

* Triggered automatically on push.
* Runs:

  * **Linting & Tests** – to check code quality.
  * **Build** – to compile the app.
  * **Environment Variables** – pulled securely from GitHub Secrets.

### 4. Deploy Code to EC2

* Deployment happens via GitHub Actions:

  * Using **SSH** or the **self-hosted runner**.

### 5. Start the App with PM2

* Start the app:

  ```bash
  pm2 start app.js
  ```
* Save and configure PM2 to restart on reboot:

  ```bash
  pm2 save
  pm2 startup
  ```

### 6. Install and Configure NGINX

* Install NGINX:

  ```bash
  sudo apt install nginx -y
  ```
* Configure reverse proxy in:

  ```
  /etc/nginx/sites-available/default
  ```

### 7. Restart NGINX

* Test configuration:

  ```bash
  sudo nginx -t
  ```
* Restart NGINX:

  ```bash
  sudo systemctl restart nginx
  ```

### 8. Map Domain to EC2

* Update your domain’s **DNS A-record** to point to the EC2 public IP.
* Add SSL with Certbot:

  ```bash
  sudo certbot --nginx
  ```

### 9. App Live!

* App is now live on your custom domain
