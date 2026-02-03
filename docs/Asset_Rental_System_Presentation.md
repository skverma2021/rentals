# Asset Rental System
## Project Presentation - SDLC Approach

---

# Slide 1: Project Overview

## 🏢 Asset Rental System

**A comprehensive web application for managing rental assets, customers, and their relationships**

### Key Highlights:
- **Technology Stack**: Next.js 16 + Prisma 7 + SQLite
- **Architecture**: Full-stack TypeScript application
- **Purpose**: Track assets, customers, rentals, conditions, and valuations

### Project Goals:
✅ Centralized asset management  
✅ Customer relationship tracking  
✅ Rental agreement management  
✅ Asset condition & value history  
✅ File attachment support  

---

# Slide 2: Strategy Phase

## 📋 Business Strategy & Vision

### Problem Statement:
Organizations need an efficient way to:
- Track physical assets available for rental
- Manage customer information and relationships
- Record rental agreements with pricing
- Monitor asset conditions over time
- Maintain asset valuation history

### Strategic Objectives:
| Objective | Description |
|-----------|-------------|
| **Centralization** | Single source of truth for all asset data |
| **Traceability** | Complete history of asset conditions & values |
| **Efficiency** | Streamlined customer-asset rental workflow |
| **Scalability** | Modern tech stack for future growth |

### Target Users:
- Asset managers
- Rental coordinators
- Finance/accounting teams

---

# Slide 3: Requirements Phase

## 📝 Functional Requirements

### Core Features:

| Module | Requirements |
|--------|--------------|
| **Asset Management** | CRUD operations, specifications, categories, manufacturers |
| **Customer Management** | Full customer profiles with contact details |
| **Rental Tracking** | Asset-customer assignments with monthly rates |
| **Condition Tracking** | Record asset conditions with timestamps |
| **Value Tracking** | Historical value records for depreciation |
| **File Attachments** | Document storage for assets and customers |

### Non-Functional Requirements:
- **Performance**: Fast page loads with optimized queries
- **Usability**: Intuitive 3-column layout for data management
- **Maintainability**: Clean code architecture with TypeScript
- **Reliability**: SQLite database with Prisma ORM

### User Stories:
1. *As an asset manager, I want to add new assets with full specifications*
2. *As a coordinator, I want to assign assets to customers with rental rates*
3. *As a finance user, I want to track asset value changes over time*

---

# Slide 4: Analysis Phase

## 🔍 System Analysis

### Data Entity Analysis:

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                      │
├─────────────────────────────────────────────────────────────┤
│  assetCategory ──┬── assetSpec ──── assets ─┬── assetFile   │
│  manufacturer ───┘                          ├── assetCurrentCondition
│                                             ├── assetCurrentValue
│                                             └── assetWithCustomer
│                                                      │
│                                             customers ─── customerFile
│                                                      │
│                               definedCondition ──────┘
└─────────────────────────────────────────────────────────────┘
```

### Key Relationships:
- **One-to-Many**: Category → Specs → Assets
- **Many-to-Many**: Assets ↔ Customers (via assetWithCustomer)
- **History Tables**: Conditions & Values with timestamps

### Process Flows:
1. **Asset Creation**: Category → Manufacturer → Spec → Asset
2. **Rental Process**: Select Customer → Select Asset → Set Rate → Create Rental
3. **Condition Recording**: Select Asset → Select Condition → Record Date

---

# Slide 5: Design - Backend Architecture

## ⚙️ Backend Design

### Technology Choices:

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Runtime** | Next.js 16 App Router | Server-side rendering, API routes |
| **ORM** | Prisma 7.3.0 | Type-safe database access |
| **Database** | SQLite | Lightweight, zero-config |
| **Driver** | better-sqlite3 | Synchronous, fast SQLite driver |
| **Language** | TypeScript 5.9 | Type safety, better DX |

### Database Schema (11 Models):

```
┌────────────────────┐  ┌────────────────────┐
│   assetCategory    │  │   manufacturer     │
│ - id, description  │  │ - id, description  │
└─────────┬──────────┘  └─────────┬──────────┘
          │                       │
          └───────────┬───────────┘
                      ▼
           ┌──────────────────────┐
           │     assetSpec        │
           │ - model, yearMake    │
           │ - description        │
           └──────────┬───────────┘
                      ▼
           ┌──────────────────────┐
           │       assets         │
           │ - purchasePrice      │
           │ - acquiredDate       │
           └──────────┬───────────┘
                      │
     ┌────────────────┼────────────────┐
     ▼                ▼                ▼
┌─────────┐    ┌───────────┐    ┌─────────────┐
│assetFile│    │ Conditions│    │assetWith    │
│         │    │ & Values  │    │Customer     │
└─────────┘    └───────────┘    └──────┬──────┘
                                       ▼
                                ┌─────────────┐
                                │  customers  │
                                │- name, email│
                                │- address    │
                                └─────────────┘
