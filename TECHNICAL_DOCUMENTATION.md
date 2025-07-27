# Dokumentacion Teknik - Platforma e Inovacionit

## Arkitektura e Aplikacionit

### Frontend Architecture
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS me design system semantik
- **UI Components**: shadcn/ui + komponente custom
- **Routing**: React Router v6
- **State Management**: React hooks + Supabase realtime

### Backend Architecture
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage për dokumentet
- **Real-time**: Supabase Subscriptions

---

## Design System & UI Guidelines

### Semantic Tokens
Aplikacioni përdor token semantikë të definuara në `index.css` dhe `tailwind.config.ts`:

```css
/* Ngjyrat kryesore */
--primary: [HSL values]
--secondary: [HSL values]
--accent: [HSL values]

/* Gradientët */
--gradient-primary: linear-gradient(...)
--gradient-subtle: linear-gradient(...)

/* Hijezat */
--shadow-elegant: 0 10px 30px...
--shadow-glow: 0 0 40px...
```

### Component Variants
- Përdorimi i `cva` (class-variance-authority) për variante
- Evitimi i ngjyrave të drejtpërdrejta (text-white, bg-black)
- Përdorimi i token-ave semantikë për konsistencë

---

## Database Schema & Relations

### Core Tables

#### `profiles`
```sql
- id: uuid (PK, references auth.users)
- emri: text (NOT NULL)
- mbiemri: text (NOT NULL) 
- role: text (DEFAULT 'user') -- 'user' | 'ekspert' | 'ekzekutiv'
- created_at: timestamp
```

#### `applications`
```sql
- id: uuid (PK)
- user_id: uuid (FK to profiles.id)
- fusha_id: uuid (FK to fusha.id)
- bashkia_id: uuid (FK to bashkia.id)
- status_id: uuid (FK to status.id)
- assigned_ekspert_id: uuid (FK to profiles.id, nullable)
- titulli: text (NOT NULL)
- pershkrimi: text (NOT NULL)
- grupmosha: text (NOT NULL)
- prototip_url: text (nullable)
- dokumente: jsonb (nullable)
- created_at: timestamp
```

#### `status`
```sql
- id: uuid (PK)
- label: text (NOT NULL) -- 'Në pritje', 'Në shqyrtim', etj.
- color_badge: text (nullable) -- Hex color për badge-in
```

#### Reference Tables
- `fusha`: id, label (Fushat e inovacionit)
- `bashkia`: id, label (Bashkitë)

#### Audit Tables
- `application_notes`: Komente të brendshme
- `status_history`: Historia e ndryshimeve të statusit

### Row Level Security (RLS) Policies

#### Applications
- **User**: `auth.uid() = user_id` (vetëm aplikimet e veta)
- **Ekspert**: `assigned_ekspert_id = auth.uid()` (vetëm të caktuarat)
- **Ekzekutiv**: `get_current_user_role() = 'ekzekutiv'` (të gjitha)

#### Application Notes
- **User**: Mund të shohë/kriojë komente në aplikimet e veta
- **Ekspert/Ekzekutiv**: Mund të shohë/kriojë komente në të gjitha

---

## Component Architecture

### Layout System

#### AdminLayout (Reusable)
```tsx
interface AdminLayoutProps {
  children: React.ReactNode;
  sidebarItems: Array<{
    href: string;
    label: string;
    icon: LucideIcon;
  }>;
  userRole: string;
}
```

#### Role-Specific Layouts
- **EkzekutivLayout**: Dashboard + Aplikimet
- **EkspertLayout**: Vetëm Aplikimet

### Application Cards

#### ApplicationCardBase (Core Component)
Komponenti bazë i ripërdorshëm që merr props për të kontrolluar:
- `canEditStatus`: A mund të ndryshojë statusin
- `canAssignEkspert`: A mund të caktojë ekspertë
- `commentPermissions`: Llojet e komenteve të lejuara

#### Role-Specific Card Logic
- **ApplicationCardEkzekutiv**: Fetch të gjitha aplikimet
- **ApplicationCardEkspert**: Fetch aplikimet e caktuara

### Dynamic Status System

#### ApplicationStatusBadge
```tsx
interface ApplicationStatusBadgeProps {
  statusId: string;
  className?: string;
}
```

Karakteristikat:
- Fetch dinamik të `label` dhe `color_badge` nga databaza
- Llogaritje automatike e ngjyrës së tekstit bazuar në background
- Stil minimalist (rounded, padding konsistent)

---

## Authentication & Authorization

### Role-Based Access Control

#### User Roles
1. **user**: Qytetarë që dorëzojnë aplikime
2. **ekspert**: Ekspertë që vlerësojnë aplikime specifike
3. **ekzekutiv**: Administratorë me akses të plotë

