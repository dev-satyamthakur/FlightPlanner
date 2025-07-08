# Configuration variables
$VM_USER = "mainperson404"
$VM_IP = "34.131.120.14"
$DOMAIN_PATH = "/var/www/flight.satyamthakur.com"
$LOCAL_BUILD_DIR = "dist"
$REMOTE_TEMP_DIR = "~/myapp"
$SSH_KEY = "C:\Users\Satyam Thakur\.ssh\id_rsa"

# Function to run SSH commands
function Run-SSH {
    param($command)
    # Convert Windows line endings to Unix and escape properly
    $command = $command -replace "`r`n", "`n"
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "${VM_USER}@${VM_IP}" "$command"
}

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Step 1: Build the React application
Write-Host "`n📦 Building React application..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Aborting deployment." -ForegroundColor Red
    exit 1
}

# Step 2: Create a backup of current deployment
Write-Host "`n💾 Creating backup of current deployment..." -ForegroundColor Green
$backup_date = Get-Date -Format "yyyyMMdd_HHmmss"
Run-SSH "sudo cp -r $DOMAIN_PATH ${DOMAIN_PATH}_backup_$backup_date"

# Step 3: Copy the new build to VM
Write-Host "`n📤 Copying new build to VM..." -ForegroundColor Green
scp -i "$SSH_KEY" -r $LOCAL_BUILD_DIR/* "${VM_USER}@${VM_IP}:$REMOTE_TEMP_DIR"

# Step 4: Deploy new build and set permissions
Write-Host "`n📋 Deploying new build..." -ForegroundColor Green
# Using single-line command to avoid line ending issues
Run-SSH "sudo rm -rf $DOMAIN_PATH/* && sudo cp -r $REMOTE_TEMP_DIR/* $DOMAIN_PATH/ && sudo chown -R www-data:www-data $DOMAIN_PATH && sudo chmod -R 755 $DOMAIN_PATH"

# Step 5: Restart Nginx
Write-Host "`n🔄 Restarting Nginx..." -ForegroundColor Green
Run-SSH "sudo systemctl restart nginx"

# Step 6: Check Nginx status
Write-Host "`n✅ Checking Nginx status..." -ForegroundColor Green
Run-SSH "sudo systemctl status nginx"

Write-Host "`n✨ Deployment completed!" -ForegroundColor Green