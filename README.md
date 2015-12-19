# Word document report generator

## Installation of the service

- Clone the repository

```
git clone https://github.com/gabayarden/report-generator.git
```

- Install dependencies

```
cd report-generator
npm install
```

- Build the project

```
npm run build
```

## Running the service

The service can be runned directly from the command line with:

```bash
npm start
```

or it can be build and runned watching for file changes

```
npm run dev
```

## Deploy on server

### Run as service

To allow the microservice to run as system service, first you must install `pm2`:

```
npm i -g pm2
```

After that, you must create the ecosystem file to launch the service:

```
nano ecosystem.config.js
```

The `ecosystem.config.js` file contains the following lines:

```
module.exports = {
  apps : [{
    name: 'REPORT-API',
    script: 'dist/server.js',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
    },
  }],
};

```

To start the service run the folowing lines:

```
pm2 start ecosystem.config.js
pm2 save
```

Now the accounts microservice is running as system service.

### Configure Nginx web server

To allow access the service from external,you must configure a new virtual host in the Nginx server:

```
nano /etc/nginx/sites-availables/api.report.com
```

With the following code:

```
upstream mod-report-api {
  server localhost:8080;
}

server {
  listen 80;
  listen [::]:80;
  server_name api.report.com;

  location / {
    proxy_pass http://mod-report-api/;
    proxy_http_version 1.1;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 600s;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Caller-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

And then enable the virtual host:

```
ln -s /etc/nginx/sites-available/api.report.com /etc/nginx/sites-enabled/api.report.com
```

To allow secure access to the service, use Let's Encrypt certificates. Certificates can be installed with the `certbot` tool:

```
certbot --nginx -d api.report.com
```

Now you can restart the Nginx server and test the microservice.
