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

**Completed:**
- ✅ Next.js 14 project with TypeScript and Tailwind CSS
- ✅ Basic folder structure following the technical roadmap
- ✅ Core dependencies (MUI, Redux Toolkit, React Hook Form, Zod)
- ✅ Configuration files (ESLint, Prettier, TypeScript)
- ✅ Basic dashboard page with placeholder content
- ✅ Type definitions for core entities
- ✅ Utility functions and constants
- ✅ Redux store setup (empty, ready for slices)

**Next Steps (Phase 1 - Week 1-2):**
- 🔄 Set up MUI theme and provider
- 🔄 Create responsive sidebar navigation
- 🔄 Implement top navigation with user menu
- 🔄 Add loading states and error boundaries
- 🔄 Create authentication layout

### Key Files Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable components (empty, ready)
├── lib/                # Utilities and configurations
│   ├── constants/      # App constants and GST rates
│   └── utils/          # Helper functions
├── store/              # Redux store (configured, empty)
├── types/              # TypeScript definitions
└── styles/             # Global styles
```