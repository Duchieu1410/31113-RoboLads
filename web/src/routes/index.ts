/**
 * Centralized Route Map & Navigation Configuration
 *
 * Use this module across the application for reliable, type-safe navigation
 * and consistent link paths throughout the client and server components.
 */

export const ROUTES = {
  // Public Client Routes
  HOME: "/",
  CAD: "/cad",
  RESOURCES: "/resources",
  RESOURCES_PORTFOLIOS: "/resources/portfolios",
  RESOURCE_DETAIL: (id: string) => `/resources/${encodeURIComponent(id)}`,
  PORTFOLIOS: "/portfolios",
  PORTFOLIO_DETAIL: (id: string) => `/portfolios/${encodeURIComponent(id)}`,
  RESOURCES_PORTFOLIO_DETAIL: (id: string) => `/resources/portfolios/${encodeURIComponent(id)}`,
  BLOG: "/blog",
  BLOG_POST: (slug: string) => `/blog/${encodeURIComponent(slug)}`,

  // Section Anchors on Home Page
  SECTIONS: {
    HERO: "#hero",
    ABOUT: "#about-target",
    DETAILS: "#details-target",
    ROBOT: "#robot-target",
    ACTIVITIES: "#activities-target",
  },

  // Admin & Management Portal
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_POST_NEW: "/admin/posts/new",
  ADMIN_POST_EDIT: (id: string) => `/admin/posts/${encodeURIComponent(id)}/edit`,
  ADMIN_RESOURCE_NEW: "/admin/resources/new",
  ADMIN_RESOURCE_EDIT: (id: string) => `/admin/resources/${encodeURIComponent(id)}/edit`,
  ADMIN_PORTFOLIO_NEW: "/admin/portfolios/new",
  ADMIN_PORTFOLIO_EDIT: (id: string) => `/admin/portfolios/${encodeURIComponent(id)}/edit`,

  // REST API Endpoints
  API: {
    POSTS: "/api/posts",
    RESOURCES: "/api/resources",
    RESOURCE_BY_ID: (id: string) => `/api/resources/${encodeURIComponent(id)}`,
    PORTFOLIOS: "/api/portfolios",
    PORTFOLIO_BY_ID: (id: string) => `/api/portfolios/${encodeURIComponent(id)}`,
    ANALYTICS_TRACK: "/api/analytics/track",
    ANALYTICS_SUMMARY: "/api/analytics/summary",
    ADMIN_LOGIN: "/api/admin/login",
    ADMIN_LOGOUT: "/api/admin/logout",
    ADMIN_RESOURCES: "/api/admin/resources",
    ADMIN_RESOURCE_BY_ID: (id: string) => `/api/admin/resources/${encodeURIComponent(id)}`,
    ADMIN_PORTFOLIOS: "/api/admin/portfolios",
    ADMIN_PORTFOLIO_BY_ID: (id: string) => `/api/admin/portfolios/${encodeURIComponent(id)}`,
    ADMIN_PORTFOLIO_UPLOAD: "/api/admin/portfolios/upload",
    ADMIN_ANALYTICS: "/api/admin/analytics",
    ADMIN_POSTS: "/api/admin/posts",
    ADMIN_POST_BY_ID: (id: string) => `/api/admin/posts/${encodeURIComponent(id)}`,
    ADMIN_UPLOAD_IMAGE: "/api/admin/upload-image",
    ADMIN_UPLOAD_FILE: "/api/admin/upload-file",
  },
} as const;

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  isAnchor?: boolean;
  badge?: string;
  isExternal?: boolean;
}

/**
 * Main navigation links displayed on the navbar
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "ABOUT US",
    href: "/#about-target",
    description: "Learn about FTC 31113 RoboLads and our team history",
    isAnchor: true,
  },
  {
    label: "WHAT WE DO",
    href: "/#activities-target",
    description: "CAD, workshop, community outreach, and competitions",
    isAnchor: true,
  },
  {
    label: "CAD LAB",
    href: "/cad",
    description: "Full-assembly 3D CAD inspection and subsystem breakdown",
  },
  {
    label: "RESOURCES",
    href: "/resources",
    description: "Open-source CAD, code libraries, mechanics, and logs",
  },
  {
    label: "BLOG",
    href: "/blog",
    description: "News and technical updates from the team",
  },
];

/**
 * Full catalog of all site routes for quick navigation and sitemaps
 */
export const ROUTE_CATALOG = [
  {
    category: "Public Pages",
    routes: [
      { name: "Home Landing Page", path: ROUTES.HOME, description: "Official HSGS RoboLads landing page" },
      { name: "3D CAD Lab Workstation", path: ROUTES.CAD, description: "Full interactive 3D assembly and Onshape CAD model viewer" },
      { name: "Resources Catalog", path: ROUTES.RESOURCES, description: "Filterable engineering resources and CAD files" },
      { name: "Blog & Updates", path: ROUTES.BLOG, description: "Announcements and build logs powered by Sanity" },
    ],
  },
  {
    category: "Landing Page Sections",
    routes: [
      { name: "About Robolads", path: ROUTES.SECTIONS.ABOUT, description: "Team photo and typewriter introduction" },
      { name: "Welcome & Purpose", path: ROUTES.SECTIONS.DETAILS, description: "Specs, stats, and core mission" },
      { name: "Main Activities", path: ROUTES.SECTIONS.ACTIVITIES, description: "Accordion cards showcasing core activities" },
    ],
  },
  {
    category: "Administration",
    routes: [
      { name: "Admin Dashboard", path: ROUTES.ADMIN, description: "Resource CRUD and real-time analytics" },
      { name: "Admin Login", path: ROUTES.ADMIN_LOGIN, description: "Secure credential authentication" },
    ],
  },
  {
    category: "REST API Endpoints",
    routes: [
      { name: "Resources List", path: ROUTES.API.RESOURCES, description: "GET /api/resources" },
      { name: "Track Analytics", path: ROUTES.API.ANALYTICS_TRACK, description: "POST /api/analytics/track" },
      { name: "Analytics Summary", path: ROUTES.API.ANALYTICS_SUMMARY, description: "GET /api/analytics/summary" },
    ],
  },
];
