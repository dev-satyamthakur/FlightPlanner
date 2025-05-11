#!/bin/bash

# Configuration variables
VM_USER="mainperson404"
VM_IP="34.131.120.14"
DOMAIN_PATH="/var/www/flight.satyamthakur.com"
LOCAL_BUILD_DIR="dist"
REMOTE_TEMP_DIR="~/myapp"
SSH_KEY="/c/Users/Satyam Thakur/.ssh/id_rsa"  # Updated SSH key path for Windows
SSH_OPTIONS="-i \"$SSH_KEY\" -o StrictHostKeyChecking=no"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run SSH commands
run_ssh() {
    ssh $SSH_OPTIONS $VM_USER@$VM_IP "$1"
}

# Function to run SCP commands
run_scp() {
    scp $SSH_OPTIONS -r $LOCAL_BUILD_DIR/ $VM_USER@$VM_IP:$REMOTE_TEMP_DIR
}

echo -e "${GREEN}🚀 Starting deployment process...${NC}"

# Step 1: Build the React application
echo -e "\n${GREEN}📦 Building React application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Aborting deployment.${NC}"
    exit 1
fi

# Step 2: Create a backup of current deployment (on remote)
echo -e "\n${GREEN}💾 Creating backup of current deployment...${NC}"
run_ssh "sudo cp -r $DOMAIN_PATH ${DOMAIN_PATH}_backup_$(date +%Y%m%d_%H%M%S)"

# Step 3: Copy the new build to VM
echo -e "\n${GREEN}📤 Copying new build to VM...${NC}"
run_scp

# Step 4: Deploy new build and set permissions
echo -e "\n${GREEN}📋 Deploying new build...${NC}"
run_ssh "
    sudo rm -rf $DOMAIN_PATH/* && \
    sudo cp -r $REMOTE_TEMP_DIR/dist/* $DOMAIN_PATH/ && \
    sudo chown -R www-data:www-data $DOMAIN_PATH && \
    sudo chmod -R 755 $DOMAIN_PATH
"

# Step 5: Restart Nginx
echo -e "\n${GREEN}🔄 Restarting Nginx...${NC}"
run_ssh "sudo systemctl restart nginx"

# Step 6: Check Nginx status
echo -e "\n${GREEN}✅ Checking Nginx status...${NC}"
run_ssh "sudo systemctl status nginx"

echo -e "\n${GREEN}✨ Deployment completed!${NC}"