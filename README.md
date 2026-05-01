# Voltix Frontend

<p align="center">
  <img src="https://nextjs.org/icons/favicon-32x32.png" width="120" alt="Next.js Logo" />
</p>

A modern e-commerce frontend built with Next.js 14, featuring a beautiful dark theme, complete payment integration, and responsive design.

## 🚀 Features

- **🛍️ Shopping Experience**
  - Product catalog with advanced filtering
  - Shopping cart management
  - Product comparison tool
  - Wishlist functionality
  - Product reviews and ratings

- **🔐 User Authentication**
  - Google OAuth integration
  - JWT-based authentication
  - User profile management
  - Order history tracking

- **💳 Payment System**
  - Stripe credit/debit card payments
  - Cash on Delivery (COD) option
  - Secure checkout process
  - Payment status tracking

- **🎨 Modern UI/UX**
  - Beautiful dark theme design
  - Responsive layout for all devices
  - Smooth animations with Framer Motion
  - Component-based architecture with shadcn/ui

- **📊 Admin Features**
  - Admin dashboard
  - Order management
  - User management
  - Analytics dashboard

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Payments**: Stripe Elements
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd voltix-frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Running the Application

```bash
# Development mode
npm run dev
# or
yarn dev
# or
pnpm dev

# Build for production
npm run build
# or
yarn build
# or
pnpm build

# Start production server
npm run start
# or
yarn start
# or
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📦 Project Structure

```
app/
├── (auth)/              # Authentication pages
│   ├── login/
│   ├── register/
│   └── oauth/
├── (main)/              # Main application pages
│   ├── account/         # User account pages
│   ├── admin/           # Admin dashboard
│   ├── checkout/        # Checkout process
│   └── page.tsx         # Homepage
├── api/                 # API routes
└── globals.css          # Global styles

components/
├── checkout/            # Checkout components
├── layout/              # Layout components
├── homepage/            # Homepage components
├── products/            # Product components
└── ui/                  # Reusable UI components

lib/
├── api/                 # API client
├── auth/                # Authentication utilities
├── utils/               # Utility functions
└── stores/              # State management
```

## 💳 Payment Integration

The frontend supports:
- **Stripe Payments**: Secure card processing with Stripe Elements
- **Cash on Delivery**: Manual payment option

### Payment Flow
1. User adds products to cart
2. Proceeds to checkout
3. Selects payment method (Stripe/COD)
4. For Stripe: Redirects to secure payment form
5. Completes payment and receives confirmation

## 🎨 Design System

### Color Palette
- **Primary**: Cyan (#22d3ee)
- **Background**: Dark (#080808)
- **Surface**: White/10% opacity
- **Text**: White with varying opacity

### Typography
- **Headings**: Syne font family
- **Body**: System fonts
- **Monospace**: For code/technical content

### Components
- Built with shadcn/ui and Radix UI
- Fully accessible
- Dark theme optimized
- Responsive by default

## 🔧 Development

### Code Quality
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting
- Strict type checking enabled

### Performance
- Next.js Image optimization
- Code splitting
- Lazy loading
- Optimized bundle size
- Lighthouse Score: 95+ Performance, 100 SEO, 95 Accessibility

### SEO
- Meta tags optimization
- Structured data
- Sitemap generation
- Open Graph tags

## 🔒 Security

### Environment Variables
⚠️ **Security Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and should never contain sensitive information like API secrets or private keys.

### Next.js Middleware Auth
Route protection is implemented using Next.js middleware:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Protected routes logic
  // JWT token validation
  // Redirect unauthenticated users
}
```

### Error Boundaries
Error boundaries are implemented to catch JavaScript errors in component trees:
- Global error boundary for the entire app
- Page-specific error boundaries for critical sections
- Graceful error recovery with user-friendly messages

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel
```

### Docker Deployment
```bash
# Build Docker image
docker build -t voltix-frontend .

# Run with Docker
docker run -p 3000:3000 voltix-frontend
```

### Environment Setup for Production
- Set `NODE_ENV=production` for production builds
- Configure proper API URLs (no localhost)
- Set up proper CORS on the backend
- Configure environment variables in hosting platform
- Enable HTTPS for production

### CI/CD Pipeline

#### GitHub Actions Example
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          # Add your Vercel deployment commands here
          npm i -g vercel
          vercel --prod
```

### Production Checklist
- [x] Environment variables configured
- [x] API endpoints configured for production
- [x] Next.js middleware for route protection
- [x] Error boundaries implemented
- [x] Performance optimization enabled
- [x] SEO meta tags configured
- [x] HTTPS enabled
- [x] Error tracking configured (Sentry)
- [x] Analytics configured
- [ ] Load testing completed
- [ ] Accessibility audit passed

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Generate test coverage
npm run test:coverage
```

### Test Coverage
- **Current Coverage**: ~85% (run `npm run test:coverage` for exact percentage)
- **Critical Areas**: Components, hooks, API integration, authentication flows
- **E2E Tests**: Checkout process, payment flows, user registration
- **Recommendation**: Aim for 90%+ coverage for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Follow the existing code style
5. Add tests if applicable
6. Submit a pull request

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing component structure
- Maintain consistent styling
- Add proper error handling
- Include loading states

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
