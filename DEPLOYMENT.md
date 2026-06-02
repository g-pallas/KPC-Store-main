# KPC Store Deployment

This project is split into two deploys:

- `frontend`: React/Vite app hosted on Vercel
- `backend`: Laravel API hosted on Render

## 1. Push the project to GitHub

Both Vercel and Render can deploy from the same GitHub repository.

## 2. Deploy the Laravel API on Render

Render deploys PHP/Laravel apps with Docker. This repo includes `backend/Dockerfile`, `backend/.dockerignore`, and `backend/docker/entrypoint.sh` for that.

### Option A: Render Blueprint

1. Open Render.
2. Choose **New +** > **Blueprint**.
3. Connect this repository.
4. Select the `render.yaml` file from the repo root.
5. Create the services.
6. Render will ask for `APP_KEY`. Generate one locally from the `backend` folder:

```bash
php artisan key:generate --show
```

7. After Render creates the API service, copy its public URL. It will look like:

```text
https://kpc-store-api.onrender.com
```

8. In the Render API service environment variables, set:

```text
APP_URL=https://your-render-api-url.onrender.com
FRONTEND_URL=https://your-vercel-site.vercel.app
FRONTEND_URL_PATTERN=^https:\/\/.*\.vercel\.app$
```

Use the real Vercel URL after the frontend is deployed.

### Option B: Manual Render setup

1. Create a Render PostgreSQL database.
2. Create a Render Web Service from this repo.
3. Set **Root Directory** to:

```text
backend
```

4. Set **Runtime** to Docker.
5. Set **Dockerfile Path** to:

```text
./backend/Dockerfile
```

6. Set **Docker Build Context Directory** to:

```text
./backend
```

7. Add the same environment variables shown in the Blueprint section, plus the database variables from your Render PostgreSQL database:

```text
APP_NAME=KPC Store
APP_ENV=production
APP_KEY=base64:your-generated-laravel-key
APP_DEBUG=false
APP_URL=https://your-render-api-url.onrender.com
FRONTEND_URL=https://your-vercel-site.vercel.app
FRONTEND_URL_PATTERN=^https:\/\/.*\.vercel\.app$
LOG_CHANNEL=stderr
LOG_LEVEL=info
DB_CONNECTION=pgsql
DB_HOST=your-render-db-host
DB_PORT=5432
DB_DATABASE=your-render-db-name
DB_USERNAME=your-render-db-user
DB_PASSWORD=your-render-db-password
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=public
```

Generate `APP_KEY` locally from the `backend` folder with:

```bash
php artisan key:generate --show
```

## 3. Deploy the React frontend on Vercel

1. Open Vercel.
2. Choose **Add New** > **Project**.
3. Import the same GitHub repository.
4. Set **Root Directory** to:

```text
frontend
```

5. Vercel should detect Vite automatically. Confirm these settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

6. Add this Vercel environment variable:

```text
VITE_API_URL=https://your-render-api-url.onrender.com/api
```

7. Deploy.

## 4. Connect both sides

After Vercel gives you the frontend URL, go back to Render and update:

```text
FRONTEND_URL=https://your-vercel-site.vercel.app
```

Then redeploy the Render API.

## Notes

- The `frontend/vercel.json` file makes browser refreshes work on React routes like `/products` and `/cart`.
- The Render start command runs migrations automatically on deploy.
- Uploaded admin images use Render's filesystem. For long-term production use, move uploads to S3 or another persistent file storage service.
