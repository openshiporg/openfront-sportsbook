# Openfront Sportsbook

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopenshiporg%2Fopenfront-sportsbook&env=DATABASE_URL%2CSESSION_SECRET)

Openfront Sportsbook is a self-hostable sportsbook development and operator application. Customer screens cover sports, events, markets, betslips, accounts, wallets, and wager history. Operators manage trading, risk, grading, settlement, finance, responsible gaming, compliance, and provider workflows. Sandbox use is not authorization to accept real-money wagers.

## Demo

Explore the application locally using the setup instructions below.

| | |
|---|---|
| **Public application** | `/` on your development URL |
| **Dashboard** | `/dashboard` on your development URL |

[Learn more →](https://openship.org/products/openfront-sportsbook)

[Documentation →](features/keystone/models)

## The Openfront Ecosystem

Openfront is part of an ecosystem of open-source commerce tools:

- **[Openfront E-commerce](https://github.com/openshiporg/openfront)**: Headless e-commerce for retail.
- **[Openfront Restaurant](https://github.com/openshiporg/openfront-restaurant)**: Restaurant ordering, point of sale, and kitchen operations.
- **[Openship](https://github.com/openshiporg/openship)**: Order routing for multi-channel fulfillment.
- **Openfront Sportsbook**: (This repository) a self-hostable sportsbook development and operator application.

## Core Features

### Admin Dashboard
Manage platform through dedicated dashboard workspaces and permission-controlled data screens.

### Storefront
Public routes include `/sports/[sport]/[competition]`, `/events/[event]`, `/betslip`, promotions, and account pages for bets, wallet, limits, disputes, and responsible play.

### Sports Catalog & Wagering
Manage sports, competitions, events, markets, selections, prices, quotes, betslips, wagers, and immutable wager terms.

### Trading, Risk & Settlement
Operate trading and exposure workspaces, record results and grading, settle and resettle wagers, and manage journal entries, holds, reconciliation, and recovery.

### Safer Play & Provider Operations
Manage identity and location evidence, player limits, self-exclusion, approvals, incidents, support, provider inbox/outbox, retries, and dead letters. Production use requires licences, approved providers, legal review, and jurisdiction-specific controls.

## Architecture

### Technology Stack
- **Frontend**: Next.js 16 with App Router and React 19.
- **Backend**: KeystoneJS 8 with a GraphQL API.
- **Database**: PostgreSQL with Prisma ORM.
- **Styling**: Tailwind CSS 4 and shared shadcn/ui components.
- **Authentication**: Password-based user accounts and session-based access with role capabilities.

### Application Structure
```text
openfront-sportsbook/
├── app/                    # Public pages, dashboard routes, and HTTP endpoints
├── features/
│   ├── keystone/           # Backend models, access rules, and GraphQL workflows
│   ├── platform/           # Operator workspaces and onboarding
│   ├── storefront/         # Public application components and screens
│   └── dashboard/          # Authentication and shared dashboard shell
└── components/             # Shared UI components
```

### Data Models
The [model registry](features/keystone/models/index.ts) and [Prisma schema](schema.prisma) cover:

- Tenants, brands, jurisdictions, operators, players, and roles.
- Sports, competitions, events, markets, selections, prices, quotes, and wagers.
- Wallet ledger accounts, journals, holds, payments, settlements, and reconciliation.
- Player limits, self-exclusions, approvals, provider connections, inbox/outbox, audit events, and recovery records.

## Getting Started

### Prerequisites
- Node.js 22, compatible with the [package requirements](package.json) and Next.js 16.
- A PostgreSQL database you can migrate.
- npm.

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/openshiporg/openfront-sportsbook.git
   cd openfront-sportsbook
   npm install
   ```

2. **Configure environment variables:**
   Create a local `.env` file using the [runtime configuration](features/sportsbook/operations/validate-env.ts) as the authority.

   ```env
   DATABASE_URL=postgresql://user:password@host/database
   SESSION_SECRET=replace-with-a-new-private-random-secret
   ```

   Generate the session secret with `openssl rand -hex 32`; use the generated value, not the placeholder. Never commit `.env`.

   Review [runtime configuration](features/sportsbook/operations/validate-env.ts) for additional application settings before building or deploying. Configure enabled integrations separately; the two values above are not a complete production configuration.

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The development script prepares the backend schema, applies checked-in migrations, and starts Next.js.

4. **Access the application:**
   Open the URL `npm run dev` prints, then use these paths:

   - **Public application**: `/`
   - **Admin dashboard**: `/dashboard`
   - **GraphQL API**: `/api/graphql`

5. **Create your first admin user:**
   Visit `/dashboard/init` on an empty database. The [initial-user resolver](features/keystone/mutations/createInitialUser.ts) delegates to the controlled operator-admin bootstrap workflow rather than Keystone's generic initial-user resolver.

6. **Run application onboarding:**
   Use sportsbook onboarding to establish the operator context, then review tenant and jurisdiction settings, MFA, catalog, player controls, and provider connections. Keep evaluation isolated from real-money operations.

## Development Commands

- `npm run dev` - Prepare the backend schema, apply migrations, and start Next.js development.
- `npm run build` - Build the backend and Next.js for production; does not apply migrations.
- `npm start` - Validate production configuration and start Next.js.
- `npm run migrate:gen` - Prepare the schema and generate/apply development migrations.
- `npm run migrate` - Apply checked-in Prisma migrations.
- `npm run lint` - Run the repository's ESLint script.
- `npm run typecheck` - Run the configured TypeScript check.
- `npm run test` - Run the repository's configured test suite.
- `npm run validate:env` - Validate the sportsbook runtime configuration.
- `npm run worker` - Run the application's background worker.

Use a disposable development database for migration generation. Review the script before running it against any existing data.

### Provider & Worker Integration
The [sportsbook implementation](features/sportsbook) owns provider adapters, durable delivery, recovery, and operational controls. Run `npm run worker` as a separate long-running process. Review [production validation](features/sportsbook/operations/validate-env.ts) before deployment; sandbox settings do not authorize live wagering.

## Documentation

The [backend models](features/keystone/models), [registered business workflows](features/keystone/mutations/index.ts), [access rules](features/keystone/access.ts), and [application routes](app) document the implementation in this repository.

## Security & Permissions

### Role-Based Access Control
- `canAccessDashboard` - Access dashboard.
- `canTrade` - Trade.
- `canManageRisk` - Manage risk.
- `canManageCompliance` - Manage compliance.
- `canManageFinance` - Manage finance.
- `canApproveSensitiveActions` - Approve sensitive actions.
- `canReadAudit` - Read audit.

### Security Features
- Session-based authentication for signed-in users.
- Backend list access and workflow authorization, rather than dashboard visibility alone.
- Current operator permission checks require tenant scope and operator MFA assurance where specified. Player access, operator authority, and sensitive-action approvals are separate boundaries.

Review the [access implementation](features/keystone/access.ts) and individual workflow checks before extending permissions.

## Platform Components

### Admin Platform (`/dashboard`)
- **Platform**: `/dashboard/platform`.

### Storefront Experience
Public routes include `/sports/[sport]/[competition]`, `/events/[event]`, `/betslip`, promotions, and account pages for bets, wallet, limits, disputes, and responsible play.

Manage sports, competitions, events, markets, selections, prices, quotes, betslips, wagers, and immutable wager terms.

## Deployment

### Production Deployment
The Vercel button imports this application's own repository. Provision PostgreSQL and configure the application's complete runtime requirements, storage, mail, and enabled providers before building. Importing the source does not configure these services or grant regulatory approval.

Build the application and apply checked-in migrations as a release step before starting the server. Back up existing data before migration.

```bash
npm run build
npm run migrate
npm start
```

The included [Railway configuration](railway.toml) defines this app's build and startup lifecycle. Provision services and secrets separately.

### Scaling Considerations
Run `npm run worker` under a supervisor and retain shared database, provider delivery, ledger, and tenant-scope controls. Production validation also requires the operational security and observability configuration described in the source.

## Contributing

Use the development commands above when preparing changes. Keep model changes and their migrations together, and describe workflow and permission changes in pull requests.

## License

No top-level license file or package license declaration is included in this repository.

## Support

- **Documentation**: [Source models and workflows](features/keystone/models).
- **Issues**: [Report bugs and feature requests](https://github.com/openshiporg/openfront-sportsbook/issues).
- **Product**: [Learn more about Openfront Sportsbook](https://openship.org/products/openfront-sportsbook).

---

Built with [Next.js](https://nextjs.org) and [KeystoneJS](https://keystonejs.com).
