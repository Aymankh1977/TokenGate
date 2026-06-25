# TokenGateway - AI Token Gateway Platform

A unified, elegant payment gateway for AI APIs that enables developers to purchase and spend tokens across multiple AI providers (OpenAI, Anthropic, Cohere, etc.) through a single, seamless platform.

## 🎯 Overview

TokenGateway is a **production-ready AI token management platform** that solves the fragmentation problem in AI API access. Instead of managing multiple API keys and billing dashboards, developers get:

- **Single unified dashboard** for all AI API access
- **Prepaid token system** with transparent pricing
- **Multi-provider support** (OpenAI, Anthropic, Cohere, HuggingFace, Replicate, etc.)
- **Automatic token metering** based on actual API usage
- **Enterprise-grade security** with API key management
- **Admin analytics** for platform owners

## ✨ Key Features

### For Developers
✅ **Landing Page** - Elegant hero section explaining the platform
✅ **User Authentication** - Manus OAuth with protected routes
✅ **Token Dashboard** - Real-time balance and usage statistics
✅ **Token Wallet** - Transaction history and usage breakdown by service
✅ **Stripe Payments** - Credit card and crypto payment options
✅ **AI API Gateway** - Proxy for OpenAI, Anthropic, Cohere with automatic token metering
✅ **API Key Management** - Generate, view, and revoke API keys
✅ **Usage Analytics** - Detailed breakdown of token consumption per model

### For Platform Owners
✅ **Admin Panel** - User management and revenue analytics
✅ **Financial Dashboard** - Revenue metrics and profitability tracking
✅ **Provider Management** - Integration and revenue sharing configuration
✅ **Compliance & Audit** - Complete transaction logging and audit trails

## 💰 Business Model

**Arbitrage-based profitability:**
- Buy tokens from AI providers at wholesale rates ($0.00004/token)
- Sell to developers at retail rates ($0.009/token)
- **Gross margin: 98.9%** | **Net margin: 87.6%** (after operating costs)

**Revenue projections:**
- Year 1: $8.5M - $50M (depending on provider partnerships)
- Year 5: $1.25B per provider
- 5-year cumulative: $884M+ per provider

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend:** Express 4 + tRPC 11 + Node.js
- **Database:** MySQL with Drizzle ORM
- **Payments:** Stripe (credit card & crypto)
- **Authentication:** Manus OAuth
- **Hosting:** Autoscale (serverless)

### Project Structure
```
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # tRPC client setup
│   └── public/               # Static assets
├── server/                   # Express backend
│   ├── routers.ts           # tRPC procedure definitions
│   ├── db.ts                # Database queries
│   ├── ai-gateway.ts        # AI API proxy handler
│   ├── stripe-webhook.ts    # Payment webhook handler
│   └── _core/               # Core infrastructure
├── drizzle/                 # Database schema & migrations
├── shared/                  # Shared types & constants
└── references/              # Integration guides
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm
- MySQL database
- Stripe account
- Manus OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/Aymankh1977/TokenGate.git
cd TokenGate

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Start development server
pnpm dev

# Run tests
pnpm test
```

### Environment Variables
```
DATABASE_URL=mysql://user:password@localhost/tokengate
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts with token balances
- **transactions** - Token purchases and usage records
- **apiKeys** - User-generated API keys for gateway access
- **usageLogs** - Detailed API call logs with token consumption
- **modelPricing** - Pricing tiers for different AI models

## 🔌 Integrations

### AI Providers
- OpenAI (GPT-3.5, GPT-4, GPT-4o)
- Anthropic (Claude 3 family)
- Cohere (Command, Generate)
- HuggingFace (Inference API)
- Replicate (Model hosting)
- Groq (Ultra-fast inference)
- Mistral AI (Open-source models)
- Together AI (Model hosting)

### Payment Processing
- Stripe (credit card, debit card, crypto)
- Webhook handling for payment completion
- Automatic token balance updates

### Authentication
- Manus OAuth for user registration/login
- Session management with JWT
- Protected routes and procedures

## 📈 Pricing

### Token Packages
| Package | Tokens | Price | Per-Token Cost |
|---------|--------|-------|----------------|
| Starter | 10,000 | $100 | $0.01 |
| Growth | 20,000 | $180 | $0.009 (10% discount) |
| Professional | 50,000 | $400 | $0.008 (20% discount) |
| Enterprise | 100,000 | $700 | $0.007 (30% discount) |

### Model Pricing (Gateway Tokens)
- **GPT-3.5:** 1x input, 1x output
- **GPT-4o:** 1x input, 2x output
- **Claude 3 Sonnet:** 0.8x input, 1.6x output
- **Claude 3 Opus:** 1.5x input, 3x output

## 🎯 Go-to-Market Strategy

### Phase 1: MVP Launch (Month 1-3)
- Launch on Product Hunt
- Post on Hacker News
- Reach out to AI influencers
- Target: 100-500 developers

### Phase 2: Provider Partnerships (Month 3-6)
- Approach Anthropic, Cohere, Mistral
- Negotiate revenue share deals
- Target: 3-5 provider partnerships

### Phase 3: Enterprise Sales (Month 6-12)
- Target Fortune 500 companies
- Build enterprise features (SSO, audit logs)
- Target: 10-50 enterprise customers

### Phase 4: Scale (Year 2+)
- Expand to more providers
- Build white-label version
- Target: 100K+ developers

## 📚 Documentation

- **[PAYMENT_FLOW_AND_PROFIT_GUIDE.md](./PAYMENT_FLOW_AND_PROFIT_GUIDE.md)** - Complete payment flow and profit calculations
- **[PRICING_AND_IMPLEMENTATION_GUIDE.md](./PRICING_AND_IMPLEMENTATION_GUIDE.md)** - Token economics and implementation details
- **[WHY_PROVIDERS_HAVENT_DONE_THIS.md](./WHY_PROVIDERS_HAVENT_DONE_THIS.md)** - Market analysis and opportunity
- **[PROVIDERS_AND_CUSTOMERS_TO_APPROACH.md](./PROVIDERS_AND_CUSTOMERS_TO_APPROACH.md)** - Outreach strategy and contact list
- **[provider_pitch_slides.md](./provider_pitch_slides.md)** - Presentation content for providers

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test server/auth.logout.test.ts
```

## 🔐 Security

- **API Key Management:** Secure key generation and revocation
- **Token Metering:** Tamper-proof token consumption tracking
- **Payment Security:** PCI-compliant Stripe integration
- **Authentication:** OAuth 2.0 with JWT sessions
- **Database:** Encrypted sensitive fields
- **Rate Limiting:** Per-user and per-API rate limits

## 📊 Analytics & Monitoring

- Real-time usage dashboard
- Revenue tracking by provider
- Customer acquisition metrics
- API performance monitoring
- Error tracking and alerting

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Live Demo

**Platform URL:** https://aitokengate-92jpnneq.manus.space

**Test Credentials:**
- Use Manus OAuth to sign up
- Stripe test card: 4242 4242 4242 4242

## 💬 Support

For questions, issues, or partnership inquiries:
- Email: support@tokengate.dev
- GitHub Issues: [Create an issue](https://github.com/Aymankh1977/TokenGate/issues)
- Twitter: [@TokenGateway](https://twitter.com/tokengateway)

## 🎉 Acknowledgments

Built with:
- React, Express, tRPC, Tailwind CSS
- Stripe for payment processing
- Manus for OAuth and infrastructure
- shadcn/ui for component library

---

**Made with ❤️ by the TokenGateway team**

*The future of AI API access is unified, transparent, and profitable.*
