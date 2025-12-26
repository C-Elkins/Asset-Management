# Marketing Pages - Design System

## Overview
All public marketing pages have been redesigned with a consistent, professional design system that matches the Krubles brand identity.

## Design Principles
- **Gradient Branding**: Blue-to-green gradient (#2563eb → #10b981) for headers and key elements
- **Rounded Corners**: 16-32px border radius for modern, friendly appearance
- **Glassmorphism**: Subtle gradient backgrounds and shadows for depth
- **Responsive**: Mobile-first design with breakpoints at md (768px) and lg (1024px)
- **Professional**: Clean, spacious layouts with clear visual hierarchy

## Pages Redesigned

### 1. **Home** (`/`)
- Hero with animated art (mobile) / branded banner (desktop)
- 6 feature cards in 3x2 grid
- Trust logos row
- Glass preview section
- CTA band

### 2. **Features** (`/features`)
- Gradient hero section
- 9 feature cards with icons in 3x3 grid
- Detailed descriptions for each feature
- CTA section with dual buttons

### 3. **Pricing** (`/pricing`)
- 3-tier pricing cards (Starter, Pro, Enterprise)
- "Most Popular" badge on Pro plan
- Feature comparison with checkmarks
- FAQ section
- Transparent pricing without hidden fees

### 4. **Solutions** (`/solutions`)
- 6 industry-specific solution cards
- Icons for each solution type
- Benefit lists with checkmarks
- CTA for personalized demos

### 5. **Security** (`/security`)
- Trust badges (SOC 2, ISO 27001, GDPR, HIPAA)
- 6 security feature cards
- Security practices grid
- Enterprise-grade messaging

### 6. **Integrations** (`/integrations`)
- Categorized by type (Identity, ITSM, Data, Developer)
- Integration cards with descriptions
- API documentation section
- Request custom integration CTA

### 7. **Customers** (`/customers`)
- Key metrics (4 stat cards)
- 3 customer testimonials with quotes
- 2 detailed case studies
- Success metrics with checkmarks

### 8. **About** (`/about`)
- Mission statement
- 4 company values with icons
- Timeline of company journey
- Team section
- Dual CTA (Contact / Try Free)

### 9. **Contact** (`/contact`)
- Modern contact form with labels
- Contact method cards (Email, Phone, Chat)
- Headquarters information
- Response time guarantee
- FAQ quick links

## Color Palette
- **Primary**: `#2563eb` (Blue)
- **Success**: `#10b981` (Green)
- **Text**: `#222` (Dark gray)
- **Text Muted**: `#555` / `#666` (Medium gray)
- **Border**: `#e5e7eb` (Light gray)
- **Background**: `#f6f8fa` / `#f0f9ff` / `#ecfdf5` (Light blues/greens)

## Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 
  - H1: text-5xl (48px), font-extrabold
  - H2: text-3xl (30px), font-bold
  - H3: text-2xl / text-xl, font-bold
- **Body**: text-base (16px) / text-lg (18px)

## Component Patterns

### Cards
```jsx
className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
```

### Buttons
```jsx
// Primary
className="px-6 py-3 rounded-lg font-semibold bg-[var(--primary,#2563eb)] text-white shadow-lg hover:bg-blue-700 transition"

// Secondary
className="px-6 py-3 rounded-lg font-semibold bg-white border-2 border-[var(--primary,#2563eb)] text-[var(--primary,#2563eb)] shadow hover:bg-blue-50 transition"
```

### Hero Sections
- Gradient background: `linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)`
- Radial blur effects for ambient depth
- Max width: 6xl (1280px)
- Centered content with gradient text

### Icon Usage
- Emoji icons for quick visual recognition
- 3xl-5xl size for hero elements
- Consistent spacing (mb-4 typical)

## Build Status
✅ All pages compile successfully
✅ TypeScript checks pass
✅ Production build optimized (2.67s)
✅ CSS properly bundled (125KB)

## Next Steps
- Consider adding real customer logos to LogosRow
- Add animation transitions with Framer Motion
- Implement dark mode variant
- Add micro-interactions on hover states
- Create blog/resources section
