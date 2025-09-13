# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GST Compliance Dashboard - a comprehensive solution for Indian SMEs to manage GST compliance. The repository contains the Next.js frontend application with comprehensive planning documentation in the `docs/` folder.

## Documentation

The `docs/` folder contains comprehensive project documentation:
- `docs/gst-compliance-dashboard-deepdive.md` - Complete product requirements and market analysis
- `docs/TECHNICAL_ROADMAP.md` - Detailed technical implementation guide

### Planning Document Overview

The project blueprint includes:
- Complete product requirements and market analysis
- Technical architecture specifications
- Development roadmap and monetization strategy
- Detailed feature specifications for GST compliance tools

## Architecture Summary

The planned system follows a microservices architecture:

- **Frontend**: React/Next.js with PWA capabilities for offline support
- **Backend**: Node.js/Express with microservices (Filing, Reconciliation, Analytics, Notifications)
- **Database**: PostgreSQL with Redis caching
- **Infrastructure**: Containerized deployment on AWS/GCP with Kubernetes
- **Integration**: GSTN APIs for official GST portal connectivity

## Key Features to be Implemented

1. **Smart Dashboard**: Real-time GST liability tracking and compliance health monitoring
2. **Automated Filing**: GSTR-1, GSTR-3B, and GSTR-9 return filing with validation
3. **ITC Reconciliation**: Automated matching of purchase invoices with GSTR-2A/2B
4. **E-Invoice Integration**: Bulk IRN generation and e-way bill management
5. **Multi-language Support**: Regional language support for Indian SMEs
6. **AI Assistant**: Intelligent GST rate finder and compliance guidance

## Development Phases

- **Phase 1 (Months 1-3)**: MVP with core dashboard and basic filing
- **Phase 2 (Months 4-6)**: Advanced reconciliation and mobile PWA
- **Phase 3 (Months 7-12)**: AI features and enterprise scaling

## Important Considerations

- **Security**: Must implement AES-256 encryption and comply with DPDP Act 2023
- **GSTN Integration**: All GST portal integrations require OAuth 2.0 with proper rate limiting
- **Offline Support**: Critical for users with unreliable internet connectivity
- **Regional Compliance**: Must support multiple Indian languages and local tax nuances

## Target Market

- Primary: Indian SMEs with ₹5-50 crore turnover
- Pain points: Complex GST compliance, expensive existing solutions, language barriers
- Positioning: 70% cheaper than existing solutions like TallyPrime/ClearTax

## Development Reference

**Technical Implementation Guide**: See `docs/TECHNICAL_ROADMAP.md` for comprehensive development plan including:
- Technology stack decisions and rationale
- Project structure and architecture
- 12-week development phases
- Performance and security considerations
- Deployment and DevOps strategy

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm install` - Install dependencies

## Project Structure

This is the frontend repository. The backend will be maintained separately for clean separation of concerns.

## Documentation Maintenance

**IMPORTANT**: Claude Code must maintain the development documentation throughout the project lifecycle.

### Development Log Updates
The `docs/DEVELOPMENT_LOG.md` file MUST be updated in these scenarios:
1. **After completing each major feature** (dashboard, forms, integrations)
2. **After every 3-5 significant commits** (new components, major fixes)
3. **When encountering and solving complex issues** (layout problems, integration challenges)
4. **After each development phase completion** (Week 1, Week 2, etc.)
5. **When making architectural decisions** (technology choices, design patterns)

### Update Guidelines
When updating `DEVELOPMENT_LOG.md`:
- Add new entries to the **Development Timeline** section chronologically
- Document **both successful implementations and failed attempts**
- Include **code snippets** for important fixes or implementations
- Record **scrapped ideas** with reasons in the appropriate section
- Update **Current Architecture** section when structure changes
- Maintain **Next Development Steps** with current priorities
- Update the **Last Updated** timestamp

### Commit Messages for Documentation
Use these patterns for documentation commits:
- `docs: update development log with [feature/fix name]`
- `docs: record Week [X] completion and next steps`
- `docs: document [specific issue] resolution and learnings`

### Quality Standards
- Keep entries concise but comprehensive
- Include file paths and component names for reference
- Document the "why" behind decisions, not just "what" was done
- Maintain the technical level appropriate for future developers
- Use consistent formatting and structure

### Current Implementation Status

**Phase 1 Complete (Week 1-2):**
- ✅ Next.js 14 project with TypeScript and Material-UI v5
- ✅ Complete folder structure following the technical roadmap
- ✅ Core dependencies fully configured (MUI, Redux Toolkit, React Hook Form, Zod, Recharts)
- ✅ Configuration files (ESLint, Prettier, TypeScript)
- ✅ Custom MUI theme with GST branding
- ✅ Responsive sidebar navigation with 7 main sections
- ✅ Top navigation with user menu and notifications
- ✅ Loading states and comprehensive error boundaries
- ✅ Breadcrumb navigation system
- ✅ Form component library (5 reusable components)
- ✅ Placeholder pages for all navigation routes

**Phase 2 Complete (Week 3-4):**
- ✅ Interactive charts with Recharts (4 chart types)
- ✅ Complete Redux data flow with async thunks
- ✅ Mock API system with realistic network simulation
- ✅ Dashboard widgets configurability system
- ✅ Fixed layout system (sidebar remains fixed, content scrolls)
- ✅ Professional UI with configurable widgets
- ✅ Real-time data visualization and state management

**Ready for Phase 3 (Week 5-8):**
- 🔄 GSTR-1 filing interface with step-by-step workflow
- 🔄 GSTR-3B filing interface with validation
- 🔄 ITC reconciliation engine
- 🔄 Invoice management system

### Key Files Structure
```
src/
├── app/                     # Next.js App Router pages
│   ├── dashboard/          # Enhanced configurable dashboard
│   ├── filing/             # GST filing pages (GSTR-1, GSTR-3B, GSTR-9)
│   └── [other routes]/     # Reconciliation, invoices, analytics, etc.
├── components/             # Comprehensive component library
│   ├── charts/            # Interactive Recharts components
│   ├── forms/             # Reusable form component library
│   ├── layouts/           # Fixed layout system (Sidebar, TopNav)
│   └── ui/                # UI components (Widgets, Loading, Error, Breadcrumbs)
├── lib/                   # Utilities and configurations
│   ├── api/               # Mock API system with multiple scenarios
│   ├── constants/         # GST rates and app constants
│   ├── theme/             # Custom MUI theme
│   └── utils/             # GST-specific helper functions
├── store/                 # Redux Toolkit store
│   └── slices/           # Dashboard and Widget state management
└── types/                 # Comprehensive TypeScript definitions
```