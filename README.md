# KPC Store

KPC Store is a full-stack ecommerce website for selling computer parts, peripherals, and PC-related products. It includes a customer storefront, shopping cart, checkout flow, user accounts, product reviews, and an admin dashboard for managing products, categories, orders, subscribers, users, and uploaded product images.

The project is built as two separate applications:

- `frontend`: React + Vite single-page app
- `backend`: Laravel API with PostgreSQL support

## Features

- Browse products by category, hot products, new arrivals, and top sellers
- View product details, specifications, gallery images, ratings, and reviews
- Add products to a guest cart or authenticated user cart
- Register, log in, and manage account pages
- Place guest or authenticated orders
- Track account orders and confirm received orders
- Write reviews after completed orders
- Submit support requests and newsletter subscriptions
- Admin dashboard for product, category, order, subscriber, and user management
- Admin image uploads for products and categories

## Tech Stack

- React
- Vite
- React Router
- Laravel
- Laravel Sanctum
- PostgreSQL
- Docker for Render deployment

## Project Structure

```text
KPC-Store-main/
├── frontend/        React/Vite storefront
├── backend/         Laravel API
├── render.yaml      Render Blueprint for the backend and database
└── README.md        Project overview and hosting guide
```

## Local Setup

### Backend

From the `backend` folder:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The local API will usually run at:

```text
http://127.0.0.1:8000/api
```

### Frontend

From the `frontend` folder:

```bash
npm install
npm run dev
```

Create or update `frontend/.env`:

```text
VITE_API_URL=http://127.0.0.1:8000/api
```

The local frontend will usually run at:

```text
http://localhost:5173
```

## Deployment Overview

This project is prepared for two deploys:

- Vercel hosts the React/Vite frontend
- Render hosts the Laravel API and PostgreSQL database

## 1. Push the Project to GitHub

Both Vercel and Render can deploy from the same GitHub repository.

## 2. Deploy the Laravel API on Render

Render deploys PHP/Laravel apps with Docker. This repo includes:

- `backend/Dockerfile`
- `backend/.dockerignore`
- `backend/docker/entrypoint.sh`
- `render.yaml`

### Option A: Render Blueprint

1. Open Render.
2. Choose **New +** > **Blueprint**.
3. Connect this repository.
4. Use the `render.yaml` file from the repo root.
5. Review the services Render will create:
   - `kpc-store-db`
   - `kpc-store-api`
6. Generate an app key locally from the `backend` folder:

```bash
php artisan key:generate --show
```

7. Paste that value into Render as `APP_KEY`.
8. For `APP_URL`, use your Render API URL:

```text
https://kpc-store-api.onrender.com
```

9. For `FRONTEND_URL`, use your Vercel frontend URL after Vercel deploys:

```text
https://your-vercel-site.vercel.app
```

10. For `FRONTEND_URL_PATTERN`, use:

```text
^https:\/\/.*\.vercel\.app$
```

This allows Vercel preview and production URLs to call the Render API.

### Option B: Manual Render Setup

1. Create a Render PostgreSQL database.
2. Create a Render Web Service from this repo.
3. Set **Runtime** to Docker.
4. Set **Dockerfile Path** to:

```text
./backend/Dockerfile
```

5. Set **Docker Build Context Directory** to:

```text
./backend
```

6. Add these environment variables:

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

## 3. Deploy the React Frontend on Vercel

1. Open Vercel.
2. Choose **Add New** > **Project**.
3. Import the same GitHub repository.
4. Set **Root Directory** to:

```text
frontend
```

5. Confirm these build settings:

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

## 4. Connect Both Sides

After Vercel gives you the frontend URL, go back to Render and update:

```text
FRONTEND_URL=https://your-vercel-site.vercel.app
```

Then redeploy the Render API.

## Deployment Notes

- `frontend/vercel.json` makes browser refreshes work on React routes like `/products`, `/cart`, and `/account/orders`.
- The Render entrypoint runs migrations and seed data automatically on deploy.
- Uploaded admin images use Render's service filesystem. For long-term production use, move uploads to S3, Cloudinary, or another persistent file storage service.
- The checkout records payment details for admin review, but it does not process real payments.
