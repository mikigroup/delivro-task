# Delivro Dashboard

Test application created by **Jiří Mika** for managing invoices and shipments.

## Application Description

The dashboard enables:
- 📤 Uploading JSON files with invoice data
- 👁️ Previewing data before confirming upload
- 📊 Displaying all shipments with the latest invoice information
- 🔍 Filtering shipments by company
- 📈 Viewing price history for each shipment
- 🌐 Support for Czech and English (i18n)

The application is connected to a **Supabase database** (PostgreSQL) for data storage and management.

## Requirements

- Node.js 18+
- npm or yarn
- Supabase account

## Installation and Setup

1. **Install dependencies**

```bash
npm install
```

2. **Supabase Setup**

   a. Create a project on [Supabase](https://supabase.com)
   
   b. Run the migration script from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
   
   c. Copy the project URL and API keys from Settings > API

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Technologies

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Tables**: TanStack Table
- **i18n**: next-intl

## Database Schema

The application uses three main tables:
- `companies` - Companies
- `shipments` - Shipments
- `invoices` - Invoices (with history)

All invoices are stored to preserve history, the dashboard displays only the latest invoice for each shipment.

## Production Build

```bash
npm run build
npm start
```

## Docker

The application is ready to run in a Docker container.

### Requirements

- Docker 20.10+
- Docker Compose 2.0+ (optional)

### Running with Docker Compose (recommended)

1. **Create `.env.local` file** with environment variables (see "Configure environment variables" section)

2. **Start the application**:

```bash
docker-compose up -d
```

The application will be available at [http://localhost:3000](http://localhost:3000)

3. **Stop the application**:

```bash
docker-compose down
```

### Running with Docker directly

1. **Build Docker image**:

```bash
docker build -t delivro-dashboard .
```

2. **Run the container**:

```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env.local \
  --name delivro-dashboard \
  delivro-dashboard
```

3. **Stop the container**:

```bash
docker stop delivro-dashboard
docker rm delivro-dashboard
```

### Docker Image Details

- **Base image**: `node:20-alpine` (lightweight Alpine Linux)
- **Multi-stage build**: Optimized for minimal size
- **Standalone output**: Next.js standalone mode for efficient production build
- **Non-root user**: Application runs as non-root user for security

## Notes

- The application does not include authentication (internal use)
- Existing shipments are automatically updated by `shipment.id` on upload
- The application is optimized for working with large amounts of data using pagination