#### Access Matrix
| Feature | User | Ekspert | Ekzekutiv |
|---------|------|---------|-----------|
| Dashboard KPIs | ❌ | ❌ | ✅ |
| Të gjitha aplikimet | ❌ | ❌ | ✅ |
| Aplikimet e caktuara | ❌ | ✅ | ✅ |
| Aplikimet personale | ✅ | ✅ | ✅ |
| Caktim ekspertësh | ❌ | ❌ | ✅ |
| Ndryshim statusi | ❌ | ❌ | ✅ |
| Komente të brendshme | ❌ | ✅ | ✅ |

### Protected Routes
```tsx
// Route structure
/auth           -> Public (Login/Register)
/               -> Public (Landing page)
/aplikimet-mia  -> Protected (User role)
/admin          -> Protected (ekspert | ekzekutiv roles)
```

---

## Data Flow & State Management

### Application Submission Flow
1. User plotëson formën në `/`
2. Upload dokumentesh në Supabase Storage
3. Insert në `applications` table
4. Auto-assign default status
5. Trigger për `status_history`

### Status Management Flow
1. Ekzekutiv ndryshon status në admin panel
2. Update `applications.status_id`
3. Insert në `status_history` për audit trail
4. Real-time update në UI

### Expert Assignment Flow
1. Ekzekutiv cakton ekspert
2. Update `applications.assigned_ekspert_id`
3. Ekspert merr akses në aplikim
4. Notification (future enhancement)

---

## Performance Considerations

### Database Optimization
- **Indexes**: Automatikë në FK relationships
- **Pagination**: Implementuar në tabela dhe karta
- **Selective Fetching**: Joins specifikë bazuar në role

### Frontend Optimization
- **Component Lazy Loading**: React.lazy për rute
- **Memoization**: React.memo për komponente të rënda
- **Bundle Splitting**: Vite code splitting automatik

### Supabase Optimizations
- **RLS**: Minimum queries në database level
- **Real-time**: Subscription vetëm kur nevojitet
- **Storage**: CDN për asset-et statikë

---

## Development Workflow

### Code Organization
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── filters/         # Filter dropdowns
│   └── [feature]/       # Feature-specific components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities
└── integrations/        # Supabase client & types
```

### Best Practices
1. **Reusability**: Komponente të ripërdorshme me props interface
2. **Type Safety**: TypeScript interfaces për të gjitha data structures
3. **Design System**: Semantic tokens në vend të ngjyrave të drejtpërdrejta
4. **Error Handling**: Try-catch + toast notifications
5. **Loading States**: Skeleton loaders për UX të mirë

### Testing Strategy (Future)
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright për user flows
- **Database Tests**: Supabase testing utilities

---

## Deployment & DevOps

### Current Setup
- **Hosting**: Lovable platform
- **Database**: Supabase managed PostgreSQL
- **CDN**: Supabase Storage për assets
- **SSL**: Automatic via platform

### Environment Variables
```bash
# Supabase Configuration
SUPABASE_PROJECT_ID=wsypsxpqeulygyrmzndn
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Production Checklist
- [ ] RLS policies audited
- [ ] Performance monitoring setup
- [ ] Backup strategy defined
- [ ] Error tracking implemented
- [ ] Analytics integration
- [ ] SEO optimization

---

## Future Enhancements

### Technical Improvements
1. **Real-time Notifications**: Toast për ndryshime të statusit
2. **Advanced Search**: Full-text search në aplikime
3. **File Preview**: In-browser preview për dokumentet
4. **Export Features**: PDF/Excel export për raporte
5. **Analytics Dashboard**: Detailed KPIs dhe trends

### User Experience
1. **Mobile App**: React Native version
2. **Offline Support**: Service Worker për basic functionality
3. **Multi-language**: i18n implementation
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Advanced Filtering**: Complex filter combinations

### Administrative Features
1. **Bulk Operations**: Mass status updates
2. **Template System**: Reusable application templates
3. **Workflow Automation**: Auto-assignment rules
4. **Audit Logs**: Detailed user activity tracking
5. **Integration APIs**: Third-party system connections

---

## Troubleshooting Guide

### Common Issues

#### RLS Policy Errors
```sql
-- Debug RLS policies
SELECT * FROM pg_policies WHERE tablename = 'applications';

-- Test user permissions
SELECT auth.uid(), get_current_user_role();
```

#### Performance Issues
- Check database query performance in Supabase dashboard
- Monitor network requests in browser DevTools
- Review component re-rendering with React DevTools

#### Authentication Issues
- Verify user session: `supabase.auth.getSession()`
- Check profile creation after signup
- Validate role assignment in profiles table

---

*Dokumentacioni do të përditësohet sipas zhvillimeve të reja të platformës.*