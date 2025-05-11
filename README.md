# React + Vite

Future Updates
For future deployments, you can follow a similar process:

Build your app locally: npm run build
Copy the new build to your VM: scp -r dist/ mainperson404@34.131.120.14:~/myapp
Update your web directory: sudo cp -r ~/myapp/dist/* /var/www/flight.satyamthakur.com/