```

### API Endpoints:

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/assets` | GET, POST | Asset CRUD |
| `/api/customers` | GET, POST | Customer CRUD |
| `/api/asset-rentals` | GET, POST | Rental management |
| `/api/asset-current-conditions` | GET, POST | Condition history |
| `/api/asset-current-values` | GET, POST | Value history |
| `/api/asset-files`, `/api/customer-files` | GET, POST | File uploads |

---

# Slide 6: Design - Frontend Architecture

## 🎨 Frontend Design

### UI/UX Principles:

| Principle | Implementation |
|-----------|----------------|
| **Consistency** | Uniform styling across all pages |
| **Efficiency** | 3-column layouts for CRUD operations |
| **Feedback** | Success/error messages for all actions |
| **Navigation** | Global navbar with active state indicators |

### Page Structure:

```
┌─────────────────────────────────────────────────────────┐
│                    GLOBAL NAVBAR                         │
│  🏠 Home  │  📦 Assets  │  👥 Customers  │  📊 Conditions │
└─────────────────────────────────────────────────────────┘
                            │
     ┌──────────────────────┼──────────────────────┐
     ▼                      ▼                      ▼
┌─────────┐          ┌─────────────┐         ┌──────────┐
│  HOME   │          │   ASSETS    │         │ CUSTOMERS│
│Dashboard│          │ 3-col CRUD  │         │ 3-col    │
│  Cards  │          │   Layout    │         │  Layout  │
└─────────┘          └─────────────┘         └──────────┘
```

### 3-Column Layout Pattern:

```
┌────────────┬────────────┬────────────┐
│   COLUMN 1 │  COLUMN 2  │  COLUMN 3  │
│            │            │            │
│    FORM    │    LIST    │   DETAILS  │
│  (Create/  │  (Browse)  │  (Selected │
│   Edit)    │            │   Item)    │
│            │            │            │
└────────────┴────────────┴────────────┘
```

### Component Architecture:
- **Navbar**: Global navigation with active state
- **Page Components**: Self-contained with styled-jsx
- **Forms**: Controlled components with validation
- **Lists**: Clickable cards with badges

---

# Slide 7: Implementation - Database Layer

## 🗄️ Database Implementation

### Prisma Schema Highlights:

```prisma
// Core Asset Model
model assets {
  id            Int       @id @default(autoincrement())
  specId        Int
  acquiredDate  DateTime
  purchasePrice Float
  assetSpec     assetSpec @relation(...)
  attachments   assetFile[]
  assetCurrentCondition assetCurrentCondition[]
  assetCurrentValue     assetCurrentValue[]
  assetWithCustomer     assetWithCustomer[]
}

// Customer Model
model customers {
  id            Int       @id @default(autoincrement())
  firstName     String
  lastName      String
  emailId       String    @unique
  mobilePhone   String    @unique
  attachments   customerFile[]
  assetWithCustomer assetWithCustomer[]
}

// Rental Junction Table
model assetWithCustomer {
  id           Int       @id @default(autoincrement())
  assetId      Int
  customerId   Int
  ratePerMonth Float
  fromDate     DateTime
}
```

### Database Features:
- ✅ Auto-incrementing IDs
- ✅ Unique constraints (email, phone)
- ✅ Timestamp tracking (createdAt)
- ✅ Cascading relations
- ✅ File metadata storage

### Prisma Client Setup:
```typescript
// Using Prisma 7 with better-sqlite3 driver adapter
import { PrismaClient } from "@/generated/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("prisma/dev.db");
const adapter = new PrismaBetterSQLite3(sqlite);
const prisma = new PrismaClient({ adapter });
```

---

# Slide 8: Implementation - API & Features

## 🔌 API Implementation

### RESTful API Pattern:

```typescript
// Example: Customers API Route
// GET /api/customers - List all customers
export async function GET() {
  const customers = await prisma.customers.findMany({
    include: {
      attachments: true,
      assetWithCustomer: {
        include: { assets: { include: { assetSpec: true } } }
      }
    }
  });
  return NextResponse.json(customers);
}

// POST /api/customers - Create customer
export async function POST(request: Request) {
  const data = await request.json();
  const customer = await prisma.customers.create({ data });
  return NextResponse.json(customer, { status: 201 });
}
```

### Implemented API Routes:

| Route | Description | Status |
|-------|-------------|--------|
| `/api/assets` | Asset CRUD | ✅ Complete |
| `/api/assets/[id]` | Single asset operations | ✅ Complete |
| `/api/asset-files` | Asset file uploads | ✅ Complete |
| `/api/customers` | Customer CRUD | ✅ Complete |
| `/api/customers/[id]` | Single customer operations | ✅ Complete |
| `/api/customer-files` | Customer file uploads | ✅ Complete |
| `/api/asset-rentals` | Rental management | ✅ Complete |
| `/api/categories` | Category management | ✅ Complete |
| `/api/manufacturers` | Manufacturer management | ✅ Complete |
| `/api/defined-conditions` | Condition definitions | ✅ Complete |
| `/api/asset-current-conditions` | Condition history | ✅ Complete |
| `/api/asset-current-values` | Value history | ✅ Complete |

### File Upload Implementation:
- FormData handling for multipart uploads
- Files stored in `/public/uploads/` directory
- Metadata stored in database (name, type, size, URL)

---

# Slide 9: Implementation - User Interface

## 💻 UI Implementation

### Pages Implemented:

| Page | Path | Features |
|------|------|----------|
| **Home** | `/` | Dashboard with navigation cards |
| **Assets** | `/assets` | Full asset management with specs |
| **Customers** | `/customers` | Customer CRUD, attachments, rentals |
| **Conditions** | `/asset-conditions` | Condition & value tracking |
| **Setup** | `/setup` | Categories, manufacturers, conditions |

### Customer Page Features:

```
┌─────────────────────────────────────────────────────────────┐
│ FORM SECTION          │ LIST SECTION      │ DETAILS SECTION │
│                       │                   │                 │
│ • First/Last Name     │ • Customer Cards  │ • Attachments   │
│ • Email/Phone         │ • Badges showing  │   - Upload      │
│ • Company/Title       │   attachment &    │   - Download    │
│ • Address fields      │   rental counts   │   - Delete      │
│ • City/State/Zip      │ • Edit/Delete     │                 │
│ • Country             │   buttons         │ • Rented Assets │
│ • Web Page            │                   │   - Add rental  │
│                       │                   │   - Rate/date   │
│ [Add Customer]        │                   │   - Remove      │
└─────────────────────────────────────────────────────────────┘
```

### Styling Approach:
- **styled-jsx**: Component-scoped CSS
- **Responsive Design**: Grid layouts with breakpoints
- **Color Scheme**: Blue primary (#3b82f6), Green success (#22c55e)
- **Cards**: Rounded corners, shadows, hover states

### Key UI Components:
- Global Navbar with active state
- Form validation with required fields
- Success/error message notifications
- Badge indicators for counts
- File upload with drag-drop support

---

# Slide 10: Maintenance & Future Enhancements

## 🔧 Maintenance & Roadmap

### Current Maintenance Practices:

| Practice | Implementation |
|----------|----------------|
| **Type Safety** | Full TypeScript coverage |
| **Code Organization** | Feature-based file structure |
| **Database Migrations** | Prisma migrate for schema changes |
| **Error Handling** | Try-catch with user-friendly messages |

### Project Structure:
```
src/
├── app/
│   ├── api/              # API routes
│   ├── assets/           # Asset pages
│   ├── customers/        # Customer pages
│   ├── asset-conditions/ # Condition pages
│   ├── setup/            # Setup pages
│   └── layout.tsx        # Global layout
├── components/
│   └── Navbar.tsx        # Navigation
├── lib/
│   └── prisma.ts         # Database client
└── generated/
    └── client/           # Prisma client
```

### Future Enhancements:

| Priority | Enhancement | Description |
|----------|-------------|-------------|
| 🔴 High | Authentication | User login & role-based access |
| 🔴 High | Rental End Dates | Track when rentals conclude |
| 🟡 Medium | Reports & Analytics | Dashboard with charts |
| 🟡 Medium | Search & Filters | Advanced filtering options |
| 🟢 Low | Email Notifications | Rental reminders |
| 🟢 Low | Export to PDF/Excel | Report generation |

### Scalability Considerations:
- Migrate to PostgreSQL for production
- Add Redis caching for performance
- Implement pagination for large datasets
- Add audit logging for compliance

---

## 📊 Summary

| Phase | Status | Key Deliverables |
|-------|--------|------------------|
| Strategy | ✅ | Business objectives defined |
| Requirements | ✅ | 6 core modules identified |
| Analysis | ✅ | 11 entities, relationships mapped |
| Backend Design | ✅ | Prisma + Next.js architecture |
| Frontend Design | ✅ | 3-column responsive layouts |
| Implementation | ✅ | Full CRUD, file uploads, rentals |
| Maintenance | 🔄 | Ongoing with enhancement roadmap |

### 🎯 Project Success Metrics:
- ✅ All core features implemented
- ✅ Responsive design across devices
- ✅ Type-safe codebase
- ✅ Clean, maintainable architecture

---

*Asset Rental System v1.0 | Built with Next.js 16, Prisma 7, TypeScript*
