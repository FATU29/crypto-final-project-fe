# Crypto Trading Platform - Frontend

A modern, production-ready Next.js 14+ application with complete authentication, 30+ UI components, and best practice architecture.

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit: http://localhost:3000

## ✨ Features

✅ **Complete Authentication System** - Login, register, logout, protected routes  
✅ **30+ shadcn/ui Components** - Beautiful, accessible, ready-to-use  
✅ **Type-Safe API Layer** - Axios client with interceptors  
✅ **Route Protection** - Middleware-based authentication  
✅ **Custom Hooks** - Reusable React hooks  
✅ **Responsive Design** - Mobile-first approach  
✅ **Dark Mode Support** - Built-in theme switching  
✅ **Professional Layout** - Navbar, Footer, and more

## 📁 Project Structure

```
fe/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard
│   ├── (features)/        # Feature-specific routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components (30+)
│   ├── layout/           # Layout components
│   └── common/           # Shared components
├── lib/                   # Business logic
│   ├── api/              # API client & services
│   └── auth/             # Authentication
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
├── config/                # Configuration
└── middleware.ts          # Route protection
```

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Getting started guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture details
- **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - Visual diagrams
- **[CHECKLIST.md](./CHECKLIST.md)** - Implementation checklist
- **[SUMMARY.md](./SUMMARY.md)** - Project summary

## 🚀 Usage Examples

### Using Authentication

```tsx
"use client";

import { useAuth } from "@/lib/auth";

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </div>
  );
}
```

### Using Components

```tsx
import { Button, Card } from "@/components/ui/button";

export function Example() {
  return (
    <Card>
      <Button variant="default">Click me</Button>
    </Card>
  );
}
```

### Making API Calls

```tsx
import { authService } from "@/lib/api";

const user = await authService.getCurrentUser();
```

## 🎨 Available Components

All shadcn/ui components installed and ready:

- Button, Card, Input, Label, Form
- Select, Checkbox, Switch, Textarea
- Alert, Dialog, Dropdown Menu, Popover
- Badge, Avatar, Skeleton, Table
- Tabs, Accordion, Sheet, Scroll Area
- Separator, Tooltip, Sonner (Toast)

## 🔐 Authentication Flow

1. User visits `/login`
2. Submits credentials
3. API validates and returns tokens
4. Tokens stored in localStorage
5. User redirected to `/dashboard`
6. Middleware protects routes
7. API client auto-injects tokens

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **State Management:** Zustand + Context API
- **API Client:** Axios
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **Icons:** Lucide React

## 📝 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🔧 Configuration

Edit `config/app.ts` to customize:

- App metadata
- API endpoints
- Auth settings
- Route definitions

## 📦 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🏗️ Architecture Highlights

### Route Groups

- `(auth)` - Authentication pages without main layout
- `(dashboard)` - Protected pages with full layout
- `(features)` - Feature-specific routes

### API Layer

- Centralized Axios client
- Request/response interceptors
- Automatic token injection
- Token refresh mechanism

### Authentication

- Context-based state management
- Token storage in localStorage
- Protected routes via middleware
- Auth hooks for components

## 🎯 Next Steps

1. Connect to your backend API
2. Implement real authentication
3. Add database integration
4. Customize UI components
5. Build your features

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript types
3. Write meaningful commit messages
4. Test your changes

## 📄 License

MIT

---

**Built with ❤️ using Next.js 14+ and shadcn/ui**
