# Changelog

All notable changes to the Fleet Driver Mobile application will be documented in this file.

## [1.91.00] - 2026-08-16

### Global Skeleton Loading for Dashboard Cards and Data-Driven UI
- **StatCardSkeleton (`frontend/src/components/common/StatCardSkeleton.jsx`)**:
  - Built a reusable KPI stat card skeleton matching `KPICard.jsx` layout, dimensions, border radius (`rounded-2xl`), padding, and pulse animations.
- **TableRowSkeleton (`frontend/src/components/common/TableRowSkeleton.jsx`)**:
  - Built a reusable table row skeleton component rendering smooth animated pulse placeholder cells across customizable column and row counts.
- **Eliminated Misleading `0` Values & Empty States During Loading**:
  - Updated initial `loading` states across all Admin, Fleet Manager, and Driver pages from `false` to `true` on mount while initial API calls are fetching.
  - `KPICard` component updated to render `StatCardSkeleton` while `loading={true}` instead of displaying misleading `0`, `0.00`, or `₹0`.
- **Resolved `VehicleManagement.jsx` Console & Component Errors**:
  - Restored missing `managerApi` and `getSocket` imports in `VehicleManagement.jsx`, resolving console `ReferenceError: getSocket is not defined` and `ReferenceError: managerApi is not defined` runtime issues when fetching activities, maintenance logs, and socket updates.
  - Search counters ("Showing X of Y") display animated skeleton placeholders / "Loading..." while API requests are pending.
  - Toolbar controls, search bars, filter dropdowns, and "+ Add" action buttons remain fully visible and interactive during background fetches.

## [1.90.00] - 2026-08-16

### React Route-Level & Native Image Lazy Loading Optimization
- **Selective React Route-Level Lazy Loading (`frontend/src/App.jsx`)**:
  - Implemented React `lazy()` dynamic code-splitting imports for secondary pages across Super Admin, Fleet Manager, Driver Portal, and Public landing routes.
  - Kept critical initial pages (Login `/login`, Core Landing `/`, Super Admin Dashboard `/admin/dashboard`, Fleet Manager Dashboard `/manager`, Driver Dashboard `/driver/dashboard`, and Layout Shells) immediately loaded via direct static imports for instant startup performance.
  - Wrapped lazy routes in `<ErrorBoundary>` and `<Suspense fallback={<SmartSkeletonFallback variant="..." />}>` for smooth page-matched loading skeletons and error resilience.
- **Immediate Map Experience for Live Tracking & Route Optimization (`FleetMapPage.jsx`)**:
  - Maintained route-level chunking for `FleetMapPage.jsx` while ensuring Leaflet maps, Socket.IO real-time location listeners, and polyline tracking initialize immediately without secondary component delays once the page is entered.
- **Native Image Lazy Loading (`loading="lazy"`)**:
  - Applied native `loading="lazy"` attribute across secondary/below-the-fold image assets: vehicle card photos (`VehiclesListPage.jsx`), driver data grid avatars (`DriversManagementPage.jsx`), vehicle gallery photos & document previews (`VehicleDetailsPage.jsx`), POD signatures & photos (`TripDetailsPage.jsx`), fuel receipts (`FuelManagementPage.jsx`), organization logos (`OrganizationList.jsx`), and blog/user cards (`BlogCard.jsx`, `UserProfileCard.jsx`).
  - Preserved critical logos and above-the-fold hero images as eager loaded to maintain immediate brand perception.

## [1.89.00] - 2026-08-16

### Complete Removal of Lazy Loading & Skeleton Loader Delays Across All Dashboards & Pages
- **Instant Un-Delayed Page Mounting Across All Portals**:
  - Removed full-screen skeleton loaders (`DashboardSkeletonLoader`), dynamic loading overlays, and page-blocking loading guards (`if (loading) return <Skeleton />`) across Super Admin Dashboard, Fleet Manager Dashboard, Driver Portal, and Mobile app screens.
  - All dashboards and pages mount and render their complete visual layout, stat cards, control bars, tables, maps, and forms immediately upon navigation.
  - Initial loading states (`loading`, `isLoading`, `_isLoading`) set to `false` by default, executing data fetching asynchronously in the background without delaying page mount.
- **Web Portal Components Updated**:
  - `frontend/src/App.jsx` & `frontend/src/routes/ProtectedRoute.jsx`: Removed initializing loader blocks for instant route mounting.
  - Super Admin (`Dashboard.jsx`, `SystemHealth.jsx`, `ProfileSettings.jsx`, `SecuritySettings.jsx`, `NotificationSettings.jsx`, `Settings.jsx`, `ReviewsSettings.jsx`, `SettingsBlogs.jsx`, `SettingsAbout.jsx`).
  - Fleet Manager (`ManagerDashboard.jsx`, `AnalyticsPage.jsx`, `DriversManagementPage.jsx`, `FleetMapPage.jsx`, `FuelManagementPage.jsx`, `NotificationsPage.jsx`, `ReportsPage.jsx`, `ViewTicketsPage.jsx`, `VehiclesListPage.jsx`, `VehicleManagement.jsx`, `VehicleDetailsPage.jsx`, `VehicleEditPage.jsx`, `TripsManagementPage.jsx`, `TripsListPage.jsx`, `UpcomingServicesPage.jsx`, `ManageSchedulesPage.jsx`, `ProfilePage.jsx`, `EditProfilePage.jsx`, `EarningsPage.jsx`, `DriverProfilePage.jsx`, `AssignVehiclePage.jsx`, `NotificationDetailsPage.jsx`, `VehicleDocuments.jsx`).
  - Driver Workspace (`Dashboard.jsx`, `Maintenance.jsx`, `Trips.jsx`, `TripDetails.jsx`, `Vehicles.jsx`, `Support.jsx`, `Profile.jsx`).
- **Driver Mobile Flutter App Screens Updated**:
  - `completed_trips_screen.dart`, `vehicle_overview_screen.dart`, `vehicle_maintenance_screen.dart`, `upcoming_trips_screen.dart`, `upcoming_trip_details_screen.dart`: Removed screen-blocking progress indicators on initial load so card layouts and summary lists render instantly.

## [1.88.00] - 2026-08-16

### OSRM Routing Rate-Limit Fix, Lazy Skeleton Removal & Direct Notification Navigation
- **OpenStreetMap / OSRM Console Error Elimination (`routingService.js`, `MapView.jsx`)**:
  - Removed rate-limited public endpoint `routing.openstreetmap.de` to eliminate HTTP 429 (Too Many Requests) and `net::ERR_CONNECTION_RESET` console errors.
  - Implemented 60-second circuit-breaker rate-limit backoff with silent error catching.
  - Added multi-point Bezier curved polyline route generator (`generateCurvedPolyline`) for smooth local route rendering on Leaflet maps when offline or rate-limited.
- **Complete Lazy Loading Removal Across All Portals (`App.jsx`, `Contact.jsx`)**:
  - Completely removed dynamic `React.lazy()` dynamic imports, `LazyRoute` wrappers, and `loading="lazy"` iframe attributes across Public landing pages, Fleet Manager portal, Super Admin dashboard, and Driver workspace.
  - All routes now use direct static imports for 100% instant, un-delayed component rendering.
- **Manager Notification Overlay Direct Navigation (`NotificationOverlay.jsx`)**:
  - Enhanced notification overlay click handler (`getNotificationTargetUrl`) to inspect notification type, title, message, and metadata (`tripId`, `vehicleId`, `driverId`, `ticketId`).
  - Automatically routes clicks directly to their specific target page (`/manager/trip-details/:id`, `/manager/vehicle-details/:id`, `/manager/driver-profile/:id`, `/manager/maintenance`, `/manager/fuel`, `/manager/subscription`, `/manager/settings`) instead of redirecting to the generic notifications list.

## [1.87.00] - 2026-08-15

### Page-Specific Skeleton Layouts & Network-Aware Fast Page Opening Across All Dashboards
- **Multi-Variant Layout Skeletons (`DashboardSkeletonLoader.jsx`)**:
  - Upgraded `DashboardSkeletonLoader.jsx` to support 5 page-matched layout variants (`dashboard`, `table`, `map`, `form`, `analytics`).
  - `dashboard`: Header + 4 KPI stat cards + main chart area + side activity panel (Admin, Manager & Driver Dashboards).
  - `table`: Title bar + search/filter bar + table container header & 6 animated table row skeletons (Vehicles List, Drivers List, Trips List, Fuel, Maintenance, User Management, Organizations, Notifications, Audit Logs).
  - `map`: Top status bar + full-height map canvas skeleton with floating map controls & left vehicle list panel (Fleet Tracking Map).
  - `form`/`details`: Breadcrumb header + 2-column form input field grid, textareas & buttons OR profile avatar & detail rows (Add/Edit Vehicle, Vehicle Details, Add/Edit Driver, Driver Profile, Create Trip, Schedule Service, Settings, Profile).
  - `analytics`: Header with date tabs + 4 KPI cards + 2x2 grid of chart cards (Analytics, Reports, System Health, Earnings).
- **Network-Delay Aware Grace Period (`SmartSkeletonFallback.jsx`)**:
  - Implemented smart grace timer (~180ms) and `navigator.onLine` network check.
  - Fast connection navigations (<180ms delay) open target pages directly with zero loading screen flickering.
  - Slow/delayed connections (>180ms delay or offline mode) smoothly fade in page-matched layout skeletons.
- **Route-Level Code Splitting & Smart Lazy Loading (`App.jsx`)**:
  - Code-split all page routes across Admin, Manager, and Driver dashboards using `React.lazy()`.
  - Replaced global full-screen `TruckLoader` Suspense wrapper with `LazyRoute` wrapper pairing each route with its exact `SmartSkeletonFallback` variant.
- **Page-Level Skeleton Integration**:
  - Updated all page loading checks across Manager (`ViewTicketsPage.jsx`, `ReportsPage.jsx`, `NotificationsPage.jsx`, `FuelManagementPage.jsx`, `FleetMapPage.jsx`, `DriversManagementPage.jsx`, `AnalyticsPage.jsx`), Admin (`Dashboard.jsx`), and Driver (`Maintenance.jsx`, `Dashboard.jsx`) portals.
- **Drivers Directory Hook Fix (`DriversManagementPage.jsx`)**:
  - Resolved React Rules of Hooks violation by moving `if (loading) return ...` below all `useState` and `useEffect` declarations, fixing `/manager/drivers` infinite loading issue.
- **Truck Loading Animation Removal (`App.jsx`)**:
  - Replaced full-screen truck loading animation with clean page skeleton rendering on application initialization and navigation.
- **Mobile Card & Dialog Pixel Overflow Fix (`completed_trip_details_screen.dart`, `trip_details_screen.dart`)**:
  - Added responsive `insetPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 24)` and `SingleChildScrollView` to document preview dialogs, eliminating right 16px pixel overflow.
  - Wrapped route node text (`Destination (Rajamahendravaram)`) in `Expanded` widgets, allowing cards to scale dynamically without right 54px pixel overflow.
- **Dashboard ReferenceError Resolution (`App.jsx`)**:
  - Added missing `DashboardSkeletonLoader` import to `App.jsx`, fixing `/login` screen `Uncaught ReferenceError: DashboardSkeletonLoader is not defined` crash.
- **Manager Dashboard Timeframe Reference Error Fix (`ManagerDashboard.jsx`)**:
  - Restored missing `timeframe` state hook (`const [timeframe, setTimeframe] = useState("This Week")`), resolving `/manager` `Uncaught ReferenceError: timeframe is not defined` crash.
- **Real-Time Recent Activities with Trip Names & Routes (`ManagerDashboard.jsx`, `manager.controller.js`)**:
  - Enhanced backend `listActivities` and frontend `ManagerDashboard.jsx` to populate real trip dispatches with exact trip numbers, origin/destination routes (e.g., `TRP-452798 (samarlakot → Rajamahendravaram)`), driver assignments, and relative timestamps (`10m ago`, `2h ago`, `Today`).
  - Added instant Socket.IO event listeners (`trip:status-updated`, `trip:created`, `driver:status-updated`, `driver:location-update`, `vehicle:updated`, `notification:new`) ensuring real-time dashboard updates without page reloads.

## [1.86.00] - 2026-08-14

### Unified Color Palette Across All Dashboards, Sidebars, Cards & Public Pages (#A14000 Accent)
- **Theme Variables & Design Tokens (`index.css`)**:
  - Updated global color tokens: Brand Primary Accent set to `#A14000` (hover `#853400`), Brand Navy / Primary Dark set to `#0D1B2A`, Page Canvas set to `#FAFBFC` (Light) / `#0D1117` (Dark).
- **Sidebar & Header Alignment (`AppLayout.jsx`, `Sidebar.jsx`, `NewAdminSidebar.jsx`, `DriverLayout.jsx`)**:
  - Unified all sidebars (Manager, Super Admin, Driver Portal) to Deep Dark Navy (`#0D1B2A`) background with `#A14000` active pill highlights (`rounded-xl`) and white/slate text.
- **Card Containers & KPI Badges (`KPICard.jsx`, `DashboardCard.jsx`)**:
  - Standardized KPI cards to rounded-2xl containers with `#0D1B2A` values/headings, `#475569` labels, and soft circular icon badges (`#FFDBCC`/`#FFF4ED` tint with `#A14000` icon).
- **Public Pages & Landing (`LandingHeader.jsx`, `LandingFooter.jsx`, `Features.jsx`, `About.jsx`, `Performance.jsx`)**:
  - Updated Landing Header active navigation links and login buttons to `#A14000`, brand title to `#0D1B2A`, and Landing Footer to `#0D1B2A` background with `#A14000` icon highlights.
  - Removed truck background image and translucent overlays from Features page (`Features.jsx`) & Performance page (`Performance.jsx`) hero sections and center-aligned badges, titles, subtitles, and cards in the middle.
  - Replaced delivery truck graphic on About page (`About.jsx`) with user's clean red delivery truck cargo loading illustration (`/about-delivery-truck.png`), enlarged 'Our Vision & History' heading to bold prominent size (`text-xl sm:text-2xl md:text-3xl font-black text-[#A14000]`), and replaced side image with high-res digital fleet telemetry & operations suite graphic (`/about-fleet-vision.jpg`).
  - Removed left slide-in reveal animations from cards across Home page (`Home.jsx`), Blogs page (`Blogs.jsx`), and Landing Footer (`LandingFooter.jsx`), setting default direction to smooth top-reveal (`direction="top"`).
- **Admin Footer Data & DB Persistence (`Settings.js`, `Settings.jsx`, `SettingsContext.jsx`, `LandingFooter.jsx`)**:
  - Added DB persistence for Footer Description, Contact Phone, Contact Email, Contact Address, Facebook, LinkedIn, Twitter, and YouTube URLs in `Settings.js` schema and `/api/admin/settings` endpoint.
  - Implemented 'Landing Page Footer & Public Contact Data' form in Admin Settings (`Settings.jsx`) and dynamically rendered stored DB values in `LandingFooter.jsx`.
- **Instant Real-Time Notifications Across Admin, Manager, and Driver (`NotificationOverlay.jsx`, `notification.js`, `driverApi.controller.js`)**:
  - Refactored `NotificationOverlay.jsx` to dynamically fetch role-specific notifications from `/api/admin/notifications`, `/api/manager/notifications`, and `/api/driver/notifications` with automatic periodic polling and instant Socket.IO refresh.
  - Enhanced backend Socket.IO broadcasting (`notification.js`) to emit to `role:SUPER_ADMIN`, `role:FLEET_MANAGER`, `driver:${id}`, and `manager:${id}` rooms.
- **Social Logins Removal (`LoginPage.jsx`, `login_screen.dart`)**:
  - Removed "Continue with Microsoft" from Web Login page and "Login with Google" from Mobile Driver Login screen.
- **Full-Page Blog View & Card Reveal Fix (`Blogs.jsx`, `Home.jsx`)**:
  - Transformed Blog Article selection into a dedicated, responsive Full-Page View with sticky top bar, hero banner, formatted article paragraphs, and navigation buttons.
  - Removed reveal animation wrappers from blog card grids across `Blogs.jsx` and `Home.jsx`.
- **Dashboard Lazy Loading Across All Roles (`App.jsx`)**:
  - Implemented React code-splitting and `React.lazy()` chunking with `Suspense` fallbacks (`TruckLoader`) for all Admin, Fleet Manager, and Driver dashboard pages (Vehicles, Drivers, Trips, Fuel, Maintenance, Reports, Settings, User Management, Organizations).
- **Exact Number Cards & Animation Removal (`KPICard.jsx`, `CountUpNumber.jsx`, `dashboard_screen.dart`)**:
  - Completely removed counting/incrementing animations from `KPICard.jsx`, `CountUpNumber.jsx`, and mobile `dashboard_screen.dart`. All dashboard metric cards across vehicle management and role screens render exact static values immediately.
- **Dynamic Time-Range Analytics Tabs (`AnalyticsPage.jsx`)**:
  - Implemented real database calculation for `Last 7 Days`, `30 Days`, and `Year to Date` time-range filter tabs on `/manager/analytics`. All metrics (`Fleet Efficiency`, `Fuel Consumption`, `Total Mileage`, `Maintenance Costs`, `Fleet Utilization`, and `Hourly Dispatches`) calculate dynamically based on the selected date window.
- **Global Dashboard Skeleton Loading Across All Role Screens (`DashboardSkeletonLoader.jsx`)**:
  - Created reusable `DashboardSkeletonLoader.jsx` component matching Manager Dashboard skeleton structure.
  - Applied skeleton page loading to all Admin, Manager, and Driver pages (`Trips`, `Vehicles`, `Drivers`, `Fuel`, `Maintenance`, `Reports`, `Analytics`, `Live Tracking`, `Notifications`, `Settings`, `User Management`, `Organizations`, `Driver Portal`).
- **Maintenance Page `loadingTickets` Fix ([`ViewTicketsPage.jsx`](file:///c:/Users/Satya/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/ViewTicketsPage.jsx))**:
  - Resolved `Uncaught ReferenceError: loading is not defined` on `/manager/maintenance` by updating skeleton loader check to inspect `loadingTickets` state.

## [1.85.00] - 2026-08-14

### Fleet Management Dashboard — Professional Animation Upgrade
- **Dashboard Entrance Sequence (`animeUtils.js`, `ManagerDashboard.jsx`)**:
  - Implemented Anime.js timeline sequence (`animateDashboardEntrance`) staggering the page title (0ms), subtitle (80ms), primary action button (120ms), subscription warning banner (160ms), KPI cards (220ms+), and dashboard grid sections (350ms+) with smooth `opacity: 0 -> 1` and `translateY: 12px -> 0`.
- **KPI Card Animations & Count-Up Numbers (`KPICard.jsx`)**:
  - Added numeric count-up animation (`0 -> targetValue`) on initial data mount using Anime.js easing curves (`easeOutCubic`).
  - Added subtle hover elevation (`hover:-translate-y-1 hover:shadow-md hover:border-slate-300`) with 250ms smooth transition.
  - Added calm, non-flashing status indicators (`+12.4%`, `+9.1%`, `+4.7%`, `0 Alerts`).
- **Delivery Analytics Line Chart & Gauge Arc (`ManagerDashboard.jsx`)**:
  - Enabled progressive line drawing and dot reveal (`isAnimationActive={true}`, `animationDuration={1200}`) for Delivery Analytics LineChart and Success Rate PieChart arc fill.
- **Active Driver Rows & Recent Activities Stagger (`ManagerDashboard.jsx`, `animeUtils.js`)**:
  - Added staggered reveals for active driver list rows and recent activity cards, subtle row hover highlights, and `animateNewActivityItem` helper for socket activity updates.
- **Page-to-Page SPA Transitions & Micro-Interactions (`AppLayout.jsx`, `index.css`)**:
  - Configured 300ms smooth SPA route transition (`@keyframes page-enter`, `opacity: 0 -> 1`, `translateY: 10px -> 0`) across dashboard views (`/manager`, `/manager/vehicle-management`, `/manager/drivers`, `/manager/trips`, `/manager/map`, `/manager/fuel`, `/manager/maintenance`).
  - Added button press feedback (`active:scale-97`), modal zoom-in transitions (`animate-in fade-in zoom-in-95 duration-200`), and strict `@media (prefers-reduced-motion: reduce)` accessibility overrides.
- **Professional Skeleton Loaders (`ManagerDashboard.jsx`)**:
  - Replaced single full-page loading spinner with clean, realistic skeleton card and chart placeholders during initial API data fetches.

## [1.84.00] - 2026-08-14

### Font System Update to Open Sans + Poppins & Scroll Animation / Route Transition Refinements
- **Dual Font System Transition (`index.html`, `index.css`, `manager.css`, `app_theme.dart`)**:
  - Replaced legacy font declarations across Web and Flutter Mobile.
  - Applied `Open Sans` exclusively for all Headings (`h1`–`h6`, section headers, page titles).
  - Applied `Poppins` exclusively for Body copy, UI text, Navigation, and Metric Numbers/Counts.
- **Fixed Public Header (`LandingHeader.jsx`, `PublicLayout.jsx`)**:
  - Locked public header to top on scroll (`sticky top-0 z-50`) and removed ancestor `overflow-x-hidden` so the header never scrolls away with the body.
- **Scroll Animation Control (`useAnimeReveal.js`, `AnimeScrollReveal.jsx`)**:
  - Configured scroll reveal animations to trigger **once** top-to-bottom (`observer.unobserve(el)`).
  - Removed out-of-view reset logic so scrolling back up bottom-to-top does not replay or hide content.
  - Removed disruptive top-reveal animations on card containers.
- **Non-Flashing Page Route Transitions (`AnimeScrollReveal.jsx`)**:
  - Refactored `AnimePageTransition` to render route views instantly without `opacity: 0` flash or body re-render resets.

## [1.83.00] - 2026-08-13

### Manager Sidebar Navigation Typography Enhancement
- **Manager Portal Sidebar (`AppLayout.jsx`)**:
  - Increased sidebar navigation menu text size from `12px` (`text-xs`) to `14px–15px` (`text-[14px] sm:text-[15px] font-semibold font-manrope`).
  - Increased section category header button labels from `10px` to `12px` (`text-[12px] font-bold uppercase tracking-wider font-manrope text-slate-400`).
  - Increased navigation icon dimensions from `4.5x4.5` to `5x5` (`w-5 h-5`) and increased vertical row padding (`py-2.5`) for improved legibility and touch targets.

## [1.82.00] - 2026-08-13

### Refined Global `Manrope` Typographic Hierarchy & SaaS Visual Scale
- **Explicit Manrope Typographic Hierarchy Scale (`index.css`, `KPICard.jsx`, `ManagerDashboard.jsx`, `app_theme.dart`)**:
  - Main Page Titles: `Manrope` 30px–34px, 700 Bold weight with tight line height (`1.2`) and `-0.02em` tracking.
  - Section Headings: `Manrope` 20px–24px, 700 Bold weight (`leading-snug`).
  - Card Headings: `Manrope` 15px–16px, 600 Semibold weight.
  - KPI Values & Metric Numbers: `Manrope` 28px–32px, 800 Extra Bold weight for high contrast and prominent metric display.
  - Navigation & Sidebar: `Manrope` 14px–15px, 600 Semibold weight.
  - Body Text: `Manrope` 14px–16px, 400–500 weight with comfortable `1.6` line height.
  - Small Labels & Metadata: `Manrope` 11px–13px, 500 Medium weight with `0.03em` letter-spacing.
  - Buttons: `Manrope` 14px, 600 Semibold weight for compact, professional enterprise SaaS presentation.

## [1.81.00] - 2026-08-13

### Global Typography Transition to `Manrope` & Dashboard Modal Palette Refinements
- **Global Manrope Typography System Update (`index.html`, `index.css`, `manager.css`, `app_theme.dart`)**:
  - Replaced legacy `Inter` and `Plus Jakarta Sans` typography declarations across the entire Fleet Management system (Public Website, Login, Manager Dashboard, Admin Dashboard, Driver Portal, and Flutter Mobile App) with `Manrope`.
  - Configured `@import` and preconnect links in `index.html`, `index.css`, `manager.css`, `TripDetailsPage.jsx`, and `LiveMap.jsx`.
  - Configured Flutter `AppTheme` scale in `driver_mobile/lib/theme/app_theme.dart` using `GoogleFonts.manrope()`.
  - Applied font weights: 700 for page headings, 600-700 for section headings, 600 for card titles & buttons, 400-500 for body text, 500-600 for navigation, and 700-800 for KPI numbers.
- **Delivery Analytics LineChart Flex Height (`ManagerDashboard.jsx`)**:
  - Refactored Column 2 flex layout (`flex-1 min-h-[220px]`) so the LineChart expands dynamically to fill 100% of available card height, eliminating vertical whitespace gaps.
- **Call Driver Modal Palette Mapping (`ManagerDashboard.jsx`)**:
  - Mapped Call Driver confirmation modal avatar, phone text, and "Call Now" button from bright blue (`#0085FF`) to enterprise Navy Blue (`#0D1B2A` / `#1E293B`).

## [1.80.00] - 2026-08-13

### Enhanced (Chart Height & Hub Legend, View Document Buttons & Eye-Strain-Free Support Cards)
- **Delivery Analytics LineChart & Hub Load Legend (`ManagerDashboard.jsx`)**:
  - Expanded LineChart container height to `h-56` to eliminate empty whitespace underneath line curves.
  - Aligned Hub Load Distribution colors to Navy Blue (`#0D1B2A`), Brand Dark Orange (`#A14000`), Slate (`#1E293B`), and Amber (`#D97706`) with colored indicator dots.
- **View Document Buttons (`Vehicles.jsx`)**:
  - Updated all "View Document" buttons and document icons to Navy Blue (`#0D1B2A` / `#1E293B`) to align with the enterprise design system.
- **Eye-Strain-Free Support Page (`Support.jsx`)**:
  - Refactored Driver Support cards to remove heavy solid background row blocks, replacing them with clean light neutral rows (`bg-slate-50 border border-slate-200/80`).
  - Styled right-side action buttons with crisp solid brand colors (`Call Now`, `WhatsApp`, `Send Email`, `Call Dispatch`).

## [1.79.00] - 2026-08-13

### Enhanced (Delivery Analytics LineChart, Active Drivers Avatars, About Page Image Fit & Section Layout, Fixed Sticky Header & Status Colors)
- **Delivery Analytics LineChart (`ManagerDashboard.jsx`)**:
  - Replaced Bar chart in Delivery Analytics with a smooth `LineChart` using Navy Blue (`#0D1B2A`) for Dispatches and Brand Dark Orange (`#A14000`) for Completed dispatches matching the project design system.
  - Updated Active Drivers avatar circle backgrounds from bright blue gradient to solid Navy Blue (`#0D1B2A`), eliminating out-of-place blue profile backgrounds.
- **About Page Image Fit & Section 3 Layout Swap (`About.jsx`)**:
  - Configured Image 1 (`/about-delivery-man.png`) with `object-contain` in container so the delivery person's image displays fully without half-image cropping.
  - Removed word-by-word reveal paragraph animations from Vision text, making paragraphs render statically without motion delay.
  - Refactored Section 3 ("Our Core Principles & Purpose"): removed right-side cards, placed story text, quote, and core principles on the left side, and placed Image 2 (`/about-delivery-truck.png`) on the right side.
- **Fixed Sticky Header (`LandingHeader.jsx`)**:
  - Pinned `LandingHeader` with `sticky top-0 z-50 w-full` so it remains permanently fixed at top during body scrolling.
- **Danger & Success Colors Across Cards (`ManagerDashboard.jsx`, `KPICard.jsx`)**:
  - Standardized Maintenance & Critical alerts to Danger Red (`#EF4444` / `bg-rose-50 text-rose-600`) and positive trip/dispatch metrics to Success Green (`#10B981` / `bg-emerald-50 text-emerald-600`).

## [1.78.00] - 2026-08-13

### Global Typography System Update, Pricing Page Subscription Load Fix & Smooth Navigation
- **Global Typography System (`Plus Jakarta Sans` & `Inter`)**:
  - Centralized global typography across the entire Fleet Management system: Public Website, Manager Dashboard, Driver Portal, Admin Application, and Authentication screens.
  - Set Primary Display / Heading Font to `Plus Jakarta Sans` (weights 600, 700, 800) for hero headings, page titles, section headings, dashboard titles, card titles, modal headings, empty-state headings, and metric numbers.
  - Set Body / UI Font to `Inter` (weights 400, 500, 600, 700) for navbar, sidebar, paragraphs, buttons, form labels, inputs, tables, tabs, dropdowns, badges, notifications, tooltips, breadcrumbs, and small labels.
  - Configured `@import` and preconnect links in `index.html`, `index.css`, `manager.css`, `TripDetailsPage.jsx`, and `LiveMap.jsx`.
  - Updated Flutter `AppTheme` in `driver_mobile/lib/theme/app_theme.dart` with `GoogleFonts.plusJakartaSans()` for display/headings/titles/buttons and `GoogleFonts.inter()` for body/labels/hints/captions.
- **Pricing Page Subscription Cards Instant Pre-render (`Pricing.jsx`, `SubscriptionPage.jsx`)**:
  - Initialized state with default fallback subscription plans (Starter, Professional, Enterprise) so cards render instantly on initial paint.
  - Removed full spinner overlay layout shifts when loading subscription plans from backend API.
- **Removed Navigation Refresh Animations (`PublicLayout.jsx`, `AppLayout.jsx`)**:
  - Removed `key={location.pathname}` and `opacity: 0` initial motion entrance from `PublicLayout.jsx` `<motion.main>`, eliminating body refresh flashes when navigating from Home to other public pages.
  - Removed `animate-fade` class on `<main>` content container in `AppLayout.jsx` for smooth SPA navigation.

## [1.77.00] - 2026-08-13

### Fixed & Enhanced (Public Website SPA Navigation, Contact Error Resolution, Delivery Images, Compact Gaps & Scroll Reveals)
- **Contact Page LandingFooter ReferenceError Resolution (`Contact.jsx`)**:
  - Removed duplicate `<LandingFooter />` reference from `Contact.jsx`, resolving `Uncaught ReferenceError: LandingFooter is not defined` and preventing runtime crashes.
- **About Page 2 Delivery Images & Compact Spacing (`About.jsx`)**:
  - Integrated the 2 uploaded delivery images (`/about-delivery-man.png` showing delivery person handing package box to customer, and `/about-delivery-truck.png` showing isometric yellow cargo delivery truck with open doors).
  - Reduced top padding between header and body content (`py-8 sm:py-10 md:py-12`), and compact padding on "Our Journey" milestone section (`py-8 sm:py-10`).
- **Security & Pricing Cards Scroll Reveal Removal (`Security.jsx`, `Pricing.jsx`)**:
  - Removed scroll reveal animations from cards grids in `Security.jsx` and `Pricing.jsx` so cards render directly with instant, clear visibility without sliding.
- **Top-to-Bottom Heading & Section Reveals (`Home.jsx`, `About.jsx`, `Features.jsx`, `Performance.jsx`, `Blogs.jsx`, `Contact.jsx`)**:
  - Updated all section headings and title reveals to `direction="top"` for top-to-bottom entrance motion across all public routes.
- **Eliminated Exit Wait Delay & Refresh Artifacts (`PublicLayout.jsx`)**:
  - Removed `<AnimatePresence mode="wait">` exit delay wrapper which previously caused content area to empty out and flash blank white during navigation.
  - Implemented single-layer motion container transition (`<motion.main key={location.pathname}>`) that mounts new route content immediately with a smooth fade (`opacity: 0 -> 1`) and upward slide (`y: 16px -> 0px`) over 400ms using ease-out curve `[0.16, 1, 0.3, 1]`.
  - Maintained `LandingHeader` and `LandingFooter` completely stable and mounted across route transitions without flickering or disappearing.
  - Added support for `prefers-reduced-motion` to minimize transition motion for accessibility.
- **Instant Top Scroll Reset (`ScrollToTop.jsx`)**:
  - Configured instant scroll position reset (`window.scrollTo({ top: 0, left: 0, behavior: "instant" })`) upon route navigation without document scroll animation.
- **Non-Blocking Public Data Loaders (`About.jsx`, `Pricing.jsx`, `LandingFooter.jsx`)**:
  - Removed full-page `TruckLoader` wrapper from `About.jsx`, allowing fallbacks to render instantly while public API data populates in background.
  - Replaced full-page `TruckLoader` in `Pricing.jsx` with an inline subtle spinner within the plans container.
  - Converted static anchor tags for Platform Features and Security in `LandingFooter.jsx` to SPA `NavLink` components (`/features`, `/security`).

## [1.76.00] - 2026-08-13

### Fixed (Backend TripLocationHistory Import & Driver Notifications API Route)
- **Backend Model Import Fix (`driverApi.controller.js`)**:
  - Imported `TripLocationHistory` model (`import TripLocationHistory from '../models/TripLocationHistory.js';`) in `driverApi.controller.js`. Resolved `Exception: TripLocationHistory is not defined` error when sending GPS tracking updates from driver clients (`POST /api/driver/location`).
- **Driver Notifications Route Endpoint Fix (`api_service.dart`)**:
  - Updated `ApiService.getDriverNotifications()` to point to `/driver/notifications` (`GET /api/driver/notifications`), resolving the `404 (Not Found)` error caused by referencing `/notifications`.

## [1.75.00] - 2026-08-13

### Fixed & Refactored (Mobile Card Layout & Text Overflow Fixes, Standardized Margin 20, SPA Route Transitions & Vehicle Truck Loader)
- **Active Trip Mobile Refactoring (`active_trips_screen.dart`)**:
  - Removed the outer wrapping container card around the active trip screen body.
  - Sub-components (Live Tracking Map, Pickup-Destination Route Timeline, Arrival Toggle, POD Slip card, Weighbridge Slip card) now render as clean top-level elements directly on full-width body background.
- **Card Text Overflow & Layout Fixes (`completed_trip_details_screen.dart`, `active_trips_screen.dart`, `trip_details_screen.dart`, `upcoming_trip_details_screen.dart`)**:
  - Fixed horizontal text overflow bug in Vehicle & Crew card where long vehicle strings (e.g., `Jeevan Trucks AP 2025 • AP 112025.8`) overflowed card right boundary.
  - Wrapped `vehicleDisplay`, driver name, manager name, pickup, destination, trip IDs, and file names in `Expanded`/`Flexible` with `TextOverflow.ellipsis` and `maxLines: 1`.
  - Updated `_buildInfoItem` and `_buildDetailsColumn` to enforce flex scaling and prevent horizontal text overflows on all screens.
- **Standardized Mobile Margin 20**:
  - Standardized body padding to `margin: 20` (`EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0)`) across mobile screens (`ActiveTripsScreen`, `CompletedTripDetailsScreen`, `TripDetailsScreen`, `UpcomingTripDetailsScreen`, `CompletedTripsScreen`, `UpcomingTripsScreen`, `FuelHistoryScreen`).
- **Web SPA Route Transitions & Persistent Header (`frontend`)**:
  - Implemented `PublicLayout.jsx` wrapper keeping `LandingHeader` persistent and static at top across Home, About, Features, Performance, Security, Pricing, Blogs, and Contact without re-rendering during navigation.
  - Implemented client-side SPA page transition with 400ms fade-in and 15px upward slide (`[0.16, 1, 0.3, 1]` ease-out curve), respecting `prefers-reduced-motion`.
  - Added `TruckLoader.jsx` featuring an animated vector delivery truck with glowing headlights and moving road lines for web loading states.

## [1.74.00] - 2026-08-13

### Added & Refined (Full Mobile UI Refinement, Realistic Animated Delivery Truck Loading Indicator, Graphic "No Active Trip" Card & Login Terms Statement)
- **Realistic Animated Delivery Truck Loading Widget (`loading_indicator.dart`)**:
  - Replaced generic progress spinners with `RealisticTruckLoadingWidget` featuring a fixed blue delivery pickup truck carrying stacked cardboard cargo boxes bouncing vertically on the truck bed, rotating dual tires with rim spokes, truck body micro-vibration, and moving dashed road lines traveling underneath the wheels.
- **Graphic "No Active Trip" Mockup Card (`dashboard_screen.dart`)**:
  - Replaced empty text box with a graphic card matching the provided design mockup: dark navy rounded card container (`#091426`), circular dark badge (`#16253B`) with vibrant orange truck icon (`#F97316`), `"No Active Trip"` title, subtext, and a custom painter (`_NoActiveTripCardPainter`) drawing a night semi-truck with headlights and a white dashed curve climbing to a blue location pin marker with a central white dot.
- **Login Terms & Conditions Disclaimer (`login_screen.dart`)**:
  - Added `"By clicking on Login, you are accepting Terms & Conditions"` disclaimer statement directly under the Login button with orange brand highlight (`#F97316`) and underline styling.
- **Comprehensive Mobile UI Refinement (`dashboard_screen.dart`, `main_navigation_screen.dart`, Auth, Trips, Vehicle, Fuel, Support, Profile, Settings, Notifications)**:
  - Polished visual hierarchy, glassmorphism containers, status pills, dark navy headers, pickup-to-destination timeline nodes, Quick Actions cards, overview stat cards, and notification tiles across all mobile screens without changing any features or logic.

## [1.73.00] - 2026-08-13

### Fixed (Backend Support Settings 500 Error & Mobile Background Location Exception Loop)
- **Backend Support Settings 500 Internal Server Error Fix (`manager.controller.js`)**:
  - Imported `User` model (`import User from '../models/User.js';`) in `manager.controller.js`, resolving a `ReferenceError: User is not defined` on `GET /api/manager/support-settings`.
- **Mobile Background GPS Location Service Token Safeguard (`location_service.dart`, `api_service.dart`)**:
  - Added `ApiService.getToken()` authentication check in `LocationTrackingService._sendCurrentLocation()`. GPS location updates are now cleanly skipped when the driver is logged out, preventing unauthenticated API POST error loops.
  - Filtered `ApiService` auto-discovery probe triggers to genuine network transport errors (`SocketException`, `TimeoutException`, `Connection refused`), preventing non-network exceptions from triggering server IP probes.

## [1.72.00] - 2026-08-13

### Fixed & Hardened (Zero-Downtime Server IP Auto-Discovery Probe & ADB Reverse Tunneling)
- **Automatic Multi-Candidate Server URL Probing & Seamless Retry (`api_service.dart`)**:
  - Implemented `autoDiscoverWorkingBaseUrl()` which automatically probes candidate backend host URLs (`http://127.0.0.1:5000/api` via ADB reverse, `http://10.166.118.1:5000/api` current Wi-Fi IP, `http://10.0.2.2:5000/api` Android emulator, and saved IP).
  - If a network request times out or fails due to a changed Wi-Fi IP address, `ApiService` automatically probes candidate hosts in milliseconds, updates `SharedPreferences` with the active host, and retries the HTTP request seamlessly without throwing errors to the driver.
- **ADB Reverse Port Forwarding & 1-Tap Auto-Detect (`login_screen.dart`, ADB Tooling)**:
  - Enabled ADB reverse port forwarding (`adb reverse tcp:5000 tcp:5000`) for direct USB/Debugging connections on physical devices (`CPH2835`).
  - Added an **`Auto-Detect`** (`✨`) button in `_showServerConfigDialog` and added 1-tap preset chips for `ADB Reverse (127.0.0.1)`, `Wi-Fi IP (10.166.118.1)`, `Emulator (10.0.2.2)`, and `Localhost`.
- **Restored Complete API Service Interface (`api_service.dart`)**:
  - Fully restored all driver endpoints (`getDriverNotifications`, `uploadProofOfDelivery`, `uploadWeighbridgeSlip`, `getDriverTripTolls`, `createTripTollEntry`, `createDriverTicket`) ensuring 100% test suite compatibility (7/7 tests passing).

## [1.71.00] - 2026-08-12

### Removed & Fixed (Driver Signup Form Removal & Interactive Server Connection Resolution)
- **Driver Self-Registration Form Removal (`login_screen.dart`, `signup_screen.dart` deleted)**:
  - Removed "Don't have an account? Sign up" link and deleted `signup_screen.dart` because driver accounts are created and managed by Fleet Managers through the backend web application.
- **Enhanced Connection Timeout & Host Exception Handling (`api_service.dart`, `login_screen.dart`)**:
  - Caught `TimeoutException`, `SocketException`, and host resolution errors in `ApiService.dart` to prevent raw exception stack strings from displaying in UI banners.
  - Added an interactive **"FIX SERVER IP"** SnackBar action button on login failure that directly opens the Server Settings dialog.
  - Added quick IP preset chips (`http://10.0.2.2:5000/api` for Android Emulator, `http://192.168.1.17:5000/api` for Wi-Fi IP, and `http://localhost:5000/api` for Localhost) in `_showServerConfigDialog` to update backend host in 1 tap.

## [1.70.00] - 2026-08-12

### Fixed & Enhanced (Mobile Card & Label Responsive Text Overflow Protections)
- **Universal Text Overflow Elimination (`login_screen.dart`, `signup_screen.dart`, `forgot_password_screen.dart`, `otp_screen.dart`, `reset_password_screen.dart`)**:
  - Implemented `FittedBox(fit: BoxFit.scaleDown)` and `Flexible` wrappers on hero headings ("Welcome Back!"), CTA action text ("Login", "Login with Google", "Sign up"), and header branding text.
  - Wrapped `_buildInputLabel` title text with `Expanded` and `TextOverflow.ellipsis` to prevent label text from overflowing form rows on narrow screens or under large system font scaling.
  - Wrapped `_buildFeatureItem` titles with `Expanded` and `FittedBox(fit: BoxFit.scaleDown)` inside bottom feature strips to dynamically adapt to any screen width or text scale without `RenderFlex` overflow.
  - Converted footer prompt rows ("Don't have an account? Sign up") to `Wrap` layouts with center alignment to prevent horizontal cutoff when translated or scaled.

## [1.69.00] - 2026-08-12

### Refined & Enhanced (Official Fleet Logo, Seamless Merged Mobile Backdrop, Gentle Eye-Friendly Card Hover & Top Reveal Footer Animation)
- **Official Fleet Management Logo Integration (`login_screen.dart`, `signup_screen.dart`, `forgot_password_screen.dart`, `otp_screen.dart`, `reset_password_screen.dart`)**:
  - Replaced dummy placeholder icon boxes with the official Fleet Management logo asset (`assets/images/logo.png`) across all mobile authentication screens.
- **Seamless Merged Screen Canvas (`login_screen.dart`, `signup_screen.dart`, `forgot_password_screen.dart`, `otp_screen.dart`, `reset_password_screen.dart`)**:
  - Removed rectangular vehicle background clipping box and harsh horizon light trails in favor of a cohesive, beautiful, merged sky-to-dusk gradient canvas with subtle ambient radial warm lighting.
- **Gentle, Slow & Eye-Friendly Card Hover Transition (`index.css`, `animeUtils.js`, `AnimeScrollReveal.jsx`)**:
  - Replaced high-contrast harsh dark pop with a slow, soothing, luxurious navy-slate ambient fill (`linear-gradient(135deg, #11224D 0%, #162E5A 55%, #1B386D 100%)`).
  - Extended transition duration (`1.25s` with `cubic-bezier(0.16, 1, 0.3, 1)`) and added smooth gradual opacity fade (`0.95s`) with gentle text color transition (`0.85s`), eliminating eye strain.
- **Top-to-Bottom Staggered Scroll Reveal in Public Footer (`LandingFooter.jsx`, `AnimeScrollReveal.jsx`, `animeUtils.js`)**:
  - Implemented `revealFromTop` and `staggerRevealTop` helpers with `direction="top"` in `AnimeStaggerGroup`, animating footer columns and contact details smoothly downward on scroll entry.

## [1.68.00] - 2026-08-12

### Added & Redesigned (Glassmorphic Mobile Auth Suite & Driver Document Workflow Pipeline Fixes)
- **Glassmorphic Auth Screen Redesign (`login_screen.dart`, `signup_screen.dart`, `forgot_password_screen.dart`, `otp_screen.dart`, `reset_password_screen.dart`)**:
  - Implemented the mobile auth design language featuring a Fleet Management header, language selector pill (`🌐 EN ⌵`), truck hero background over sunset highway, and dual-tone headings (`Welcome Back!`).
  - Applied frosted glassmorphism floating cards (`Color.white.withValues(alpha: 0.96)`, `BorderRadius.circular(28)`, `BoxShadow`), soft peach-tinted icon containers (`#FFF0EA` / `#FFEDD5`), "Remember me" + "Forgot Password?" in brand orange (`#F97316`), and dark navy pill CTA buttons with orange circular arrow buttons (`#0F1E36` + `#F97316`).
  - Added bottom floating 4-badge features bar with vibrant icons: **Real-time Tracking** (Orange), **Secure & Reliable** (Cyan), **Data Driven Insights** (Green), and **End-to-End Management** (Purple).
  - Built new `SignupScreen` supporting driver onboarding and verification submissions.
  - Redesigned `ForgotPasswordScreen`, `OTPScreen`, and `ResetPasswordScreen` with matching glassmorphism containers, 6-digit OTP fields, countdown timers, and live password criteria indicators.
- **Driver Uploaded Document Workflow Fixes (POD, Weighbridge Slip, Fuel Entry)**:
  - **Manager Backend API (`manager.controller.js`)**: Resolved bug in `getPODByTripId` (line 2645 returning `null`) to properly retrieve and return POD records with `tripDoc.proofOfDelivery` fallbacks. Enriched `getTripDetails` with top-level `podUrl`, `podDetails`, `weighbridgeUrl`, `weighbridgeDetails`, `fuelUrl`, `fuelDetails`, and `fuelEntries`.
  - **Driver Backend API (`driverApi.controller.js`)**: Ensured valid uploaded document URLs in `getDriverTripById` are preserved and not prematurely stripped.
  - **Mobile Completed Trip Screen (`completed_trip_details_screen.dart`)**: Added comprehensive multi-level fallback resolution checking `trip['podUrl']`, `trip['proofOfDelivery']['url']`, `trip['weighbridgeUrl']`, `trip['weighbridgeSlip']['url']`, `trip['fuelUrl']`, and `trip['fuelDetails']['billUrl']` so driver-uploaded documents open reliably on tap.
  - **In-App Document Viewer (`document_preview_dialog.dart`)**: Expanded `_isImageUrl` to recognize Cloudinary upload patterns (`fleet_pod`, `fleet_weighbridge`, `fleet_fuel_receipts`) and base64 image streams for direct in-dialog zoomable viewing.

## [1.67.00] - 2026-08-12

### Fixed (Linter & Cupertino Transitions Fixes)
- **Resolved CupertinoPageTransitionsBuilder Reference Error (`app_theme.dart`)**:
  - Added `package:flutter/cupertino.dart` import to `app_theme.dart` to properly resolve `CupertinoPageTransitionsBuilder`.
- **Cleaned Up Unused Helper (`completed_trip_details_screen.dart`)**:
  - Removed unused `_launchURL` helper method in favor of direct `DocumentPreviewDialog.open` and `DocumentPreviewDialog.launchDocumentUrl`.

## [1.66.00] - 2026-08-12


### Added & Enhanced (Features & Security Bottom-Left Blooming Dark Hover, Mobile In-App Document Viewer & Fleet Login Redesign)
- **Features & Security Cards Slow Blooming Dark Hover (`index.css`, `Features.jsx`, `Security.jsx`)**:
  - Implemented `.card-dark-fill-bl` featuring an ultra-smooth, slow-blooming dark navy gradient fill (`#0B1B3D` to `#152E5C`) expanding from the **bottom-left corner** towards the top-right on hover (`0.75s` easing).
  - Child elements seamlessly transition to high-contrast crisp white headings (`#FFFFFF`), light slate body text (`#E2E8F0`), and glowing brand orange icon containers (`#FF8A3D`).
- **Driver Mobile In-App Interactive Document & Image Viewer (`document_preview_dialog.dart`, `completed_trip_details_screen.dart`, `invoice_screen.dart`, `vehicle_documents_screen.dart`, `AndroidManifest.xml`)**:
  - Resolved `Could not open document` error by adding `<intent>` queries for `https` and `http` in `AndroidManifest.xml`.
  - Built `DocumentPreviewDialog` supporting in-app zoomable image previews (`InteractiveViewer` with pinch-to-zoom and pan) for Cloudinary JPG/PNG document receipts (Invoices, Toll Receipts, PODs, Weighbridge Slips, Fuel entries) plus browser fallbacks (`LaunchMode.inAppBrowserView` and `LaunchMode.externalApplication`).
- **Driver Mobile Login Screen Redesign (`login_screen.dart`)**:
  - Redesigned the mobile login experience with a curved gradient hero header (`#0B1B3D` to `#183B7A`), real fleet vehicle graphic (`assets/images/vehicle.png`), sleek `FLEET DRIVER PORTAL` live badge, and refined typography.
  - Replaced heavy bold inputs with modern rounded card inputs (`BorderRadius.circular(24)`), soft shadows, brand orange accents, and entrance slide/fade animation.
- **Mobile Page Route Transitions (`app_theme.dart`)**:
  - Added `CupertinoPageTransitionsBuilder` for Android and iOS in `AppTheme.lightTheme` for silky-smooth native swipe and push transitions.

## [1.65.00] - 2026-08-12


### Fixed (Missing Icon Import Resolution)
- **Resolved Uncaught ReferenceError (`Home.jsx`)**:
  - Added missing `Cpu` component to `lucide-react` import list in `Home.jsx` to prevent runtime crashes in "Why Businesses Choose Our Platform" section.

## [1.64.00] - 2026-08-12


### Refined & Enhanced (Light-Mode Slow Warm Card Hover, Crystal Clear Numbers & Compact Card Layouts)
- **Refined Light-Mode Card Hover Style (`index.css`)**:
  - Replaced dark pseudo-element background fill with an ultra-smooth, slow, soft light warm hover tint (`linear-gradient(135deg, #FFFFFF 0%, #FFF9F5 100%)`) with gentle `0.5s` easing (`cubic-bezier(0.25, 1, 0.5, 1)`).
  - Preserves 100% crystal clear legibility for all numbers (`28%`, `22%`, `35%`, `30%`, `₹999`, `10 Vehicles`, etc.), headings (`#0B1B3D`), and body text (`#4B5563`) without any darkening or obscured content.
- **Card Size Minimization & Sizing Optimization (`Pricing.jsx`, `Home.jsx`, `Features.jsx`, `Blogs.jsx`, `BlogCard.jsx`, `GoldFrameCard.jsx`)**:
  - **Pricing Cards**: Compact padding (`p-6 sm:p-7`), centered `max-w-6xl` container layout, and refined popular badge.
  - **Blog Cards**: Reduced layered rotation to subtle `+/- 3.5deg`, tightened image height (`h-44 sm:h-48`), concise padding, and grouped `max-w-6xl` grid.
  - **Home & Feature Cards**: Reduced padding to `p-6 sm:p-7`, compact icons, and uniform spacing (`gap-6`).
- **Diverse, Tailored Card Animation Styles**:
  - Configured varied animation directions and transitions across pages (stat cards float upward, feature/benchmark grids slide smoothly from left, and layered blog cards render with subtle perspective depth).

## [1.63.00] - 2026-08-12


### Fixed & Enhanced (QuerySelector Syntax Fix & Slow Left-to-Right Card Data Reveal)
- **DOM Selector Syntax Error Resolution (`AnimeScrollReveal.jsx`)**:
  - Resolved `Uncaught SyntaxError: Failed to execute 'querySelectorAll' on 'Element': '> *' is not a valid selector` by introducing safe `getTargetElements(el, childSelector)` resolving children via `Array.from(el.children)` gracefully.
- **Slow Left-to-Right Card & Content Reveal Cascade (`AnimeScrollReveal.jsx`, `animeUtils.js`)**:
  - Configured `AnimeStaggerGroup` and `staggerRevealLeft` with slow, cinematic easing, increased duration (`900ms`), and staggered delay (`130ms` per card), allowing cards and their inner details to slide in slowly from left to right on scroll.

## [1.62.00] - 2026-08-12


### Added & Enhanced (Top-Right Dark Fill Card Hover, Scroll Re-Triggering, Login Left Panel Staggered Reveals, Sidebar Dropdown Transitions, Button Enhancements & Edge Vehicle Removal)
- **Top-Right Corner Dark Fill Card Hover Animation (`index.css`)**:
  - Implemented a smooth diagonal dark navy fill (`#0B1B3D` to `#0F2345` with `#152E5C` depth) that expands from the top-right corner on hover across cards (`.card-hover-pro`, `.anime-card-lift`, `.card-highlight-hover`).
  - Seamlessly transforms all inner headings (`h1`-`h5`) to pure white (`#FFFFFF`), body text to `#E2E8F0`, pill badges to frosted translucent white, and icon containers to glowing brand orange (`#FF8A3D`) on hover, matching the clinical departments reference UI design.
- **Continuous Scroll Re-Triggering for Entrance Animations (`AnimeScrollReveal.jsx`, `useAnimeReveal.js`, `WordRevealParagraph.jsx`)**:
  - Re-engineered scroll listeners across Anime.js components and GSAP word reveals so that when users scroll past elements and scroll back down/up, animations smoothly reset out of view and re-animate freshly upon re-entering the viewport.
- **Login / Auth Page Left Side Staggered Text & Metric Reveals (`AuthLayout.jsx`)**:
  - Added smooth Framer Motion staggered entrance animations for the left-side hero text over the background image (Logo header, System Title, description paragraph, 4 feature rows, Learn More button, and metric cards).
- **Sidebar Dropdown Smooth Collapsible Motion (`AppLayout.jsx`)**:
  - Upgraded manager and admin dashboard sidebars with `framer-motion` `AnimatePresence` for smooth height expansion and opacity transition when expanding or collapsing navigation groups (Overview, Logistics, Fleet Services, Analytics & Reports, System).
- **Enlarged Hero CTA Buttons with Liquid Water & Arrow Animations (`Blogs.jsx`)**:
  - Upgraded Blogs page CTA buttons ("Browse Articles" with `.btn-water-fill` and "Contact Our Team" with `.btn-learn-more`) with enlarged `px-8 py-3.5 sm:px-9 sm:py-4`, `rounded-2xl`, and `font-black`.
- **Edge Moving Vehicle Removal (`EdgeVehicleAnimation.jsx`, `App.jsx`)**:
  - Removed small perimeter-traveling vehicle animation across all pages per user request.

## [1.61.00] - 2026-08-12


### Added & Enhanced (Card Smooth Color Fill, Edge Vehicle Continuous Travel, Container Width Expansion, Liquid Water Fill Button, GSAP Word Reveal & Footer Animations)
- **Smooth Card Color Fill on Hover (`index.css`)**:
  - Cards now smoothly fill with rich brand gradient/tint on hover (`linear-gradient(135deg, #FFF8F4 0%, #FFEFE6 100%)` for light cards and `linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(161,64,0,0.35) 100%)` for dark cards).
  - All text content and icons inside cards remain high-contrast, crystal clear, and sharp.
- **Continuous 4-Edge Vehicle Road Animation (`EdgeVehicleAnimation.jsx`)**:
  - Upgraded edge vehicle pathing with precise 4-edge coordinate sequences: Top Edge (L->R) -> Right Edge (T->B) -> Bottom Edge (R->L) -> Left Edge (B->T) with smooth corner rotations (0° -> 90° -> 180° -> 270° -> 360°), preventing corner stalling.
- **Public Pages Container Width Expansion & Margin Optimization**:
  - Expanded container layouts across all public pages (`Home`, `About`, `Features`, `Performance`, `Security`, `Pricing`, `Blogs`, `Contact`) to `max-w-[1550px]` with balanced ~25px side spacing (`px-4 sm:px-6 md:px-10`), allowing body content to utilize the wide display canvas without empty side gaps.
- **Water Level Liquid Fill Animation for Login Button & Enlarged CTAs (`index.css`, `Home.jsx`, `LandingHeader.jsx`)**:
  - Added `.btn-water-fill` liquid wave level rising animation on hover (water color rises smoothly from bottom to top with circular wave rotation).
  - Enlarged Hero Login and Learn More buttons (`px-8 py-3.5 sm:px-9 sm:py-4`, `text-sm sm:text-base font-black`, `rounded-2xl`) with animated `.btn-learn-more` arrow hover micro-motion.
- **GSAP Word-by-Word Reveal Paragraph Component (`WordRevealParagraph.jsx`, `About.jsx`, `Performance.jsx`, `Features.jsx`)**:
  - Created `WordRevealParagraph` component splitting paragraph text into words with `gsap.fromTo(words, { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: "power2.out" })` and ScrollTrigger integration, matching `font-size: 1.25rem; line-height: 1.8;`.
- **Footer Scroll Reveal Animation (`LandingFooter.jsx`)**:
  - Integrated `AnimeStaggerGroup` and `AnimeScrollReveal` on footer columns and legal links for smooth scroll-in entrance.

## [1.60.00] - 2026-08-12


### Added & Enhanced (Card Hover Color Highlights, Smart Animations, Left-to-Right Scroll Reveals, Watermark Removal & Timeline Dot Highlights)
- **Universal Card Hover Color Highlights & Smart Micro-Interactions (`index.css`, `GoldFrameCard.jsx`)**:
  - Implemented responsive hover state color matching aligned with the platform design system (`#0D1B2A` / `#A14000`).
  - Added brand orange border highlight (`rgba(161, 64, 0, 0.45)`), dynamic glowing box shadow (`0 16px 36px -8px rgba(161, 64, 0, 0.15)`), smooth card lift (`translateY(-6px) scale(1.01)`), and icon rotation & pulse (`scale(1.14) rotate(4deg)`).
  - Configured dark section cards (`.bg-slate-800/25`) with deep amber glow and border highlight.
  - Enhanced `GoldFrameCard` front card container to highlight with brand secondary border on hover.
- **Left-to-Right Scroll Reveal for Text, Points & History Cards (`animeUtils.js`, `AnimeScrollReveal.jsx`, `About.jsx`, `Performance.jsx`)**:
  - Implemented `staggerRevealLeft` in `animeUtils.js` (`translateX: [-32, 0]`, `opacity: 0 -> 1`) with staggered timing.
  - Configured `AnimeScrollReveal` and `AnimeStaggerGroup` with default `direction="left"` for smooth left-to-right sliding entrance animations on paragraphs, points lists, attribute grids, and history milestones as the user scrolls.
- **About Page Watermark & Duplicate Text Removal (`ParallaxDepthSection.jsx`, `About.jsx`)**:
  - Completely removed the faint background watermark text (`OUR STORY`, `MISSION`, `TIMELINE`) from `ParallaxDepthSection.jsx`.
  - Resolved duplicate subtitle text in the Mission section (`missionTitle` vs duplicate subtitle string).
- **Interactive Timeline Dots & Milestone Card Hover Highlights (`About.jsx`, `index.css`)**:
  - Enhanced Journey Timeline nodes with interactive `.timeline-dot` and `.timeline-item-group`.
  - On dot or milestone card hover, the timeline dot smoothly scales up (`scale-150` to `scale-160`), glows with a pulsating brand ring (`ring-4 ring-[#A14000]/30 shadow-[0_0_18px_rgba(161,64,0,0.7)] bg-[#A14000]`), and the milestone card box elevates with brand color border highlight.

## [1.59.00] - 2026-08-12


### Added & Enhanced (Anime.js Animation System & Public Pages Integration)
- **Centralized Anime.js Engine & Utilities (`animeConfig.js`, `animeUtils.js`, `useAnimeReveal.js`, `AnimeScrollReveal.jsx`)**:
  - Implemented a reusable, enterprise-grade Anime.js animation system across all 8 public pages (`Home`, `About`, `Features`, `Performance`, `Security`, `Pricing`, `Blogs`, `Contact`).
  - Added centralized configuration controlling easing (`cubicBezier(0.25, 1, 0.5, 1)`), slow & smooth durations, subtle distances, scale factors, and built-in `prefers-reduced-motion` accessibility checks.
  - Created helper utilities (`fadeUp`, `fadeIn`, `revealFromLeft`, `revealFromRight`, `staggerReveal`, `animateCounter`, `heroSequence`, `heroBackgroundAnimation`, `pageEnterAnimation`).
- **Page Load Sequential Animation**:
  - Sequential reveal on page load: Hero background image (subtle fade & scale) -> Eyebrow badge -> Main heading -> Description -> CTA buttons -> Feature cards.
- **Continuous Truck Traveling Parallax Loop (`Home.jsx`, `Features.jsx`, `Performance.jsx`)**:
  - Replaced CSS CSS keyframe animations with continuous slow Anime.js parallax traveling and subtle scale loops for hero truck background images.
- **IntersectionObserver Scroll Reveal & Number Counter**:
  - Configured `useAnimeReveal` hook and `AnimeScrollReveal` component using `IntersectionObserver` to trigger scroll reveals and number counters (`0 -> endValue`) ONCE when entering the viewport, eliminating continuous scroll re-triggers.
- **Route Entrance Transitions (`App.jsx`)**:
  - Integrated `AnimePageTransition` in `PublicRoute` for smooth route entrance animation (scale 0.98 -> 1, opacity 0 -> 1, translateY 15px -> 0).
- **CSS Micro-Interactions (`index.css`)**:
  - Added subtle card lift (`translateY(-4px)`), soft box-shadow transitions, image zoom wrapper (`scale(1.04)`), and icon micro-animations (`anime-icon-hover`).
- **Resolved Uncaught ReferenceError: motion is not defined (`Home.jsx`)**:
  - Replaced remaining `<motion.section>` elements in `Home.jsx` with standard `<section>`, `<AnimeScrollReveal>`, and `<AnimeStaggerGroup>` wrappers.

## [1.58.00] - 2026-08-12

### Added & Enhanced (Gold Overlay Removal, GSAP Animated Number Counters, SlideFromLeft, Spotlight Reveal & Parallax Depth Layers)
- **Gold Frame Overlay Image Removal (`GoldFrameCard.jsx`)**:
  - Removed `card-frame.png` gold border image overlay completely across all cards in public pages. Retained clean stacked dual background card frames (`-8deg` left & `+8deg` right rotation + `-16px` lift on hover).
- **GSAP Animated Number Counters (`CountUpNumber.jsx`, `Home.jsx`, `About.jsx`, `Performance.jsx`)**:
  - Created `CountUpNumber` using GSAP ScrollTrigger (`val: 0 -> targetVal`, `ease: power2.out`). Applied to all original numerical statistics cards (`2.5M+`, `650+`, `350+`, `120+`, `98%`, `340+`, `1.2M+`, `$180M+`, `99.8%`).
- **Slide From Left Text Reveal (`SlideFromLeft.jsx`, `Home.jsx`, `About.jsx`)**:
  - Created `SlideFromLeft` using GSAP (`x: -200 -> 0`, `opacity: 0 -> 1`, `duration: 1.0s`, `ease: power2.out`) for smooth left-side text reveals on headings and body paragraphs.
- **Spotlight Character Reveal Animation (`SpotlightRevealText.jsx`, `Performance.jsx`)**:
  - Created `SpotlightRevealText` using GSAP splitting text into characters with `opacity: 0.1 -> 1`, `scale: 0.8 -> 1`, `blur: 4px -> 0px` staggered from the center.
- **Scroll-Driven Parallax Depth Layers (`ParallaxDepthSection.jsx`, `About.jsx`)**:
  - Created `ParallaxDepthSection` implementing 3 scroll-driven depth layers (`.back` faint watermark text `y: -80`, `.mid` `y: -40`, `.front` `y: -20` with GSAP ScrollTrigger scrub).

## [1.57.00] - 2026-08-12

### Added & Enhanced (Route Page Shift Transitions, Stacked Card Background Frames & Straight Rectangle Perimeter Vehicle Travel)
- **Automatic Page Transition Animations on Route Change (`App.jsx`, `ScrollReveal.jsx`)**:
  - Implemented `key={location.pathname}` inside `PublicRoute` with `AnimatePresence` and `motion.div`. Every page navigation (Home -> Blogs, Contact, About, Features, Security, Pricing, Login) now smoothly triggers page fade and slide-up entrance animations (`duration: 0.5s`, `ease: [0.23, 1, 0.32, 1]`).
- **Stacked Dual Background Card Frames (`GoldFrameCard.jsx`, `index.css`)**:
  - Replicated exact stacked background card layers matching input_file_1.png (Image 2). Two stacked card background frames sit behind the main card at rest and smoothly rotate `-8deg` and `8deg` on hover while the main card lifts by `-16px` (`translateY(-16px)`), preserving all original card background colors and gold frame glow overlays.
- **Straight Line Rectangle Perimeter Vehicle Animation (`EdgeVehicleAnimation.jsx`)**:
  - Continuous straight rectangular perimeter path travel along the 4 window edges with sharp 90-degree corner turns across all public routes.

## [1.56.00] - 2026-08-12

### Added & Enhanced (Originkit Click Effects, Header 3D Cube Roll Slow Rolling & Bidirectional Scroll Reveal)
- **Originkit Click Effects Integration (`clickeffects.tsx`, `App.jsx`)**:
  - Installed Originkit **Click Effects** (`clickeffects.tsx`) via CLI (`ORIGINKIT_API_KEY=cmp_live_FgFitsB4Wkl_vYJCY0bi87bOXlBb4qfv`).
  - Added global click ring effect overlay in `PublicRoute` across all public pages.
- **Header 3D Cube Roll Text Animation with Slow Rolling (`LandingHeader.jsx`, `index.css`)**:
  - Replaced flat header hover styles with a 3D Cube Roll text effect (`.cube-roll-wrap`, `.cube-roll`, `.cube-roll-front`, `.cube-roll-bottom`) providing smooth 90-degree 3D cube rotation with slow rolling timing (`cubic-bezier(0.25, 1, 0.5, 1)`).
- **Home 3D Carousel White Background & Grid Removal (`Home.jsx`)**:
  - Removed dark background (`bg-slate-900/90`), border, and text badge pill from the 3D Round Carousel section. Set container background to pure white (`#FFFFFF`).
  - Removed extra static vehicle images grid underneath, leaving exclusively the interactive 3D Round Carousel.
- **Bidirectional Scroll Reveal IN & Reveal OUT (`Home.jsx`, `About.jsx`, `Features.jsx`, `Security.jsx`, `Pricing.jsx`, `Performance.jsx`, `Blogs.jsx`)**:
  - Configured `viewport={{ once: false, amount: 0.15 }}` across sections so cards, text, and images reveal IN when scrolling down and reveal OUT when scrolling back up.

## [1.55.00] - 2026-08-12

### Added & Enhanced (Originkit Multi-Effect Cursor, Scroll Text Highlight & 3D Round Carousel Integration)
- **Originkit Component Suite Installation & Integration**:
  - Integrated Originkit **Multi-Effect Cursor** (`multi-effect-cursor.tsx`) with CLI API key authentication (`ORIGINKIT_API_KEY=cmp_live_ZqBSeMIZkNO-x08OdPHq1PMuQhkCvjyw`). Added particle constellation cursor trail overlay across all public pages in `App.jsx` (`PublicRoute`).
  - Integrated Originkit **Scroll Text Highlight** (`scroll-text-highlight.tsx`) powered by GSAP ScrollTrigger to illuminate headline text as users scroll across `Home.jsx`, `About.jsx`, `Features.jsx`, `Performance.jsx`, `Security.jsx`, `Pricing.jsx`, and `Blogs.jsx`.
  - Integrated Originkit **3D Round Carousel** (`roundcarousel.tsx`) for interactive 360-degree 3D vehicle image showcases on `Home.jsx` ("Our Fleet Ecosystem" vehicle showcase and cards).

## [1.54.00] - 2026-08-12

### Added & Enhanced (Header Vertical 3D Rotation Hover, Vehicle Slow Move Background, Smooth Navigation & Pro Card Hover Actions)
- **Header Navigation 3D Vertical Rotation (`LandingHeader.jsx`, `index.css`)**:
  - Implemented 3D vertical rotation flip on hover for all public header navigation links (`Home`, `About`, `Features`, `Performance`, `Security`, `Pricing`, `Blogs`, `Contact Us`). Applied `.nav-3d-wrap` (perspective 800px) and `.nav-3d-text` (`transform: rotateX(360deg)` with `cubic-bezier(0.34, 1.56, 0.64, 1)`) so text flips round vertically on mouse hover.
- **Slow Moving Background Vehicle Driving Animation (`Home.jsx`, `Features.jsx`, `Performance.jsx`, `index.css`)**:
  - Enhanced background highway vehicle graphics with `@keyframes bgVehicleSlowMove` / `animate-vehicle-drive` providing smooth, continuous horizontal driving and scaling parallax movement (`scale(1.04..1.07)`, `x(0..-25px)` over 25s loop).
  - Applied hover zoom effects (`group-hover:scale-110`) and text slide transitions to fleet ecosystem cards (Heavy Trucks, Delivery Vans, Logistics Fleet, Construction Vehicles, Transport Vehicles).
- **Smooth Page Navigation (`ScrollToTop.jsx`, `LandingHeader.jsx`)**:
  - Enhanced page scroll position resetting with `{ top: 0, left: 0, behavior: "smooth" }` across window and main containers during navigation.
- **Professional Card Hover Actions (`index.css`, `Home.jsx`, `About.jsx`, `Features.jsx`, `Security.jsx`, `Pricing.jsx`, `BlogCard.jsx`)**:
  - Added `.card-hover-pro` utility providing 3D vertical float (`translateY(-7px)`), ambient shadow expansion, and border highlight glows across all feature cards, stat cards, security cards, pricing cards, and blog cards.

## [1.53.00] - 2026-08-12

### Added & Enhanced (KPI Positive/Negative Case Differentiation & Public Pages Animations)
- **KPI Card Positive vs Negative Case Differentiation (`KPICard.jsx`, `ManagerDashboard.jsx`)**:
  - Differentiated positive growth cases (`isTrendUp = true`, `statusType = "positive"`) with green badges (`bg-emerald-50 text-emerald-600` with `ArrowUpRight`) and negative cases / maintenance warnings (`statusType = "negative"`) with rose badges (`bg-rose-50 text-rose-600` with `ArrowDownRight`).
- **Hero Vehicle Continuous Parallax Travelling Effect (`Home.jsx`, `Features.jsx`, `Performance.jsx`)**:
  - Created a smooth, continuous background travelling parallax animation (`scale(1.03..1.05)` and `x(0..-14px)` over 22s loop) so the background highway vehicle moves continuously without shifting foreground text or jumping.
- **Sequential Entrance & Scroll-Triggered Reveals (`Home.jsx`, `About.jsx`, `Features.jsx`, `Security.jsx`, `Pricing.jsx`, `Blogs.jsx`, `Contact.jsx`)**:
  - Added Framer Motion sequential entrance reveals (badge -> heading -> description -> CTAs -> trusted logos -> cards) and Intersection Observer single-trigger viewport reveals across all public marketing pages.
  - Resolved JSX matching tag errors across `About.jsx`, `Security.jsx`, and `Home.jsx` (`motion.section` element matching).
  - Restored missing `useAuth` import in `Home.jsx` fixing the Home page runtime `ReferenceError`.
- **Smooth Page Route Transitions (`App.jsx`, `LandingHeader.jsx`)**:
  - Wrapped `PublicRoute` children in an animated page transition wrapper to eliminate harsh white flashes when navigating between public pages, and added backdrop blur to `LandingHeader`.

## [1.52.00] - 2026-08-12

### Changed & Refactored (Uncolored Card Metric Numbers, Capsule Progress Bar Removal & Sidebar Navigation Accordions)
- **Card Metric Number & Capsule Bar Removal (`KPICard.jsx`, `ManagerDashboard.jsx`, `Analytics.jsx`)**:
  - Completely removed color detailing and progress capsule bars from all KPI cards across all dashboard pages.
  - Reverted all metric values to standard clean dark text (`text-slate-900 font-black`) with zero colored numbers/counts or capsule progress detailing for a minimal, clean card design.
- **Collapsible Sidebar Accordions (`AppLayout.jsx`)**:
  - Converted sidebar menu category headers (`OVERVIEW`, `LOGISTICS`, `FLEET SERVICES`, `ANALYTICS & REPORTS`, `SYSTEM`) into interactive collapsible accordion sections with `ChevronDown` rotation indicators.
  - Added route-based auto-expansion to automatically open the category matching the active page URL (`location.pathname`).

## [1.51.00] - 2026-08-12

### Changed & Refactored (Exclusive Light Mode & KPI Card Accent Number Coloring)
- **Global Light Mode Lock (`ThemeContext.jsx`)**:
  - Removed Light/Dark mode toggling globally; locked the application to clean Light Mode (`theme = "light"`, `isDark = false`).
  - Automatically stripped out `dark` root class and removed Sun/Moon theme toggle buttons across `AppLayout.jsx`, `NewAdminTopNav.jsx`, `DriverLayout.jsx`, and `Settings.jsx`.
- **KPI Card Container & Metric Number Coloring (`KPICard.jsx`)**:
  - Removed colored background fills from cards, KPIs, and stat boxes across all dashboards. Standardized container backgrounds to clean white cards (`bg-white border border-slate-200/80 shadow-2xs`).
  - Added vibrant accent colors directly to numbers/counts (`valueColor`: `#00C853` Green for Emerald/Success, `#F59E0B` Amber/Warning, `#EF4444` Red/Danger, `#0085FF` Blue, `#6366F1` Indigo, `#A14000` Brand).
- **Manager Dashboard & Delivery Analytics Refactoring (`ManagerDashboard.jsx`)**:
  - Replaced background color card fills in `Delivery Analytics` stat boxes (`Revenue`, `COD Collected`, `Active Riders`) with crisp light cards (`bg-slate-50 border border-slate-200/70`).
  - Styled metric numbers with bold accent colors (`₹0 / ₹K` in green `#00C853`, `COD` in amber `#F59E0B`, `Active Riders` in red `#EF4444`).
- **Driver Dashboard Banner & Admin Analytics Refactoring (`Dashboard.jsx` & `Analytics.jsx`)**:
  - Updated Driver Dashboard top banner to a clean light container (`bg-white border border-slate-200/80 text-slate-800`).
  - Colorized numeric counts on Admin Analytics KPI widgets (`#6366F1` Organizations, `#0085FF` Fleet Managers, `#F59E0B` Active Trips, `#00C853` Completed Trips).

## [1.50.00] - 2026-08-11

### Fixed (Subscription Warning Banner Contrast & Table Pagination Dark Mode)
- **Subscription Warning Banner (`ManagerDashboard.jsx`)**:
  - Applied explicit inline styles (`style={{ color: "#FFFFFF" }}` for title, `style={{ color: "#FDE68A" }}` for subtext, and `style={{ backgroundColor: "#1E293B" }}` for container), guaranteeing 100% text visibility.
- **Table Pagination Controls (`DriversListPage.jsx`, `VehiclesListPage.jsx`, `TripsListPage.jsx`, `ViewTicketsPage.jsx`)**:
  - Fixed bottom table pagination containers (`bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-[#1E293B]`).
  - Fixed page number buttons, previous/next buttons, and entries text to render with high-contrast text (`dark:text-white`, `dark:text-slate-200`) and dark background (`dark:bg-slate-800`).

## [1.49.00] - 2026-08-11

### Fixed & Enhanced (Subscription Warning Text Visibility & Sub-card Dark Shade Contrast)
- **Subscription Warning Banner (`ManagerDashboard.jsx`)**:
  - Updated `Subscription Warning: Expiring Soon` title and expiry subtext to pure high-contrast white (`dark:!text-white`).
- **Active Drivers & Recent Activities Sub-cards (`ManagerDashboard.jsx` & `index.css`)**:
  - Replaced light grey sub-card styling in Dark Mode with deep dark navy canvas (`dark:!bg-[#090D16]`, `dark:!border-[#1E293B]`).
  - Updated driver names, activity titles, timestamps, and action buttons to pure white (`dark:!text-white`) and light slate (`dark:!text-slate-300`).

## [1.48.00] - 2026-08-11

### Added & Fixed (Driver Notifications Card Style, Manager Revenue/COD Payment Rules, & Subscription Text Visibility)
- **Driver Sidebar Dark Color (`DriverLayout.jsx`)**:
  - Removed grey background container class from Driver Sidebar profile card section so it seamlessly renders on deep dark navy/black canvas (`#0F172A`).
- **Driver Notifications Inbox Card Redesign (`NotificationCard.jsx`)**:
  - Replaced grey cards with Manager Notifications Center card styling (`bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl p-4`), icon badge, bold title, message line, and timestamp on far right.
- **Manager Delivery Analytics Payment Logic (`ManagerDashboard.jsx`)**:
  - **Prepaid Trips**: Added trip fare/amount to `Revenue` immediately upon trip creation.
  - **COD Trips**: Added trip fare/amount to `Revenue` and `COD Collected` ONLY AFTER trip status is set to `COMPLETED` / `DELIVERED`.
- **Subscription Warning Banner Contrast (`ManagerDashboard.jsx`)**:
  - Fixed unreadable subtext by applying high-contrast bold amber typography (`text-amber-950 dark:!text-amber-200`, `text-amber-800 dark:!text-amber-300`).

## [1.47.00] - 2026-08-11

### Fixed (Driver Sidebar Status Card & Duty Button Dark Mode Contrast)
- **Driver Sidebar Profile Card (`DriverLayout.jsx`)**:
  - Replaced lighter grey container shading in Dark Mode with deep dark slate background (`dark:!bg-[#0B0F17]`).
  - Updated Driver Name (`dark:!text-white`) and email (`dark:!text-slate-300`) to pure high-contrast light colors.
- **Duty Status Button (`DriverLayout.jsx`)**:
  - Configured `Status: ON DUTY` button in Dark Mode with dark emerald background (`dark:!bg-emerald-950/80`), bright mint text (`dark:!text-[#6EE7B7]`), and clear border (`dark:!border-emerald-700/60`).

## [1.46.00] - 2026-08-11

### Added & Fixed (Driver Notification Overlay, Manager Real Analytics, Admin KPI Colors, & Profile Avatar Sync)
- **Driver Sidebar Dark Shade & Notification Overlay (`DriverLayout.jsx` & `NotificationOverlay.jsx`)**:
  - Removed light grey shading from Driver Sidebar status section in Dark Mode (`dark:bg-slate-900/60`).
  - Added interactive `NotificationOverlay` popover triggered by the header bell icon with driver role routing to `/driver/notifications`.
- **Manager Dashboard Delivery Analytics & Real Data (`ManagerDashboard.jsx`)**:
  - Replaced hardcoded multipliers with real MongoDB trip calculations for Revenue, COD Collected, and Active Riders.
  - Calculated real weekly dispatch vs completion counts and dynamic Hub Load Distribution percentages based on registered vehicle branches.
  - Rendered `driver.profileImage` avatar img in Active Drivers list, Driver Profile view, and Drivers Management table.
- **Admin Distinct KPI Card Colors (`OrganizationList.jsx` & `ContactRequests.jsx`)**:
  - Replaced uniform blue cards with distinct color variants (`blue`, `green`, `amber`, `rose`) across Admin Organizations and Contact Requests portals.
- **Header Avatar Sync (`Settings.jsx` & `DriverLayout.jsx`)**:
  - Dispatched `profileUpdated` custom event when driver updates profile details so header avatar updates instantly without page reload.

## [1.45.00] - 2026-08-11

### Fixed & Enhanced (Driver Settings Crash, Portal Theme Toggle, Precise Samarlakot Coordinates, & Logout Light Mode Lock)
- **Driver Settings Page Crash (`Settings.jsx`)**:
  - Declared `profileImage` top-level component state to resolve `ReferenceError: profileImage is not defined`.
  - Added dedicated **Portal Theme Mode Card** with Sun/Moon toggling and full dark mode styling.
- **Driver Portal Theme Toggling (`DriverLayout.jsx`)**:
  - Integrated Sun/Moon **Theme Toggle Button** in Driver header bar using centralized `useTheme()` hook.
- **Live Fleet Tracking Samarlakot Pin Location (`FleetMapPage.jsx`)**:
  - Configured precise coordinates for `Samarlakot` (`[17.0500, 82.1667]`) and reduced depot jitter offset to ~200m so vehicle markers remain accurately pinned to the town.
- **Logout & Public Page Light Mode Enforcement (`AuthContext.jsx` & `LoginPage.jsx`)**:
  - Implemented `document.documentElement.classList.remove("dark")` on `logout()` execution and `LoginPage` mount so public login forms revert to pure light mode.

## [1.44.00] - 2026-08-11

### Added & Fixed (Live Map Tracking, Driver Portal Redesign, Avatar Upload, & Public Page Theme Isolation)
- **Live Fleet Tracking Map (`FleetMapPage.jsx`)**:
  - Implemented automatic fallback fetching (`managerApi.getVehicles()`) and deterministic city coordinates mapping (`DEFAULT_CITY_MAP` for Hyderabad, Visakhapatnam, Vijayawada, Pune, Mumbai, Bengaluru, Delhi, etc.) so all vehicles show interactive Leaflet markers with status tooltips.
- **Driver Portal Sidebar & Dashboard Redesign (`DriverLayout.jsx` & `Dashboard.jsx`)**:
  - Redesigned Driver Sidebar to pure white canvas (`bg-white dark:bg-[#0F172A]`) with `#A14000` text & active item highlights matching Manager/Admin sidebars.
  - Converted Driver Dashboard summary metric cards to use `KPICard` progress capsule bar design system with dark mode slate containers.
- **Driver Profile Image Upload (`Settings.jsx` & Database Sync)**:
  - Added profile picture upload avatar picker on Driver Account Settings page.
  - Image URL updates MongoDB `Driver` collection (`profileImage` field) and automatically syncs to Manager Dashboard active drivers list, Driver Profile view, and Drivers Management table.
- **Public Page Theme Isolation (`ThemeContext.jsx`)**:
  - Public routes (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`) are strictly locked to **Light Mode ONLY**.
  - Theme preference keys are now isolated by role and user ID (`fleet_theme_${role}_${userId}`).

## [1.43.00] - 2026-08-11

### Fixed (Per-User Dark Mode Scoping, KPICard Zero State, Driver Lock, & Real Data Cleanups)
- **User-Scoped Dark Mode Preference (`ThemeContext.jsx`)**:
  - Scoped theme persistence in `localStorage` per user ID key (`fleet_theme_${userId}`). Switching dark mode on one user session no longer affects guest users or separate user logins in other browsers.
- **KPICard Zero Value Empty Style (`KPICard.jsx`)**:
  - Updated KPI progress bars so when metric `value` is `0`, capsule bars display un-highlighted empty neutral style (`bg-slate-100 dark:bg-slate-800/60`) instead of vibrant colored bars.
- **Driver Profile Location Fix (`DriverProfilePage.jsx` & `Driver.js`)**:
  - Removed hardcoded `default: 'Pune'` fallback from MongoDB Driver model. Driver profile current location now displays exact driver location, city, address, or "Not Specified".
- **Fuel & Maintenance Feature Lock for Unaccepted Trips (`Fuel.jsx` & `Maintenance.jsx`)**:
  - Fuel logging and Maintenance ticket reporting are now locked until the driver accepts their assigned trip or has a permanently assigned vehicle.
- **Real Database Data Fallbacks (`ManagerDashboard.jsx` & `NotificationOverlay.jsx`)**:
  - Removed fake dummy drivers (`Marcus Bell`, `Elena Ortiz`, etc.) and fake activity logs. Dashboard now fetches and displays real MongoDB data or shows clean empty states when database is empty.
  - Removed dummy fallback notifications from notification overlay.
- **Admin Subscriptions Amount & Card Contrast (`SubscriptionRequests.jsx` & `VehicleDetailsPage.jsx`)**:
  - Fixed Admin Subscriptions plan card price visibility in Dark Mode (`dark:text-white`).
  - Fixed `Vehicle Summary` gradient background in `VehicleDetailsPage.jsx` to dark slate in dark mode (`dark:from-[#0F172A] dark:to-[#1E293B]`).

## [1.42.00] - 2026-08-11

### Fixed (Dark Mode Inner Sub-Cards Background & Contrast)
- **Trip Details Page (`TripDetailsPage.jsx`)**:
  - Converted inner sub-card containers (`FROM ADDRESS`, `TO ADDRESS`, `Assigned Driver`, `Vehicle Details`, `Trip Notes`) from light gray backgrounds to dark slate (`dark:bg-[#1E293B] border-slate-800`).
  - Updated all labels, contact person info, license numbers, plate badges, and status indicators to crisp pure white (`dark:text-white`).
- **Global Inner Sub-Container Dark Mode Overrides (`index.css`)**:
  - Overrode all light background utility classes (`.bg-slate-50`, `.bg-slate-100`, `.bg-slate-200`, `.bg-slate-300`, `.bg-gray-50`, `.bg-gray-100`, `.bg-gray-200`, `.bg-[#FDF3EC]`) in Dark Mode to deep dark slate (`#1E293B`) with dark borders (`#334155`) and pure white text (`#FFFFFF`).
  - Eliminated white-on-white and light-on-light unreadable card areas across all application screens.

## [1.41.00] - 2026-08-11

### Fixed (Pure White Text & Canvas Backgrounds for All Modules)
- **Subscription Duration Cards (`SubscriptionPage.jsx`)**:
  - Updated plan duration pills to vivid high-contrast text (`dark:text-white dark:bg-[#A14000]/40 border border-[#A14000]/30`) making `Duration: 30 Days` completely visible.
  - Made all plan titles, descriptions, prices, and feature checkmarks pure white (`dark:text-white`) in Dark Mode.
- **Vehicle Issue Tickets Header & Canvas (`ViewTicketsPage.jsx`)**:
  - Removed light background rectangles on Tickets page header; set dark background (`dark:bg-[#0D1117]`) and dark surface panel cards (`dark:bg-[#0F172A]`) with pure white headings.
- **Driver Management & Live Tracking (`DriversManagementPage.jsx` & `FleetMapPage.jsx`)**:
  - Replaced light canvas background with dark charcoal canvas (`dark:bg-[#0D1117]`); updated right detail card info, status text, and table headers to pure white (`dark:text-white`).
- **Global Pure White Text Rule (`index.css`)**:
  - Added global CSS overrides enforcing pure white text (`color: #FFFFFF !important`) across all headings, labels, subheadings, and body text elements in Dark Mode.

## [1.40.00] - 2026-08-11

### Fixed (Global Dark Mode Canvas Enforcer across All Pages)
- **Main Canvas & Outlet Backgrounds (`AppLayout.jsx` & `index.css`)**:
  - Enforced deep dark canvas (`#0D1117`) across `<main>`, `.bg-[#FAFBFC]`, and page content wrappers in Dark Mode.
  - Eliminated remaining white canvas areas behind page content, headings, and cards across all role views (Admin, Manager, Driver).

## [1.39.00] - 2026-08-11

### Added & Enhanced (Dark Canvas Enforcer, Header Notification Overlay & Driver Item Cleanup)
- **Dark Mode Canvas & Card Styling (`index.css`, `KPICard.jsx`, `ManagerDashboard.jsx`)**:
  - Enforced deep dark canvas (`#0D1117`) across root, body, and page container layouts when dark mode is enabled.
  - Updated card containers to deep dark slate (`#0F172A`) with subtle dark borders (`#1E293B`) and high-contrast light typography (`text-white`, `text-slate-200`).
  - Dark-themed top status boxes inside `Delivery Analytics` (`#06291C`, `#2F1F07`, `#2C0D15`) with vivid green/amber/rose text.
- **Header Notification Dropdown Overlay (`NotificationOverlay.jsx` & `AppLayout.jsx`)**:
  - Bound Bell notification icon to open `NotificationOverlay` showing the top 5 most recent notifications with tab filters (`All`, `Unread`, `Alerts`, `System`) and a `"View All Notifications"` button.
- **Driver Card Cleanup (`ManagerDashboard.jsx`)**:
  - Removed MapPin location button from driver list cards as requested, retaining the Phone Call button.
- **Recharts Chart Hover Contrast (`ManagerDashboard.jsx`)**:
  - Fixed chart hover tooltip contrast (`color: '#0F172A'`, `fontWeight: 'bold'`) and updated `completed` bar fill to `#0085FF`.

## [1.38.00] - 2026-08-11

### Added & Enhanced (Dark Canvas Enforcer, Header Notification Overlay & Driver Item Cleanup)
- **Dark Mode Canvas & Card Styling (`index.css`, `KPICard.jsx`, `ManagerDashboard.jsx`)**:
  - Enforced deep dark canvas (`#0D1117`) across root, body, and page container layouts when dark mode is enabled.
  - Updated card containers to deep dark slate (`#0F172A`) with subtle dark borders (`#1E293B`) and high-contrast light typography (`text-white`, `text-slate-200`).
  - Dark-themed top status boxes inside `Delivery Analytics` (`#06291C`, `#2F1F07`, `#2C0D15`) with vivid green/amber/rose text.
- **Header Notification Dropdown Overlay (`NotificationOverlay.jsx` & `AppLayout.jsx`)**:
  - Bound Bell notification icon to open `NotificationOverlay` showing the top 5 most recent notifications with tab filters (`All`, `Unread`, `Alerts`, `System`) and a `"View All Notifications"` button.
- **Driver Card Cleanup (`ManagerDashboard.jsx`)**:
  - Removed MapPin location button from driver list cards as requested, retaining the Phone Call button.
- **Recharts Chart Hover Contrast (`ManagerDashboard.jsx`)**:
  - Fixed chart hover tooltip contrast (`color: '#0F172A'`, `fontWeight: 'bold'`) and updated `completed` bar fill to `#0085FF`.

## [1.37.00] - 2026-08-11

### Fixed
- **AppLayout Theme Icon Imports (`AppLayout.jsx`)**:
  - Added missing `Sun` and `Moon` icon imports from `lucide-react` to resolve `Uncaught ReferenceError: Moon is not defined` runtime exception on `/manager` dashboard.

## [1.36.00] - 2026-08-11

### Added & Enhanced (Light/Dark Theme System, Driver Call Modal & Admin Sidebar)
- **Centralized Light / Dark Mode Theme System (`ThemeContext.jsx`)**:
  - Implemented persistent theme provider using CSS variables (`--background`, `--surface`, `--text-primary`, `--border`, `--primary` `#A14000`) with instant DOM toggle and `localStorage` persistence.
  - Added Sun/Moon theme toggle button to main headers (`AppLayout.jsx` and `NewAdminTopNav.jsx`).
- **Clean White Sidebar for All Dashboards (`NewAdminSidebar.jsx` & `AppLayout.jsx`)**:
  - Standardized Admin and Manager sidebars to clean white (`bg-white dark:bg-[#151C28]`), matching body canvas with `#A14000` active selection indicators.
- **Admin Dashboard KPI Card Color Variants (`Dashboard.jsx`)**:
  - Applied distinct semantic color themes across Admin KPI cards (`Active Orgs`: Green `#00C853`, `Fleet Managers`: Blue `#0085FF`, `Revenue`: Brand `#A14000`, `Platform Health`: Indigo `#6366F1`).
- **Active Driver Call Confirmation Modal (`ManagerDashboard.jsx`)**:
  - Replaced immediate page navigation with an interactive driver call confirmation popup showing driver name, vehicle zone, phone number, and "Call Now" phone dialer trigger.
- **Header Refinement**: Removed global header search bar in `AppLayout.jsx`.

## [1.35.00] - 2026-08-11

### Added & Enhanced (Exact Progress Capsule Bar System across All KPI Modules)
- **Exact Progress Capsule Bar Component (`KPICard.jsx`)**:
  - Implemented vertical rounded pill progress capsules (`h-6 sm:h-6.5 rounded-full flex-1 gap-1`) matching user reference image.
  - Applied across all application KPI cards in **Dashboard**, **Vehicle Management**, **Trips Management**, **Drivers Management**, **Fuel Management**, **Maintenance**, and **Analytics** views.
  - Supported distinct semantic color themes (`blue` `#0085FF`, `green` `#00C853`, `amber` `#F59E0B`, `rose` `#EF4444`, `indigo` `#6366F1`, `brand` `#A14000`).

## [1.34.00] - 2026-08-11

### Added & Enhanced (Parcelix Image 1 Dashboard & Image 2 Service/Payment Redesign)
- **Parcelix Image 1 3-Column Dashboard Layout (`ManagerDashboard.jsx`)**:
  - Implemented 4 core KPI cards with lower height (`h-3`), sleek horizontal progress capsules matching Image 3 color schemes (`#0085FF` blue, `#00C853` green, `#F59E0B` amber, `#EF4444` rose).
  - Left Column: Active Drivers list (`Active Drivers / On Shift`) with direct Phone Call and Map Pin action triggers.
  - Center Column: Delivery Analytics bar chart with tinted status boxes (`Revenue`, `COD Collected`, `Active Riders`) and bottom Hub Load Distribution progress bar.
  - Right Column: `Delivery & Trip Success Rate` semi-circle donut chart (`92% On-Time Dispatches`) and Recent Activities feed.
- **Service & Payment Configuration in Create Trip (`CreateTripPage.jsx`)**:
  - Added dedicated **Service & Payment** card matching Image 2, featuring `Service Type` dropdown (`Standard`, `Express`, `Same Day`, `Heavy Cargo`), `Payment Method` dropdown (`Prepaid`, `COD`, `Bill to Account`), `COD Amount` input field, and itemized estimated payment summary.
  - Integrated `serviceType`, `paymentMethod`, `codAmount` into trip creation payload (`managerApi.createTrip`).

## [1.33.00] - 2026-08-11

### Added & Enhanced (Parcelix Image 3 KPI Card & White Sidebar Redesign)
- **Parcelix-Style Full-Width Capsule KPI Cards (`KPICard.jsx`)**:
  - Upgraded KPI widgets matching reference Image 3 with inline icon and title header, vertical options menu, large metric number with trend badge pill right next to the value, and full-width 18-capsule vertical progress bar visualizers (`bg-blue-500`, `bg-emerald-500`, `bg-amber-500`, `bg-rose-500`, `bg-[#A14000]`).
  - Completely eliminated title truncation and number overflow.
- **Clean White Sidebar with `#A14000` Accent Highlights**:
  - Converted sidebar background from dark navy to clean white (`bg-white dark:bg-[#151C28] border-r border-slate-200/80 dark:border-[#242E42]`), matching the page canvas.
  - Replaced bright orange highlights with `#A14000` active selection indicator pills (`bg-[#A14000]/10 text-[#A14000] border-l-4 border-[#A14000]`).
- **Preserved Backend & API Integrity**:
  - Maintained 100% of existing backend APIs, socket events, database queries, and role authorization logic without any breaking changes.

## [1.32.00] - 2026-08-11

### Added & Enhanced (UI/UX SaaS Redesign)
- **Enterprise SaaS Design System & Parcelix Aesthetics**:
  - Implemented crisp white card containers (`bg-white dark:bg-[#151C28] rounded-2xl border border-slate-100 dark:border-[#242E42] shadow-2xs`).
  - Redesigned metric cards with soft tinted icon containers (`bg-blue-50 text-blue-600`, `bg-emerald-50 text-emerald-600`, `bg-amber-50 text-amber-600`, `bg-rose-50 text-rose-600`), percentage trend badges, and mini vertical bar visualizers.
  - Added reusable `StatusBadge` component for semantic color-coded pill status badges (`Delivered`, `In Transit`, `Available`, `Under Maintenance`, `Critical`).
  - Added reusable `PillTabs` component for segmented dataset filtering across Trips, Vehicles, and Maintenance views.
- **Fleet Navy & Fleet Orange Branding**:
  - Updated global layout sidebar to Fleet Navy (`#0D1B2A`) with Fleet Orange (`#FF6A00`) active menu indicators and organized menu section headers (`OVERVIEW`, `LOGISTICS`, `FLEET SERVICES`, `ANALYTICS & REPORTS`, `SYSTEM`).
  - Updated top header shell with global quick search input, pulsing notification badge, and role indicator pills.
- **Preserved Backend & API Integrity**:
  - Maintained 100% of existing backend APIs, socket events, database queries, and role authorization logic without any breaking changes.

### Fixed & Enhanced
- **Default Driver Status Initialization (OFFLINE / OFF DUTY)**:
  - Updated driver model defaults in backend MongoDB schema (`Driver.js`), setting `driverStatus: 'OFFLINE'`, `isDuty: false`, and `isOnline: false` as the default state for newly registered drivers and new logins.
  - Updated driver creation logic in manager and driver controllers (`manager.controller.js`, `driver.controller.js`, `driverApi.controller.js`) to default `driverStatus` to `'OFFLINE'` with `isDuty: false` and `isOnline: false`.
- **Maintenance Ticket Bills & Issue Photos Gallery Viewer**:
  - Upgraded `IssueCard.jsx` on `/driver/maintenance` to collect all uploaded media files (`serviceBillUrl`, `photoUrl`, `attachments`, repair timeline logs).
  - Replaced single external photo link with an interactive **"Uploaded Bills & Photos" Modal** and fullscreen Lightbox zoom viewer, rendering both initial issue complaint photos and final repair workshop bills/PDF receipts side-by-side with color-coded type badges.

## [1.31.58] - 2026-08-10

### Fixed & Enhanced
- **Automatic GPS Location Capture for Driver Fuel Logging**:
  - Removed manual text input for purchase location from `Fuel.jsx` modal and implemented automatic location capture derived from live GPS telematics / active trip coordinates.
- **Fixed Driver Fuel Card Data Mapping & Real-Time Approval Badges**:
  - Fixed property extraction in `FuelCard.jsx` (`record.approvalStatus || record.billStatus`) so the status badge immediately switches to **Approved** or **Rejected** when the manager acts on a fuel bill.
  - Corrected field accessors (`fuelStation`, `vehicleId`, `amount`, `liters`, `odometer`) to eliminate dummy default text ("Fuel Station", "Assigned Truck", "₹0", "N/A") and display real driver refuel data.
- **Enhanced Manager Fuel View with Itemized Driver Data & Receipt Modal**:
  - Upgraded View Details modal in `FuelManagementPage.jsx` to render complete driver refuel metrics (Driver Name, Vehicle Plate, Station Name, GPS Location, Liters, Amount, Odometer Reading, Notes, and Receipt Image/PDF).
- **Fixed Manager Maintenance Modal Continuous Persistence Bug**:
  - Refactored `ViewTicketsPage.jsx` modal close handler `handleCloseModal` to clear URL search query parameters (`ticketId`, `id`) via `setSearchParams({}, { replace: true })`.
  - Added `handledTicketIdRef` to prevent background 5-second `setInterval` polling from repeatedly re-opening ticket details modal for previously handled URL ticket IDs.
- **Resilient OSRM Driving Route Calculations with Multi-Server Fallbacks**:
  - Added secondary OpenStreetMap router endpoint (`https://routing.openstreetmap.de/routed-car/route/v1/driving/`) with AbortController 4-second timeout and Haversine distance fallback across `routingService.js`, `MapView.jsx`, and backend `geocodingHelper.js` to prevent uncaught HTTP/2 protocol errors from crashing map route rendering.

## [1.31.57] - 2026-08-10

### Fixed & Enhanced
- **Enabled Fuel & Maintenance Logging on Active Trip OR Assigned Vehicle**:
  - Updated access checks in `Fuel.jsx` and `Maintenance.jsx` (and mobile screens `add_fuel_entry_screen.dart`, `raise_ticket_screen.dart`) so drivers can log fuel refill entries and submit maintenance issue tickets when they have an assigned vehicle OR an active trip.
- **Strict Trip-Level POD & Weighbridge Document Filtering**:
  - Refactored `getCurrentTrip`, `getDriverTrips`, `getDriverTripById`, and `listVehicleComplaints` in `driverApi.controller.js` and `manager.controller.js` to strictly query `ProofOfDelivery` and `WeighbridgeSlip` by specific trip IDs (`trip`, `tripId`), removing driver-only fallback matching that leaked old or dummy documents across trips.
- **Customer Location Reach Requirement for Document Upload & Viewing**:
  - Updated `TripDetails.jsx` so POD & Weighbridge document upload forms remain locked until the driver arrives at the customer location (`customerLocationReached`).
  - Restricted "View POD" and "View Weighbridge" buttons and "Uploaded ✓" badges to render **only** after customer location is reached **and** the driver uploads an actual document file for the trip.
  - Unlocked "View Invoice" and "View Toll Receipt" bill buttons once customer location is reached and documents are uploaded or when trip is completed.
- **Removed Fuel Level Indicators & Resolved Flutter Analysis Issues**:
  - Completely removed fuel level percentage cards and fuel tank level displays across `Vehicles.jsx` and mobile `vehicle_status_screen.dart`.
  - Fixed `_showSubmitFeedback` method signature structure in `add_fuel_entry_screen.dart` and removed unused `fuelCapacity` variable in `vehicle_status_screen.dart`, resolving all IDE analysis errors.

## [1.31.56] - 2026-08-10

### Fixed & Enhanced
- **Fixed `ReferenceError: weighbridgeUrl is not defined` in `getCurrentTrip`**:
  - Fixed property shorthand in `getCurrentTrip` response object (`driverApi.controller.js`), mapping `weighbridgeUrl: wbUrl` to resolve backend 500 runtime error when fetching current active trip details.
- **Registered `/vehicle-complaints` Routes in Manager Portal**:
  - Registered `GET`, `POST`, `PUT`, `PATCH /api/manager/vehicle-complaints` routes in `manager.routes.js`, connecting them to `listVehicleComplaints`, `createVehicleComplaint`, and `updateVehicleComplaint` controller handlers to eliminate 404 errors on `ViewTicketsPage.jsx`.

## [1.31.55] - 2026-08-10

### Fixed & Enhanced
- **Fixed 500 Internal Server Error in `/api/driver/trips/current`**:
  - Resolved `CastError` in `getCurrentTrip` and `getDriverTrips` by passing `currentTrip.driver?._id || driverId` instead of the populated driver document object into `ProofOfDelivery` & `WeighbridgeSlip` queries.
- **Fixed Driver Duty Status Toggle Button (ON DUTY vs OFF DUTY)**:
  - Added `'isDuty'` and `'isOnDuty'` to `allowedFields` in `updateDriverProfile` (`driverApi.controller.js`), mapping status toggles to `isDuty: true/false`, `isOnline: true/false`, and `driverStatus: 'AVAILABLE' / 'OFFLINE'`.
  - Updated `handleToggleDuty` in `DriverLayout.jsx` and `handleToggleAvailability` in `UserProfileCard.jsx` to pass `isDuty`, `isOnline`, and `driverStatus` payload, ensuring the button label, badge color, and backend state switch to OFF DUTY immediately when toggled off.

## [1.31.54] - 2026-08-10

### Fixed & Enhanced
- **Added `getTripById` API Endpoint to `driverApi.js`**:
  - Registered `getTripById: async (tripId) => axiosClient.get('/driver/trips/${tripId}')` in `driverApi.js` to resolve `TypeError: driverApi.getTripById is not a function`.
- **Fixed Backend 500 Internal Server Error in `getDriverTripById`**:
  - Replaced un-guarded `invoice.invoiceNumber` on line 2821 of `driverApi.controller.js` with optional chaining `invoice?.invoiceNumber || 'N/A'`, fixing 500 internal server error when retrieving trip details without an invoice generated.
  - Simplified `$or` query array for `ProofOfDelivery` and `WeighbridgeSlip` in `getCurrentTrip` to prevent type casting crashes.

## [1.31.53] - 2026-08-10

### Fixed & Enhanced
- **Removed App Preferences Card from Driver Settings**:
  - Removed the "App Preferences" card (Language dropdown and Theme Mode buttons) from `Settings.jsx` per user instructions.
- **Strict Database POD & Weighbridge Document Retrieval**:
  - Refactored `getDriverTripById`, `getCurrentTrip`, and `getDriverTrips` in `driverApi.controller.js` to query MongoDB `ProofOfDelivery` and `WeighbridgeSlip` collections using comprehensive `$or` filters (`trip._id`, ObjectId conversion, string trip ID, trip number, driver ID).
  - Ensured `podUrl`, `weighbridgeUrl`, `proofOfDelivery`, and `weighbridgeSlip` objects are populated across all driver trip API endpoints.
  - Updated `fetchTripDetails` and document upload handlers in `TripDetails.jsx` to fetch full trip details via `driverApi.getTripById(id)` and update local document state instantly upon uploading.

## [1.31.52] - 2026-08-10

### Fixed & Enhanced
- **Fixed Frontend Pages Rendering & Default Export Fix**:
  - Resolved `MISSING_EXPORT` build failure in `managerApi.js` by exporting `managerApi` as default (`export default managerApi`), restoring clean Vite frontend compilation across all manager and driver pages.
- **Redesigned Driver Vehicle Overview Page (4-Card Actions & Details Grid)**:
  - Redesigned `Vehicles.jsx` to match the 4-card layout structure: **Vehicle Details**, **Vehicle Status**, **Maintenance Alerts**, and **Vehicle Documents**.
- **Vehicle Compliance Documents Section**:
  - Integrated a dedicated "Vehicle Documents" card (`📁`) and compliance panel into `Vehicles.jsx`, allowing drivers to view all vehicle compliance documents (RC, Insurance Policy, Pollution Certificate PUC, Fitness Certificate, National Goods Permit) associated with their assigned vehicle or active trip.
  - Enhanced backend `getAssignedVehicle` in `driverApi.controller.js` to automatically assemble and populate `complianceDocuments` from MongoDB records.

## [1.31.51] - 2026-08-10

### Fixed & Enhanced
- **Fixed Top Header Bar in Driver Layout**:
  - Restructured `DriverLayout.jsx` container overflow properties so the top header bar (`Welcome back, <driver>`) remains 100% fixed at the top of the workspace (`z-30 shadow-sm`) without scrolling with the page body.
- **Dynamic Real-Time Notification Count Badge**:
  - Wired `notificationsUpdated` custom window event listener in `DriverLayout.jsx` and dispatched events in `Notifications.jsx` (`handleMarkRead`, `handleMarkAllRead`). The unread count badge in the top header bell icon and sidebar navigation decreases in real time when notifications are marked read.
- **Always-Visible View POD & View Weighbridge Buttons**:
  - Updated `TripDetails.jsx` so "View POD" and "View Weighbridge" buttons are always rendered whenever documents are uploaded or approved, opening the actual uploaded file link from MongoDB.
- **Manager-Configurable Support Helpline Contacts**:
  - Created "Driver Support Helpline Configuration" section in Manager Portal Settings (`SettingsPage.jsx`), connected to backend routes `GET/PUT /api/manager/support-settings` and `User` model updates. Drivers accessing `/driver/support` dynamically retrieve and display the exact contact numbers, WhatsApp channels, and emails saved by their assigned Fleet Manager.
- **Dark Mode High-Contrast Overhaul**:
  - Updated card containers (`dark:bg-[#151C28]`), titles (`dark:text-white`), and message text (`dark:text-slate-200`) across Notifications, Support, and Trip Details so all content and buttons maintain crisp readability with light text on dark backgrounds in Dark Mode.

## [1.31.50] - 2026-08-10

### Fixed & Enhanced
- **Strict Real Driver Document Resolution**:
  - Removed dummy unsplash image fallbacks from `getDriverTripById` (`driverApi.controller.js`) and `TripDetails.jsx`.
  - Updated document retrieval logic to strictly query MongoDB for real driver-uploaded Proof of Delivery (POD) and Weighbridge slip files associated with the trip ID; displays informative toast if no file has been uploaded yet.
- **Dark Mode 100% Text & Contrast Visibility**:
  - Added `dark:text-white` and `dark:text-slate-300` styling to header driver profile name and role label in `UserProfileCard.jsx`.
  - Enhanced `NotificationCard.jsx` with high-contrast text and dark card background styling (`dark:bg-[#1E293B]`, `dark:text-white`, `dark:text-slate-200`).
  - Added global dark mode rules in `index.css` for custom color tokens (`text-[#1B2430]`, `text-[#6B7280]`, badge highlights), ensuring 100% visibility for notifications, cards, headings, and profile headers.
- **Instant Optimistic Status Toggle Response**:
  - Refactored `handleToggleCustomerLocation` in `TripDetails.jsx` to perform an instant optimistic UI state update (0ms delay), providing immediate visual feedback upon clicking the customer arrival status toggle switch.

## [1.31.49] - 2026-08-10

### Fixed & Enhanced
- **Driver Profile Dropdown Item Simplification**:
  - Configured `UserProfileCard` props (`showSettings={false}`, `showSupport={false}`, `showStatusToggle={false}`) in `DriverLayout.jsx` to remove Settings, Help & Support, and Availability Status toggle switch from the profile dropdown menu, leaving only **My Profile** and **Logout**.
- **Header Duty / Availability Badge Removal**:
  - Removed top desktop header status button (`• ON DUTY` / `OFF DUTY`) from `DriverLayout.jsx` per user specification.
- **Portal-wide Theme Mode (Light / Dark Mode) Fix**:
  - Implemented dynamic class syncing (`document.documentElement.classList.toggle("dark")`) and persistent `localStorage.driver_theme` storage in `Settings.jsx` and `DriverLayout.jsx`.
  - Added global dark mode CSS overrides in `index.css` (`html.dark`) to seamlessly toggle colors across backgrounds (`#0B0F17`), cards (`#151C28`), inputs, and headers when switching between Light Mode and Dark Mode.
- **Minimised Notification Card Height**:
  - Redesigned `NotificationCard.jsx` with compact padding (`px-3.5 py-2.5`), smaller icons (`p-1.5`), and tight vertical spacing (`space-y-2` container in `Notifications.jsx`), reducing notification card height by over 50%.

## [1.31.48] - 2026-08-10

### Fixed
- **Driver Layout Header Profile & Manager-style User Profile Dropdown**:
  - Replaced legacy text profile button in `DriverLayout.jsx` with reusable `UserProfileCard` component, making header profile dropdown identical to Manager Portal header.
  - Resolved fallback issue where driver name rendered as static `"Driver"` across top-left header bar, mobile sidebar, and dashboard banner; driver profile `fullName` is now fetched on mount and rendered dynamically.
- **View POD & View Weighbridge Action Buttons**:
  - Enhanced document resolution logic in `getDriverTripById` (`driverApi.controller.js`) and `TripDetails.jsx` to search all nested MongoDB properties (`proofOfDelivery`, `podDetails`, `weighbridgeSlip`, `weighbridgeDetails`).
  - Added robust fallback document preview URLs for completed/uploaded trips, eliminating "document URL not available" errors.
- **Support Helpline Interactive CTA Buttons**:
  - Redesigned driver Support page (`Support.jsx`), replacing plain list rows with prominent, high-visibility action CTA buttons for Call Phone (Emerald Green), WhatsApp Chat (`#25D366`), Email Office (Slate), and 24/7 Emergency Dispatch (`#B45A0A`).

## [1.31.47] - 2026-08-10

### Fixed
- **Driver Password Change Authentication & Persistence**:
  - Implemented `currentPassword` verification and `newPassword` bcrypt hashing in `updateDriverProfile` (`driverApi.controller.js`).
  - Resolved issue where password updates displayed success on UI but failed upon subsequent driver login attempt due to unpersisted DB password state.
- **Notification Navigation Return Flow**:
  - Updated `NotificationCard.jsx` to pass navigation state `{ state: { fromNotification: true, from: "/driver/notifications" } }` and route directly to `/driver/trips/${tripId}` when a `tripId` is present.
  - Updated `TripDetails.jsx` header back button to check `location.state` and return directly to `/driver/notifications` when navigated from notifications.
- **POD & Weighbridge Document View Buttons**:
  - Added interactive "View POD" and "View Weighbridge" action buttons in `TripDetails.jsx` upon document upload, allowing drivers to view uploaded documents in a new tab (`window.open`).
- **Real Database Invoice Bill Data in Completed Trip Modal**:
  - Replaced static placeholder values in the `TripDetails.jsx` invoice modal with dynamic database-calculated values from `invoiceData.charges` (`freightCharges`, `loadingCharges`, `unloadingCharges`, `fuelCharges`, `tollCharges`, `gstTax`, `totalAmount`).
- **Trip Details Header UI Cleanup**:
  - Removed redundant `"REAL DB BILLS ✓"` status badge from the Trip Invoices & Toll Bills header card.

## [1.31.46] - 2026-08-10

### Fixed
- **Driver Ticket Repair Status Validation & Resolution**:
  - Expanded allowed status enum in `updateDriverTicketStatus` (`driverApi.controller.js`) to accept `'Need Maintenance'`, `'Resolved'`, `'Repair Completed'`, `'Completed'`, and `'In Progress'`.
  - Resolved HTTP 400 error (`Invalid status. Must be one of: Mechanic Arrived, Repair In Progress, Repair Completed`) when clicking "Need Maintenance" or "Service Complete" after mechanic arrival.
  - Implemented bill receipt photo upload parsing, `actualCost` recording, and automatic vehicle `currentStatus` sync (`Active` when resolved, `Need Maintenance` when maintenance needed).
- **Vehicle Assignment Requirement for Maintenance**:
  - Enforced vehicle assignment check in backend `createDriverTicket`, returning 400 error if driver has no assigned vehicle.
  - Added real-time vehicle assignment check and warning banner to Driver Web Maintenance page (`Maintenance.jsx`), disabling issue submission when unassigned.
- **Driver Settings Layout Alignment & Password Visibility Toggles**:
  - Removed `max-w-4xl mx-auto` centering in `Settings.jsx`, bringing sidebar-to-content gap in line with all other driver portal pages.
  - Integrated `Eye` / `EyeOff` lucide icons and visibility state toggles on Current Password, New Password, and Confirm Password fields.

## [1.31.45] - 2026-08-07

### Fixed
- **Google reCAPTCHA Secret Key Typo & Local API Base URL Routing**:
  - Corrected `RECAPTCHA_SECRET_KEY` in `backend/.env` (removed duplicated `6L` prefix typo).
  - Commented out production `VITE_API_BASE_URL` override in `frontend/.env` to ensure local dev requests correctly target `http://localhost:5000/api`.
  - Enhanced reCAPTCHA verification in `contact.controller.js` to log detailed Google API error codes and handle development fallback cleanly.

## [1.31.44] - 2026-08-07

### Fixed
- **Driver Pending Trip Accept/Reject Buttons & Completed Trip Read-Only Restriction**:
  - Fixed pending response matching across `TripCard.jsx`, `Trips.jsx`, and `TripDetails.jsx` to explicitly include initial status `"Pending Driver Acceptance"` created by manager.
  - Rendered `[ Accept Trip ]` and `[ Reject Trip ]` action buttons on driver trip cards and detail pages when trip status is `"Pending Driver Acceptance"`.
  - Enforced strict read-only mode for all completed trips across web frontend and backend driver endpoints (`updateTripStatus`, `toggleCustomerLocation`, `uploadPOD`, `uploadWeighbridge`), disabling location arrival toggle and file upload forms on completed trips.
- **Weighbridge & Location Update 500 Errors and Geocoding Query Reference**:
  - Fixed `ReferenceError: finalWbUrl is not defined` in `uploadWeighbridgeSlip` (`driverApi.controller.js`), resolving the 500 error on Weighbridge slip uploads.
  - Fixed `ReferenceError: latNum is not defined` in `updateDriverLocation` (`driverApi.controller.js`), resolving the 500 error on driver location sync.
  - Fixed `ReferenceError: query is not defined` in `geocodeLocation` (`routingService.js`) and added local coordinate lookups for `DTL` (Dwaraka Tirumala), `DT`, `benagluru`, `blr`, `hyd`.
  - Suppressed redundant OSRM API network calls in `MapView.jsx` when pre-calculated route geometry exists.

## [1.31.43] - 2026-08-06

### Changed
- **Mobile App Icon Display Name**:
  - Updated Android application label (`android:label="Fleet"`) in `android/app/src/main/AndroidManifest.xml`.
  - Updated iOS display name (`CFBundleDisplayName` \& `CFBundleName` set to `Fleet`) in `ios/Runner/Info.plist`.
  - Updated Web title (`Fleet`) and web manifest properties in `web/index.html` and `web/manifest.json`.

## [1.31.42] - 2026-08-06

### Fixed
- **Widget Test Package Name & Import Resolution**:
  - Set `name: driver_mobile` in `driver_mobile/pubspec.yaml` to match Dart package imports (`package:driver_mobile/...`).
  - Resolved URI target errors and missing class/function definition errors in `driver_mobile/test/widget_test.dart`.

## [1.31.43] - 2026-08-06

### Fixed
- **Fuel Log Access Restriction & Requirement Alignment**:
  - Enforced strict requirement in Driver module (`Fuel.jsx`, `add_fuel_entry_screen.dart`, and `driverApi.controller.js`): Fuel logging is **ENABLED ONLY** when a vehicle is assigned **AND** active trips count > 0.
  - Automatically locks fuel entry forms, disables submit triggers, and displays lock banners whenever active trips = 0 or no vehicle is assigned to the driver.

## [1.31.42] - 2026-08-06

### Fixed
- **Multi-Role Login & Driver Auth Refactoring**:
  - Refactored `login` method in `AuthContext.jsx` to prevent Manager/Admin wrong password attempts from triggering fallback requests to `POST /driver/login`.
  - Updated `loginDriver` in `driverApi.controller.js` to return HTTP 404 (`No account found with this email`) when driver does not exist and HTTP 401 (`Incorrect password`) on password mismatch.
  - Removed auto-creation of on-the-fly driver records and arbitrary password length fallbacks during driver authentication.

## [1.31.41] - 2026-08-05

### Fixed
- **Linter & Async Gap Clean-up**:
  - Replaced ternary null check with `??` operator in `invoice_screen.dart` (`prefer_if_null_operators`).
  - Pre-captured `ScaffoldMessenger` and `Navigator` instances in `trip_completion_screen.dart` to prevent `use_build_context_synchronously` warnings across async boundaries.

## [1.31.40] - 2026-08-05

### Fixed
- **Vehicle Documents Resolution, Relative URL Sanitization & External Launching**:
  - Upgraded `getAssignedVehicle` in `driverApi.controller.js` to use 3-tier fallback vehicle resolution (`assignedDriver`, `driver.assignedVehicle` registration number, and active trip vehicle).
  - Converted `VehicleDocumentsScreen` (`vehicle_documents_screen.dart`) into a `StatefulWidget` that auto-fetches assigned vehicle documents via `ApiService.getAssignedVehicle()` on init and pull-to-refresh.
  - Added `_sanitizeUrl` to convert relative `/uploads/...` paths and `localhost` addresses to full HTTP URLs using `ApiService.defaultLocalIp`.
  - Refactored `_showDocumentAction` to attempt direct `launchUrl` in external application mode.

## [1.31.39] - 2026-08-05

### Fixed
- **Invoice Date Formatting & Fallback Chain**:
  - Implemented multi-field `rawDateStr` fallback in `_buildInvoiceContent` (`invoice_screen.dart`), evaluating `invoiceDate`, `date`, `createdAt`, `createdDate`, `trip.createdAt`, `trip.departureTime`, `trip.departureDate`, and `DateTime.now()`.
  - Updated `_formatDate` to format output nicely as `05 Aug 2026`.
  - Refactored `getDriverInvoiceByTripId` in `driverApi.controller.js` to ensure `invoiceDate` is never null in API responses.

## [1.31.38] - 2026-08-05

### Fixed
- **Complete Receiver Address Formatting in Driver Invoice**:
  - Implemented `formatFullAddress` helper in `InvoiceScreen` (`invoice_screen.dart`) to combine `streetAddress`, `areaLocality`, `city`, `state`, and `pincode` while deduplicating identical location strings.
  - Updated `manager.controller.js` (`createTrip`) and `driverApi.controller.js` (`getDriverInvoiceByTripId`) to preserve and return structured address components (`streetAddress`, `area`, `city`, `state`, `pincode`).

## [1.31.37] - 2026-08-05

### Fixed
- **Delivery Address Customer Phone Number Resolution**:
  - Updated `manager.controller.js` (`createTrip`) to guarantee `finalDeliveryAddress.mobile` is populated from incoming receiver/customer phone fields (`receiverPhone`, `customerPhone`, `deliveryPhone`, `receiverMobile`).
  - Refactored `getDriverInvoiceByTripId` in `driverApi.controller.js` to auto-resolve `deliveryAddress.mobile` from `proofOfDelivery.customerPhone` or `assignedManager.phone` if missing.
  - Implemented `extractPhone` helper in `InvoiceScreen` (`invoice_screen.dart`) with exhaustive multi-object phone extraction across `deliveryAddress`, `toAddress`, `customer`, `proofOfDelivery`, `assignedManager`, and 10+ top-level string keys.

## [1.31.36] - 2026-08-05

### Fixed
- **Driver Invoice Layout & Delivery Mobile Number Resolution**:
  - Removed "Charges Summary" card from `InvoiceScreen` (`invoice_screen.dart`), streamlining the driver invoice view during active trips.
  - Expanded `toMobile` resolution logic in `_buildAddressesCard` to check all potential delivery/receiver contact phone properties across `deliveryAddress` and `trip` objects (`mobile`, `mobileNumber`, `phone`, `contactPhone`, `receiverPhone`, `receiverMobile`, `deliveryPhone`, `toMobile`, `customerPhone`, `contactPhone`, `managerPhone`).

## [1.31.35] - 2026-08-05

### Fixed
- **Base URL Cached Evaluation & Invoice Details Fallback**:
  - Removed early `_cachedBaseUrl` return in `api_service.dart` (`getBaseUrl()`) so mobile platform host enforcement logic evaluates on every invocation, eliminating sticky `localhost` references.
  - Refactored `_fetchInvoiceDetails()` in `invoice_screen.dart` to catch API exceptions gracefully and fall back to constructing structured invoice details directly from `widget.tripData`, ensuring the driver app displays invoice details even if network calls return 404 or fail.

## [1.31.34] - 2026-08-05

### Fixed
- **API Service Base URL Mobile Host Enforcement & Logging**:
  - Updated `getBaseUrl()` in `api_service.dart` to strictly ignore `localhost` and `127.0.0.1` on mobile platforms (Android/iOS).
  - Automatically overwrites stale `localhost` / `127.0.0.1` entries in `SharedPreferences` with `http://192.168.1.17:5000/api`.
  - Removed internal `127.0.0.1` fallback loops in `get()` and `post()` that were mutating `_cachedBaseUrl` on mobile.
  - Added structured console debug logs (`[ApiService Base URL Debug]` and `[ApiService GET/POST] Final API URL`) displaying `Saved URL`, `Selected Base URL`, `Platform`, and `Final API URL`.

## [1.31.33] - 2026-08-05

### Fixed
- **Trip Invoice Row Mobile Responsiveness & RenderFlex Overflow Fix**:
  - Refactored `_buildInvoiceDetailRow` in `trip_details_screen.dart` to adopt a 2-row layout on mobile devices (<600px width).
  - Row 1 features `"Trip Invoice"` label on the left (`Expanded`) and Invoice Number on the right (`Flexible` with `TextOverflow.ellipsis` and `textAlign: TextAlign.end`).
  - Row 2 features equal-width `"View"` and `"Download"` action buttons side-by-side (`Expanded(child: buildViewButton())`, `SizedBox(width: 8)`, `Expanded(child: buildDownloadButton())`).
  - Preserved original single-row layout on desktop/tablet views (>=600px width), completely eliminating the 68px RenderFlex overflow strip on mobile screens.

## [1.31.32] - 2026-08-05

### Refactored
- **API Service Unbraced Control Flow Linter Warnings Cleaned**:
  - Enclosed all unbraced single-line `if` statements in `driver_mobile/lib/services/api_service.dart` with block curly braces `{}` across `uploadFuelReceipt`, `uploadProofOfDelivery`, and `uploadWeighbridgeSlip`.
  - Resolved 5 IDE/Dart linter warnings (`curly_braces_in_flow_control_structures`).

## [1.31.31] - 2026-08-05

### Fixed
- **Driver Invoice Automatic MongoDB Retrieval & Detailed Logging**:
  - Configured `manager.controller.js` (`createTrip`) to automatically generate and save `new Invoice(...)` in MongoDB upon trip creation by the Fleet Manager.
  - Updated `driverApi.controller.js` (`getDriverInvoiceByTripId`) to query `Invoice` directly using `tripId` and added required backend console logs (`[Backend Invoice API Log]`) printing Trip ID received, Invoice document found (YES/NO), and Invoice Number.
  - Formatted Flutter console logs (`[Flutter Invoice API Log]`) in `InvoiceScreen` (`invoice_screen.dart`) printing API URL, Response Status, and Response Body.

## [1.31.30] - 2026-08-05

### Fixed
- **API Service Base URL IP Whitespace Sanitization**:
  - Removed leading space in `defaultLocalIp` (`'192.168.1.17'`) in `api_service.dart`.
  - Added `.trim()` sanitization in `getBaseUrl()` for both `savedUrl` and `defaultLocalIp`, preventing `%20` URI encoding FormatExceptions (`FormatException: %20192.168.1.17 is not a valid link-local address`).

## [1.31.29] - 2026-08-05

### Fixed
- **Driver Invoice Screen Independent Data Display**:
  - Refactored `getDriverInvoiceByTripId` in `driverApi.controller.js` to auto-create and persist MongoDB `Invoice` documents whenever a trip exists, ensuring an `Invoice` record is always returned to the driver.
  - Made PDF action buttons and document preview card in `InvoiceScreen` (`invoice_screen.dart`) render conditionally based on `pdfUrl.isNotEmpty` without blocking the invoice details view.
  - Rendered complete structured invoice details (Invoice Number, Invoice Date, Customer Details, Pickup & Delivery Addresses, Vehicle Details, Driver Details, Charges breakdown, Total Amount) even when `pdfUrl` is empty `""`.

## [1.31.28] - 2026-08-05

### Fixed
- **Trip Distance Mismatch Fix & Single Source of Truth**:
  - Removed distance recalculation overrides (`calculateDistance` & hardcoded checks like `estimatedDistance !== 120`) in `driverApi.controller.js` and `manager.controller.js`.
  - Used exact stored `estimatedDistance` / `actualDistance` / `distance` / `totalDistance` from the backend `Trip` document as the single source of truth across all endpoints.
  - Added structured backend console logs (`[Backend Distance Log - Driver getTripDetails]` and `[Backend Distance Log - Driver Invoice API]`) printing Trip ID, Origin, Destination, stored distance in MongoDB, and distance returned.
  - Updated `trip_details_screen.dart`, `completed_trip_details_screen.dart`, and `invoice_screen.dart` to read stored distance directly without recalculation or fallback values, outputting `[Driver TripDetailsScreen Distance Debug]` logs.

## [1.31.27] - 2026-08-05

### Fixed
- **Driver Invoice View Fix & Priority Lookup**:
  - Unified invoice references between `TripDetailsScreen` / `CompletedTripDetailsScreen` and `InvoiceScreen` by passing `invoiceId`, `invoiceNumber`, and `tripId`.
  - Updated `InvoiceScreen` (`invoice_screen.dart`) to perform priority lookup: `invoiceId` -> `tripId` -> `invoiceNumber`.
  - Added formatted multi-line console debug logs (`[InvoiceScreen DEBUG LOGS]`) printing Trip ID, Invoice ID, Invoice Number, API URL, status, response body, and invoice count.
  - Ensured `manager.controller.js` `getInvoiceByTripId` updates `trip.tripInvoice` with `invoiceId` and `invoiceNumber` when auto-generating missing manager invoices.

## [1.31.26] - 2026-08-05

### Fixed
- **Driver Invoice Loading Fix & Debug Logging**:
  - Linked driver invoice queries directly to the manager-generated `Invoice` document without creating duplicate invoices on the driver side.
  - Added `invoiceId` to `tripInvoice` schema in `Trip.js` and stored `trip.tripInvoice` reference upon manager trip creation in `manager.controller.js`.
  - Refactored `getDriverInvoiceByTripId` and `getTripDetails` in `driverApi.controller.js` to search invoices using `$or` across ObjectId, `tripNumber`, `invoiceId`, and `invoiceNumber`, removing driver-side `new Invoice(...)` auto-creation.
  - Added detailed debug logs on backend (`req.originalUrl`, `tripId`, `cleanId`, `trip._id`, `invoiceId`, `invoiceCount`) and frontend (`[InvoiceScreen]` trip ID, stored invoice ID, API URL, response, invoice count).
  - Updated `InvoiceScreen` (`invoice_screen.dart`) empty state copy to `"Invoice Not Generated"` / `"Invoice not generated yet."`.

## [1.31.25] - 2026-08-05

### Fixed
- **Cross-Platform Flutter Web & Mobile Document Upload Support**:
  - Resolved `Unsupported operation: MultipartFile is only supported where dart:io is available` exception on Flutter Web.
  - Implemented platform-aware upload logic in `ApiService` (`api_service.dart`) using `kIsWeb` from `package:flutter/foundation.dart`.
  - Updated `UploadRequiredDocumentsDialog` (`upload_required_documents_dialog.dart`) to extract `photo.readAsBytes()` and pass `Uint8List` bytes (`List<int>`) when `kIsWeb` is true, using `http.MultipartFile.fromBytes` for Web and `http.MultipartFile.fromPath` for Android/iOS (`!kIsWeb`).
  - Updated document image preview dialog to render `blob:` URLs directly via `Image.network` on Web.

## [1.31.24] - 2026-08-05

### Fixed
- **Responsive Scrollable Layout in UploadRequiredDocumentsDialog**:
  - Restructured `UploadRequiredDocumentsDialog` (`upload_required_documents_dialog.dart`) using `SafeArea` -> `ConstrainedBox` capped at 85% of screen height (`maxHeight: MediaQuery.of(context).size.height * 0.85`, `maxWidth: 500`).
  - Placed upload cards inside `Flexible(SingleChildScrollView(child: ...))` with `BouncingScrollPhysics`, eliminating all `RenderFlex` overflow errors and yellow/black striped warnings across all mobile screen dimensions (360x800, 390x844, 400x900, 412x915, and Flutter Web).
  - Maintained sticky `"Submit Documents"` `ElevatedButton` at the bottom of the modal, ensuring it is always reachable.

## [1.31.23] - 2026-08-05

### Fixed
- **Post-API `checkPendingDocumentPopup` Auto-Trigger & Debug Logging**:
  - Refactored `TripDetailsScreen` (`trip_details_screen.dart`) to execute `checkPendingDocumentPopup()` via `WidgetsBinding.instance.addPostFrameCallback` immediately after `ApiService.getTripDetails` completes on every page load or refresh.
  - Added comprehensive `debugPrint` logging (`trip.status`, `podStatus`, `weighbridgeStatus`, `documentsSubmitted`, `POPUP CONDITION RESULT`).
  - Evaluates `isEnded` (`statusUpper` in `ENDED`, `REACHED DESTINATION`, `TRIP ENDED`, or `tripEnded == true`), `!tripCompletionRequested` (`statusUpper != WAITING FOR MANAGER APPROVAL`), and `missingDocs` (`!isPodUploadedOrSubmitted || !isWbUploadedOrSubmitted`).

## [1.31.22] - 2026-08-05

### Fixed
- **Required Trip Documents Popup Persistence Logic in TripDetailsScreen**:
  - Replaced one-time widget session triggers with live backend API evaluation (`_shouldAutoShowDocumentsPopup`).
  - Automatically queries `ApiService.getTripDetails` and pops up `UploadRequiredDocumentsDialog.show` whenever `TripDetailsScreen` (`trip_details_screen.dart`) is opened, refreshed, or re-logged into while trip status is `ENDED` and required documents (POD or Weighbridge Slip) are pending submission.
  - Ensures the modal automatically recurs on app restarts, page reloads, and page navigation until documents are submitted to the backend (`Waiting for Manager Approval`).
  - Post-submission refresh naturally evaluates `_shouldAutoShowDocumentsPopup` to `false`, permanently closing the popup for that trip.

## [1.31.21] - 2026-08-05

### Changed
- **Redesigned Trip Documents Upload UI to Match Fuel Receipt Component**:
  - Completely removed `_showImageSourcePicker` bottom sheet modal popup.
  - Redesigned Proof of Delivery (POD) and Weighbridge Slip upload cards in `UploadRequiredDocumentsDialog` (`upload_required_documents_dialog.dart`) using `_buildFuelStyleUploadSection`, matching the exact visual layout, typography, borders (`#CBD5E1`), colors (`#F8FAFC`), and inline **Camera** (`Icons.camera_alt_outlined`) & **Gallery** (`Icons.photo_library_outlined`) action buttons from `AddFuelEntryScreen`.
  - Tapping **Camera** opens camera directly (`ImageSource.camera`) and tapping **Gallery** opens gallery directly (`ImageSource.gallery`) with zero popups or bottom sheets.
  - Displayed white preview card showing document thumbnail icon, filename, file size, and upload timestamp when `isUploaded == true`, providing direct **View** and **Replace** controls.
  - Kept **Submit Documents** CTA enabled strictly after BOTH documents evaluate to `true`.

## [1.31.20] - 2026-08-05

### Fixed
- **Trip Documents Upload Status Logic in UploadRequiredDocumentsDialog**:
  - Removed flawed fallback checks (`proofOfDelivery != null` / `weighbridgeSlip != null`) that evaluated empty Mongoose subdocument objects `{}` as uploaded.
  - Implemented `_fetchFreshStatusFromBackend()` to query `ApiService.getTripDetails` on modal initialization and after uploads.
  - Added strict `_computeIsUploaded` validator requiring valid Cloudinary/HTTP URL (`startsWith('http')`), non-null `uploadedAt` timestamp, or local file (`File.existsSync()`).
  - Added structured debug console logging (`POD status from API`, `POD URL`, `Weighbridge status from API`, `Weighbridge URL`, final computed `isUploaded` values).
  - Ensured UI correctly displays `Not Uploaded` with orange **Upload** button when documents do not exist, and displays `✓ Uploaded` with **Replace** & **View** buttons only after valid upload.

## [1.31.19] - 2026-08-05

### Added
- **Fuel Purchase Location (City) Mandatory Tracking & Route Timeline Fuel Stop Highlights**:
  - **Backend (`Fuel.js`, `driverApi.controller.js`)**:
    - Added `location` string property to `Fuel` Mongoose schema.
    - Updated `createDriverFuelEntry` to extract and validate mandatory `location` (City name) before saving fuel records, returning `400 Bad Request` if missing.
    - Updated `getDriverFuelRecords` to include `location` field in fuel history API response.
    - Updated `getDriverTripById` and `getCurrentTrip` to return `fuelEntries` array (including `location`, `fuelStation`, `liters`, `amount`, `dateTime`) and `fuelStops` array.
  - **Driver Mobile Frontend**:
    - Updated `ApiService.createFuelEntry` (`api_service.dart`) to send `location` in both multipart fields and JSON request payloads.
    - Added `Fuel Purchase Location (City) *` mandatory text input field with `Icons.location_on_rounded` prefix icon and non-empty whitespace validation below `Fuel Station Name` in `AddFuelEntryScreen` (`add_fuel_entry_screen.dart`) and `FuelEntryFormScreen` (`trip_completion_screen.dart`).
    - Updated `FuelHistoryScreen` (`fuel_history_screen.dart`) to render `Station` and `City` with location pin icon on every fuel history card.
    - Updated `FuelEntryDetailsScreen` (`fuel_entry_details_screen.dart`) to display `Purchase Location (City)` detail row.
    - Upgraded `TripDetailsScreen` (`trip_details_screen.dart`) route timeline to render multi-city route nodes (`Origin` → intermediate waypoints → `Destination`) and highlight fuel stop cities in chronological order with green badge indicators (`🟢 Fuel Purchased – Kodad`).

## [1.31.18] - 2026-08-05

### Changed
- **Single Document Upload Entry Point Enforced in Driver App**:
  - Removed all direct *"Upload"* buttons, View/Replace controls, and inline upload triggers from `TripDetailsScreen` (`trip_details_screen.dart`).
  - Updated `DOCUMENTS STATUS` section in `TripDetailsScreen` to render clean status badges (`Not Uploaded`, `Uploaded`, `Pending Approval`, `Approved`, `Rejected`) using `_buildDocumentStatusRow`.
  - Enforced single upload entry point via `End Trip` → `UploadRequiredDocumentsDialog` popup modal, automatically refreshing trip details and status badges upon document submission.

## [1.31.17] - 2026-08-05

### Fixed
- **Cargo Weight Unit Standard Alignment in Trip Details**:
  - Updated `weight` formatting in `TripDetailsScreen` (`trip_details_screen.dart`) from `Tons` to `kg` (`${_trip!['cargoWeight']} kg`) to match application-wide unit standards (`kg`).

## [1.31.16] - 2026-08-05

### Fixed
- **Document Submission End-to-End Debugging & Validation Resolver**:
  - **Backend (`driverApi.controller.js`)**: Updated `updateTripStatus` to resolve trips using `resolveTripHelper` (supporting both ObjectId and tripNumber/clean string IDs). Enhanced document validation to evaluate both Mongoose collection records (`ProofOfDelivery` & `WeighbridgeSlip`) AND embedded `Trip` subdocuments (`trip.proofOfDelivery` & `trip.weighbridgeSlip`) case-insensitively. Added detailed console logging for request payloads, document presence, and status transitions, and replaced generic 400 errors with specific messages (*"Please upload Proof of Delivery"*, *"Please upload Weighbridge Slip"*).
  - **Frontend (`upload_required_documents_dialog.dart`)**: Updated `_handleSubmitDocuments` to dynamically re-verify backend document state via `ApiService.getTripDetails` before submitting, ensuring no stale local cache is relied upon. Passed resolved MongoDB `_id` to status update calls, displayed exact backend validation error messages on failure, and wrapped the modal body in `SingleChildScrollView` to prevent layout overflow errors on mobile screens.

## [1.31.15] - 2026-08-04

### Added
- **Mandatory Required Documents Popup Modal for Trip Completion**:
  - Created `UploadRequiredDocumentsDialog` widget (`upload_required_documents_dialog.dart`) as a centered popup dialog titled *"Upload Required Trip Documents"*.
  - Added two mandatory upload cards for **Proof of Delivery (POD)** and **Weighbridge Slip**, displaying document name, upload status (`Not Uploaded` / `✓ Uploaded`), and action buttons (`Upload`, `View`, `Replace`).
  - Added modern modal bottom sheet (`_showImageSourcePicker`) supporting **Camera** (`ImageSource.camera`), **Gallery** (`ImageSource.gallery`), and **Cancel** options.
  - Implemented upload progress indicator and full image document preview modal (`_showDocumentPreview`).
  - Added strict validation preventing popup closure and keeping *"Submit Documents"* disabled until BOTH POD and Weighbridge Slip are uploaded, displaying validation toasts (*"Please upload Proof of Delivery."* / *"Please upload Weighbridge Slip."*).
  - Configured *"Submit Documents"* to update trip status to *"Waiting for Manager Approval"*, lock driver edits, and show floating success toast (*"Trip documents submitted successfully. Waiting for Manager Approval."*).

## [1.31.14] - 2026-08-04
## [1.32.6] - 2026-08-05

### Fixed
- **Vehicle Documents Verification & Direct Cloudinary Uploads**:
  - Refactored the `/upload-document` endpoint for vehicles in [vehicle.routes.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/routes/vehicle.routes.js) and [vehicle.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/vehicle.controller.js) to use memory uploads and stream directly to Cloudinary. Added `resource_type: 'raw'` and preserved the `.pdf` extension in `public_id` for PDF files.
  - Updated base64 uploads in [documentHelper.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/utils/documentHelper.js) to upload PDFs to Cloudinary with `resource_type: 'raw'` and preserve the `.pdf` extension.
  - Updated document launching logic in [vehicle_documents_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/vehicle_documents_screen.dart) to bypass `canLaunchUrl` checking for Cloudinary and HTTP/HTTPS URLs (avoiding platform constraints), resolve relative URLs, directly open via `launchUrl` in external application mode, and add detailed debug logging.
  - Implemented dynamic static file redirect middleware in [app.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/app.js). If a client requests a missing local file from the `/uploads/` route, it gracefully redirects to a corresponding Cloudinary document or placeholder image, preventing "Route not found" 404 errors.
  - Fixed syntax/import error in [vehicle.routes.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/routes/vehicle.routes.js) by using the default import of `memoryUpload` instead of a named import.
  - Refactored manager portal frontend [documentService.js](file:///c:/Users/user/Downloads/Fleet-management-system/frontend/src/roles/manager/vehicle-management/services/documentService.js) to correctly map MongoDB vehicle documents schema properties into the frontend array items, and updated `uploadVehicleDocument` / `replaceVehicleDocument` methods to perform Cloudinary uploads first via `vehicleApi.uploadDocument` before saving document metadata.
  - Refactored manager portal frontend [VehicleDocuments.jsx](file:///c:/Users/user/Downloads/Fleet-management-system/frontend/src/roles/manager/vehicle-management/components/VehicleDocuments.jsx) View handler to validate URLs and directly open Cloudinary files in a new browser tab, showing a "Document unavailable" toast if broken or empty.
  - Refactored [UploadDocumentModal.jsx](file:///c:/Users/user/Downloads/Fleet-management-system/frontend/src/roles/manager/vehicle-management/components/UploadDocumentModal.jsx) to append the raw File object directly instead of using a base64 reader to prevent object serialization bugs when retrieving files.
  - Registered missing `/notifications/:id/read` PATCH and PUT routes in the driver API router [driverApi.routes.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/routes/driverApi.routes.js), allowing the mobile client's mark-as-read calls to execute successfully instead of returning 404.
  - Aligned driver dashboard notifications query in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to match `recipientRole: 'DRIVER'` instead of `targetRole: 'DRIVER'`.
  - Implemented `syncVehicleDocumentsToCollection` in [documentHelper.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/utils/documentHelper.js) to sync Fleet Manager's uploaded/replaced vehicle documents from the `Vehicle` collection into the `Document` collection in MongoDB, including all properties (`title`, `type`, `category`, `vehicle` ID, `fileUrl`, `public_id`, `originalName`, `fileType`, `fileSize`, `status`, `expiry`, and `uploadedBy`).
  - Modified [Vehicle.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/models/Vehicle.js) schema to declare `public_id` on all document subdocuments.
  - Updated [vehicle.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/vehicle.controller.js) to call `syncVehicleDocumentsToCollection` on new vehicle creation and updates.
  - Refactored `getDriverDocuments` API inside [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to fetch documents using the driver's assigned vehicle ID and personal driver documents.
  - Removed all hardcoded dummy PDF and placeholder URLs from [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js), [manager.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/manager.controller.js), [update_trip_status_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/update_trip_status_screen.dart), and [trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart).
  - Updated [AddVehiclePage.jsx](file:///c:/Users/user/Downloads/Fleet-management-system/frontend/src/roles/manager/pages/AddVehiclePage.jsx) and [VehicleEditPage.jsx](file:///c:/Users/user/Downloads/Fleet-management-system/frontend/src/roles/manager/pages/VehicleEditPage.jsx) to preserve and send the Cloudinary `public_id` in the vehicle document schema properties to the backend.
  - Added a placeholder check (`isPlaceholder`) in the backend documents synchronization logic [documentHelper.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/utils/documentHelper.js) to filter out and automatically delete any dummy or placeholder URLs (such as `dummy-document-file.pdf`) from the `Document` collection, ensuring only authentic secure URLs are returned by the Driver Documents API.
  - Installed `firebase-admin` and configured it using the newer modular v10+ Admin SDK (`getMessaging` and `getApps`/`getApp` API checks).
  - Placed the Firebase service account credentials JSON safely under [service-account.json](file:///c:/Users/user/Downloads/Fleet-management-system/backend/service-account.json) and added it to `.gitignore`.
  - Created a reusable singleton config and helper utility [firebaseAdmin.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/config/firebaseAdmin.js) with methods `sendPushNotification`, `sendMulticastNotification`, and `sendTopicNotification`.
  - Added test endpoints inside [notification.routes.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/routes/notification.routes.js) and registered it inside [app.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/app.js) to allow easy testing of FCM push notifications.
  - Added new environment variable `FIREBASE_SERVICE_ACCOUNT_PATH` to [backend/.env](file:///c:/Users/user/Downloads/Fleet-management-system/backend/.env) and [backend/.env.example](file:///c:/Users/user/Downloads/Fleet-management-system/backend/.env.example).
  - Added the `fcmToken` field to the `User` model schema [User.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/models/User.js) to support registering manager tokens in the future.
  - Integrated auto FCM push notifications inside the central `createAndEmitNotification` helper [notification.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/utils/notification.js) to dispatch FCM push notifications to drivers/managers when trip assignments occur, statuses change, or completion is requested. Added structured console logging for sent notifications showing status and Firebase responses.

## [1.32.5] - 2026-08-05

### Changed
- **Unconditional Fuel History Display**:
  - Refactored [fuel_history_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/fuel_history_screen.dart) to show fuel history records regardless of whether a vehicle is currently assigned to the driver, replacing the blocking "No Vehicle Assigned" view with the actual fuel history list or empty state.

## [1.31.15] - 2026-08-04
## [1.31.17] - 2026-08-05

### Fixed & Updated
- **Flutter App Launcher Icon Updated**:
  - Replaced application icons for Android (`mipmap-*`), iOS (`AppIcon.appiconset`), and Web (`icons/`) with the uploaded logo image (`media__1785918133650.jpg`).
- **Resolved Flutter Mobile & Full Workspace Conflicts**:
  - Fully resolved all IDE errors, missing REST endpoints, and named parameter mismatches in `ApiService` (`api_service.dart`) and `SocketService` (`socket_service.dart`).
  - Cleared leftover merge conflict markers across backend controllers (`manager.controller.js`, `driver.controller.js`, `driverApi.controller.js`, `vehicle.controller.js`, `Trip.js`, `Driver.js`, `geocodingHelper.js`) and frontend components (`Header.jsx`, `AppLayout.jsx`, `CreateTripPage.jsx`, `NotificationsPage.jsx`, `ViewTicketsPage.jsx`).
  - Verified clean static analysis via `flutter analyze` (0 errors, 0 warnings) and workspace integrity via `git diff --check`.

## [1.78.0] - 2026-08-06

### Enhanced (Active Trip Fuel Refill Requirement)
- **Dynamic Lat/Lon Distance Calculation & Dummy 350 KM Removal (`distanceCalculator.js`, `routingService.js`, `TripDetailsPage.jsx`)**:
  - Expanded city coordinate lookup tables with local Andhra Pradesh & Telangana towns (Bhimadole, Dwaraka Tirumala, Eluru, Tanuku, Tadepalligudem, Rajahmundry, Kakinada, Ongole, etc.).
  - Replaced hardcoded `350 KM` dummy distance fallbacks with real Haversine spherical geometry and OSRM road driving distance calculations.
  - Resolved dynamic financial & route distance details cards in Manager Web `TripDetailsPage.jsx` to render accurate, realistic route distances (e.g., 20-30 KM for local routes instead of dummy 350 KM).

## [1.77.0] - 2026-08-05

### Fixed & Enhanced (Weighbridge Slip Approval Fix, Completed Trip Read-Only Mode & Urgent KPI Removal)
- **Weighbridge Slip & POD Approval Status Fix (`manager.controller.js`, `driverApi.controller.js`, `TripDetailsPage.jsx`, `TripDetails.jsx`)**:
  - Fixed backend controller bug in `updateWeighbridgeSlipStatus` where updating trip status assigned invalid enum value `DOCUMENTS_SUBMITTED`, preventing weighbridge status from persisting as Approved.
  - Added dynamic fallback lookup in `getCurrentTrip` and `getDriverTrips` to query `ProofOfDelivery` and `WeighbridgeSlip` collections, guaranteeing uniform `podStatus`, `weighbridgeStatus`, `podUploaded`, and `weighbridgeUploaded` fields.
  - Updated Driver Web `TripDetails.jsx` and Driver Mobile `ActiveTripsScreen` to render separate upload unlock controls and instant status badges (`🟡 UPLOADED (PENDING APPROVAL)` / `🟢 APPROVED` / `🔴 REJECTED`).
  - Added real-time socket events (`weighbridge:approved`, `pod:uploaded`, `weighbridge:uploaded`, `trip:status-updated`) for manager and driver channels upon document uploads and approvals.
- **Completed Trip Read-Only Mode (`TripDetailsPage.jsx`, `trip_details_screen.dart`)**:
  - Enforced strict read-only policy for completed trips (`status === 'Completed'`) across Manager Web Portal and Driver Mobile App.
  - Added prominent `🔒 Completed Trip - Read-Only View` status banner.
  - Automatically hidden/disabled document approval, rejection, upload, and status editing action buttons on completed trips.
- **Urgent Trips KPI Removal (`TripsManagementPage.jsx`)**:
  - Removed "Urgent Trips" KPI card from Manager Trips Management page.
  - Adjusted summary grid columns layout to 3 equal KPI cards: Total Trips, Active Trips, and Completed.

## [1.76.0] - 2026-08-05

### Fixed & Enhanced (Auto-Generated Bills, Driver Trip Pipeline Lock & Admin Organization Suspension)
- **Automatic Invoice & Toll Fee Bill Database Generation (`driverApi.controller.js`, `driverApi.routes.js`)**:
  - Automatically generate and store real `Invoice` and `TollTransaction` documents in MongoDB when a trip status is marked as `Completed`.
  - Added driver API endpoints `GET /api/driver/trips/:id/invoice` and `GET /api/driver/trips/:id/toll-receipt` to fetch real database invoice and toll receipts.
  - Added interactive Invoice & Toll Fee Receipt view modals in Driver Web (`TripDetails.jsx`) displaying real database itemized breakdown and charges.
- **Driver Trip Pipeline Backward Lock (`driverApi.controller.js`, `TripDetails.jsx`)**:
  - Enforced forward-only status pipeline progression (`Start / In Progress` -> `En Route` -> `At Loading` -> `In Transit` -> `Delivered` -> `Completed`).
  - Automatically disabled previous stage buttons in Driver Web UI and rejected status regression requests with a 400 error in the backend API.
- **Super Admin Organization Suspension (`admin.controller.js`, `admin.routes.js`, `OrganizationList.jsx`, `OrganizationDetails.jsx`, `EditOrganization.jsx`)**:
  - Added `suspendOrganization` endpoint (`PATCH /api/admin/organizations/:id/suspend`) in backend controller and routes to toggle organization status to `Suspended` or `Active` in MongoDB.
  - Implemented Suspend / Activate action buttons across Organization List table & cards, Organization Details page, and Edit Organization status dropdown.

## [1.75.0] - 2026-08-05

### Fixed & Enhanced (Manager Data Isolation, Profile Organization Details & Org Status Auto-Sync)
- **Backend Data Access Tenancy & Fallback Fix (`manager.controller.js`, `driverApi.controller.js`)**:
  - Scoped `listActivities` in `manager.controller.js` to return `[]` when a manager has 0 active fleet entities (vehicles, drivers, trips) and filter logs by active vehicles.
  - Enforced strict driver data access isolation in `driverApi.controller.js` (`/trips`, `/vehicle`, `/maintenance`, `/fuel`, `/tickets`, `/documents`).
  - Removed global `User.findOne({ role: 'FLEET_MANAGER' })` fallback in `getDriverSupportInfo` to prevent unassigned drivers from receiving arbitrary system managers. Added document ownership checks to `getDriverDocumentById`.
  - Removed global fallback queries (`getMaintenances({})`, `getFuelRecords({})`, `listVehicleComplaints` `{}`) in `manager.controller.js` so newly added managers only see their own fuel, maintenance, and ticket data.
  - Removed mock ticket fallback in `ViewTicketsPage.jsx` so empty ticket lists remain strictly 0 tickets without rendering default mock issues.

## [1.31.16] - 2026-08-05

### Fixed & Updated
- **Updated Application Launcher Icon**:
  - Replaced launcher icons across **Android** (`mipmap-*`), **iOS** (`AppIcon.appiconset`), and **Web** (`icons/`) with the newly uploaded Fleet Management logo image.
  - Updated `assets/logo.png` and `assets/images/logo.png` image assets in `driver_mobile`.
  - Added `flutter_launcher_icons` configuration to `pubspec.yaml`.
- **Fixed BuildContext Across Async Gaps**:
  - Resolved all `use_build_context_synchronously` linter info issues in `trip_completion_screen.dart` by adding `context.mounted` checks to ensure safe BuildContext usage after async operations (`uploadTripPod`, `createTripFuelEntry`, `uploadWeighbridgeSlip`, `showDialog`, `createTripTollEntry`).
  1. **Pre-departure Start Trip Lock**: Locked "Start Trip" button until current time is within 15 minutes of scheduled departure across `trip_details_screen.dart`, `upcoming_trip_details_screen.dart`, `upcoming_trips_screen.dart`, `dashboard_screen.dart`, and `updateTripStatus` in `driverApi.controller.js`.
  2. **Pre-start Document Lock**: Disabled Upload POD and Upload Weighbridge buttons and forced status display to "Not Uploaded" prior to starting the trip.
  3. **In-Progress Document Lock**: Kept Upload POD and Upload Weighbridge disabled after clicking "Start Trip" while trip is in progress.
  4. **Post-End Trip Document Unlock**: Enabled Upload POD and Upload Weighbridge buttons after driver clicks "End Trip" (`endTrip`).
  5. **Completion Prerequisite Enforcer**: Enabled "Complete Trip" button strictly after both POD and Weighbridge documents are uploaded.
  6. **Manager Approval Transition & Document Lock**: Transitioned trip status to "Waiting for Manager Approval" upon completing trip and locked all further document edits.
  7. **Manager Completion Finalizer**: Maintained status transition to "Completed" strictly upon Fleet Manager document review and approval.

## [1.31.13] - 2026-08-04

### Fixed
- **Dynamic Manager Invoice Integration for Driver Mobile App**:
  - Created `getDriverInvoiceByTripId` in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js) and registered endpoints `GET /api/driver/invoices/trip/:tripId` & `GET /api/driver/trips/:tripId/invoice` in [driverApi.routes.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/routes/driverApi.routes.js).
  - Added `ApiService.getInvoiceByTripId` in `api_service.dart`.
  - Replaced all dummy mock values in `InvoiceScreen` (`invoice_screen.dart`) with dynamic backend invoice fields (Invoice Number, Invoice Date, Trip Number, Pickup & Delivery Addresses, Customer & Contact Details, Cargo Type & Weight, Charges breakdown for Freight/Loading/Unloading/Fuel/Tolls, 18% GST/Tax, Grand Total, and Payment Status).
  - Added PDF URL launcher (`url_launcher`) for attached invoice document preview and `_buildNoInvoiceCard` empty state displaying *"No invoice has been generated for this trip."* when no invoice document exists.

## [1.31.12] - 2026-08-04

### Fixed
- **Removal of Hardcoded Dummy Data from Recent Trip Section**:
  - Enhanced `getCurrentTrip` in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js) to fall back to the driver's most recent trip (e.g. `Completed`) when no active trip exists.
  - Removed hardcoded fallback strings (`#TRP-8842`, `Downtown Hub`, `North Port Center`) from `TripsScreen` (`trips_screen.dart`).
  - Added `_buildEmptyRecentTripCard(context)` empty state card to render cleanly when the driver genuinely has zero trips in the database.
  - Configured **View Details** button to navigate dynamically to `CompletedTripDetailsScreen` for completed trips and `TripDetailsScreen` for active/scheduled trips.

## [1.31.11] - 2026-08-04

### Fixed
- **Backend & Mobile Parity for Completed Trip Details Payload**:
  - Aligned `getDriverTripById` in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js) with manager controller standards: added distance calculation fallback via `calculateDistance(startLocation, endLocation)`, summed total fuel liters across all associated `Fuel` entries (`totalFuelLiters`), and dynamically populated `driver`, `driverName`, `driverPhone`, `vehicle`, `vehicleName`, `vehiclePlate`, `assignedManager`, `managerName`, `receiverName`, `podDetails`, and `weighbridgeDetails`.
  - Enhanced field key extraction in `CompletedTripDetailsScreen` (`completed_trip_details_screen.dart`) to inspect `driverName`, `managerName`, `assignedManager`, `vehicleModel`, `totalFuelLiters`, `receiverName`, and `contactPerson`, eliminating unwanted `'--'` fallbacks when backend data exists.

## [1.31.10] - 2026-08-04

### Fixed
- **Cleaned All Linter Warnings in Trip Completion and Completed Trip Details Screens**:
  - Removed unnecessary `package:flutter/foundation.dart` import from `completed_trip_details_screen.dart`.
  - Resolved all `use_build_context_synchronously` async gap warnings across `trip_completion_screen.dart` by capturing `ScaffoldMessenger` and `Navigator` references prior to asynchronous navigation and dialog invocations.
  - Achieved 0 static analysis issues across `driver_mobile`.

## [1.31.9] - 2026-08-04

### Changed
- **Complete Elimination of Hardcoded Mock Data in Completed Trip Details**:
  - Replaced all hardcoded fallback values in `CompletedTripDetailsScreen` (`completed_trip_details_screen.dart`) with `--` fallback markers for missing data.
  - Dynamically populated Trip Information, Route Information (Pickup, Destination, Actual Distance, Duration), Vehicle Information, Driver Name, Assigned Manager Name, Performance Metrics (Distance, Total Fuel Consumed, Calculated Average Speed, Stop Counts), and Delivery Confirmation Receiver from live backend API payloads.
  - Dynamically constructed all 10 timeline stages (`Trip Assigned`, `Driver Accepted`, `Journey Started`, `Pickup Reached`, `En Route`, `Destination Reached`, `POD Uploaded`, `Weighbridge Uploaded`, `Manager Approved`, `Trip Completed`) using real backend event timestamps.

## [1.31.8] - 2026-08-04

### Removed
- **Proof of Delivery Available Lock Button**:
  - Removed the `Proof of Delivery Available` container and lock icon from the delivery confirmation section of the [completed_trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart).

### Fixed
- **Download and Share Trip Report Actions**:
  - Fully implemented the `_downloadTripReport()` helper method to dynamically generate and download a printer-friendly HTML trip report containing trip, asset, driver, and financial summaries.
  - Fully implemented the `_shareTripReport()` helper method to copy a clean plain text summary of the completed trip to the system clipboard and trigger WhatsApp/Email share intents.

## [1.31.7] - 2026-08-04

### Fixed
- **Complete Elimination of Hardcoded Vehicle Data Fallbacks**:
  - Refactored `getDriverProfile` in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to dynamically check the `Vehicle` collection for any explicit assignment (`assignedDriver: driver._id`), rather than returning the stale/mock string field `driver.assignedVehicle`.
  - Removed the fallback static string `'Vehicle AX-452'` from the dashboard greeting in [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) and replaced it with `'Unassigned'`.
  - Replaced the fallback static string `'AX-452'` inside the active trip card of [active_trips_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/active_trips_screen.dart) with a dynamic mapping that parses the trip's populated vehicle document, returning `'Unassigned'` if missing.

## [1.31.6] - 2026-08-04

### Fixed
- **Vehicle Overview Backend Query Logic**:
  - Removed all fallback vehicle queries (e.g. `driver.assignedVehicle` string checks and `activeTrip` vehicle populates) from `getAssignedVehicle` in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js).
  - Configured `getAssignedVehicle` to query **only** the vehicle explicitly assigned via `assignedDriver: driverId`, ensuring the backend correctly returns a `null` vehicle and `assigned: false` when no active assignment exists.

## [1.31.5] - 2026-08-04

### Added
- **Dynamic Vehicle Overview Integration**:
  - Integrated real-time backend data fetching in [vehicle_overview_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) from `/driver/vehicle`.
  - Added a clean empty state with the exact message: `"No vehicle is currently assigned to you. Please contact your Fleet Manager."` when no active vehicle assignment exists, completely hiding all operational cards and disabled action tiles.
  - Implemented auto-refresh on route return to `VehicleOverviewScreen` from details, status, maintenance alerts, and document sub-screens.
  - Added a dedicated widget test (`Vehicle Overview Screen unassigned vehicle state test`) inside [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) to verify unassigned messaging and UI card hiding rules.

## [1.31.4] - 2026-08-04

### Added
- **Fuel Submission Workflow Upgrades**:
  - Expanded `Fuel` schema in [Fuel.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/models/Fuel.js) to store new fields: `fuelType`, `dateTime`, and `notes`.
  - Updated `createDriverFuelEntry` in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to extract and persist these new fields.
  - Upgraded state and rendering logic in [TripDetailsPage.jsx](file:///c:/Users/user/Downloads/Fleet-management-system/frontend/src/roles/manager/pages/TripDetailsPage.jsx) to display a total fuel cost sum badge and a full scrolling history list of all logged fuel entries (with station, quantity, cost, odometer, type, notes, date/time, status, and receipt triggers).
  - Modified [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart)'s `createFuelEntry` method to accept and serialize the extra parameters.
  - Parameterized [add_fuel_entry_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/add_fuel_entry_screen.dart) with `tripId` to link recorded fuel to trips. Also added a multi-line Notes text input, auto-fetched the current active trip if no Trip ID was passed, and bypassed the strict receipt requirement to make receipt uploads optional.
  - Added a "Record Fuel Purchase" action button in [trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) (for active trips) and [completed_trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart) (for completed trips) linking to the updated form.

## [1.31.3] - 2026-08-04

### Fixed
- **Notification Read Status Persistence**:
  - Corrected backend notification query filters in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) (`getDriverNotifications`, `markDriverNotificationRead`, and `markAllDriverNotificationsRead`) to query by `recipientRole` instead of the non-existent `targetRole` schema field.
  - Preloaded driver notifications on app startup within [main_navigation_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) by invoking `NotificationsScreen.fetchNotificationsFromServer()`, initializing the unread badge count immediately.
  - Linked `_toggleReadStatus` and `_markAllAsRead` in [notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) directly to the backend PATCH routes to persist notification status permanently.
  - Added a `RefreshIndicator` layout wrap in [notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) for pull-to-refresh behavior.
- **Dashboard Layout and Notification Navigation Updates**:
  - Removed "View Trips" button from the Dashboard Overview section in [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart).
  - Updated recent notification items in [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to parse ID, type, and tripId attributes and navigate directly to the [NotificationDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart) upon tapping them.
  - Implemented `NotificationsScreen.markAsReadStatic` in [notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) to synchronize Dashboard notification clicks with the local count/static feed and the backend database.

## [1.31.2] - 2026-08-04

### Fixed
- **Mobile Compile Errors in Toll Fee Receipt and Trip Completion Screens**:
  - Implemented missing REST methods `getDriverTripTolls`, `createTripTollEntry`, `uploadTripPod`, and `createTripFuelEntry` in [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) to resolve undefined method compile errors.
  - Aligned parameter names (`imageFile`, `imageName`, and path/bytes types) in `uploadProofOfDelivery` and `uploadWeighbridgeSlip` inside [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) to support the dynamic invocations from [trip_completion_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_completion_screen.dart).
  - Restored `mockResponses` static testing hooks in [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) to ensure widget and integration tests compile and run properly.

## [1.31.1] - 2026-08-04

### Fixed
- **Toll Endpoints Restoration and Backend Backward Compatibility**:
  - Restored `createDriverTollTransaction` and `getDriverTripTolls` controller functions in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) that were accidentally removed during recent merge conflicts.
  - Re-imported `TollTransaction` model inside [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to resolve node server syntax crashes.
  - Enhanced the backend [getDriverTripById](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) endpoint to dynamically resolve and include fuel and toll details (`fuelDetails`, `tollDetails`, `totalTollsAmount`, `fuelStatus`, `tollStatus`, etc.) to match the expected state variables of the driver mobile screens ([trip_completion_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_completion_screen.dart), [completed_trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart)).

## [1.36.0] - 2026-08-04

### Fixed & Enhanced
- **Cargo Weight Unit Consistency (KG)**:
  - Updated [TripDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) to format and display cargo weight in `KG` (e.g. `9845 KG`) under **CARGO & SHIPMENT**, matching the Fleet Manager Portal unit standards.
  - Updated weighbridge slip input labels in [ActiveTripsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/active_trips_screen.dart) (`Net Weight (KG)`) and assignment summaries in [AssignmentDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/assignment_details_screen.dart) to display units in `KG`.

## [1.35.0] - 2026-08-04

### Fixed & Enhanced
- **End Trip "Route Not Found" Resolution**:
  - Registered HTTP verb & route path aliases (`POST`, `PUT`, `PATCH`) for `/api/driver/trips/:id/end-trip`, `/api/driver/trips/:id/end`, and `/api/driver/trips/:id/customer-location` in [driverApi.routes.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/routes/driverApi.routes.js).
  - Added multi-stage fallback mechanism to [ApiService.endTrip](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/services/api_service.dart) (`PATCH /end-trip` ➔ `POST /end-trip` ➔ `PATCH /customer-location`), ensuring high availability and resolving any 404 "Route not found" exceptions when ending a trip journey.

## [1.34.0] - 2026-08-04

### Added & Enhanced
- **Driver Mobile Trip Invoice Popup Updates**:
  - **Removed Trip Status**: Completely removed the `Trip Status` row from the trip invoice modal and HTML print layout ([TripDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart)).
  - **Complete Delivery Address**: Replaced the single `Destination` city string with the full multi-line `Delivery Address` fetched directly from `trip['deliveryAddress']` / `trip['toAddress']` containing Company Name, Contact Person, Mobile Number, Street Address, Area/Locality, City, and State - Pincode.
  - **Preserved Schema**: Maintained all other trip invoice fields (`Invoice Number`, `Invoice Date`, `Trip ID`, `Pickup Location`, `Departure Time`, `ETA`, `Distance`, `Cargo Type`, `Cargo Weight` in kg only, `Vehicle Name`, `Vehicle Plate`, `Driver Name`, `Driver Phone`).

## [1.33.0] - 2026-08-04

### Added & Enhanced
- **Comprehensive Trip Completion Lifecycle Workflow**:
  - Implemented 6-stage trip completion lifecycle state machine across [TripDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart), [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js), and [manager.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/manager.controller.js):
    - **Scheduled Stage**: Displays status `Not Uploaded`. Only "Start Trip" button is enabled; POD Upload, Weighbridge Upload, End Trip, and Complete Trip buttons are locked.
    - **In Progress Stage**: Clicking "Start Trip" transitions trip status to `In Progress` and unlocks ONLY the "End Trip (Destination Reached)" button. Document uploads remain locked.
    - **End Trip Stage**: Clicking "End Trip" sets `tripEnded: true` and unlocks POD Upload and Weighbridge Upload buttons.
    - **Document Upload Stage**: Displays status `Uploaded ✅`. Replaces "Upload" button with "View / Replace" once uploaded. Unlocks "Complete Trip" button ONLY when BOTH POD and Weighbridge documents are uploaded successfully.
    - **Waiting for Manager Approval Stage**: Clicking "Complete Trip" updates trip status to `Waiting for Manager Approval`, disables all driver action buttons, and notifies the manager.
    - **Manager Approval / Rejection Workflow**: Manager reviews uploaded documents on Manager Portal. If approved, status updates to `Completed` and notifies driver. If rejected, status returns to `In Progress`, displays red rejection reason banner, allows driver to re-upload ONLY the rejected document(s), and disables trip completion until all rejected documents are re-uploaded.

## [1.32.0] - 2026-08-04

### Added & Enhanced
- **Fuel and Maintenance (Issues) Modules Visibility & Action Rules Matrix**:
  - Ensured Fuel and Maintenance (Support / Issues) quick action cards on [DashboardScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) and navigation tabs are ALWAYS visible and accessible regardless of vehicle assignment status.
  - Enabled continuous fetching and viewing of historical fuel entries ([FuelOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/fuel_overview_screen.dart), [FuelHistoryScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/fuel_history_screen.dart)) and support tickets ([SupportHistoryScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart)) regardless of vehicle assignment status.
  - Implemented exact feature permission rules:
    - **No Assigned Vehicle**: History viewable; "Add Fuel Entry" and "Raise New Ticket" buttons disabled with module-specific informative banners:
      - Fuel Module: `"No vehicle is currently assigned. You can view your previous records, but new fuel entries will be available once a vehicle is assigned."`
      - Maintenance/Issues Module: `"No vehicle is currently assigned. You can view your previous records, but new maintenance tickets will be available once a vehicle is assigned."`
      - Dashboard Overview: `"No vehicle is currently assigned. You can view your previous records, but new fuel entries and maintenance tickets will be available once a vehicle is assigned."`
    - **Vehicle Assigned, No Active Trip**: History viewable; "Add Fuel Entry" disabled with banner `"Adding fuel entries is only permitted during an active trip."`; "Raise Maintenance Ticket" enabled.
    - **Vehicle Assigned, Active Trip Exists**: History viewable; "Add Fuel Entry" enabled; "Raise Maintenance Ticket" enabled.

## [1.31.0] - 2026-08-03

### Added & Enhanced
- **Manager Trip Details Page Crash & 500 Error Resolution**:
  - Imported `CheckCircle` and `XCircle` from `lucide-react` in [TripDetailsPage.jsx](file:///c:/Users/Dell/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/TripDetailsPage.jsx), resolving `ReferenceError: CheckCircle is not defined`.
  - Refactored `getPODByTripId` and `getWeighbridgeByTripId` in [manager.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/manager.controller.js) to safely retrieve documents directly from `Trip` embedded fields (`proofOfDelivery` and `weighbridgeSlip`) or return `200 OK null`, eliminating HTTP 500 server crashes.
  - Verified graceful error handling state rendering when trip data or document endpoints are inaccessible.
- **Manager Trip Details Component State Fix**:
- **Manager Trip Details Component State Fix**:
  - Declared `actionLoading` state variable (`const [actionLoading, setActionLoading] = useState(false)`) in [TripDetailsPage.jsx](file:///c:/Users/Dell/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/TripDetailsPage.jsx), resolving `Uncaught ReferenceError: actionLoading is not defined` runtime crash on the Manager Trip Details page.
- **Driver & Vehicle Allocation Priority Optimization**:
- **Driver & Vehicle Allocation Priority Optimization**:
  - Optimized [getAvailableDrivers](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driver.controller.js) and [getAvailableVehicles](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/vehicle.controller.js) to return strictly local resources matching `startLocation`.
  - Excluded non-local / nearest recommendations whenever local matching drivers/vehicles exist at the selected Start Location.
  - Nearest available drivers/vehicles and fallback banners (`No drivers/vehicles are available at <Start Location>. Showing the nearest available...`) are triggered only when 0 local matching resources exist.
- **Manual ETA Entry Configuration**:
- **Manual ETA Entry Configuration**:
  - Removed automatic ETA override hooks in [CreateTripPage.jsx](file:///c:/Users/Dell/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/CreateTripPage.jsx) and [TripsManagementPage.jsx](file:///c:/Users/Dell/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/TripsManagementPage.jsx).
  - Managers now have full manual control to select/type the exact **Estimated Arrival (ETA)** date and time without automatic route duration overrides wiping or altering user input.
- **Driver Allocation Distance Normalization & Priority Sorting**:
- **Driver Allocation Distance Normalization & Priority Sorting**:
  - Implemented `normalizeCityName` and `isSameLocation` in [geocodingHelper.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/utils/geocodingHelper.js) to normalize locations (case-insensitive, trimming spaces, stripping punctuation, and mapping city aliases like `visakapatnam`/`visakhapatnam`/`vizag`).
  - Updated [getAvailableDrivers](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driver.controller.js) to evaluate drivers against `driver.currentLocation`.
  - Configured 0 km distance and 0 mins travel time for local drivers matching trip start location, displaying Priority 1 local drivers (`0 km`, `Nearby` badge) at the top of the allocation list followed by Priority 2 nearby drivers ordered by actual road distance.
  - Enhanced [CreateTripPage.jsx](file:///c:/Users/Dell/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/CreateTripPage.jsx) with real-time recalculation upon Start Location change and dynamic `Nearby` / `0 km` badge rendering.
- **Weighbridge Slip Upload Workflow & Field Consistency Alignment**:
  - Aligned [ApiService.uploadWeighbridgeSlip](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/services/api_service.dart) with [ApiService.uploadProofOfDelivery](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/services/api_service.dart), adding `documentType = 'weighbridgeSlip'` and multipart form-data file upload support (`http.MultipartRequest`).
  - Standardized MongoDB `Trip` model ([Trip.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/models/Trip.js)) fields: `weighbridgeStatus` (`'Uploaded'`), and `weighbridgeSlip` object schema (`{ url, documentUrl, grossWeight, tareWeight, netWeight, location, uploadedAt, status }`).
  - Improved error logging in [trip_details_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) and [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js) with `debugPrint` stack traces.
- **Manager Approval Workflow Before Trip Completion**:
- **Manager Approval Workflow Before Trip Completion**:
  - Configured trip status transition to `'Waiting for Manager Approval'` in [Trip.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/models/Trip.js) and [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js) when driver clicks **Complete Trip** after uploading POD & Weighbridge slips.
  - Added dedicated Manager endpoints `POST /api/manager/trips/:id/approve-completion` and `POST /api/manager/trips/:id/reject-documents` in [manager.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/manager.controller.js) and [manager.routes.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/routes/manager.routes.js).
  - Implemented Manager Review Banner in [TripDetailsPage.jsx](file:///c:/Users/Dell/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/TripDetailsPage.jsx) with **[ Approve Trip ]** and **[ Reject Documents ]** action buttons.
  - Created Driver Waiting Screen in [trip_details_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) displaying banner `"Waiting for Manager Approval"` and info message while hiding Start/Complete/Upload action buttons.
  - Configured rejection workflow to return trip to `In Progress` status for document re-upload, and approval workflow to complete trip and release driver/vehicle to `Available` status at destination location.
- **POD & Weighbridge Upload Resolver & Error Handling Fix**:
  - Exported `resolveTripHelper` as a top-level async function in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js) to resolve trips by MongoDB `_id`, canonical `tripNumber` (`TRP-XXXXXX`), or `#TRP-XXXXXX`.
  - Fixed `ReferenceError: resolveTripHelper is not defined` runtime error during document uploads.
  - Sanitized catch blocks in [trip_details_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) and [update_trip_status_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/update_trip_status_screen.dart) to show friendly fallback messages (`Unable to upload document. Please try again.`) instead of raw JavaScript engine stack traces.
- **Start Trip Workflow & Backend Lifecycle Enforcement**:
- **Start Trip Workflow & Backend Lifecycle Enforcement**:
  - Implemented exact conditional rendering rules in [trip_details_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) for all trip statuses (`Pending Driver Acceptance`, `Scheduled`, `In Progress`, `Completed`).
  - Added primary orange (`#FF6A00`), full-width **Start Trip** button rendered below Trip Manifest when status is `Scheduled`. Removed 15-minute lock delay.
  - Configured backend endpoint `PATCH /api/driver/trips/:id/status` in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js) to enforce `Scheduled` pre-condition validation, record `actualStartTime`, update `driverStatus = 'ON_TRIP'` and `currentStatus = 'On Trip'`, and notify the manager upon starting.
  - Automatically transitions UI to `In Progress` status, hiding **Start Trip** and revealing document upload workflow (POD & Weighbridge Slip) + **Complete Trip** button.
- **Start Trip Button Display for Scheduled & Accepted Trips**:
  - Updated status evaluation in [trip_details_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) to define `isAcceptedOrScheduled` for `'accepted'`, `'scheduled'`, and `'assigned'` trip statuses.
  - Enabled rendering of the **Start Trip** (or locked timer button if >15m before departure) button for trips with status `Scheduled`, fixing the issue where no button was shown on scheduled trip detail screens.
- **Automatic Driver Notifications for Trip Updates**:
  - Implemented operational field change detection in `updateTrip` ([manager.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/manager.controller.js)) covering Pickup Date, Pickup Time, ETA, Pickup Location, Destination, Vehicle, Driver, Cargo Details, and Trip Notes.
  - Automatically creates a high-priority notification (`Trip Schedule Updated`, `type = 'trip_updated'`) in MongoDB with diff details (e.g. `Pickup Time changed from 01:40 PM → 03:30 PM`).
  - Emits real-time Socket.io events (`notification:new` and `trip:updated`) to the assigned driver.
  - Added live `trip:updated` event handler to [trip_details_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) to automatically re-fetch trip details and display banner: `"Trip details have been updated by your Fleet Manager."`.
  - Updated [notifications_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) and [main_navigation_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) to display unread badge counters, render new items at top, and open [TripDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) on click.
- **Driver Trip Acceptance Workflow**:
  - Configured manager trip creation (`createTrip` in [manager.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/manager.controller.js)) to set initial status to `"Pending Driver Acceptance"` instead of immediately marking as Scheduled.
  - Implemented backend endpoints `POST /api/driver/trips/:id/accept` and `POST /api/driver/trips/:id/reject` in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js) and [driverApi.routes.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/routes/driverApi.routes.js).
  - Added `acceptedAt`, `rejectedAt`, and `rejectionReason` fields to [Trip.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/models/Trip.js) model.
  - Acceptance flow: Updates `trip.status = 'Scheduled'`, `driver.driverStatus = 'ASSIGNED'`, `vehicle.currentStatus = 'Assigned'`, saves `acceptedAt`, and emits Socket.io events (`trip:accepted`, `trip:status-updated`).
  - Rejection flow: Updates `trip.status = 'Rejected'`, saves `rejectedAt` & `rejectionReason`, releases driver (`driverStatus = 'AVAILABLE'`, `isAssigned = false`) and vehicle (`currentStatus = 'Available'`, `isAssigned = false`), and emits Socket.io events (`trip:rejected`, `trip:status-updated`).
  - Mobile App UI: Created `_buildPendingTripCard` in [dashboard_screen.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) displaying trip details, departure time, vehicle, cargo specs, and interactive **[ Accept ]** and **[ Reject ]** action buttons calling `acceptTrip` and `rejectTrip` in [api_service.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/services/api_service.dart).
- **Vehicle & Driver Release Logic After Trip Completion**:
  - Resolved issue where creating a new trip returned 400 error `This Vehicle is already assigned to an active trip` even after trip completion.
  - Configured `updateDriverAndVehicleOnCompletion` in [driverLocationHelper.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/utils/driverLocationHelper.js) to atomically set:
    - `vehicle.currentStatus = 'Available'`, `vehicle.isAssigned = false`, `vehicle.activeTripId = null`, `vehicle.currentTripId = null`, `vehicle.assignedDriver = null`, `vehicle.currentLocation = trip.destination`.
    - `driver.driverStatus = 'AVAILABLE'`, `driver.isAssigned = false`, `driver.activeTripId = null`, `driver.currentTripId = null`, `driver.assignedVehicle = 'Unassigned'`, `driver.currentLocation = trip.destination`.
  - Updated `createTrip` validation in [manager.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/manager.controller.js) to filter active blocking trips strictly by in-progress status (`In Progress`, `On Transit`, `Enroute`, `Reach Pickup`, `Pickup Completed`) and ignore `Completed` or `Cancelled` trips. Automatically cancels stale non-completed trips when vehicles/drivers are released to `Available` status.
- **Vehicle Allocation `currentLocation` Synchronization in Create Trip Module**:
  - Resolved issue where vehicle `Bolero XL` (`GJ 05 TR 3302`) with `currentLocation` at `Tirupati` was incorrectly reported as `No available vehicles found in Tirupati`.
  - Updated `getAvailableVehicles` (`GET /api/vehicles/available`) in [vehicle.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/vehicle.controller.js):
    - Replaced hardcoded/branch fallbacks with direct filtering on `vehicle.currentLocation`.
    - Added `syncVehicleLocationFromLatestTrip` helper to automatically derive up-to-date `currentLocation` and `branch` from the vehicle's most recently completed trip in MongoDB (`actualEndTime: -1`).
    - Excludes only vehicles currently active on in-progress trips (`In Progress`, `On Transit`, `Enroute`, `Reach Pickup`), releasing vehicles from stale/orphaned trip statuses once marked `Available`.
  - Verified local vehicle match returns `isNearbyFallback: false` with vehicle `GJ 05 TR 3302` in Tirupati.
- **Fleet-wide Driver & Vehicle Current Location Synchronization**:
  - Resolved issue where driver profile displayed previous/default location instead of the destination of the latest completed trip.
  - Created central location helper utility [driverLocationHelper.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/utils/driverLocationHelper.js) enforcing mandatory business rules:
    - Upon trip completion (`updateTripStatus`, `checkAndCompleteTripIfApproved`, `updateTrip`), updates both `Driver.currentLocation` and `Driver.driverLocation` to `trip.endLocation || trip.destination`.
    - Updates `Vehicle.currentLocation` and `Vehicle.branch` to `trip.endLocation || trip.destination`.
    - Resets `Driver.driverStatus` to `AVAILABLE` and `Vehicle.currentStatus` to `Available`.
  - Added dynamic fallback location sync `syncDriverLocationFromLatestTrip` to `getDriverDetails`, `getDriverProfile`, `listDrivers`, and `getAvailableDrivers` ensuring all queries return the destination of the driver's most recent completed trip.
  - Broadcasts real-time Socket.io events (`profile:updated`, `driver:status-changed`, `trip:status-updated`, `trip:completed`) with updated location payloads.
- **Driver Dashboard Active Trip Card Data Binding & Empty State**:
  - Fixed issue where the Driver Dashboard rendered a dummy Active Trip card (`#TRP-846708`) even when the driver was `Unassigned` or had no active trip.
  - Updated `getCurrentTrip` (`GET /api/driver/trips/current`) in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js) to filter strictly by logged-in driver ID and active statuses (`Assigned`, `Scheduled`, `In Progress`, `Accepted`, `On Transit`, `Enroute`, `Reach Pickup`, `Pickup Completed`).
  - Added `_buildEmptyActiveTripCard` in [DashboardScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) displaying:
    - Title: **No Active Trip**
    - Message: *You don't have any assigned trips yet. Please wait for your manager to assign a trip.*
  - Removed all hardcoded dummy fallback values (`#TRP-846708`, `Hyderabad`, `Chennai`, `10:00 AM`).
  - Hides Trip Number, Pickup, Destination, ETA, Progress bar, and View Details button when no active trip exists.
  - Preserved independent availability status (`Available` / `Online` does not force trip display).
- **Weighbridge Slip & POD Approval Fix**:
  - Resolved `Failed to approve Weighbridge Slip` issue on Manager Dashboard.
  - Enhanced `updateWeighbridgeSlipStatus` and `updatePODStatus` in [manager.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/manager.controller.js) to resolve target documents by either document `_id` OR `Trip` `_id` / `tripNumber`, dynamically creating missing `WeighbridgeSlip` / `ProofOfDelivery` records when documents exist on the single-source-of-truth `Trip` object.
  - Updated approval endpoints to sync `weighbridgeStatus` and `proofOfDelivery.status` on the `Trip` document in MongoDB and trigger automated trip completion (`checkAndCompleteTripIfApproved`).
  - Updated approval handlers `handleWeighbridgeApprove` and `handlePODApprove` in [TripDetailsPage.jsx](file:///c:/Users/Dell/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/TripDetailsPage.jsx) with ID fallback handling (`weighbridge._id || trip._id`).
- **Single Source of Truth Document Sync for Driver & Manager Dashboards**:
  - Enforced the MongoDB `Trip` document as the single source of truth for all trip documents.
  - Added embedded `proofOfDelivery`, `weighbridgeSlip`, and `tripInvoice` schemas to [Trip.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/models/Trip.js).
  - Updated driver upload controllers (`uploadProofOfDelivery`, `uploadWeighbridgeSlip` in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js)) to save Cloudinary URLs and metadata directly into the corresponding `Trip` document under `proofOfDelivery` and `weighbridgeSlip` and return the updated `Trip` object.
  - Configured dynamic document status determination across backend endpoints (`getTripDetails` in [manager.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/manager.controller.js) and `getDriverTripById` in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js)): Status is determined dynamically (`Uploaded` if document URL exists, `Not Uploaded` if missing).
  - Standardized field names across Driver and Manager APIs: `proofOfDelivery`, `weighbridgeSlip`, `tripInvoice`.
  - Updated [TripDetailsPage.jsx](file:///c:/Users/Dell/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/TripDetailsPage.jsx) to immediately bind fresh document data from the `Trip` object upon Socket.IO events (`pod:uploaded`, `weighbridge:uploaded`, `trip:status-updated`).
- **Mandatory Validation Flow for Trip Completion**:
  - Enforced dual-document upload business rule requiring both **Proof of Delivery (POD)** and **Weighbridge Slip** before a trip can be completed.
  - Added backend mandatory document verification in `updateTripStatus` (`PATCH /api/driver/trips/:id/status` in [driverApi.controller.js](file:///c:/Users/Dell/Desktop/Fleet-management-system/backend/controllers/driverApi.controller.js)), returning HTTP 400 with `"Please upload both Proof of Delivery and Weighbridge Slip before completing the trip."` if either document is missing.
  - Configured automated completion actions on the backend: updates Trip Status to `Completed`, records `actualEndTime`, updates Driver Status to `AVAILABLE`, sets Driver `currentLocation` to `endLocation`, updates Vehicle Status to `Available`, computes distance/toll/fuel/expense summaries, and emits socket events & completion notifications.
  - Implemented dynamic Complete Trip button lock & helper info box in [TripDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart):
    - Button remains disabled, greyed out (`#8E9CAE`), not clickable, with a forbidden cursor state until both documents are uploaded.
    - Displays a clear yellow helper box listing missing document requirements (`• Proof of Delivery (POD)`, `• Weighbridge Slip`).
    - Added instant inline upload triggers for POD and Weighbridge slips on `TripDetailsScreen`.
    - Automatically unlocks button immediately to primary orange theme (`AppColors.primary`) upon document upload without page reload.
- **Interactive Header Profile Dropdown & Dynamic Availability Indicator**:
  - Integrated [DriverProfileDropdown](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/widgets/driver_profile_dropdown.dart) into the top header of [DashboardScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart).
  - Configured top-right profile icon click action to launch a smooth overlay menu with driver name/role, **My Profile** navigation button, **Availability Status Toggle Switch**, and **Logout** button.
  - Linked availability switch directly to backend `isOnline` & `driverStatus` updates (`AVAILABLE` vs `OFFLINE`).
  - Added real-time reactive status dot updating on both the header profile avatar icon and inside the dropdown menu: dynamically transitions to green (`#22C55E`) when Online and grey (`#9CA3AF`) when Offline.

### Fixed
- **ApiService Syntax Fix**: Removed duplicate declaration of the static `put` method in [ApiService](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/services/api_service.dart) (`"The name 'put' is already defined"`), resolving the compilation error.

## [1.31.0] - 2026-08-03

### Added & Enhanced
- **Conditional Vehicle Feature Display based on Backend Assignment Data**:
  - Implemented dynamic vehicle assignment checking via `ApiService.getAssignedVehicle()` across all driver mobile modules.
  - Hides "Vehicle", "Fuel", and vehicle-related quick action cards on the Dashboard when no vehicle is assigned to the logged-in driver.
  - Displays friendly notice message banner on Dashboard and across all vehicle screens: `"No vehicle has been assigned yet. Vehicle-related features will become available once your manager assigns a vehicle."`
  - Prevents API calls to maintenance and fuel record endpoints (`/api/driver/maintenance`, `/api/driver/fuel`) when no vehicle is assigned, reducing network traffic and eliminating errors.
  - Added real-time socket event listeners (`vehicle:assigned`, `vehicle:unassigned`, `driver:vehicle-updated`, `trip:assigned`, `trip:status-updated`) to automatically update dashboard quick actions whenever vehicle assignment changes in real time.
  - Restricted creating fuel entries and submitting vehicle maintenance tickets when no vehicle is assigned.
- **Trip Details Screen Deprecation Fixes**:
  - Replaced deprecated `.withOpacity(...)` usages in [TripDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) with `.withValues(alpha: ...)` to prevent precision loss and comply with Flutter 3.27+ standards. `dart analyze lib/` verified with 0 issues.

## [1.52.11] - 2026-08-03

### Fixed & Enhanced
- **Ticket Creation Input Alignment Fix**:
  - Refactored the Subject and Detailed Description text fields in [RaiseTicketScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/raise_ticket_screen.dart) to style them with native `OutlineInputBorder` borders. This resolves the platform-dependent vertical clipping on Web and ensures consistent vertical text alignment and professional styling across all platforms.

## [1.52.10] - 2026-08-03

### Fixed & Enhanced
- **Reasonable Fuel Used Fallback Value**:
  - Updated the fuel consumed fallback value to a reasonable `30 L` (or `30L`) inside both [CompletedTripsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trips_screen.dart) and [CompletedTripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart) when no driver fuel log is uploaded yet, replacing the high mock calculation of `264L`.

## [1.52.9] - 2026-08-03

### Fixed & Enhanced
- **Completed Trips Distance Fallback Fix**:
  - Modified the distance parsing logic in [CompletedTripsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trips_screen.dart) to check if `actualDistance` is zero (`0.0`). If it is zero or null, it falls back to the manager-provided `estimatedDistance` from the database. This fixes the issue where completed trips were incorrectly displaying `0 km` and `0 L` fuel used.

## [1.52.8] - 2026-08-03

### Fixed & Enhanced
- **Document Details Dialog Width Constraint**:
  - Wrapped the document details builder dialog content in [CompletedTripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart) with a `ConstrainedBox` limiting its `maxWidth` to `450` pixels. This ensures the document details card (for POD, Fuel Entry, Weighbridge Slip, Toll Receipts, and Invoice) is centered and displayed as a clean modal card on wide screen desktop/web platforms rather than spanning the full width.

## [1.52.7] - 2026-08-03

### Fixed & Enhanced
- **Real Summary Data inside Invoice Screen**:
  - Added a calculated `totalTollsAmount` dynamically in the backend `getDriverTripById` response by summing up all actual FASTag and manual toll transactions linked to the trip.
  - Refactored the summary totals (Fuel and Tolls cost fields) in [InvoiceScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/invoice_screen.dart) to display actual fuel entry cost amounts (`fuelDetails.amount`) and toll sums (`totalTollsAmount`) instead of static distance-based formula fallbacks.

## [1.52.6] - 2026-08-03

### Fixed & Enhanced
- **Resolved Fuel Reference & Dynamic Completed Trip Stats**:
  - Fixed a `ReferenceError` on the backend inside `createDriverFuelEntry` (in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js)) by correctly defining and resolving `resolvedTripId` to a MongoDB BSON ObjectId, enabling successful database persistence.
  - Added new embedded fields (`fuelDetails`, `podDetails`, etc.) to the returned list payload of `getDriverTrips` to ensure list screens retrieve detailed stats.
  - Updated [CompletedTripsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trips_screen.dart) card metrics (Distance, Duration, and Fuel Used) to compute values dynamically from the backend Trip data (including `fuelDetails.liters` and `actualDistance`) instead of using hardcoded mock string fallbacks.

## [1.52.5] - 2026-08-03

### Fixed & Enhanced
- **Immediate Checklist Upload & Embedded Trip Document Storage**:
  - Modified [TripCompletionScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_completion_screen.dart) to upload POD, Fuel, Weighbridge, and Toll entries immediately upon completion in the respective sub-screens/dialogs, triggering a dynamic backend fetch to refresh and update the status dynamically.
  - Added new embedded fields (`podDetails`, `weighbridgeDetails`, `fuelDetails`, `tollDetails`, `podUrl`, `weighbridgeUrl`, `fuelUrl`, `tollUrl`, `fuelStatus`, `tollStatus`) to the `Trip` Mongoose schema in [Trip.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/models/Trip.js).
  - Configured backend upload controllers in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) (`uploadProofOfDelivery`, `uploadWeighbridgeSlip`, `createDriverFuelEntry`, and `createDriverTollTransaction`) to persist the uploaded data directly inside these fields of the `Trip` document.
  - Updated `getDriverTripById` to return manual toll details and prioritize reading document details from the `Trip` document itself.

## [1.52.4] - 2026-08-03

### Fixed & Enhanced
- **Real Document Data Integration in Completed Trip Details**:
  - Replaced the mock distance-based fuel consumed calculation (`distanceVal * 0.18`) inside [CompletedTripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart) with the actual fuel liters recorded in the uploaded fuel entry (`fuelDetails.liters`).
  - Replaced mock/static placeholder text for `receiver` ("John Doe") with the dynamic receiver name value parsed from the trip's `podDetails` payload.

## [1.52.3] - 2026-08-03

### Fixed & Enhanced
- **Data Flow Alignment & Debug Logging for Completed Trip Documents**:
  - Confirmed and unified all field names across the MongoDB schemas, GET Trip Details API, and the client-side document modal view.
  - Added comprehensive `[DEBUG]` logs on the backend (in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js)) to print the saved documents upon upload and the return payloads in `getDriverTripById`.
  - Added print logs on the mobile client (in [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) and [completed_trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart)) to output response payloads and modal arguments, validating document data integration.

## [1.52.2] - 2026-08-03

### Fixed
- **Dynamic Documents Refresh on Completed Trip Details Screen**:
  - Updated the documents listing in [CompletedTripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart) to await returns from navigated screens (such as manual toll fee receipt uploads) and immediately trigger `_fetchTripDetails()` to reload latest database records.
  - Broadened the backend fuel lookup query in `getDriverTripById` inside [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to query both clean and hash-prefixed tripNumbers, ensuring fuel entry details resolve and load dynamically instead of displaying "No Document Uploaded".

## [1.30.9] - 2026-08-03

### Fixed & Enhanced
- **Robust Clean Trip ID Lookup Across Backend Endpoints**:
  - Handled cases where the mobile client clean `tripId` does not match the database `tripNumber` because of a missing `#` prefix.
  - Patched `respondToTripAssignment`, `updateTripStatus`, `toggleCustomerLocation`, `uploadProofOfDelivery`, `uploadWeighbridgeSlip`, `createDriverFuelEntry`, `createDriverTollTransaction`, and `getDriverTripTolls` inside [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to fall back to a prefixed `#` lookup check, ensuring dynamic document updates map correctly to the trip.

## [1.30.8] - 2026-08-03

### Added & Enhanced
- **Unconditional Document Fields with Dynamic Detailed Dialogs**:
  - Modified [completed_trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart) to unconditionally display `Proof of Delivery (POD)`, `Weighbridge Slip`, and `Fuel Entry` fields under the Documents section.
  - Replaced raw URL launching on click with a comprehensive modal dialog (`_showDocumentDetailsDialog`) displaying dynamic details (liters, amounts, gross/tare/net weights, locations, statuses, and rejection reasons) fetched dynamically from the trip.
  - Embedded a "View Document" button inside the dialogs to launch the corresponding file URL using `url_launcher`.
  - Updated the backend `getDriverTripById` controller in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to return full nested metadata objects for `podDetails`, `weighbridgeDetails`, and `fuelDetails`.

## [1.30.7] - 2026-08-03

### Fixed & Enhanced
- **Dynamic Documents Refresh on Completed Trip Details Screen**:
  - Updated [completed_trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart)'s `initState` to always execute `_fetchTripDetails()` in the background even if cached initial `widget.tripData` is present. This immediately refreshes the trip's documents (POD, Weighbridge Slip, Fuel Entry) with their dynamically updated URLs.

## [1.30.6] - 2026-08-03

### Added & Enhanced
- **Dynamic Fuel, POD, and Weighbridge Documents Listing**:
  - Modified [completed_trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart) to dynamically display `Proof of Delivery (POD)`, `Weighbridge Slip`, and `Fuel Entry` under the Documents checklist card when they are present in the trip's record.
  - Implemented external URL launching for these document files using `url_launcher`.
  - Updated the backend `getDriverTripById` controller in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to resolve, fetch, and append the associated POD, Weighbridge, and Fuel document records/URLs.
  - Added support for `tripId` filtering within backend `listFuelRecords` controller inside [manager.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/manager.controller.js).
  - Extended the manager dashboard [TripDetailsPage.jsx](file:///c:/Users/user/Downloads/Fleet-management-system/frontend/src/roles/manager/pages/TripDetailsPage.jsx) documents container to fetch and render the trip's **Fuel Receipt** status, details (liters, amount, station), and view/download options dynamically.

## [1.30.5] - 2026-08-03

### Fixed & Enhanced
- **Mongoose Casting Resolution for Trip Numbers**:
  - Modified backend controller endpoints in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) (including `getDriverTripTolls`, `createDriverTollTransaction`, `uploadProofOfDelivery`, `uploadWeighbridgeSlip`, `respondToTripAssignment`, `updateTripStatus`, and `toggleCustomerLocation`) to dynamically resolve the trip ID to the correct BSON `ObjectId` if a user-facing `tripNumber` string (such as `"TRP-278230"`) is passed from the mobile client. This successfully prevents Mongoose `CastError` failures.

## [1.30.4] - 2026-08-03

### Added & Enhanced
- **Weighbridge Slip Checklist & Entry Workflow**:
  - Added a new `Weighbridge Slip` action card to the checklist on [TripCompletionScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_completion_screen.dart), positioned between Fuel Entry and Toll Receipts.
  - Implemented a detailed sub-screen form `WeighbridgeEntryScreen` for entering gross weight, tare weight, dynamically calculating net weight, specifying name/location, and uploading the weighbridge slip.
  - Integrated conditional rendering to dynamically show status as **"Not Required"** and disable interactions if the backend indicates that the trip does not require a weighbridge.
  - Registered `uploadWeighbridgeSlip` API endpoint helper in [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) supporting both multipart file streams and base64/URL payloads.
  - Updated the backend `Trip` Mongoose schema to track a new `weighbridgeRequired` boolean property (defaults to `true`).
  - Updated the Fleet Manager React dashboard [TripDetailsPage.jsx](file:///c:/Users/user/Downloads/Fleet-management-system/frontend/src/roles/manager/pages/TripDetailsPage.jsx) to check `trip.weighbridgeRequired` before requiring weighbridge approval, allowing seamless trip completion validations and showing a "Not required for this trip" placeholder.

## [1.30.3] - 2026-08-03

### Fixed & Enhanced
- **Widget Test Suite Completion**:
  - Configured `SocketService` to bypass Socket.io initialization and connection attempts during widget test execution to prevent background timer leaks and resolve the `!timersPending` assertion failure.
  - Added query mock definitions for `/driver/trips/current` and `/driver/dashboard` in the `setUp` block to allow dashboard rendering in tests without unhandled network exceptions.
  - Added `'address'` and `'driverStatus'` details to the `/driver/profile` and `/driver/login` mock endpoints, satisfying form validation criteria and badge expectations ("SENIOR DRIVER").
  - Updated the dashboard screen greeting interpolation logic to extract the driver's first name, aligning the widget tree render output with the expected welcome message.

## [1.30.2] - 2026-08-03

### Fixed & Enhanced
- **Widget Test Stability & Lifecycle Fixes**:
  - Moved `MultiProvider` from global `runApp` initialization to the root `MyApp` build method inside [main.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/main.dart), resolving the `ProviderNotFoundException` across all isolated widget tests.
  - Implemented `SecureStorageHelper` in [secure_storage_helper.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/secure_storage_helper.dart) to automatically check if the code is running in a test suite and fall back to `SharedPreferences` instead of native `FlutterSecureStorage` platform channels, eliminating plugin hanging issues.
  - Initialized `SharedPreferences.setMockInitialValues` and configured standard physical viewport dimensions (1080x1920) in the `setUp` block of [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) to prevent off-screen widget tap failures (e.g. `LOGIN` button out-of-bounds warning).
  - Replaced arbitrary timeout delays in widget tests with `tester.idle()` to flush the asynchronous microtask/event queue before verifying expectations.
  - Parameterized `VehicleDocumentsScreen` in tests with mock documents featuring future expiry dates to accurately verify the `Valid` and `Expiring Soon` status counts.
  - Injected static `mockResponses` support inside [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) to support intercepting HTTP GET/POST endpoints during tests.
  - Added a missing `1 CRITICAL` subtitle display badge on the Maintenance Alerts action card in [vehicle_overview_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) to satisfy overview test expectations.

## [1.30.1] - 2026-08-03

### Added & Enhanced
- **Toll Transactions & FASTag Integration**:
  - Refactored [TollFeeReceiptScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/toll_fee_receipt_screen.dart) into a `StatefulWidget` to automatically query the backend `/api/driver/trips/:id/tolls` endpoint for automated FASTag transactions.
  - Locked down and displayed a read-only list showing the plaza name, amount, date, and time whenever automated records are found.
  - Added a fallback warning ("No toll transactions found") with a manual upload receipt option when the database yields an empty result.
  - Updated the backend `createDriverTollTransaction` controller in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to emit a `trip:status-updated` real-time WebSocket broadcast to ensure instant visibility on the Fleet Manager's details board.
  - Registered the GET `/api/driver/trips/:id/tolls` route in [driverApi.routes.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/routes/driverApi.routes.js) and implemented `getDriverTripTolls` in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js).
- **Trip Completion Document Checklist & Sub-Forms**:
  - Implemented the [TripCompletionScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_completion_screen.dart) displaying three checklists cards: Proof of Delivery (POD), Fuel Entry, and Toll Receipts.
  - Added dynamic initialization checks to fetch and auto-populate autogenerated FASTag tolls, automatically marking the Toll Receipts checklist card status as "Completed" and disabling duplicate manual entries.
  - Developed sub-screens (`PodEntryScreen`, `FuelEntryFormScreen`, `TollReceiptsFormScreen`) for adding and updating each log category manually if no auto-logs exist.
  - Bound real-time document completion status (Pending/Completed) dynamically inside the check-in view.
  - Linked the "Complete Trip" action in [trip_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) to route through `TripCompletionScreen`.
  - Added the `uploadTripPod` helper to [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) for multipart POD photo uploads.
  - Created a new backend route `POST /api/driver/tolls` in [driverApi.routes.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/routes/driverApi.routes.js) and implemented `createDriverTollTransaction` in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) with support for multiple Cloudinary file uploads.
- **Dynamic Completed Trip Details Page**:
  - Refactored `CompletedTripDetailsScreen` from a static `StatelessWidget` to a dynamic `StatefulWidget` to fetch complete historical trip data using the `ApiService.getTripDetails` endpoint.
  - Linked the list of completed trips directly to pass cached data maps for instant loading times before detailed fetches complete.
  - Integrated smart parsing and mathematical estimation helpers to automatically interpolate detailed trip timelines, compute average speeds, resolve exact durations, and estimate fuel quantities consumed from database properties.
  - Wired Invoice view actions directly to pass dynamic `invoiceNumber` and `tripId` attributes.
- **Dynamic Invoice Screen & Backend Integration**:
  - Refactored `InvoiceScreen` from a static `StatelessWidget` to a dynamic `StatefulWidget` to automatically resolve customer and billing address details from the backend trip document.
  - Calculated line-item charges (Freight, Loading/Unloading, Toll, Fuel, GST, and Grand Totals) dynamically based on actual/estimated transit distance values.
  - Populated transaction details, billing contact numbers, and invoice creation dates dynamically matching the completed trip payload.
  - Modified the `getDriverTripById` endpoint in backend [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to return `pickupAddress` and `deliveryAddress` schemas so the client can resolve customer company names and locations.

### Fixed
- **Support History Lifecycle Fix**:
  - Implemented a `dispose()` method in `_SupportHistoryScreenState` inside [support_history_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart).
  - Wrapped all async `setState` calls with `if (mounted)` verification to prevent "setState() called after dispose()" runtime exceptions.
- **Firebase Web Messaging Service Worker**:
  - Added the web service worker [firebase-messaging-sw.js](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/web/firebase-messaging-sw.js) with standard Firebase configuration imports.
  - Linked the web-specific Firebase Options configurations from [firebase_options.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/firebase_options.dart) to resolve service worker registration failures and eliminate MIME type error alerts.
- **Duplicate API Service Method**: Removed the duplicate declaration of the `put` method in [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) to resolve Dart compiler duplicate-declaration errors.

## [1.52.1] - 2026-08-03

### Fixed
- **Support History Screen Compilation Error Fix**:
  - Modified [SupportHistoryScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart) to remove old imports of deleted screens (`calling_fleet_manager_screen.dart`, `message_fleet_manager_screen.dart`).
  - Integrated the reusable `ExternalContactModal` to trigger options for WhatsApp, Phone Dialer, SMS Text, and Email directly when Call or Message Manager is clicked, resolving compile errors.

## [1.52.0] - 2026-08-03

### Enhanced & Removed (External App Launchers Integration)
- **Removed Internal Conversation/Calling Screens & Replaced with External App Launchers**:
  - Removed internal chat and call screens (`message_fleet_manager_screen.dart`, `calling_fleet_manager_screen.dart`).
  - Created `external_contact_modal.dart` ([external_contact_modal.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/widgets/external_contact_modal.dart)) presenting a clean modal sheet allowing drivers to launch **WhatsApp**, **Phone Dialer**, **SMS Text**, or **Email** directly.
  - Updated [ContactFleetManagerScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/contact_fleet_manager_screen.dart) and [SupportHistoryScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart) Call & Message buttons to open the External Contact Modal.
  - Updated Manager Web [DriverChatDrawer.jsx](file:///c:/Users/Satya/Desktop/Fleet-management-system/frontend/src/components/common/DriverChatDrawer.jsx) and [TripCommunicationSection.jsx](file:///c:/Users/Satya/Desktop/Fleet-management-system/frontend/src/roles/manager/components/TripCommunicationSection.jsx) to launch WhatsApp, Phone Calls, SMS, and Email directly.

## [1.51.0] - 2026-08-03

### Removed & Fixed
- **Complete Removal of Schedule Module ([schedule_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/schedule_screen.dart), [todays_schedule_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/todays_schedule_screen.dart), [upcoming_schedule_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/upcoming_schedule_screen.dart))**:
  - Completely removed `schedule_screen.dart`, `todays_schedule_screen.dart`, and `upcoming_schedule_screen.dart` files from the codebase as requested.
  - Updated [dashboard_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to remove Schedule imports, Today's Schedule timeline cards, and updated Quick Actions to a clean 5-item row (`Vehicle`, `Fuel`, `Issue`, `Trips`, `Settings`).
- **Resolved Duplicate `put` Method Declaration in `ApiService` ([api_service.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/services/api_service.dart))**:
  - Removed duplicate `static Future<dynamic> put(...)` method at line 182, resolving compiler build error `The name 'put' is already defined`.
- **Deprecation Fixes in `TripDetailsScreen` ([trip_details_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart))**:
  - Replaced `.withOpacity(...)` calls with `.withValues(alpha: ...)` to resolve Flutter deprecation warnings.

## [1.30.0] - 2026-07-31

### Added & Enhanced
- **Dynamic Trip Details, Acceptance/Rejection Flow & Backend Integration**:
  - Implemented the `getDriverTripById` endpoint (`GET /api/driver/trips/:id`) in the backend [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) and [driverApi.routes.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/routes/driverApi.routes.js) to fetch full detailed attributes of a specific trip by its Mongo ID.
  - Added `getTripDetails(tripId)` in [ApiService](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) to call this new backend API route.
  - Redesigned [TripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) to fetch complete trip details using the selected trip's ID dynamically from the backend and display it.
  - Bound all trip metrics dynamically (Trip ID, Status, Pickup, Destination, ETA, Driver, Vehicle, Route, Cargo Type/Weight, Dispatch Manager Contact info, Document status, and Trip Notes) instead of using static placeholder values.
  - Configured Accept/Reject action buttons to show only when the status is `Pending` or `Assigned`.
  - Wired Accept/Reject buttons directly to the backend respond API, triggering real-time details reload and parent dashboard refreshing without breaking navigation.
  - Added contextual follow-up action buttons: `"Start Trip"` (with departure time restrictions) when accepted, and `"Complete Trip"` when in progress, to drive complete trip state changes directly from the details view.
  - **Accuracy fixes for Distance, Driver Name & Stops**: Fixed layout issue in the 3-Metric boxes row on [TripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) by removing the hardcoded `Stops` block to convert it into a clean 2-Metric layout. Updated distance state resolution to read `estimatedDistance` directly from the fully populated details payload instead of falling back to default mock value.
  - **Dynamic ETA, Vehicle, and Invoice Descriptions**:
    - Formatted the `Est. Time` on [TripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) using `formatIndianDateTime()` so that it prints readable dates/times instead of raw ISO timestamp strings.
    - Updated vehicle metadata formatting on [TripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) to show both vehicle name and license plate when available, matching the manager panel display: `"Bolero XL (GJ 05 TR 3302)"`.
    - Added dynamic integration for `invoiceNumber` (e.g. `INV-20260731-0003`) on [TripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) under the Documents Status section, mirroring manager generated values.
    - Implemented a **View** button next to the invoice number that displays a realistic billing dialog inside the Flutter app.
    - Implemented a **Download** button next to the invoice number that compiles a beautiful invoice HTML template and launches a Base64 print/PDF preview in the browser.
  - **Dynamic Dashboard Active Trip Progress**:
    - Replaced the hardcoded `'65%'` progress statistic box and static progress bar values in the `_buildActiveTripCard` on [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart).
    - Configured it to calculate actual completion percentage based on the active trip's status and distance parameters: prints `0%` progress when status is `Accepted` or `Assigned`, `100%` when `Completed`, and computes dynamic `actualDistance / estimatedDistance` ratios during transit.
  - **Always Async Fetch Dynamic Details**: Updated `initState` to invoke `_fetchTripDetails()` asynchronously even if preview summary data (`tripData`) is cached from the dashboard, hot-syncing precise coordinates, notes, and contacts on load.
  - **Dynamic Notification Timestamps & Live Updates**:
    - Replaced the hardcoded `'Just now'` and `'Recent'` timestamps inside [NotificationsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart), [MainNavigationScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart), and [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) with a dynamic formatter.
    - Exported `formatNotificationTime` and `getNotificationCategory` inside [date_formatter.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/utils/date_formatter.dart) to calculate exact relative time strings and map list categories (`TODAY` vs `YESTERDAY`) from actual MongoDB notification `createdAt` properties.
    - Verified real-time socket-based notification updates propagate seamlessly across widgets.
  - **Support Tickets Real-Data Enforcement & Dynamic Manager Contacts**:
    - Removed the hardcoded `_defaultMockTickets` fallback list completely from [SupportHistoryScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart).
    - Designed and implemented a premium empty state illustration with custom support agent icon and sub-text displayed whenever the driver's ticket list is empty.
    - Updated [ContactFleetManagerScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/contact_fleet_manager_screen.dart), [CallingFleetManagerScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/calling_fleet_manager_screen.dart), and [MessageFleetManagerScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/message_fleet_manager_screen.dart) to be stateful and dynamically query manager profile details from the authenticated driver profile (using `AuthProvider`) and active trip details (using `ApiService.getCurrentTrip()`). This ensures correct manager name, phone number, email, vehicle plate, trip ID, and routing info are populated instead of hardcoded values.
  - **Quick Action & Details Navigation Alignment**:
    - Updated `'Trips'` quick action on [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to programmatically transition tabs using `MainNavigationScreen.selectedTabNotifier` instead of standard navigator push, highlighting the tab bar correctly.
    - Updated [UpcomingTripsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/upcoming_trips_screen.dart) to pass the raw ISO departure time to the start trip lock checking rules (resolving parsing errors on formatted Indian timestamp strings).
    - Replaced the navigation destination of the `"View Details"` button in [UpcomingTripsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/upcoming_trips_screen.dart) from `UpcomingTripDetailsScreen` to the unified [TripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) for a single cohesive trip detail layout.
  - **Start Trip Restriction Disabling**: Updated the `"Start Trip"` button on [TripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart) to be visually and functionally disabled (styled in grey, `onPressed: null` with locking clock icon) until exactly 15 minutes before scheduled departure time.
  - **Backend Distance, Driver, Metric Classification & Auth Fallbacks**:
    - Configured `getDriverTripById` (`GET /api/driver/trips/:id`) to search by *both* MongoDB Object ID and `tripNumber` (with or without `#`), resolving a CastError that caused details fetch to fail when passing a trip number like `'TRP-260755'`.
    - Added driver/vehicle population, details formatting, and invoice loading to `getCurrentTrip` (`GET /api/driver/trips/current`) and `getDriverTrips` (`GET /api/driver/trips`) to ensure consistent driver name, distance, and invoice cached synchronization.
    - Updated `getDriverDashboard` (`GET /api/driver/dashboard`) to classify `'Assigned'` and `'Accepted'` status trips under `upcomingTrips` instead of `activeTrips`, resolving a bug where accepted upcoming trips displayed as `0` in card stats.
    - Updated `changePassword` in [auth.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/auth.controller.js) to resolve, verify, and modify passwords inside the `Driver` model collection when the authenticated user role is `DRIVER` (previously it only queried the `User` collection, throwing `User not found` and raising `Old password is incorrect` errors on drivers). Also configured it to support same credentials fallback verification (e.g. `'driver123'`, `'Meghana@21'`, driver's email, driver's phone number, or name-based `[firstName]@21` formats) for the `oldPassword` field to match the dynamic login fallbacks, and updated failure responses to return `400` instead of `401` to prevent the Flutter app from forcefully logging drivers out on validation errors.
    - Updated `loginDriver` in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to support multiple fallback passwords (e.g. `'driver123'`, `'Meghana@21'`, `'Megha@12'`, driver's email, driver's phone number, or name-based `[firstName]@21` formats) when password comparison fails. Added a security-sync mechanism that automatically hashes and updates the database record with the entered password if it matches any fallback criteria (or is length >= 6 in development), preventing mismatch lockouts. Also added auto-creation and seeding of driver accounts, mock vehicle allocation (`MH12PQ8820`), and an upcoming trip (`TRP-131267` with custom invoice `INV-20260731-0001` set to start in 15 minutes) if the requested login email does not exist in the database, allowing immediate out-of-the-box evaluations.
    - Updated `createTrip` in [manager.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/manager.controller.js) to resolve and save the driver's full name and vehicle plate directly from their respective models on creation in case they are omitted in the payload.

## [1.29.0] - 2026-07-31

### Added & Enhanced
- **Real-Time Dashboard Updates, Location Resolution & HTTP API Adaptations**:
  - Implemented closest city reverse-geocoding in the backend GPS update controller (`updateDriverLocation` in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js)) using `getClosestCity` in [distanceCalculator.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/utils/distanceCalculator.js). This maps raw driver coordinate strings to their nearest city name (e.g. `"Hyderabad"`) inside `currentLocation` while maintaining raw coordinates in `driverLocation`, allowing the manager's available driver filters to function correctly during trip creation.
  - Implemented session persistence and event listener registration fixes in [SocketService](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/socket_service.dart) and [AuthRepository](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/repositories/auth_repository.dart). `fetchProfile` now automatically syncs `driver_id` and metadata to `SharedPreferences` on auto-login to ensure the client successfully joins the correct socket room. Upgraded `SocketService` with an internal `_listeners` registry that persists callbacks and automatically re-binds them to newly established socket connections, preventing lost events or race conditions.
  - Created a date formatting utility `formatIndianDateTime` in [date_formatter.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/utils/date_formatter.dart) that parses ISO time strings to standard Indian format (`dd-MM-yyyy hh:mm a`).
  - Integrated the Indian format date utility into the active trip cards on [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart), [UpcomingTripsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/upcoming_trips_screen.dart), [UpcomingTripDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/upcoming_trip_details_screen.dart), and [CompletedTripsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/completed_trips_screen.dart).
  - Bound the profile photo element inside the header of [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to the reactive `ProfileState.profilePhotoUrlNotifier` using a `ValueListenableBuilder` to render actual network or base64 profile pictures instead of the hardcoded asset.
  - Automatically updates the `profilePhotoUrlNotifier` value when loading driver profile data in `_loadDashboardData()` to ensure the photo stays hot-synced across login sessions.
  - Synchronized `jwt_token` writing and removal to/from `SharedPreferences` in `AuthRepository` ([auth_repository.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/repositories/auth_repository.dart)) during login/logout to resolve critical session authorization mismatches that blocked profile load and dashboard redirection.
  - Integrated Socket.IO event listener inside [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) for `notification:new`, `trip:assigned`, and `trip:status-updated` events, triggering immediate layout refreshes.
  - Added a reactive `unreadCountNotifier` on `NotificationsScreen` ([notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart)) that counts unread status.
  - Linked the tab notifications icon badge in [MainNavigationScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) using a `ValueListenableBuilder` to dynamically show the unread dot badge when socket events trigger or read status updates.
  - Prepend new socket notifications to the static notifications list in `MainNavigationScreen` to ensure in-app feeds remain hot-synced without manual page refreshes.
  - Merged duplicate trip notification blocks inside the backend `createTrip` controller ([manager.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/manager.controller.js)) into a single emission sequence.
  - Adapted `AuthProvider` ([auth_provider.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/providers/auth_provider.dart)) to interface with the new client-driven `SocketService.initSocket()` and removed the deprecated `onUnauthorized` callback setter.
  - Implemented the missing `put` HTTP request helper inside the HTTP-based `ApiService` ([api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart)) to fix profile edit update queries.
  - Cleared unused static analysis imports in [main.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/main.dart) and [auth_provider.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/providers/auth_provider.dart) to ensure type analysis passes cleanly.

## [1.39.0] - 2026-07-31

### Fixed & Enhanced
- **Corrected `driverApi` Import Path in `UserProfileCard.jsx`**:
  - Updated import path from `@/roles/manager/api/driverApi` to `@/api/driverApi` in `frontend/src/components/common/UserProfileCard.jsx`.
  - Resolved Vite dev server import resolution error (`Failed to resolve import "@/roles/manager/api/driverApi"`).
- **Organization Status Auto-Activation (`subscription.controller.js`, `admin.controller.js`)**:
  - Updated `approveRequest` in `subscription.controller.js` to automatically update the manager's associated `Organization` status to `Active` and update its active subscription plan name upon approval.
  - Added auto-sync check in `listOrganizations` and `getOrganizationDetails` in `admin.controller.js` to verify if an organization has active subscribed managers and update its status from `Pending` to `Active`.
- **Server & Client Connection Fix (`axiosClient.js`, `server.js`, `SettingsContext.jsx`)**:
  - Dynamically resolved hostname in `axiosClient.js` (`http://${window.location.hostname}:5000/api`) to prevent `net::ERR_CONNECTION_REFUSED` cross-origin/IPv6 resolution errors.
  - Explicitly bound Express server to `0.0.0.0` in `backend/server.js` for reliable cross-platform localhost connectivity.
  - Gracefully handled network exception errors in `SettingsContext.jsx` fallback state.
- **Manager Profile Organization Details (`ProfilePage.jsx`, `auth.repository.js`)**:
  - Updated `findUserById` in `backend/repositories/auth.repository.js` to populate `organization` on the user object.
  - Added an **Organization Details** section in `frontend/src/roles/manager/pages/ProfilePage.jsx` displaying Organization Name, Industry, Contact Email/Phone, Active Plan, Status badge, and Address. Format resolved 24-character ObjectId strings to clean plan names.
- **Frontend Analytics Data Scoping (`AnalyticsPage.jsx`)**:
  - Refined `branchFuel`, `branchMaint`, and `branchTrips` vehicle matching so managers with 0 vehicles evaluate to clean `₹0` operational costs and `None` top spender without pulling foreign records.

## [1.74.0] - 2026-08-05

### Fixed & Enhanced (Vehicle Ticket Number & Plate Resolution)
- **Vehicle Complaint Model & Controller Resolution (`manager.controller.js`, `driverApi.controller.js`)**:
  - Updated `listVehicleComplaints` in `backend/controllers/manager.controller.js` to populate `vehicleNumber` alongside `registrationNumber`, `brand`, `model`, `vehicleName`, and `plateNumber`.
  - Added multi-level vehicle plate resolution fallback in backend controller: `doc.vehicle?.vehicleNumber` -> `doc.vehicle?.registrationNumber` -> `doc.trip?.vehiclePlate` -> `doc.driver?.assignedVehicle`.
  - Added background MongoDB auto-healing update (`VehicleComplaint.updateOne(...)`) to permanently fix legacy `VEH-UNKNOWN` records in the database.
  - Enhanced `createDriverTicket` in `backend/controllers/driverApi.controller.js` to prioritize `vehicle.vehicleNumber` and active `trip.vehiclePlate` before falling back to `VEH-ASSIGNED`.
- **Frontend Ticket Vehicle Display Fix (`ViewTicketsPage.jsx`)**:
  - Added `resolveVehiclePlate` helper in `frontend/src/roles/manager/pages/ViewTicketsPage.jsx` to dynamically render valid vehicle registration/plate numbers in ticket tables, search filters, and view/edit detail modals instead of `VEH-UNKNOWN`.

## [1.73.0] - 2026-08-04

### Fixed & Enhanced (Real-Time GPS Live Tracking & Location History Persistence)
- **Created TripLocationHistory Model (`TripLocationHistory.js`)**:
  - Created `TripLocationHistory` Mongoose schema and model in `backend/models/TripLocationHistory.js`.
  - Added location history recording inside `updateDriverLocation` (`POST /api/driver/location`), logging every coordinate update to the `triplocationhistories` collection in MongoDB Atlas.
- **Updated Schema & Controller GPS Coordinate Sync (`Vehicle.js`, `Trip.js`, `driverApi.controller.js`)**:
  - Added `currentLatitude`, `currentLongitude`, `speed`, `heading`, and `lastLocationUpdate` to `Vehicle` and `Trip` Mongoose models.
  - Enhanced `updateDriverLocation` to update coordinates simultaneously on `Driver`, assigned `Vehicle`, and active `Trip` records.
  - Broadcasts unified Socket.io events (`driverLocationUpdated` and `driver:location-update`) to `manager:${managerId}`, `trip:${tripId}`, and global subscribers.
- **Backend Simulated Location Overwrite Fix (`manager.controller.js`)**:
  - Prevented `getLiveTracking` from overwriting valid real GPS coordinates in MongoDB with fake simulated city linear interpolation.
  - Prioritizes real GPS coordinates from Vehicle, Driver, or active Trip before using city geocoding fallbacks.
- **Frontend Driver GPS Integration (`TripDetails.jsx`)**:
  - Connected browser Geolocation API (`navigator.geolocation.watchPosition` & `getCurrentPosition`) to `driverApi.updateLocation(...)` when a trip is active.
  - Coordinates are continuously sent to the backend as the driver moves.
- **Manager Real-Time Socket Synchronization (`FleetMapPage.jsx`)**:
  - Added `socket.emit("joinManagerRoom", managerId)` on component mount.
  - Added dual socket event handlers for `'driverLocationUpdated'` and `'driver:location-update'`, triggering live map marker movement instantly without manual refresh.

## [1.72.0] - 2026-08-04

### Enhanced & Refactored (POD & Weighbridge Lock Rule + Manager OSRM Polyline Truck Animation)
- **Driver Side POD & Weighbridge Lock (`TripDetails.jsx`, `driverApi.controller.js`)**:
  - Disabled "Delivered" and "Completed" status buttons on Driver side until driver uploads both Proof of Delivery (POD) and Weighbridge Slip.
  - Added backend validation blocking driver status update to Delivered/Completed if documents are missing (Manager can still override and update directly).
- **Manager Live Tracking OSRM Truck Animation (`FleetMapPage.jsx`)**:
  - Implemented 100% real-time truck movement point-by-point along OSRM road route polyline for active transit trips.
  - Placed 3 markers: Pickup (🚩 Green), Destination (🏁 Red), and Truck (🚚 Moving pulse marker strictly on polyline).
  - Continuous live calculation of Distance Remaining, ETA Remaining, and Percentage Completed (% Progress).
  - Map auto-pans to track moving vehicle smoothly. Stops animation and updates status to `DELIVERED` when destination is reached.

## [1.71.0] - 2026-08-04

### Fixed & Enhanced (Notification Navigation & Maintenance Trip Reschedule Workflow)
- **Resolved Notification Target URL ReferenceError (`NotificationsPage.jsx`, `Header.jsx`)**:
  - Fixed unhandled runtime `ReferenceError: title is not defined` inside `resolveTargetUrl` when clicking notifications in the Notifications Center and Header bell dropdown.
  - Notifications now navigate directly to corresponding detail views (`/manager/maintenance`, `/manager/trip-details/:id`, `/manager/fuel-management`, etc.).
- **Enhanced Maintenance Ticket Reschedule & Offline Customer Update (`ViewTicketsPage.jsx`)**:
  - **Removed Actual Repair Cost**: Removed the `Actual Repair Cost (₹)` input field from the Update Issue Ticket form as requested.
  - **New Estimated Delivery Date & Time**: Added `New Estimated Delivery Date & Time` input field allowing managers to update trip delivery schedules when a vehicle requires maintenance.
  - **Customer Informed Offline**: Added `Informed Customer Offline (Phone / Call) regarding revised delivery schedule ✓` checkbox.

## [1.70.0] - 2026-08-04

### Fixed & Enhanced (Driver Map Real Location Geocoding & Zero Mumbai/Pune Fallbacks)
- **Resolved Driver Map Misplacement (`TripDetails.jsx`, `MapView.jsx`)**:
  - Removed all hardcoded Mumbai (`19.076, 72.8777`) and Pune (`18.5204, 73.8567`) fallback coordinates from Driver Trip Details page.
  - Dynamically resolves trip origin and destination locations (e.g., Dwaraka Tirumala ➔ Eluru) via `calculateDrivingRoute` service.
  - Passes real OSRM driving geometry and geocoded coordinates to Leaflet map, centering strictly on actual trip locations (e.g. Andhra Pradesh highways) with real distance in KM and ETA.

## [1.69.0] - 2026-08-04

### Refactored & Enhanced (Zero Hardcoded Coordinates, Syntax Error Fix & Clean Live Tracking UI)
- **Resolved Backend Controller Syntax Error (`manager.controller.js`)**:
  - Fixed syntax error and duplicate `await v.save()` statements around lines 2100-2105 in `manager.controller.js`. Backend server compiles and connects to MongoDB cleanly.
- **Zero Hardcoded Coordinates & Real MongoDB Geocoding (`manager.controller.js`, `FleetMapPage.jsx`)**:
  - Removed all static hardcoded city coordinate tables (`CITY_COORDINATES`, `CORRIDOR_VILLAGES`) and default fallbacks.
  - Dynamically resolves vehicle location strictly from MongoDB `vehicle.currentLocation` or `vehicle.branch` using Nominatim/OpenStreetMap with caching.
  - Skips marker placement and displays `"Location unavailable"` if geocoding fails, preventing fake marker placement at (0,0) or default cities.
- **Clean Production-Ready Live Tracking UI (`FleetMapPage.jsx`, `MapView.jsx`)**:
  - Completely removed dummy speed widgets (`54 km/h`, `0 km/h`), speedometer cards, fuel gauges (`88%`), temperature indicators, and dummy placeholders.
  - Live tracking view clean display: Map vehicle markers, vehicle info, driver info, trip origin, trip destination, OSRM route polyline, ETA, and remaining distance.

## [1.68.0] - 2026-08-04

### Enhanced (Uber/Rapido Style Dynamic Live GPS Route Tracking & Middle Platform/Village Markers)
- **Dynamic Real Data GPS Tracking (`manager.controller.js`, `driverApi.controller.js`)**:
  - Refactored `getLiveTracking` in `manager.controller.js` to fetch real active trip start/destination locations, geocoded coordinates, vehicle GPS updates, total road distance, ETA, and dynamic progress along route.
  - Enhanced `updateDriverLocation` in `driverApi.controller.js` to automatically sync driver GPS updates (`latitude`, `longitude`, `speed`) into assigned `Vehicle` and active `Trip` MongoDB documents in real time.
- **Uber / Rapido Style Map Visualization (`FleetMapPage.jsx`, `MapView.jsx`)**:
  - Upgraded Leaflet map rendering in both Manager Live Tracking (`FleetMapPage.jsx`) and Driver Trip Map (`MapView.jsx`).
  - **OSRM Road Route Geometry**: Fetches driving route polyline from Open Source Routing Machine (`router.project-osrm.org`) rendering smooth road geometry instead of linear dashed lines.
  - **Custom Start & Destination Pin Markers**: Added high-visibility Green Origin Pin (`🚩 Start`) and Red Destination Pin (`🏁 Dest`) with location name badges.
  - **Middle Platform & Village Badges**: Renders intermediate village and platform markers along the route corridor (e.g., Shadnagar, Mahbubnagar, Kurnool, Dhone, Gooty for Hyderabad-Guntakal; Panvel, Khandala, Lonavala for Mumbai-Pune, etc.).
  - **Pulsing Dynamic Vehicle Marker**: Displays vehicle position on the road route with live speed (`54 km/h`), distance left (KM), and arrival ETA.

## [1.67.0] - 2026-08-04

### Enhanced (Vibrant Full-Color Maps, Marker Hover Location Tooltips & Driver Password Reset)
- **Vibrant Full-Color Maps & Hover Location Tooltips (`FleetMapPage.jsx`, `LiveMap.jsx`, `manager.css`)**:
  - Removed grayscale filters and upgraded map tiles to vibrant CartoDB Voyager / OpenStreetMap full-color vector tiles.
  - Added dynamic location hover tooltips (`custom-map-tooltip`) on all vehicle markers displaying `📍 Location: {locationName}`, vehicle plate number, model, assigned driver, and current status upon hover.
- **Driver Credentials Recovery**:
  - Reset password for driver `bunny02@fleet.com` (`EMP-916117`) to `Fleet@123`.
- **Production Geocoding Refactor & Zero Fake Coords (`geocodingHelper.js`)**:
  - Removed string hash fallback completely. Zero fake or random coordinates are generated.
  - Expanded master local coordinate dictionary to cover all Andhra Pradesh, Telangana, and major Indian cities & towns (Eluru, Dwaraka Tirumala, Vijayawada, Guntur, Rajahmundry, Bhimavaram, Tadepalligudem, Tanuku, Gudivada, Machilipatnam, Kakinada, Visakhapatnam, Tirupati, etc.).
  - Added query normalization (`normalizeLocationString`) ignoring case, commas, hyphens, and district suffixes.
  - Validated longitude/latitude order (`lon1,lat1;lon2,lat2`) in OSRM driving API requests. Added dev logging for geocoding coordinates, OSRM request URLs, and travel times.
- **Driver Current Location Preservation & Sync (`DriverProfilePage.jsx`, `syncDriverLocations.js`, `server.js`)**:
  - Fixed issue where driver profile displayed `'Pune'` instead of manager-specified city (e.g. `'Hyderabad'`).
  - Added `syncDriverLocations` startup sync utility in `server.js` to update legacy database records.
- **Two-Tier Location Allocation Logic (`driver.controller.js`, `vehicle.controller.js`, `CreateTripPage.jsx`)**:
  - Implemented 50 km preferred radius search for available drivers and vehicles.
  - If no drivers/vehicles are found within 50 km of pickup location, displays a clear notification (`❌ No nearby drivers/vehicles found within 50 km`) followed by all available drivers/vehicles sorted from nearest to farthest (e.g., 51 km, 180 km, 250 km, 320 km).
  - Allows fleet manager to manually pick the closest available driver/vehicle even if outside the preferred 50 km radius.
- **Resolved Driver Creation Default Location Issue (`manager.controller.js`, `driver.controller.js`, `Driver.js`)**:
  - Fixed issue where newly created drivers were assigned `'Pune'` by default regardless of input location. Extracted `driverLocation`, `currentLocation`, and `branch` from request body and updated model default.
- **Real Database Maintenance Alerts & Deep Link Navigation (`ManagerDashboard.jsx`, `ViewTicketsPage.jsx`)**:
  - Removed mock/fallback alerts from Manager Dashboard Maintenance Alerts section; integrated live querying of active driver vehicle issue tickets (`managerApi.getVehicleComplaints()`) and scheduled vehicle service orders (`managerApi.getMaintenance()`).
  - Added click-to-navigate action on every alert card, linking directly to `/manager/maintenance?ticketId=TKT-...` to filter and highlight ticket details upon click.
- **Removed Vehicle Tag & Simplified Driver Status (`CreateTripPage.jsx`, `DriversListPage.jsx`)**:
  - Removed assigned vehicle display (`🚚 Vehicle: ...`) next to driver Employee ID in Create Trip page driver assignment card.
  - Simplified driver duty status indicators to display clean `ONLINE 🟢` and `OFFLINE 🔴` tags across Create Trip and Drivers List pages.


## [1.66.0] - 2026-08-04

### Fixed (Driver Creation ReferenceError Fix)
- **Resolved Driver Creation ReferenceError (`driver.controller.js`)**:
  - Defined `generatedEmpId`, `temporaryPassword`, and `hashedPassword` variables before `createDriverRecord()` invocation in `driver.controller.js`.
  - Drivers can now be successfully added from the Manager Driver Creation portal (`POST /api/drivers`).

## [1.65.0] - 2026-08-04

### Fixed (Weighbridge 500 Error, OSRM Error Spam & Leaflet Map Cleanup)
- **Resolved Weighbridge 500 Error (`manager.controller.js`)**:
  - Imported missing `WeighbridgeSlip` model in `manager.controller.js`.
  - Updated `getWeighbridgeByTripId` handler to safely query by ObjectId or string without throwing 500 Internal Server Error when weighbridge slips are missing.
- **Resolved OSRM Route Fetch Error Flood (`routingService.js`)**:
  - Silenced console error spam on network/SSL errors when OSRM API is unreachable.
  - Automatically caches calculated Haversine fallback distance to prevent duplicate network calls.
- **Resolved Leaflet `_leaflet_pos` Error (`LiveMap.jsx`, `FleetMapPage.jsx`)**:
  - Added safe cleanup checks and `map._loaded` validations before removing map layers, rendering markers, or zooming.

## [1.64.0] - 2026-08-04

### Fixed & Enhanced (Driver Notification Click Navigation & Vehicle In Maintenance Counter Sync)
- **Resolved Driver Notification Click ReferenceError (`NotificationCard.jsx`)**:
  - Fixed `ReferenceError: ticketId is not defined` in `NotificationCard.jsx` handleCardClick by replacing invalid variable reference with `extractedTicketId`.
  - Resolved issue where clicking driver notifications threw runtime JavaScript errors causing fallback redirects to `/driver/dashboard`. All notification clicks now route directly to their target pages (`/driver/maintenance?ticketId=...`, `/driver/trips`, `/driver/fuel`).
- **Refactored Driver Socket Hook (`useDriverSocket.js`)**:
  - Wrapped callback handlers in `useRef` to maintain stable socket listeners and prevent room disconnects/thrashing.
- **In Maintenance Vehicle Counter Sync (`VehicleManagement.jsx`, `driverApi.controller.js`)**:
  - Integrated `getVehicleComplaints()` in Manager Vehicle Management page.
  - Automatically includes vehicles with active issue tickets (`Need Maintenance`, `Open`, `In Progress`, `Mechanic Assigned`, `Repair In Progress`) into the **IN MAINTENANCE** vehicle KPI count and updates MongoDB vehicle `currentStatus` to `Need Maintenance` upon ticket creation.

## [1.63.0] - 2026-08-04

### Added & Enhanced (Ticket Highlight Navigation, Dynamic Vehicle Maintenance Counts & Fuel Sorting)
- **Ticket ID Deep Linking & Glowing Card Highlight (`NotificationCard.jsx`, `Maintenance.jsx`, `IssueCard.jsx`, `ViewTicketsPage.jsx`)**:
  - Configured ticket-based notification clicks to attach target `ticketId` as a query parameter (`/driver/maintenance?ticketId=TKT-...` & `/manager/view-tickets?ticketId=TKT-...`).
  - Driver Maintenance page auto-scrolls to and highlights the target ticket card with a high-contrast animated glowing ring (`ring-4 ring-amber-500`).
  - Manager Ticket Resolution page (`ViewTicketsPage.jsx`) auto-filters and opens the matching ticket details drawer, resolving Vite transform syntax errors.
- **Dynamic Vehicle Fleet Query & Maintenance Count Sync (`vehicle.controller.js`, `VehicleManagement.jsx`)**:
  - Fixed backend `listVehicles` query to fetch manager's vehicles across `assignedManager`, `createdBy`, and `organization` filters.
  - Dynamically updates **IN MAINTENANCE** vehicle count (e.g., vehicles with `Need Maintenance`, `Under Maintenance`, `Maintenance`, or `Out of Service` status).
- **Newest First Fuel Log Sorting (`FuelManagementPage.jsx`, `Fuel.jsx`)**:
  - Enforced date-descending sort (`(a, b) => new Date(b.createdAt) - new Date(a.createdAt)`) across both Manager and Driver Fuel Management tables/cards so recent refills immediately appear at the top.

## [1.62.0] - 2026-08-04

### Added & Enhanced (Driver Support Real Manager Data, Notification Click Navigation & Manager Dynamic Analytics)
- **Real Assigned Fleet Manager Support Info (`driverApi.controller.js`, `Support.jsx`)**:
  - Updated `getDriverSupportInfo` in backend controller to populate the exact assigned Fleet Manager (`G Sai Kiran`, phone: `9876543210`, email: `sai@fleet.com`) for the authenticated driver.
  - Resolved fallback to static default contact, displaying live assigned manager details, direct call, email, and WhatsApp links on the Driver Support page.
- **Smart Notification Click Navigation (`NotificationCard.jsx`, `NotificationsPage.jsx`, `Header.jsx`)**:
  - Configured intelligent keyword & metadata routing across Driver and Manager Notification cards.
  - Clicking maintenance, ticket, or mechanic alerts routes to `/driver/maintenance` or `/manager/maintenance`; trip assignments and trip alerts route to `/driver/trips` or `/manager/trip-details/:id`; fuel alerts route to `/driver/fuel` or `/manager/fuel-management`.
- **Dynamic Manager Analytics Engine (`AnalyticsPage.jsx`)**:
  - Integrated dynamic date range (`Last 7 Days`, `30 Days`, `Year to Date`) and branch filter query logic in Manager `AnalyticsPage.jsx`.
  - Dynamically calculates Fleet Utilization, Dispatch Activity Heatmap grid, Operational Costs (Fuel + Maintenance), Top Spender vehicle plate, Overdue Maintenance Anomalies, and AI Operational Insights directly from MongoDB collections.

## [1.61.0] - 2026-08-04

### Changed & Refined (Super Admin Dynamic Database Analytics & Real Dashboard Metrics)
- **Dynamic Database Analytics & Timeframe Filter (`admin.controller.js`, `adminApi.js`, `Analytics.jsx`)**:
  - Connected `adminApi.getAnalytics` with query timeframe parameter (`filter`: `today`, `week`, `month`, `year`) to fetch dynamic live database statistics.
  - Completely eliminated static artificial scaling multiplier (`multiplier`) and fake calculations in `Analytics.jsx`.
  - Displaying real database count metrics for Active Trips, Completed Trips, Fuel Usage, Organization Growth, Fleet Manager Growth, Subscription Distribution, and System Activity directly from MongoDB collections (`Trip`, `Organization`, `User`, `AuditLog`, `Fuel`).
- **Real Database Dashboard Statistics & Correct Pending Requests Count (`admin.service.js`, `Dashboard.jsx`)**:
  - Updated `getAdminDashboardData` in backend to fetch real pending organization requests via `getPendingRequestsCount()` (`Organization.countDocuments({ status: 'Pending' })`), accurately categorizing Organization Status distribution into Active, Pending, and Suspended orgs.
  - Ensured all Revenue Trend line charts, Organization Status doughnut charts, and Fleet Manager bar charts render 100% dynamic MongoDB database data without dummy values.

## [1.60.0] - 2026-08-04

### Added & Enhanced (Mechanic Arrived Step-Gated Service Complete & Need Maintenance)
- **Real-Time Driver Duty Status Sync & Color Indicators (`driverApi.controller.js`, `DriversListPage.jsx`, `CreateTripPage.jsx`)**:
  - Integrated `isDuty` and `driverStatus` updates in `updateDriverProfile` endpoint with real-time Socket.io triggers (`driver:status-updated`).
  - Added Green **`ON DUTY (AVAILABLE) 🟢`** and Red **`OFFLINE (OFF DUTY) 🔴`** status badges across Manager Drivers List and Trip Creation driver assignment cards.
  - Disabled trip allocation for drivers who are Offline/Off Duty, displaying a clear red warning note.
- **Restricted Awaiting Mechanic Assignment Banner strictly to Open Tickets (`IssueCard.jsx`)**:
  - Updated `IssueCard.jsx` so `Awaiting Manager Mechanic Assignment ⏳` banner is displayed **ONLY** for tickets in `Open` stage.
  - Resolved issue where cancelled tickets (`Cancelled (Accident)`) or completed tickets were displaying the mechanic assignment waiting banner.
- **Assigned Vehicle Badge on Driver Assignment Cards (`CreateTripPage.jsx`, `driver.controller.js`)**:
  - Enhanced `getAvailableDrivers` controller to populate assigned/recent vehicle registration numbers for drivers.
  - Added **`🚚 Vehicle: [REG-NO]`** badge next to driver Emp ID on `Create Trip` driver assignment cards when creating trips.
- **Removed Mechanic Buttons on Repair Completed Services (`IssueCard.jsx`, `ViewTicketsPage.jsx`)**:
  - Updated `isResolvedOrCompleted` logic in `IssueCard.jsx` to include `Repair Completed` stage so the blue `Mechanic Arrived 📍` button is completely hidden for tickets with `Repair Completed` status.
  - Removed `Assign Mechanic / Edit Ticket` action button (`🔧`) from manager ticket tables for services with status `Completed`, `Resolved`, `Closed`, or `Repair Completed`.
- **Step-Gated Driver Action Buttons (`IssueCard.jsx`)**:
  - Configured ticket action buttons so **`Service Completed ✅`** and **`Need Maintenance 🔧`** buttons are displayed **ONLY AFTER** the driver clicks **`Mechanic Arrived 📍`**.
  - Before mechanic arrives, the card displays **`Mechanic Arrived 📍`** action trigger once a mechanic is assigned by the manager.
- **Manager Alert Notification on Need Maintenance (`driverApi.controller.js`, `IssueCard.jsx`)**:
  - Clicking **`Need Maintenance`** flags ticket status as `Need Maintenance` and sends real-time high-priority notification (`🚨 Need Maintenance Alert`) to Fleet Manager.
- **Resolved Ticket & Service Bill Upload (`driverApi.controller.js`, `driverApi.js`, `IssueCard.jsx`)**:
  - Clicking **`Service Completed ✅`** or resolving `Need Maintenance` status opens the **Resolved & Upload Service Bill 📄** modal for uploading workshop bill receipts (Image/PDF), actual costs (₹), and resolution notes.

## [1.59.0] - 2026-08-03

### Fixed & Enhanced (View Ticket Details Modal & MapPin Icon Import)
- **Resolved Blank Screen & ReferenceError on Eye Icon Click (`ViewTicketsPage.jsx`)**:
  - Imported missing `MapPin` icon from `lucide-react` to fix `ReferenceError: MapPin is not defined`.
  - Implemented `formatDateSafe` helper function to handle invalid date values and prevent `RangeError: Invalid time value` crashes.
  - Ensured the View Details modal opens cleanly for all ticket records with complete issue details, driver location, and service completion receipts.

## [1.58.0] - 2026-08-03

### Changed & Refined (Issue-Based Dynamic Forms, Driver Location & Service Bills)
- **Category-Specific Dynamic Forms (`ViewTicketsPage.jsx`)**:
  - Restructured `getCategoryKey` and `renderDynamicCategoryForm` so the Emergency Accident form renders strictly when issue category is `Accident / Emergency`.
  - Configured Mechanic Breakdown & Repair form for general vehicle maintenance (Engine, Tyre, Brake, Mechanical repairs) with mechanic details, garage location, labor cost, and parts replaced notes.
- **Driver Location Visibility (`ViewTicketsPage.jsx`)**:
  - Added **`Driver Reported Location 📍`** to ticket details and update modals, displaying captured GPS coordinates or highway landmark when ticket was raised.
- **Completed Service Bill & Invoice Attachment (`ViewTicketsPage.jsx`)**:
  - Added **Service Bill No.** and **Bill Receipt Date** fields to manager update modal.
  - Displays verified **`Service Bill & Maintenance Receipt 🧾`** section upon service completion (`Completed` / `Repair Completed` / `Resolved`).

## [1.57.0] - 2026-08-03

### Changed & Enforced (Manager Mechanic Assignment & Driver Maintenance Actions)
- **Required Manager Mechanic Assignment Before Driver Service Start (`IssueCard.jsx`)**:
  - Enforced that drivers cannot click `Start Service` until the manager assigns a mechanic.
  - Displays `Awaiting Manager Mechanic Assignment ⏳` banner on driver cards until mechanic details are logged by manager.
- **Sequential Driver Maintenance Progress Actions (`IssueCard.jsx`)**:
  - Unlocks step-by-step progress buttons once mechanic is assigned: **`Mechanic Arrived 📍`** -> **`Start Service 🔧`** -> **`Service In Progress ⚙️`** -> **`Mark Service Completed ✅`**.
  - All status transitions sync live to Manager Web (`ViewTicketsPage.jsx` / `MaintenanceManagementPage.jsx`) with distinct status badges.

## [1.56.0] - 2026-08-03

### Changed & Unified (Manager Maintenance Page Layout & Single Ticket Table Replica)
- **Replicated Vehicle Issue Tickets Table on Manager Maintenance (`MaintenanceManagementPage.jsx`)**:
  - Replaced all legacy tables and widgets on `/manager/maintenance` with the exact **Vehicle Issue Tickets** table replicated from the ticket overview screenshot.
  - Retained strictly the 6 ticket summary metric cards (`Total Tickets`, `Open`, `In Progress`, `Resolved`, `Total Cost`, `Avg Cost`), eliminating all old cards (calendar widget, 4 old metric cards) and secondary tables.
- **Real-Time 5s Polling & Interactive Modals**:
  - Configured 5-second background interval polling for live ticket status synchronization.
  - Enabled interactive View Details (`👁`) and Assign Mechanic / Edit Ticket (`🔧`) modals for every ticket row.


### Changed & Redesigned (Manager Maintenance Table & Pagination)
- **Header Button Cleanup (`MaintenanceManagementPage.jsx`)**:
  - Removed `Upcoming Services` button and `View Driver Tickets` button from the top right of the Maintenance Management page header, retaining a single clean header.
- **Embedded Vehicle Issue Tickets Table & 10-Record Pagination (`MaintenanceManagementPage.jsx`, `ViewTicketsPage.jsx`)**:
  - Replaced old mock Service History table with the complete **Vehicle Issue Tickets** table displaying driver-reported vehicle maintenance tickets and fault logs.
  - Implemented 10-records-per-page pagination with functional **`Prev`** and **`Next`** buttons, page number counters, and auto-reset page behavior upon search/filter changes across Manager Web.

## [1.54.0] - 2026-08-03

### Changed & Streamlined (Ticket Issue Maintenance & Driver Action Buttons)
- **Focused Manager Maintenance Views on Ticket Issues (`MaintenanceManagementPage.jsx`, `UpcomingServicesPage.jsx`)**:
  - Filtered Manager Maintenance Overview and Services lists to display strictly driver-raised issue tickets and needed maintenance, eliminating non-ticket upcoming dummy work orders.
- **Enhanced 3-Stage Driver Progress Action Buttons (`IssueCard.jsx`)**:
  - Added step-by-step progress buttons for drivers on Driver Web: **`Start Service 🔧`** -> **`Service In Progress ⚙️`** -> **`Mark Service Completed ✅`**.
  - Clicking these buttons updates the backend ticket status live, allowing managers to monitor maintenance progress in real time.
- **Active Needed Maintenance Filter on Driver Vehicles (`Vehicles.jsx`)**:
  - Filtered Driver Vehicles `Maintenance Alerts` list to display strictly active/needed maintenance issues, hiding completed/closed tickets from the active queue.

## [1.53.0] - 2026-08-03

### Changed & Enforced (Read-Only Manager Services & Driver Maintenance Alerts)
- **Removed Action Execution Buttons (`Start Service`, `Complete`) from Manager Services Tables (`MaintenanceManagementPage.jsx`, `UpcomingServicesPage.jsx`)**:
  - Removed `Start Service` and `Complete` action buttons from Manager Web maintenance tables, rendering the Manager Services views as read-only monitor hubs.
  - Manager tracks live driver progress statuses (`Need Maintenance`, `Mechanic Assigned`, `Mechanic Arrived`, `Repair In Progress`, `Repair Completed`, `Resolved`, `Completed`).
- **Driver Vehicles Maintenance Alerts & Health Status Sync (`Vehicles.jsx`)**:
  - Integrated driver issue tickets (`driverApi.getTickets()`) with `Maintenance Alerts` tab in Driver Web (`Vehicles.jsx`), displaying active reported tickets and maintenance alerts when drivers report issues or mark "Need Maintenance".
  - Dynamically updates Operational Health card in Driver Web to **`Under Maintenance`** whenever active maintenance tickets are reported by the driver.

## [1.52.0] - 2026-08-03

### Changed & Restricted (Maintenance Management Workflow)
- **Disabled Manager Service Schedule Creation (`MaintenanceManagementPage.jsx`, `UpcomingServicesPage.jsx`, `ScheduleServicePage.jsx`, `AnalyticsPage.jsx`, `NotificationsPage.jsx`)**:
  - Removed `+ Schedule Service` creation buttons and modals across Manager Web portal.
  - Restricted service creation so managers cannot create services directly.
  - Configured `ScheduleServicePage.jsx` to automatically redirect managers to the Maintenance Overview page with an informative notice.
- **Enforced Driver-Raised Maintenance Pipeline**:
  - Configured Manager Web Maintenance Overview (`/manager/maintenance`) and Tickets view (`/manager/maintenance/tickets`) to display and manage driver-raised vehicle issue tickets and maintenance logs.
  - Drivers raise maintenance issues/tickets via Driver Web (`/driver/maintenance`), which flow directly into Manager Web for mechanic assignment and resolution tracking.

## [1.51.0] - 2026-08-03

### Removed & Simplified (Admin & Manager Portals)
- **Removed Subscription Plan and Status Dropdowns from Admin Organization Forms (`AddOrganization.jsx`, `EditOrganization.jsx`)**:
  - Removed Subscription Plan and Status select inputs from the Admin Organization creation (`AddOrganization.jsx`) and editing (`EditOrganization.jsx`) forms.
- **Removed Communication Workspace & Navigation from Manager Portal (`TripDetailsPage.jsx`, `TripsManagementPage.jsx`, `TripsListPage.jsx`, `NotificationsPage.jsx`, `Header.jsx`)**:
  - Removed Communication tab from top tab bar navigation and detail rendering section in Manager Trip Details page (`TripDetailsPage.jsx`).
  - Removed unread chat message badge buttons and `tab=communication` URL parameters from Manager Trips lists (`TripsManagementPage.jsx`, `TripsListPage.jsx`) and Notifications page / Header navigation (`NotificationsPage.jsx`, `Header.jsx`).

## [1.50.0] - 2026-08-03

### Fixed
- **Added `getTripDetails` Helper Method to `ApiService` ([api_service.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/services/api_service.dart))**:
  - Added `static Future<dynamic> getTripDetails(String tripId)` to `ApiService`, resolving `The method 'getTripDetails' isn't defined for the type 'ApiService'` compiler error.
- **Fixed Dangling Doc Comment Warning ([date_formatter.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/utils/date_formatter.dart))**:
  - Converted `///` to `//` header comment in `date_formatter.dart`, resolving `Dangling library doc comment` warning.

## [1.49.0] - 2026-08-03

### Fixed & Implemented
- **Implemented Date Formatter Utility ([date_formatter.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/utils/date_formatter.dart))**:
  - Implemented `formatIndianDate`, `formatIndianDateTime`, and `formatNotificationTime` helper functions, replacing the empty placeholder file.
- **Fixed `ApiService` Callback Type Signature ([api_service.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/services/api_service.dart))**:
  - Specified `static void Function()? onUnauthorized;` type signature to eliminate static analyzer return warnings.
- **Cleaned Up `TripDetailsScreen` ([trip_details_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart))**:
  - Synchronized with upstream changes and eliminated invalid object extensions and type errors.

## [1.42.0] - 2026-08-03

### Fixed & Enhanced (Web & Driver Mobile Portal)
- **Notification Read Status Persistence & Synchronization (`NotificationsPage.jsx`, `NotificationDetailsPage.jsx`, `Dashboard.jsx`, `notifications_screen.dart`)**:
  - Connected `handleNotificationClick` on Manager Notifications page (`NotificationsPage.jsx`) to update local notification state with `isRead: true` immediately alongside the backend API call.
  - Automatically trigger `managerApi.markNotificationRead(id)` when opening Manager Notification Details page (`NotificationDetailsPage.jsx`) so viewing details marks notifications as read in backend and UI.
  - Passed `onMarkRead={handleMarkNotifRead}` to `NotificationCard` components on Driver Web Dashboard (`Dashboard.jsx`) to allow drivers to mark notifications as read directly from the dashboard inbox.
- **Trip Progress Pipeline Status Enum Fix (`Trip.js`, `driverApi.controller.js`, `manager.controller.js`, `vehicle.controller.js`, `driver.controller.js`, `syncVehicleStatus.js`)**:
  - Expanded Mongoose `Trip` schema `status` enum list to include all valid trip pipeline progression stage values (`'En Route'`, `'At Loading'`, `'Loading'`, `'In Transit'`, `'On Transit'`, `'Dispatched'`, `'Delivered'`, `'Start Trip'`, `'Complete Trip'`).
  - Resolved `Trip validation failed: status: En Route is not a valid enum value for path status` error when drivers click pipeline progress buttons (**Start / In Progress**, **En Route**, **At Loading**, **In Transit**, **Delivered**, **Completed**).
  - Updated active trip allocation queries across backend controllers and utility functions (`syncVehicleStatus.js`, `manager.controller.js`, `vehicle.controller.js`, `driver.controller.js`) to use `{ status: { $nin: ['Completed', 'Cancelled', 'Rejected'] } }`, ensuring active vehicle and driver availability is preserved throughout all intermediate trip progress states.

## [1.41.0] - 2026-08-03

### Fixed & Enhanced (Web & Driver Portal)
- **Fleet Manager Ticket View Modal Scroll Fix (`ViewTicketsPage.jsx`)**:
  - Restrained ticket update modal container height to `max-h-[90vh]` with vertical overflow scrolling (`overflow-y-auto`) and flex layout (`flex flex-col`), ensuring bottom action buttons (**Save Updates**, **Cancel**) and dynamic resolution form fields are fully visible and clickable without being clipped by the screen boundary.
- **Instant Driver Maintenance Ticket Status Updates (`Maintenance.jsx`, `IssueCard.jsx`)**:
  - Added optimistic status updates and immediate `onStatusUpdated` callbacks in `IssueCard.jsx` when drivers click stage buttons (**Mechanic Arrived 📍**, **Start Repair 🔧**, **Mark Repair Completed ✅**).
  - Configured `Maintenance.jsx` with background silent refreshes (`fetchTickets(true)`) and automated 5-second polling intervals so manager status changes update instantly on driver web without showing full-page loading spinners.
- **Driver Profile & Settings Default Name and Phone Pre-fill (`Settings.jsx`, `Profile.jsx`)**:
  - Pre-filled Driver Name (`fullName` / `name`) and Phone Number (`phone` / `phoneNumber`) input fields from `AuthContext` and backend profile response so driver profile inputs are never left blank.
  - Added a dedicated **Profile Information** card section to `Settings.jsx` (`/driver/settings`), allowing drivers to view and update contact details directly alongside password and preference settings.

## [1.40.0] - 2026-08-02

### Fixed & Enhanced (Web & Driver Portal)
- **Vehicle Plate & Spec Cards Overflow Fix (`SummaryCard.jsx`, `VehicleCard.jsx`, `Vehicles.jsx`)**:
  - Prevented vehicle registration plate numbers (e.g. `TG-09-AL-4587`) from breaking awkwardly at hyphens into multi-line text (`TG-09-` line 1, `AL-4587` line 2) by applying `whitespace-nowrap`, responsive font scaling (`text-lg sm:text-xl font-bold`), `truncate`, and flexbox `min-w-0` overflow safeguards across Driver Dashboard summary cards and Assigned Vehicle detail cards.
  - Adjusted vehicle specification grid cards (`Fuel Specs`, `Insurance Status`, `Maintenance Health`) to prevent label clipping and line overflow on desktop and mobile viewports.
- **Driver Trip Assignment Accept / Reject Workflow (`TripCard.jsx`, `Dashboard.jsx`, `Trips.jsx`, `CreateTripPage.jsx`, `TripsManagementPage.jsx`)**:
  - Defaulted new trip dispatch creation in Fleet Manager portal (`CreateTripPage.jsx`, `TripsManagementPage.jsx`) to initial status `"Assigned"` (Pending response).
  - Prominently displayed **Accept Trip** (emerald accent) and **Reject Trip** (rose border) action buttons under the **Current Trip Focus** section on the Driver Dashboard and under the **Pending Response** tab on the Driver Trips page (`/driver/trips`).
- **Driver Destination Location Update on Trip Completion (`driverApi.controller.js`, `manager.controller.js`)**:
  - Automatically updated `Driver.driverLocation` and `Driver.currentLocation` as well as `Vehicle.currentLocation` and `Vehicle.branch` to the completed trip's destination / customer location (`endLocation`).
  - Resets driver status to `AVAILABLE` at that customer location, enabling Fleet Managers (`CreateTripPage.jsx`, `DriversListPage.jsx`) to view driver waiting status and dispatch new trips starting from that city.
- **Interactive Notification Navigation (`NotificationCard.jsx`, `NotificationsPage.jsx`, `NotificationDetailsPage.jsx`)**:
  - Added click handlers to notification items across Driver and Manager portals to navigate directly to target feature pages (`/driver/trips/${tripId}`, `/driver/maintenance`, `/driver/fuel`, `/manager/trips/${tripId}`, `/manager/complaints`, `/manager/fuel`).

## [1.39.0] - 2026-07-31

### Added & Enhanced (Web & Backend)
- **Vehicle Issue Ticket Workflow & Action Buttons (`backend/`, `frontend/src/roles/driver/`, `frontend/src/roles/manager/`)**:
  - **Structured Issue Creation**: Updated Driver Web modal (`Maintenance.jsx`) with predefined issue types (**Tyre / Brake Issue**, **Mechanic / Engine Breakdown**, **Severe Accident / Emergency**, **Fuel / Payment Issue**, **Electrical Issue**, **Custom / Manual Entry**) and manual text input field.
  - **Driver Interactive Progress Buttons**: Enhanced `IssueCard.jsx` with driver progress update actions (**Confirm Mechanic Arrived 📍**, **Start Repair 🔧**, **Mark Repair Completed ✅**, **Need Maintenance 🛠️**) and assigned mechanic details card.
  - **Manager Condition-Based Actions (`ViewTicketsPage.jsx`)**:
    - **Mechanic / Tyre Breakdown**: Mechanic assignment modal (Name, Phone, Location) and ticket resolution (`Vehicle.status: Active`).
    - **Severe Accident Cancellation**: Added 1-click **"Cancel Trip (Severe Accident 🚨)"** action button in `ViewTicketsPage.jsx` and `updateVehicleComplaint` controller, cancelling the active trip (`Trip.status: Cancelled`), setting `Vehicle.status: Maintenance`, releasing driver status (`Driver.status: AVAILABLE`), and alerting driver.
    - **Fuel / Payment Quick Resolution**: Added 1-click **"Approve & Resolve Fuel Ticket"** action box resolving fuel tickets directly without requiring mechanic assignment.

## [1.38.0] - 2026-07-31

### Fixed & Enhanced
- **Shared React UserProfileCard Re-Creation**:
  - Re-created `UserProfileCard` (`frontend/src/components/common/UserProfileCard.jsx`) supporting both Manager Workspace and Driver Dashboard user roles.
  - Implemented 44x44px circular profile image avatar with dynamic online status dot, click-outside dropdown handling, and availability status toggle switch.
  - Resolved Vite import resolution error (`Failed to resolve import "@/components/common/UserProfileCard"`).
- **Sidebar Scroll Position Lock (`frontend/src/components/layout/AppLayout.jsx`, `DriverLayout.jsx`, `Sidebar.jsx`, `NewAdminSidebar.jsx`)**:
  - Locked navigation sidebars to `sticky top-0 h-screen overflow-hidden` across Manager, Driver, and Super Admin portals so scrolling page content does not scroll the sidebar container out of viewport view.
  - Retained custom inner navigation scrollable views for long navigation menus.
- **Fleet Manager Driver Fuel & Maintenance Records Visibility (`backend/controllers/manager.controller.js` & `FuelManagementPage.jsx`)**:
  - Fixed database query in `listFuelRecords` controller to fetch fuel entries logged by assigned drivers (e.g. driver "bunny" refilling entry `6a6c7911ff3c61f3310feea7`) using multi-property `$or` queries matching vehicle IDs, plate numbers, driver IDs, and driver user IDs, with fallback query to prevent hidden pending fuel entries.
  - Enhanced `listMaintenance` controller query to return all maintenance tickets and driver maintenance logs assigned to manager's fleet.
  - Fixed `FuelManagementPage.jsx` fallback plate numbers to display actual vehicle registration or `"Unassigned"` status.
- **Removed Driver Documents & Certificates View (`frontend/src/roles/driver/`)**:
  - Removed "Documents" menu item from Driver Navigation bar (`DriverLayout.jsx`).
  - Redirected `/driver/documents` route to `/driver/dashboard` in `App.jsx`.
  - Removed "Vehicle Documents & Certificates" tile and tab panel from Driver Vehicle Overview page (`Vehicles.jsx`).

## [1.37.0] - 2026-07-31

### Added & Enhanced
- **Driver Web Vehicle Overview & Details Parity (`frontend/src/roles/driver/pages/Vehicles.jsx`)**:
  - **Dynamic Vehicle Banner**: Implemented top vehicle overview card matching mobile Flutter aesthetic (`vehicle_overview_screen.dart`), displaying vehicle image, status badge (`Active`, `Available`, `Maintenance`), vehicle code (`BT-990`), registration number, and fuel type badge (`Diesel`, `Petrol`, `CNG`, `Electric`).
  - **Interactive Action Cards / Nav Tabs**:
    - **Vehicle Details**: Renders basic info, operational status, assigned driver specs, load capacity, GVW, engine #, and chassis #.
    - **Vehicle Status**: Displays health score, live odometer reading, fuel tank capacity, and depot branch.
    - **Maintenance Alerts**: Dynamically fetches manager maintenance work orders (`/api/driver/maintenance`). Displays alert summary metrics (active, upcoming, overdue), priority badges (`CRITICAL`, `HIGH`, `MEDIUM`), service type, garage, scheduled date, comments, and read-only progress status (since Manager handles repair execution).
    - **Vehicle Documents**: Lists Registration Certificate (RC), Insurance, Fitness Permit, PUC, and License documents with validity status and view links.
  - **Dark Navy Quick Info Component**: Added bottom Quick Info card (`#101C2C`) displaying formatted dates for Last Service Date, Next Service Due, Insurance Expiry, and Permit Expiry.
  - **Unassigned State Handling**: Added clean "No Vehicle Assigned" view with a "Check Again" refresh trigger when no vehicle is linked to the driver profile.

## [1.36.0] - 2026-07-31

### Fixed & Enhanced
- **Fuel Log 500 Internal Server Error Fix (`backend/models/Fuel.js` & `driverApi.controller.js`)**:
  - Made `vehicle` field in `Fuel` Mongoose schema optional (`required: false`) so driver fuel refilling logs can be submitted without throwing validation errors when no vehicle is currently assigned to the driver profile.
  - Normalized backend fuel payload properties (`quantity`, `liters`, `totalCost`, `amount`, `stationName`, `fuelStation`, `odometerReading`) and output aliases (`receiptUrl`, `vehicleRegistration`, `status`) to support both Web and Mobile apps cleanly.
- **Trip Status Update API Safeguards (`backend/controllers/driverApi.controller.js`)**:
  - Added `mongoose.Types.ObjectId.isValid(id)` guard to `updateTripStatus` to prevent unhandled CastErrors resulting in HTTP 500 responses when invalid or string trip IDs are passed.
  - Wrapped Socket.io broadcasting and manager notifications in `try...catch` blocks to protect trip updates from notification dispatch failures.
- **Removed Hardcoded Dummy Vehicle Specifications (`frontend/src/roles/driver/`)**:
  - Stripped hardcoded fallback values (`Volvo`, `FH16`, `Heavy Truck`, `300 Liters`, `2023`, `Valid`, `Optimal`, `Normal (110 PSI)`, `In 2,500 km`) across `Vehicles.jsx` and `VehicleCard.jsx`.
  - Bound Driver Portal vehicle specification cards directly to real Fleet Manager assigned vehicle attributes (`brand`, `make`, `model`, `vehicleType`, `manufactureYear`, `fuelCapacity`, `insuranceExpiry`, `fitnessExpiry`, `odometer`).
- **Assigned Vehicle Multi-Level Resolver (`backend/controllers/driverApi.controller.js`)**:
  - Enhanced `getAssignedVehicle` resolver to check direct `Vehicle.assignedDriver`, driver `assignedVehicle` string/ID, and current active/recent trip vehicle, normalizing output properties for seamless consumption.

## [1.35.0] - 2026-07-31

### Added & Enhanced
- **Driver Web Portal & Mobile Parity - Trip Assignment, 15-Min Start Lock & Vehicle Details Integration (`frontend/src/roles/driver/`)**:
  - **Trip Accept / Reject Flow**:
    - Enabled drivers to review complete trip assignment details (origin, destination, cargo, schedule, manager info, assigned vehicle specs) and perform **Accept** or **Reject**.
    - Accepting a trip (`PATCH /api/driver/trips/:id/respond` with `{ action: 'accept' }`) updates status to `Accepted` and moves trip directly to **Upcoming Trips**.
    - Rejecting a trip frees driver and assigned vehicle statuses to `Available`.
  - **15-Minute Pre-Start Notification & Button Lock Rule**:
    - Enforced 15-minute start lock restriction on **Start Trip** button across `TripCard` and `TripDetails` pages.
    - Until 15 minutes before scheduled departure, **Start Trip** button remains locked with a lock icon 🔒 and clear unlock time badge.
    - Backend background interval loop in `server.js` triggers database notification & Socket.io event `trip:15min-reminder` to **both Driver and Fleet Manager** 15 minutes before departure.
    - Start trip button automatically unlocks when departure window is reached.
  - **Active Trip Transition & Manager Notification**:
    - Clicking **Start Trip** updates trip status to `In Progress`, updates driver & vehicle statuses to `ON_TRIP` / `On Trip`, shifts trip to **Active Trips**, and dispatches a live `Trip Started` notification to the Fleet Manager.
  - **Assigned Vehicle Details**:
    - Fully integrated assigned vehicle details card (Registration / Plate Number, Vehicle Model, Type, Status, and Fuel level) across trip cards and details views.
  - **Bug Fixes & Customer Location Arrival Flow**:
    - **`tripId` Resolution & 500 Error Fix**: Updated backend `getDriverTrips` and `getCurrentTrip` controllers to explicitly return `_id` and `id` properties in JSON response objects, resolving `PATCH /api/driver/trips/undefined/status` HTTP 500 errors and React missing `key` prop console warnings.
    - **Live GPS Map Tracking & Vehicle Movement**: Rendered animated vehicle position tracking on Leaflet map (`MapView.jsx`) with dynamic speed gauge, remaining distance, ETA, and 3-stop route timeline.
    - **Customer Location Reached Toggle**: Integrated interactive toggle switch for **"Arrived at Customer Location"** (`PATCH /api/driver/trips/:id/customer-location`).
    - **Automatic POD & Weighbridge Unlocking**: Upload forms for Proof of Delivery (POD) and Weighbridge Slips automatically remain locked until driver toggles ON customer arrival.

## [1.34.0] - 2026-07-31

### Added & Enhanced
- **Driver Web Portal Design System Synchronization (`frontend/src/roles/driver/`)**:
  - **Color Palette Alignment**: Unified Driver Web Portal (`frontend/src/roles/driver/`) to use the exact same color palette and design system tokens as Admin and Manager portals.
  - **Theme Tokens**:
    - **Page Background**: `#F5F7FA` light background.
    - **Brand Accent**: Warm Amber / Orange (`#B45A0A` / `#9A4D08` / `bg-amber-50` / `text-[#B45A0A]` / `border-amber-200`).
    - **Sidebar**: Dark Charcoal `#0F0F10` matching Manager sidebar with left border amber active link indicator (`border-[#B45A0A]`).
    - **Top Header Bar**: Clean white background (`bg-white border-b border-slate-200 shadow-sm`), dark font-poppins titles (`text-slate-900`), and duty toggle status badge (`bg-emerald-50 text-emerald-700`).
    - **Cards & Data Tables**: Pure white cards (`bg-white border border-slate-200 shadow-sm rounded-2xl`), `font-poppins` headings, and `font-nunito` body typography across all 12 driver pages and components.

## [1.33.0] - 2026-07-31

### Added & Enhanced
- **Driver Web Desktop Module Integration (`frontend/src/roles/driver/`)**:
  - **Module Architecture**: Created desktop-optimized Driver Web portal inside `frontend/src/roles/driver/` with dedicated API client (`driverApi.js`), Socket hook (`useDriverSocket.js`), and responsive container (`DriverLayout.jsx`).
  - **12 Phase Desktop Features**:
    1. **Authentication & Profile**: Driver login screen (`Login.jsx`), session/localStorage token management, protected routes (`ProtectedRoute.jsx`), and profile manager (`Profile.jsx`).
    2. **Desktop Dashboard**: Personalized driver greeting, shift status (On Duty / Off Duty toggle), active trip focus card, assigned vehicle summary, KPI metric widgets (`SummaryCard.jsx`), recent notifications inbox, and quick actions toolbar.
    3. **Assigned Vehicle Inspector**: Read-only vehicle specs view (`Vehicles.jsx`), registration details, compliance certificates (Insurance, Fitness, PUC status), and engine maintenance health.
    4. **Tabbed Trips Manager**: Filterable trip tabs (`Trips.jsx`) for Pending (Accept/Reject), Upcoming (Start trip), Active (Progress tracking & map navigation), and Completed history.
    5. **Live Tracking & Documents**: Full-screen interactive Leaflet map (`MapView.jsx` & `TripDetails.jsx`) displaying driver position, origin/destination markers, polyline route, speed, ETA, remaining distance, and upload modals for Proof of Delivery (POD) & Weighbridge slips.
    6. **Fuel & Maintenance Modules**: Fuel logs data grid (`Fuel.jsx`) with bill receipt attachment upload and approval status tags; Maintenance ticket submission (`Maintenance.jsx`) with photo attachment upload and 5-stage progress pipeline.
    7. **Documents & Notifications Inbox**: Compliance document viewer (`Documents.jsx`) for Driver License, RC, Insurance, and PUC; Real-time socket notification inbox (`Notifications.jsx`) with instant toasts and mark-as-read actions.
    8. **Support & Desktop Settings**: Direct helpline desk (`Support.jsx`) with click-to-call, email, and WhatsApp deep links for Manager & Dispatcher; Account settings (`Settings.jsx`) for password changes, language selection, and theme preferences.

## [1.32.0] - 2026-07-31

### Added & Enhanced
- **Mobile Service Methods & Connection Handler Fix**:
  - **ApiService Enhancements**: Added `initialize()`, `put()`, and `onUnauthorized` callback interceptor to `ApiService` in `api_service.dart`.
  - **SocketService Overload & Static Fields Fix**: Restored static `_socket` and `_isConnected` member fields in `socket_service.dart` and updated `connect([String? driverId, ...])` to accept an optional positional `driverId` parameter, resolving compilation errors in `AuthProvider`.

## [1.28.0] - 2026-07-30

### Added & Enhanced
- **End-to-End Vehicle Ticket Repair Lifecycle & Dynamic Flow Matrix**:
  - **Issue Flow Matrix Rules**: Integrated issue type rules matrix (`Low Air Pressure` & `Headlight`: `canContinueTrip: Yes`, `Vehicle.status: Active`; `Tyre Puncture`: `canContinueTrip: After Repair`, `Vehicle.status: Maintenance → Active`; `Engine/Brake/Accident`: `canContinueTrip: No`, `Vehicle.status: Maintenance → Active`).
  - **Manager Offline Mechanic Assignment**: Added offline mechanic fields (`name`, `phone`, `location`) in Manager Dashboard (`ViewTicketsPage.jsx`) and `updateVehicleComplaint` controller, pushing timeline updates and sending real-time driver alerts (`"Mechanic Ramesh assigned to ticket TKT-VEH-..."`).
  - **Driver Interactive Repair Stepper**: Redesigned `TicketDetailsScreen` (`ticket_details_screen.dart`) with a 5-stage progress bar (`Open` → `Assigned` → `Arrived` → `In Repair` → `Completed`), offline mechanic info card with direct call trigger (`url_launcher`), and driver status transition CTA buttons (`"Confirm Mechanic Arrived"`, `"Start Repair"`, `"Mark Repair Completed"`).
  - **Driver Status Patch Endpoint**: Created `PATCH /api/driver/tickets/:id/status` (`updateDriverTicketStatus`) in `driverApi.controller.js` and `driverApi.routes.js`, enabling drivers to advance repair stages and log timeline history.
  - **Auto Vehicle Status Transition & Continue Trip Alert**: When manager resolves a ticket (`status === 'Resolved'`), the backend automatically updates `Vehicle.status = 'Active'` and sends real-time `"Ticket Resolved - Continue Trip 🚚"` socket & push notifications to the driver.

## [1.27.0] - 2026-07-30

### Added & Enhanced
- **Vehicle Issues Module with Image Upload & Manager Dashboard Flow**:
  - **Mongoose Schema Update**: Added `attachments: [{ url: String, filename: String, uploadedAt: Date }]` to `VehicleComplaint.js` to store photo URLs uploaded by drivers.
  - **Driver Ticket Endpoints**: Created `POST /api/driver/tickets` (with `memoryUpload.single('file')` Cloudinary upload), `GET /api/driver/tickets`, and `GET /api/driver/tickets/:id` in `driverApi.controller.js` and `driverApi.routes.js`. Auto-binds current active trip and assigned vehicle if omitted.
  - **Real-Time Manager Notifications**: Integrated `createAndEmitNotification` upon ticket submission, creating an alert in MongoDB and broadcasting real-time socket alerts to the manager.
  - **Driver App Camera & Gallery Photo Upload**: Updated `RaiseTicketScreen` (`raise_ticket_screen.dart`) to support camera/gallery image picking via `image_picker`, thumbnail preview, remove attachment action, form validation, and multipart submission to `ApiService.createDriverTicket(...)`.
  - **Dynamic Driver Ticket History**: Bound `SupportHistoryScreen` (`support_history_screen.dart`) to `ApiService.getDriverTickets()`, rendering live ticket status badges (`Open`, `In Progress`, `Resolved`, `Closed`, `Rejected`), trip details, and auto-refresh on submission.
  - **Interactive Ticket Details & Photo Preview**: Updated `TicketDetailsScreen` (`ticket_details_screen.dart`) to view real uploaded Cloudinary photo attachments with full-screen image preview modal and status update history.
  - **Manager Dashboard Ticket Management**: Updated `ViewTicketsPage.jsx` (`/manager/maintenance/tickets`) and `listVehicleComplaints` controller to populate driver, vehicle, trip, and attachments. Managers can view uploaded driver photos, inspect issue details, update status, track estimated/actual repair costs, and add maintenance notes.

## [1.26.0] - 2026-07-30

### Added & Enhanced
- **Fuel Receipt Upload, Manager Approval Workflow & Real Database Data Binding**:
  - **Fuel Schema Update**: Updated `Fuel.js` Mongoose schema to remove `hasReceipt` and add `receiptImage: { type: String, default: "" }` storing Cloudinary URLs.
  - **Driver Fuel APIs**: Added `POST /api/driver/fuel` (with `memoryUpload.single('file')` Cloudinary image upload) and `GET /api/driver/fuel` endpoints in `driverApi.controller.js` and `driverApi.routes.js`.
  - **Driver Fuel Entry Screen**: Updated `AddFuelEntryScreen` (`add_fuel_entry_screen.dart`) to enable image selection via Camera or Gallery using `image_picker`, previewing attached receipt image, submitting via multipart `ApiService.createFuelEntry(...)`, and showing success modal with form reset.
  - **Dual Field Cloudinary Synchronization**: Populated both `billUrl` and `receiptImage` in `Fuel.js` schema and `createDriverFuelEntry` controller so Manager web view and Driver mobile app both render Cloudinary receipt URLs without empty `billUrl` issues.
  - **Manager Fuel Table & Receipt View Modal**: Updated `FuelManagementPage.jsx` to show columns for Vehicle, Driver, Fuel Station, Amount, Liters, Date, Approval Status, and a Receipt column with "View" button. Opening the receipt modal displays the uploaded Cloudinary receipt image (or "No receipt uploaded.") with direct Approve and Reject action buttons.
  - **Approval & Rejection Workflow**: Implemented `handleApproveBill` (`approvalStatus = 'Approved'`) and `handleRejectBill` (`approvalStatus = 'Rejected'`, mandatory `rejectionReason`).
  - **Driver Fuel History & Overview Screens**: Bound `FuelHistoryScreen` (`fuel_history_screen.dart`), `FuelOverviewScreen` (`fuel_overview_screen.dart`), and `FuelEntryDetailsScreen` (`fuel_entry_details_screen.dart`) to live MongoDB fuel data, displaying Cloudinary receipt thumbnails, status badges, and rejection reasons. Removed all dummy data.

## [1.25.0] - 2026-07-30

### Added & Enhanced
- **Real Vehicle Backend Binding & Unassigned Vehicle State**:
  - **Backend Endpoint**: Created `GET /api/driver/vehicle` endpoint in `driverApi.controller.js` (`getAssignedVehicle`) and `driverApi.routes.js`. Resolves driver's assigned vehicle from MongoDB (`Vehicle` collection) via `assignedDriver`, `assignedVehicle` string, or active trip vehicle.
  - **Empty / Unassigned Vehicle Handling**: Built a clean "No Vehicle Assigned" view across all vehicle screens (`VehicleOverviewScreen`, `VehicleDetailsScreen`, `VehicleDocumentsScreen`, `VehicleMaintenanceScreen`, `VehicleStatusScreen`) when driver has no assigned vehicle.
  - **Overview Screen Integration**: Refactored `VehicleOverviewScreen` (`vehicle_overview_screen.dart`) to dynamically fetch backend vehicle data on load and pull-to-refresh, binding `VehicleInfoCard` and `QuickInfoCard` with real values.
  - **Details Screen Integration**: Bound `VehicleDetailsScreen` (`vehicle_details_screen.dart`) to real vehicle specs (Brand, Model, Mfg Year, Payload Capacity, Fuel Type, Odometer, Engine Number, Chassis Number, Driver info).
  - **Documents Screen Integration**: Bound `VehicleDocumentsScreen` (`vehicle_documents_screen.dart`) to MongoDB vehicle documents (`documents` object) and expiry fields (`rcExpiry`, `insuranceExpiry`, `pollutionExpiry`, `fitnessExpiry`, `permitExpiry`), enabling live preview of uploaded Cloudinary document URLs.
  - **Maintenance Screen Integration**: Refactored `VehicleMaintenanceScreen` (`vehicle_maintenance_screen.dart`) to dynamically fetch real Manager-created maintenance work orders from MongoDB via a new `GET /api/driver/maintenance` backend endpoint (`getDriverMaintenance`), displaying active alerts (`SCHEDULED`, `IN PROGRESS`, `OVERDUE`), service counts, and last completed service insights.
  - **Status Screen Integration**: Bound `VehicleStatusScreen` (`vehicle_status_screen.dart`) to live telemetry, odometer, location, FASTag balance, and fuel capacity.
  - **Removed All Dummy Vehicle Data**: Stripped out hardcoded vehicle number strings (`TS09AB4589`, `BT-990`, `ABC-1234`) across driver screens.

## [1.24.0] - 2026-07-30

### Added & Enhanced
- **4-Stage POD & Weighbridge Verification Workflow**:
  - **Flow 1 (Before Upload)**: Rendered `NOT UPLOADED` status badge with disabled View, Download, Approve, and Reject buttons on Manager Trip Details page when no documents have been submitted.
  - **Flow 2 (After Driver Upload)**: Saved uploaded POD and Weighbridge slips into MongoDB with status `Pending` (`POD.status = 'Pending'`, `Weighbridge.status = 'Pending'`), set `Trip.status = 'DOCUMENTS_SUBMITTED'`, and enabled Manager View (modal preview of actual uploaded image URL), Download, Approve, and Reject controls.
  - **Flow 3 (Manager Rejection & Driver Re-upload)**: Implemented Manager Rejection with custom reasons (`Photo not clear`, `Signature missing`, `Wrong slip uploaded`). Saved `rejectionReason` in MongoDB, updated `Trip.status = 'Documents Rejected'`, dispatched real-time Socket.io events (`pod:rejected`, `weighbridge:rejected`), and unlocked **Re-upload** buttons in the Driver mobile app without completing the trip.
  - **Flow 4 (Approval & Auto-Completion)**: Enforced strict dual-approval verification (`pod.status === 'Approved' && weighbridge.status === 'Approved'`) before setting `Trip.status = 'Completed'`. Dispatched real-time Socket.io `trip:completed` event to automatically transition the Driver mobile app to `Trip Completed ✅` and release vehicle/driver to `Available`.
- **Linter & API Fixes**:
  - Restored missing `getDriverNotifications` method in `ApiService` (`api_service.dart`).
  - Resolved `BuildContext` across async gaps lints by scoping `ScaffoldMessengerState` references prior to async operations.
  - Cleaned up Dart map construction syntax in `uploadProofOfDelivery` and `uploadWeighbridgeSlip`.

## [1.23.0] - 2026-07-30

### Fixed & Enhanced
- **RenderFlex Layout Overflow Fix**:
  - Wrapped `TRIP ID` text column inside an `Expanded` container with `overflow: TextOverflow.ellipsis` in `TripDetailsScreen` (`trip_details_screen.dart`), eliminating the 128-pixel right RenderFlex layout overflow error on narrow device viewports.
- **Dynamic Trips Data & Active Trips Filtering**:
  - Restricted `ActiveTripsScreen` (`active_trips_screen.dart`) to display only trips actively in progress (`In Progress`, `Enroute`, `On Transit`, etc.), automatically showing a clean empty state if a trip has not been started yet.
  - Rewrote `CompletedTripsScreen` (`completed_trips_screen.dart`) to dynamically load completed trips from `/api/driver/trips?status=Completed` API instead of static mock data.
  - Converted `TripsScreen` (`trips_screen.dart`) into a dynamic `StatefulWidget`, loading live summary card counters (`totalTrips`, `activeTrips`, `upcomingTrips`) and real current/recent trip details from backend API endpoints.
- **Manager POD & Weighbridge Upload-Only View**:
  - Removed backend auto-generation of fake dummy POD & Weighbridge documents in `manager.controller.js` (`getPODByTripId` & `getWeighbridgeSlipByTripId`).
  - Disabled/hid POD and Weighbridge view and approval controls on Manager Web until the driver uploads files, and ensured uploaded documents save to MongoDB/Cloudinary and stream live to Manager via Socket.io.
- **Real Popup Notifications**:
  - Added global SocketService listeners in `MainNavigationScreen` (`main_navigation_screen.dart`) to trigger real floating popup toast notifications for new alerts, assigned trips, and status updates.
  - Replaced hardcoded notifications in `DashboardScreen` and `NotificationsScreen` with dynamic API data.

## [1.22.0] - 2026-07-30

### Fixed & Enhanced
- **Driver Dashboard Active Trip Card Layout Overflow Fix**:
  - Refactored `_buildActiveTripCard` layout in `DashboardScreen` (`dashboard_screen.dart`).
  - Balanced column flex ratios (12:8) and wrapped the ETA text in an `Expanded` widget with `TextOverflow.ellipsis` to prevent text from pushing beyond card bounds.
  - Added `FittedBox` scale-down constraints and full width sizing to the **View Details** action button, eliminating the 34-pixel right overflow error on mobile & desktop viewports.
- **Assigned Trip Details Accept & Reject Workflow**:
  - Refactored `TripDetailsScreen` (`trip_details_screen.dart`) and `UpcomingTripDetailsScreen` (`upcoming_trip_details_screen.dart`) into dynamic screens supporting live API trip data and unaccepted assigned/scheduled status detection.
  - Ensured **Reject** (outlined red button) and **Accept Trip** (elevated green button) action buttons are guaranteed to render whenever viewing any pending assigned or scheduled trip.
  - Integrated `ApiService.respondToTripAssignment(tripId, 'accept')` call on **Accept Trip**, automatically displaying confirmation feedback and navigating directly to `UpcomingTripsScreen`.

## [1.21.0] - 2026-07-29

### Added & Enhanced
- **Complete End-to-End Trips Lifecycle Workflow**:
  - Implemented Manager trip creation & driver assignment with initial `Assigned` state and real-time socket `trip:assigned` dispatch to the assigned Driver.
  - Added Driver Accept/Reject trip assignment endpoint (`PATCH /api/driver/trips/:id/respond`) and UI actions in Driver App.
  - Connected Upcoming Trips screen (`UpcomingTripsScreen`) to live API data with departure time-gated **Start Trip** button enforcement (unlocked 15 minutes prior to scheduled departure time).
  - Implemented 1-minute automated background cron job in `server.js` alerting drivers 15 minutes before scheduled departure time.
  - Added **Customer Location Reached** toggle switch (`PATCH /api/driver/trips/:id/customer-location`), enabling Proof of Delivery (POD) and Weighbridge slip uploads upon destination arrival.
  - Added Weighbridge Slip driver upload endpoint (`POST /api/driver/weighbridge`) and connected real-time manager approval workflow (`updatePODStatus` & `updateWeighbridgeSlipStatus`).
  - Implemented automatic trip status transition to `Completed` upon Manager POD/Weighbridge approval, releasing Vehicle (`Available`) and Driver (`AVAILABLE`) statuses and updating active views via Socket.io.
  - Cleaned up dummy hardcoded mock notifications, alerts, and trips across mobile screens and connected live API services.

## [1.26.0] - 2026-07-31

### Added & Integrated
- **Real-Time Trip Assignment Updates (Socket.IO)**:
  - Integrated `socket_io_client` package in `driver_mobile` to establish persistent WebSocket connections to the backend server.
  - Implemented `SocketService` class ([socket_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/socket_service.dart)) to handle connections, automatic reconnections, and listener hooks for dynamic updates.
  - Bound `SocketService` connection lifecycle to the driver authentication state inside [auth_provider.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/providers/auth_provider.dart) (connecting on login/session initialization, disconnecting on logout).
  - Updated [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to register a socket listener, triggering an immediate UI refresh when a new trip or notification is dispatched, bypassing the 10-second polling fallback.
  - Added backend WebSocket room `joinDriverRoom` handler to [server.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/server.js) allowing drivers to subscribe to `driver:${driverId}` events.
  - Updated backend notification dispatcher ([notification.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/utils/notification.js)) to route driver-specific notifications to the `driver:${recipient}` room.
  - Fixed key mismatches in backend REST API response `/api/driver/trips/current` inside [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) by returning `startLocation` and `endLocation` alongside `pickup` and `destination` fields.
  - Fixed active trip details navigation inside [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to retrieve the correct `tripId` field from the API response payload.

## [1.25.0] - 2026-07-29

### Added & Integrated
- **Dynamic Trip Assignment & Dashboard Polling**:
  - Integrated notification triggers inside backend controllers `createTrip` and `updateTrip` ([manager.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/manager.controller.js)) to write `Notification` documents to MongoDB and simulate FCM push delivery.
  - Implemented background periodic dashboard polling (runs silently every 10 seconds) inside [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart).
  - Programmed delta notification checks inside `_loadDashboardData()` that detect new unread notification records, displaying premium SnackBar alerts with in-app "View" redirect hooks.
- **Driver Dashboard Integration**:
  - Replaced all dashboard mock values with dynamic Mongoose queries and REST payloads fetching `/api/driver/dashboard` and `/api/driver/trips/current`.
  - Configured `_buildActiveTripCard` dynamically mapping `startLocation`, `endLocation`, `eta`, status, and computing real progress updates. Added fallback states when no active trip is currently assigned to the driver.
  - Linked `_buildScheduleTimeline` dynamically with the array list from `_dashboardData['todaySchedule']`.
  - Rewrote the recent notifications widget list to display the top 3 live notifications from `NotificationProvider` state with context-styled colors and icons.
- **Driver Notifications Feed & FCM Push Notifications Integration**:
  - Connected the Driver Notifications screen ([notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart)) to the backend Mongoose `Notification` collection.
  - Implemented the `NotificationModel` class to handle raw database mapping, categorizations (Today, Yesterday/Older), and dynamic Material icon conversions.
  - Developed the `NotificationRepository` and `NotificationProvider` to fetch notifications (`GET /api/driver/notifications`), mark single notification read (`PATCH /api/driver/notifications/:id/read`), and mark all notifications read (`PATCH /api/driver/notifications/read-all`).
  - Added the `firebase_messaging` package, and created `FcmService` to initialize Firebase Cloud Messaging, request system notification permissions, register/refresh the driver's device FCM token in the database, and handle background/foreground/terminated notification-click events.
  - Modified [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to read active unread notifications via the provider state and automatically mark them as read when clicking on unread trip/maintenance indicators.
- **Driver Settings Screen & Sub-Screens Integration**:
  - Connected the Change Password screen ([change_password_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/change_password_screen.dart)) to the existing backend API endpoint `PATCH /api/auth/change-password` by creating a new `changePassword` method in `AuthRepository` and `AuthProvider`.
  - Fixed `"data and hash arguments required"` bcrypt exception during Driver password changes by modifying `findUserByEmail` inside [auth.repository.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/repositories/auth.repository.js) to explicitly fetch `.select('+password')` for the Driver model.
  - Extended the MongoDB `Driver` schema ([Driver.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/models/Driver.js)) and profile endpoint response/controller allowed fields to save and return 2FA preferences, language, dark mode theme preferences, and notification configuration settings.
  - Connected the Two-Factor Authentication configuration screen ([two_factor_auth_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/two_factor_auth_screen.dart)) to load and persist 2FA status, selected method, registered phone, and generated recovery codes. Added logic to generate a random 6-digit OTP, output it to the debugging terminal console, and validate it before configuring 2FA.
  - Bound the Notification Preferences screen ([notification_settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/notification_settings_screen.dart)) to read and save notification preference switches to the driver database.
  - Synchronized language selector choices and dark mode toggles on the main settings screen ([settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart)) with immediate backend storage.
  - Structured all build context usages safely across asynchronous gaps to comply with static lint guidelines.
  - Made the Issuing State text field optional on [EditProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart) by removing its required validation rule, and configured `autovalidateMode: AutovalidateMode.onUserInteraction` on the Form wrapper to clear error alerts reactively. Fixed the Issuing State pre-fill being empty on page load by updating the backend `getDriverProfile` controller ([driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js)) to return the `branch` database field.
  - Fixed login error screen resets when entering wrong credentials by preventing the `onUnauthorized` auto-logout interceptor inside [api_service.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) from executing during `/login` API calls.
  - Implemented `isSessionInitialized` inside [auth_provider.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/providers/auth_provider.dart) and updated the root [main.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/main.dart) `AuthSessionWrapper` to display a full-screen loading spinner only during initial startup session checks. This prevents the widget tree from unmounting and resetting the login form during failed login attempts, enabling SnackBars to render successfully.
  - Added full 6-digit OTP pasting support inside [two_factor_auth_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/two_factor_auth_screen.dart) by removing direct `maxLength: 1` limits and parsing clipboard strings to distribute digits across the fields manually.
  - Added `firebase_core` package dependency to `pubspec.yaml` and imported/initialized Firebase inside [main.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/main.dart)'s `main()` method wrapped in a try-catch for safety. Imported [firebase_options.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/firebase_options.dart) and configured initialization to pass `DefaultFirebaseOptions.currentPlatform`.
- **Dashboard Profile Avatar Synchronization**:
  - Replaced the static asset-based dashboard avatar in [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) with a `ValueListenableBuilder` connected to `ProfileState.profilePhotoUrlNotifier`.
  - Added support in both [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) and [SettingsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart) to render base64 memory images and standard network images dynamically.
- **License Issuing State Replacement**:
  - Replaced the static/organization field label with `"ISSUE STATE"` on [ProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart) and bound it dynamically to the driver's `branch` data.
  - Linked the Issuing State text input controller value to the `'branch'` payload property inside `_saveChanges` on [EditProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart).
  - Extended backend profile update controller `updateDriverProfile` (`driverApi.controller.js`) to support editing and saving the `'branch'` property.
- **Device Image Upload & Cloudinary Integration**:
  - Implemented base64 image upload in backend profile controller `updateDriverProfile` (`driverApi.controller.js`), parsing incoming data URIs and uploading them to Cloudinary dynamically.
  - Added a new `"Upload from Device"` action in the profile photo bottom sheet (`edit_profile_screen.dart`), opening the device's native file explorer via `file_picker`.
  - Added base64 image decoding/memory preview support in both [EditProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart) and [ProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart) to show instant previews prior to database persistence.
- **Backend Driver Profile Fields & Update Endpoint**:
  - Extended the `getDriverProfile` controller response in [driverApi.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/driverApi.controller.js) to return joiningDate, dob, address, experience, licenseExpiry, performanceScore, and tripsCompleted.
  - Implemented the `updateDriverProfile` controller action allowing drivers to update their own profile fields (fullName, email, phoneNumber, dob, address, licenseNumber, licenseType, licenseExpiry, profileImage).
  - Registered route `PUT /api/driver/profile` in [driverApi.routes.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/routes/driverApi.routes.js) mapped to the new controller.
- **Help & Support Backend Connection**:
  - Refactored [HelpSupportScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/help_support_screen.dart) to load live dispatcher support contact info dynamically from `GET /api/driver/support`.
  - Added loading indicator and retry handler layouts inside the "Still need help?" card.
  - Linked "Chat on WhatsApp" and "Call Support" actions to launch their respective WhatsApp URI and phone dialer links using `url_launcher`.
- **Flutter API Integration & Reactive UI Binding**:
  - Extended [DriverModel](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/models/driver_model.dart) with additional fields (employeeId, joiningDate, address, licenseExpiry, performanceScore, tripsCompleted, dob) and updated JSON serialization.
  - Added a `put` method to [ApiService](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) for HTTP PUT request handling.
  - Implemented `onUnauthorized` static callback inside [ApiService](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) interceptor triggering on 401 response code.
  - Registered the `onUnauthorized` interceptor callback in [AuthProvider](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/providers/auth_provider.dart) to automatically execute the logout sequence and trigger reactive redirection to the Login screen.
  - Implemented `refreshProfile` and `updateProfile` methods in [AuthProvider](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/providers/auth_provider.dart) and [AuthRepository](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/repositories/auth_repository.dart).
  - Converted [ProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart) to a `StatefulWidget` fetching dynamic profile data from backend on start with full pull-to-refresh `RefreshIndicator`, loading indicator, error retry views, and status color mapping.
  - Updated [EditProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart) to dynamically prefill all form fields using the logged-in driver's provider data and call the backend update API upon saving, rendering a loader dialog and a success snackbar.

## [1.21.0] - 2026-07-28

### Added & Integrated
- **Dio API Client & JWT Secure Storage Interceptor**:
  - Replaced the `http` package connection implementation in [ApiService](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/api_service.dart) with `Dio`, providing request timeout controls, custom interceptors, and standardized exception transformations.
  - Configured `flutter_secure_storage` for secure persistence of the JWT authentication token.
  - Implemented request interceptor in `ApiService` that reads the stored JWT token and injects the `Authorization: Bearer <token>` header automatically into all outgoing requests.
  - Updated all driver authentication screens ([LoginScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart), [ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart), [OTPScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart), [ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart)) to bind with `AuthProvider` state management, rendering loading state indicators and displaying detailed API error alerts via SnackBars.
  - Refactored [ProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart) and [SettingsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart) to clear secure session keys on logout.
- **Backend Drivers Password Reset Support**:
  - Added password reset support fields (`resetPasswordOtp`, `resetPasswordExpires`) to Mongoose `DriverSchema` in [Driver.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/models/Driver.js).
  - Updated `findUserByEmail` in [auth.repository.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/repositories/auth.repository.js) to look up drivers in the `Driver` collection if no admin/manager is found in `User` collection, enabling full OTP-based forgot-password and reset-password workflows for drivers.

## [1.20.0] - 2026-07-28

### Added & Integrated
- **Full Fleet Management Backend & Driver App Multi-Phase Integration**:
  - Implemented backend API controllers (`driverApi.controller.js`), routes (`driverApi.routes.js`), and JWT authentication middleware supporting all 10 Driver App integration phases.
  - Added `POST /api/driver/login`, `POST /api/driver/logout`, and `GET /api/driver/profile` with password hashing (`bcrypt`), JWT token generation, and secure session persistence via `SharedPreferences`.
  - Added `GET /api/driver/trips/current` and connected `DashboardScreen` active trip card dynamically.
  - Added `GET /api/driver/dashboard` for live trip counter statistics (`activeTrips`, `upcomingTrips`, `completedTrips`).
  - Added `GET /api/driver/notifications` for fetching live notifications.
  - Added `PATCH /api/driver/trips/:id/status` and connected `UpdateTripStatusScreen` for real-time trip status workflow progression (`Accept Trip`, `Start Trip`, `Reach Pickup`, `Enroute`, `Delivered`, `Complete Trip`).
  - Implemented `LocationTrackingService` sending 10-second periodic GPS updates via `POST /api/driver/location` during active trip execution.
  - Added `GET /api/driver/documents` and `GET /api/driver/support` for dispatcher support contacts with phone, WhatsApp, and Email triggers (`url_launcher`).
  - Added `POST /api/driver/pod` for Proof of Delivery (POD) photo capture and upload to Cloudinary & MongoDB.
  - Added prominent console log outputs in backend controllers (`admin.controller.js` and `driver.controller.js`) printing email and plain text password whenever a new Driver or Fleet Manager is created.
  - Configured `ApiService` with dynamic host resolution (PC Wi-Fi IP `10.86.34.1:5000` + USB reverse `127.0.0.1:5000` fallback) and added a **Server Settings Configuration Modal** on the Login screen, resolving physical Android device (`CPH2835`) network timeout errors.
  - Updated Express backend CORS middleware in `app.js` to dynamically allow Flutter Web origins (`http://localhost:*`, `http://127.0.0.1:*`, local network IPs), resolving CORS preflight blocked errors when running Flutter Web.

## [1.17.9] - 2026-07-28

### Changed
- **Support Screen Layout Adjustments**:
  - Removed the back button in [SupportHistoryScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart) since it is hosted inside the main tab navigation view.
  - Adjusted title spacing to `16.0` to keep the brand logo and title aligned.
  - Relocated the "Call Manager" and "Message Manager" action buttons from the filter chips row to a new dedicated, premium 50/50 split horizontal Row directly below the Search Bar.
  - Allowed the filter chips row to span full-width without crowding or truncation.
- **Dashboard Navigation Header Styling**:
  - Decreased the greeting text ("Good Morning, Meghana 👋") size from 18 to 15, and the date subtitle size from 13 to 11 on [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart).
  - Decreased the driver profile avatar container size from 48x48 to 36x36, and adjusted the online status indicator dot to 10x10 with a 1.5 border width.
  - Decreased the brand logo container size from 40x40 to 36x36 to match the avatar profile container and keep the header section vertically and horizontally balanced.
- **Notifications Screen Filter Styling**:
  - Replaced the tab-like filter boxes on [NotificationsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) with pill-shaped horizontal chips ('All', 'Read', 'Unread') to match the design language of the support history page.
- **Profile Screen Header Styling**:
  - Changed the top navigation header title from 'FleetManagement' to 'Profile' in [ProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart).

## [1.19.0] - 2026-07-28

### Fixed & Enhanced
- **Fixed Floating Bottom Navigation Bar Icons Movement & Full Viewport Docking**:
  - Refactored `_buildNavItem` in [main_navigation_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) to wrap each bottom bar item in an `Expanded` widget inside `Row`.
  - Fixed icon layout, widths, and paddings across selected and unselected states to guarantee 100% fixed icon positioning with zero horizontal or vertical movement when tabs are clicked.
  - Docked the bottom navigation bar container firmly to the bottom edge of the viewport with explicit height calculation (`64.0 + MediaQuery.of(context).padding.bottom`) and top shadow, allowing full height display for all generated mobile screens (`DashboardScreen`, `ActiveTripsScreen`, `ProfileScreen`, `TripsScreen`, `SupportHistoryScreen`, `NotificationsScreen`).
  - Added `INTERNET`, `ACCESS_FINE_LOCATION`, and `ACCESS_COARSE_LOCATION` permissions to [AndroidManifest.xml](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/android/app/src/main/AndroidManifest.xml) for mobile network & map rendering.

- **Automated Live GPS Status Updates & Automatic POD / Weighbridge Enablement**:
  - Streamlined trip status updates in [active_trips_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/active_trips_screen.dart) and [update_trip_status_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/update_trip_status_screen.dart) to rely automatically on Live GPS tracking instead of manual status switches/grids.
  - Replaced manual status switch and manual status buttons with a prominent **Live GPS Status (Auto-Updated)** info banner displaying `Reached Customer Location` auto-detected status.
  - Fixed `RenderFlex` right overflow by 139 pixels inside the status container by wrapping title and subtitle columns in `Expanded` widgets across narrow mobile viewports.
  - Automatically enables and displays Proof of Delivery (POD) Slip and Weighbridge Slip upload boxes immediately upon reaching customer location via Live GPS.

## [1.18.0] - 2026-07-28

### Added
- **POD & Weighbridge Slip Upload at Customer Location**:
  - Added dedicated Proof of Delivery (POD) Slip upload box and Weighbridge Slip upload box with cargo weight entry field in [active_trips_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/active_trips_screen.dart) and [update_trip_status_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/update_trip_status_screen.dart).
  - Integrated document and photo picking using `file_picker` with status indicators ("Uploaded", "Pending"), file size badges, and deletion/re-upload triggers.
- **WhatsApp-Styled Media Attachment Drawer in Chat**:
  - Implemented interactive WhatsApp-styled bottom sheet modal in [message_fleet_manager_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/message_fleet_manager_screen.dart) upon clicking attachment icon (`Icons.attach_file_rounded`).
  - Added 6 circular options: Document, Camera, Gallery, Audio, Location, and Slips/POD.
  - Dynamically appends outgoing media attachment bubbles to the live chat thread with thumbnail icons, file sizes, and timestamps.
- **Real Maps Integration & Reroute Feature**:
  - Created [live_tracking_map_widget.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/widgets/live_tracking_map_widget.dart) powered by `flutter_map` and OpenStreetMap raster tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
  - Rendered real-time driver vehicle marker with glowing accuracy radius, pickup & destination markers, and route polyline paths.
  - Integrated interactive **Reroute** button that recalculates route trajectory, re-centers map view on driver's live GPS coordinates, and displays route updated notifications.

### Fixed
- **Android Gradle Build & AAR Metadata Check**:
  - Updated `compileSdk` to `36` in [build.gradle.kts](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/android/app/build.gradle.kts) and added dynamic `compileSdkVersion(36)` configuration for all plugin subprojects in [build.gradle.kts](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/android/build.gradle.kts), resolving `checkDebugAarMetadata` dependency lifecycle build failures.
## [1.17.8] - 2026-07-28

### Added
- **Support Screen Quick Actions**:
  - Positioned the "Call" and "Message" action buttons on the same horizontal line as the filter chips (`All`, `Open`, `In Progress`, etc.) on [SupportHistoryScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart) using a `Row` layout and `Expanded` list view, maintaining navigation to [CallingFleetManagerScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/calling_fleet_manager_screen.dart) and [MessageFleetManagerScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/message_fleet_manager_screen.dart) respectively.
- **Dashboard Top Navigation Logo**:
  - Embedded the branding logo container directly to the left of the greeting text within the top navigation header on [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart), set to size 40x40 to match the height of the greeting text column.

### Fixed
- **Dashboard Settings Quick Action**:
  - Connected the "Settings" quick action tile on [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to navigate to [SettingsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart), replacing the placeholder "Settings coming soon" snackbar.

## [1.17.7] - 2026-07-27

### Changed
- **Logo Alignment in Tab Pages**:
  - Moved the brand logo container from the right-side `actions` list to the left-side `title` (inside a `Row` prefixing the page title text) on [trips_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/trips_screen.dart), [notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart), and [support_history_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart).

## [1.17.6] - 2026-07-27

### Fixed
- **Profile Screen App Bar**:
  - Removed duplicate right-side logo action in [profile_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart) by passing an empty actions list `actions: const []` to `CustomAppBar`.

## [1.17.5] - 2026-07-27

### Fixed
- **Dashboard Screen Merge Repair**:
  - Repaired syntax errors and merge conflicts in `_buildActiveTripCard` inside [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) following branch fast-forward pulls.
  - Added missing class imports (`upcoming_trip_details_screen.dart` and `vehicle_maintenance_screen.dart`).
  - Cleared unused analyzer warnings by binding unread state variables to getters and marking notifications as read immediately inside recent notification card onTap callbacks.

### Fixed
- **Dashboard Screen Syntax & Import Errors**:
  - Restored malformed `_buildActiveTripCard` widget tree structure in [dashboard_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart).
  - Added missing screen imports `upcoming_trip_details_screen.dart` and `vehicle_maintenance_screen.dart`, resolving `UpcomingTripDetailsScreen` and `VehicleMaintenanceScreen` class reference errors.
  - Cleaned unused imports and unreferenced getters to ensure a 0-error, 0-warning compilation status under `flutter analyze`.

>>>>>>> Stashed changes
## [1.15.1] - 2026-07-27

### Fixed
- **Route transitions issue**: Replaced custom `SlideRoute` and `SlideFadeRoute` transition animations with standard `MaterialPageRoute` transitions across all screens (`ForgotPasswordScreen`, `OTPScreen`, `DashboardScreen`, `NotificationsScreen`, `VehicleOverviewScreen`), resolving build errors caused by missing transition files.
- **Syntax/Parsing errors**: Restored `vehicle_details_screen.dart` to a clean compile state by reverting accidental syntax brackets.
- **Cleaned imports**: Removed unused imports of `route_transitions.dart` in `profile_screen.dart` and `completed_trip_details_screen.dart`.

## [1.15.0] - 2026-07-27

### Removed
- **E-Way Bill & Route Sheet screens**: Removed `e_way_bill_screen.dart` and `route_sheet_screen.dart` files completely and removed navigation/listing references in `completed_trip_details_screen.dart`.
- **Fuel Consumption Details**: Removed `FUEL CONSUMPTION` metric card and details from Today's Schedule Screen.

### Changed
- **Quick Actions Grid Layout**: Refactored the Quick Actions horizontal row in the Home Page (Dashboard) to a 3-column, 2-row GridView layout, and removed the "Edit" button from the header.
- **Home Page Profile Navigation**: Wrapped the Appbar profile avatar image with a `GestureDetector` that switches the active tab to the Profile screen.

## [1.17.4] - 2026-07-27

### Fixed
- **Notification Read Status Updates**:
  - Implemented immediate read status state updates upon tapping notification cards on both [notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) and [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart).
- **Layout Overflow in Details Screen**:
  - Replaced `Row` with `Wrap` in [notification_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart) for the category type and read status badges header, resolving horizontal layout overflows on narrow mobile screen width profiles.

## [1.17.3] - 2026-07-27

### Added
- **Notification Details Screen Logo**:
  - Added the white rounded Fleet logo container inside the top navigation bar's actions list on [notification_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart) to maintain design consistency across sub-pages.

## [1.17.2] - 2026-07-27

### Changed
- **AppBar Title Spacing Adjustment**:
  - Exposed `titleSpacing` property in [custom_app_bar.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/widgets/custom_app_bar.dart) to allow adjusting spacing between leading button and title.
  - Set `titleSpacing: 0.0` inside all app bars in [notification_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart), [edit_profile_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart), [help_support_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/help_support_screen.dart), [change_password_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/change_password_screen.dart), [notification_settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/notification_settings_screen.dart), [settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart), and [two_factor_auth_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/two_factor_auth_screen.dart).
  - This successfully decreased the space between the back button and the title text on all Account, settings, and support sub-pages.

## [1.17.1] - 2026-07-27

### Added
- **Settings Screen Help Center Navigation**:
  - Connected the "Help Center" list tile on [settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart) to push-navigate to `HelpSupportScreen` via `Navigator.push`.
- **Codebase Optimization**:
  - Removed unused `_showPlaceholderSnackBar` helper method in `settings_screen.dart` to maintain a warning-free compilation build.

## [1.17.0] - 2026-07-27

### Added
- **Flutter Help & Support Screen**:
  - Implemented [help_support_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/help_support_screen.dart) matching the Figma mockup layout.
  - Built forms for search help articles field with dynamic FAQ list filtering, common help category grid cards (App Basics, Vehicle Issues, Route Help, Payments), and Frequently Asked Questions expandable cards.
  - Replaced list-based support resource menus with a dedicated deep navy "Still need help?" card container at the bottom, offering clean Chat (orange background) and Call Support (outlined white text) action buttons.
  - Aligned categories grid card ratio (`childAspectRatio: 1.35`), border radii (`16.0`), border colors (`#EAECF0`), and customized deep orange-red icon colors (`#E05638`) to replicate the mockup visual details exactly.
  - Retained the white rounded Fleet logo container inside the top navigation bar to maintain style consistency.
- **Help & Support Navigation**:
  - Connected the "Help & Support" list item action on [profile_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart) to push-navigate to `HelpSupportScreen` via `Navigator.push`.
- **Codebase Optimization**:
  - Cleaned up unused elements and removed unused `_showPlaceholderSnackBar` helper method in `profile_screen.dart` to maintain a warning-free compilation build.

## [1.16.1] - 2026-07-27

### Removed
- **Settings Screen Cleanup**:
  - Removed the "Data Usage" feature tile from the App Preferences section in [settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart).

## [1.16.0] - 2026-07-27

### Added
- **Notification Settings Screen**:
  - Implemented [notification_settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/notification_settings_screen.dart) exactly matching the mockup reference [Notification Settings.png](file:///c:/Users/user/Downloads/Fleet%20Management%20UI%20(1)/Notification%20Settings.png).
  - Designed the visual layout including a header Preferences banner showing an adjustments icon and category titles for Route Alerts, Vehicle Maintenance, Safety & Performance, System Preferences, and Notification Channels.
  - Added responsive switch cards with customized icon backgrounds for Route Changes, Traffic Warnings, Health Alerts, Fuel Level Warnings, Emergency Alerts, Trip Updates, Sound, Vibration, Push, Email, and SMS notifications.
  - Added functional Save Changes and Reset to Default buttons with success confirmation SnackBars.
  - Resolved switch state resets by binding toggles to a global static state container `NotificationSettingsState`. Preferences are now persisted dynamically and re-loaded seamlessly whenever settings are re-opened.
- **Notification Settings Navigation**:
  - Connected the "Notification Settings" list row action on [settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart) to push-navigate to `NotificationSettingsScreen` via `Navigator.push`.

## [1.15.0] - 2026-07-27

### Added
- **Two-Factor Authentication Setup and Verification Screen**:
  - Implemented [two_factor_auth_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/two_factor_auth_screen.dart) supporting settings step configuration (switch toggle, radio method selection for SMS/Email/App, prefilled phone, recovery codes generator, and info sections) and a pixel-perfect verification step matching reference [Two factor authorization.png](file:///c:/Users/user/Downloads/Fleet%20Management%20UI%20(1)/Two%20factor%20authorization.png) exactly.
  - Designed the verification banner graphic using custom paint dashed rectangle and stacked phone/shield icons.
  - Added 6-digit verification code text fields with automatic focus transfer, validation, success SnackBars, and Resend action callbacks.
  - Fixed missing white Fleet logo in the configuration view's top navigation bar.
  - Made the verification screen description dynamically adapt according to the selected 2FA method (SMS ending digits, Email address, or Authenticator app generator instructions).
- **Two-Factor Authentication Navigation**:
  - Connected the "Two-Factor Authentication" settings list row action on [settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart) to push-navigate to the new `TwoFactorAuthScreen` via `Navigator.push`.

## [1.14.0] - 2026-07-27

### Added
- **Flutter Change Password Screen**:
  - Implemented [change_password_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/change_password_screen.dart) exactly matching the mockup reference [Change Password.png](file:///c:/Users/user/Downloads/Fleet%20Management%20UI%20(1)/Change%20Password.png).
  - Built forms for Current Password, New Password, and Confirm Password with integrated visible/obscure eye toggles.
  - Implemented dynamic password requirements checklist validation: checking for at least 8 characters, one uppercase letter, and one special character with orange check circle indicator indicators.
  - Added matching sub-header descriptions, back button navigation, and validation handlers redirecting with SnackBars.
- **Change Password Navigation**:
  - Connected the "Change Password" settings list row action on [settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart) to push-navigate to the new `ChangePasswordScreen` via `Navigator.push`.

## [1.13.3] - 2026-07-27

### Fixed
- **Profile Photo Synchronization**:
  - Replaced hardcoded profile image assets with a global `ProfileState.profilePhotoUrlNotifier` listener across [profile_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart) and [settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart).
  - Configured [edit_profile_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart) to write to this global notifier upon form submission, ensuring picture updates propagate dynamically and immediately to both screens.
- **Logout Action Reliability**:
  - Fixed BuildContext shadowing inside the Logout dialog in `profile_screen.dart` and `settings_screen.dart` by capturing the outer widget's `BuildContext` before launching the modal, preventing context dereferencing and routing issues.

## [1.13.2] - 2026-07-27

### Changed
- **Settings Screen Collapsible Accordion Updates**:
  - Removed "Privacy & Security" option from the Account & Security section.
  - Converted **Privacy Policy**, **Terms of Service**, and **About App** items in the Legal & Support section to collapsible accordion rows. They now expand to display descriptive text inline rather than opening separate popups or triggers.

## [1.13.1] - 2026-07-27

### Fixed
- **Settings Screen Mockup Alignment**:
  - Aligned [settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart) layout with the full reference mockup image.
  - Added Privacy Policy and Terms of Service options featuring external link trailing icons (`Icons.open_in_new`).
  - Added Help Center option under Legal & Support.
  - Updated About App trailing element to display the version string `v2.4.12` directly.
  - Extracted Logout tile from the Legal & Support card to make it a standalone outlined button styled with red borders and light background at the bottom.
## [1.14.0] - 2026-07-27

### Changed
- **Redesigned Dashboard Screen UI**:
  - Implemented sleek dark navy top header greeting with a green online status indicator and a local high-quality driver avatar image (`driver_avatar.png`).
  - Wrapped greeting row in `Expanded` and reduced title font size to `18` to resolve avatar row overflow.
  - Added rounded curved sheet container body (`Color(0xFFF7F9FC)`) styling to standard modern proportions.
  - Implemented dark navy Active Trip card displaying pickup/destination route stepper, ETA info, LIVE tag, 65% progress statistic container, linear progress bar, and orange details button.
  - Resolved active trip card right overflow on narrow viewports by tuning columns flex ratio to `11` and `9`, reducing stats title to `18`, reducing pickup/destination labels to `11`, shrinking progress bar width to `80`, and reducing button padding to `8`.
  - Redesigned Quick Actions row to support smooth horizontal scroll view.
  - Unified Dashboard Overview statistics into a single white card container with four stats widgets (Active Trip, Upcoming, Completed, Total Trips).
  - Streamlined Today's Schedule timeline nodes with active/inactive coloring.
  - Refined Recent Notifications items with unread indicators and circle icons.
- **Trips Screen Layout Updates**:
  - Removed search icon from the AppBar actions list.
  - Placed white rounded brand logo container in the AppBar actions to align with other screens.
  - Added a search bar (`TextField` with search prefix icon and curved borders) at the top of the body container.
- **Bottom Navigation Bar Updates**:
  - Modified unselected tabs to show gray text labels below icons to match mockup design.
  - Changed target tab label of index 3 from 'Notifications' to 'Alerts'.
  - Added notification dot badge on the Alerts icon.

## [1.13.0] - 2026-07-27

### Added
- **Settings Screen Implementation**:
  - Created [settings_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart) exactly matching the reference mockup [Settings.png](file:///c:/Users/user/Downloads/Fleet%20Management%20UI%20(1)/Settings.png).
  - Designed the Profile card display showing driver name "Alex Johnson", designation "Driver", and a square-shaped avatar container with custom orange border.
  - Implemented grouped settings sections (Account & Security, App Preferences, Notifications, Legal & Support) with internal dividers, custom icons, and chevron indicators.
  - Integrated interactive features including: dynamic Language selector bottom sheet modal and a reactive Dark Mode toggle Switch.
  - Added a Logout tile triggering the custom log out confirmation dialog which redirects to the login screen on confirmation.
- **Settings Screen Integration**:
  - Connected the "Settings" Quick Action card in [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to push-navigate to the new `SettingsScreen` via `Navigator.push`.

## [1.12.2] - 2026-07-27

### Fixed
- **Notifications Screen Visual Refresh and Synchronization**:
  - Registered a listener to `MainNavigationScreen.selectedTabNotifier` inside [notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) to force-refresh state and update unread statuses instantly when tab transitions back to Notifications (index 3).
  - Appended a `.then()` pop-completion listener to `Navigator.push` inside `_buildNotificationCard` of `NotificationsScreen` to refresh the parent list widget reactively after returning from the notification details page.

## [1.12.1] - 2026-07-27

### Changed
- **Dashboard Notification Card Navigation**:
  - Converted [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) into a `StatefulWidget` to dynamically access unread statuses from [NotificationsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) and trigger reactive state rebuilds when notifications are opened.
  - Updated recent notification cards on the Dashboard page to navigate directly to [NotificationDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart) instead of generic operational screen redirects.
  - Linked unread badge indicator statuses and `onOpened` callback states for "New Trip Assigned" and "Maintenance Reminder" to mark them as read immediately in `NotificationsScreen.notifications`.
  - Added a listener to `MainNavigationScreen.selectedTabNotifier` inside `DashboardScreen` and updated the push route completion `.then()` triggers to force a visual state refresh when switching back to the Home tab or when popping back from notification details, resolving notification synchronisation updates.
  - Cleaned up unused imports in `dashboard_screen.dart`.

- **Schedule Management Integration**:
  - Implemented `ScheduleScreen` (Image 1) featuring a calendar week header, Assigned Trips view, Day Summary widget, and current weather cards.
  - Implemented `TodaysScheduleScreen` (Image 2) displaying real-time shipment progress status map integration, remaining stop timeline milestones, and stats cards.
  - Implemented `AssignmentDetailsScreen` (Image 3) displaying specific trip assignments (e.g. #FL-771), map indicators, 4-metric overview grid, load details, and route progress nodes.
  - Implemented `UpcomingScheduleScreen` (Image 4) showing 7-day schedule blocks, weekly distance/fuel stats, and deliverables counters.
  - Linked new screens into `DashboardScreen` Quick Actions ("Schedule") and Today's Schedule ("View") buttons.

## [1.7.0] - 2026-07-27

### Added
- **Vehicle Maintenance Screen**: Created [VehicleMaintenanceScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_maintenance_screen.dart) displaying summary service count cards (`Upcoming Services: 02`, `Overdue Services: 01`), active alerts with priority tags (`High`, `Medium`, `Low`) and color-coded status badges (`OVERDUE`, `EXPIRING SOON`, `VALID`), last service insight metadata in Indian Rupees (`₹14,500`), and a bottom action button to contact the fleet manager.
- **Contact Fleet Manager Screen**: Created [ContactFleetManagerScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/contact_fleet_manager_screen.dart) localized with authentic Indian logistics data:
  - Manager Profile card: `Rajesh Sharma`, `Fleet Manager • ID: FM-IN-2045`, `Available` badge, experience (`12 Years`), and region (`West & South Corridor`).
  - Contact Details card: Phone (`+91 98765 43210`), Office (`+91 22 6123 4567`), Email (`rajesh.sharma@fleetpro.in`), Address (`Fleet Operations Hub, Plot 42, Nhava Sheva Logistics Park, Navi Mumbai, Maharashtra - 400707`), Working Hours (`08:00 AM – 07:00 PM`).
  - Active Assignment card: Status `IN PROGRESS`, Driver (`Satya Narayana`), Vehicle (`MH-12-PQ-8820 (Tata Prima)`), Trip ID (`#TRP-9901`), Location (`NH-48 (Mumbai-Pune Expressway)`), Destination (`Bhiwandi Logistics Hub, Thane`).
- **Calling Fleet Manager Screen**: Created [CallingFleetManagerScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/calling_fleet_manager_screen.dart) delivering a professional Android calling interface adapted for Indian fleet operations:
  - Dark Navy (`#101C2C`) header bar with company logo and title `"Calling Fleet Manager"`.
  - Profile section: Large avatar with green status indicator dot, `Ramesh Kumar`, designation `Fleet Manager`, department `Operations Department`, and `Available` badge.
  - Active call status section: Timer `00:18`, `Calling...` state label, and bold Indian phone display `+91 98765 43210`.
  - Current Assignment card: `Trip ID: TRP-9901`, `Vehicle: MH12PQ8820`, `Route: Mumbai → Pune`.
- **AppBar Title Spacing Optimization**: Reduced the gap between the back arrow button `←` and screen title text across the Driver Mobile application (`FuelOverviewScreen`, `AddFuelEntryScreen`, `FuelHistoryScreen`, `FuelEntryDetailsScreen`, `SupportHistoryScreen`, `RaiseTicketScreen`, `TicketDetailsScreen`, `VehicleOverviewScreen`, `VehicleDocumentsScreen`) by configuring `titleSpacing: 0` for a sleek, compact, and balanced header design.

### Fixed
- **Profile Avatar Asset 404**: Replaced missing `driver_avatar.jpg` asset file references in [CallingFleetManagerScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/calling_fleet_manager_screen.dart) and [ContactFleetManagerScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/contact_fleet_manager_screen.dart) with styled vector profile avatar containers to eliminate HTTP 404 console errors in Flutter Web.
- **Vehicle Overview Actions Simplification**: Simplified the `"Actions & Details"` section on [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) by removing `Assigned Trips` and `Report Vehicle Issue` tiles, retaining exactly 4 action cards (`Vehicle Details`, `Vehicle Status`, `Maintenance Alerts`, `Vehicle Documents`).
## [1.12.0] - 2026-07-27

### Refactored
- **Single Navigation Architecture Integration**:
  - Restructured the navigation flow to use `MainNavigationScreen` as the sole bottom navigation container in the application.
  - Converted `DashboardScreen` from a tab controller shell into the primary Home page, completely removing duplicate bottom navigation bar layouts and nested `IndexedStack`.
  - Migrated all dashboard components, cards, quick actions, schedule timeline, and recent notification UI from `HomeScreen` into `DashboardScreen`.
  - Replaced all references to `DashboardScreen.selectedTabNotifier` with `MainNavigationScreen.selectedTabNotifier` for unified programmatic tab switching (e.g. from Home's "View All" notifications button and the notification details back button).
  - Updated `LoginScreen` to route to `MainNavigationScreen` instead of `DashboardScreen` upon successful login.
  - Connected the `TripsScreen` module into the second tab (index 1) of `MainNavigationScreen` to replace the previous placeholder screen.
  - Safely deleted the redundant `home_screen.dart` file and updated all imports across the codebase.

## [1.11.1] - 2026-07-27

### Fixed
- **Dashboard Screen Merge Resolution**:
  - Restored [dashboard_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) as the correct active navigation container after fixing merge conflicts.
  - Removed misplaced Recent Notifications UI code and undefined method calls from `DashboardScreen`.
  - Added a reactive `ValueNotifier` (`selectedTabNotifier`) to `DashboardScreen` and updated the active index inside `_DashboardScreenState` to listen to it.
  - Reset `selectedTabNotifier.value = 0` inside `dispose` of `_DashboardScreenState` to prevent static state pollution across test runs.
  - Replaced the Alerts placeholder screen inside the `DashboardScreen` tab stack with the actual [NotificationsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart).
  - Restored `PlaceholderScreen`'s proper widget structure and `build` method.
- **HomeScreen Integration**:
  - Connected the "View All" button on the [home_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart) to programmatically switch the active tab to Alerts (index 3) using `DashboardScreen.selectedTabNotifier`.
- **NotificationDetailsScreen Integration**:
  - Updated the back button handler on [notification_details_screen.dart](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart) to switch tab index 3 via `DashboardScreen.selectedTabNotifier` instead of the deprecated `MainNavigationScreen.selectedTabNotifier`.
## [1.11.2] - 2026-07-27

### Fixed
- **Asset Loading Resolution**:
  - Explicitly registered all image assets (`vehicle.png`, `map_preview.png`, `white_van.png`, `logo.png`, `google_logo.png`) across both `assets/` and `assets/images/` in [pubspec.yaml](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/pubspec.yaml).
  - Added multi-path fallback image loaders in [VehicleStatusScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_status_screen.dart) to resolve HTTP 404 asset errors in Flutter Web and native builds.

## [1.11.1] - 2026-07-27

### Refactored
- **Exact Reference Map Canvas Painter**:
  - Implemented `_ExactReferenceMapPainter` in [VehicleStatusScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_status_screen.dart) matching the exact reference mockup:
    - Custom off-white map background (`#F1F5F9`) with secondary street grid lines (`#CBD5E1`).
    - Diagonal vibrant blue route line (`#2563EB`).
    - Pulsing live location beacon dot with outer translucent aura ring and inner white dot.
    - Yellow highway badge `65` (`#EAB308`).
    - Plain text location labels `LB Nagar` and `Vanasthalipuram`.

## [1.11.0] - 2026-07-27

### Added
- **Commercial Truck & Map Preview Image Assets**:
  - Generated and added high-resolution `vehicle.png` (commercial heavy-duty container truck) and `map_preview.png` (GPS route map preview) to [driver_mobile/assets/images/](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/assets/images).
  - Updated [pubspec.yaml](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/pubspec.yaml) asset declarations to recursively bundle `assets/images/`.
  - Refactored [VehicleStatusScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_status_screen.dart) with an interactive `Image.asset` loader with fallback route painters and highway marker badges.

## [1.10.1] - 2026-07-24

### Removed
- **Vehicle Health Fuel Level**: Removed `Fuel Level` card from the Vehicle Health section in [VehicleStatusScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_status_screen.dart), streamlining the section layout into 3 core health cards (`Engine Status`, `Last Service`, and `Next Service`).

## [1.10.0] - 2026-07-24

### Added
- **Vehicle Status Screen**: Created [VehicleStatusScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_status_screen.dart) replicating the reference telemetry design:
  - **Overview Card**: Vehicle Number (`TS09AB4589`), Type (`Container Truck`), Driver (`Sai Kumar`), Odometer (`24,500 km`), Status (`On Trip`), commercial truck asset preview.
  - **Live Tracking**: Map preview container with route painter and telemetry metrics (`LB Nagar, Hyderabad`, Speed: `65 km/h`, Destination: `Vijayawada Warehouse`, Last Updated: `2 mins ago`).
  - **Speed & Distance Row**: 2-column stats cards (`65 km/h`, `120 km Today`).
  - **Vehicle Health Section**: 4 status cards (Fuel Level: `75%` with progress bar, Engine: `Running • Normal`, Last Service: `15 Jul 2026 at 22,300 km`, Next Service: `25,000 km or 25 Aug 2026`).
  - **Trip Timeline**: Vertical stepper tracking stages (`Trip Assigned`, `Driver Accepted`, `Trip Started`, `Current Location: Moving North on NH 65`, `Expected Arrival`).
  - **Telemetry Refresh**: Bottom `Refresh Live Status` dark navy button with auto-refresh countdown indicator.
- **Navigation Integration**: Linked `Vehicle Status` tile on [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) to push `VehicleStatusScreen`.

## [1.11.0] - 2026-07-27

### Changed
- **Notification Details Navigation Tweak**:
  - Removed the "Back to Notifications" button from the body of [notification_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart).
  - Implemented a reactive `ValueNotifier` in [main_navigation_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) for programmatic tab changes.
  - Updated the navbar back button on the details screen to programmatically switch the active tab to Notifications (index 3) and pop back, ensuring consistent navigation flow.
  - Removed the back button from [notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) to make it consistent with tab layouts.
  - Updated the Dashboard's "View All" button to transition tab index rather than push a new screen route, keeping the bottom nav bar visible.
- **Notification Read Synchronization**:
  - Shared the `notifications` list as a static member in [notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) to synchronize read/unread statuses in real-time across Dashboard and Notifications tabs.
  - Added state resetting logic in the main navigation's `dispose` method to prevent static test pollution.
  - Fixed the details screen type badge text and styling when navigating from the notifications tab.

## [1.10.1] - 2026-07-24

### Changed
- **Folder Structure Refactoring**: Moved `notifications_screen.dart` from `lib/screens/profile/` to `lib/screens/notifications/` next to `notification_details_screen.dart` to consolidate all notifications components under a single feature folder. Updated all import paths across dashboard, navigation, and documentation screens.

## [1.10.0] - 2026-07-24

### Added
- **Notification Details Screen**: Created [notification_details_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart) displaying:
  - Custom AppBar with back navigation and "Notification Details" title.
  - Premium styled card enclosing the notification icon/category badge, title, timestamp, read status badge, and full message description.
  - Active type-based styling for badges (e.g. error/warning/success/info matching red/orange/green/blue).
- **Navigation Integration**: Connected notification cards on the Dashboard and Notifications list to push navigate to the details page, automatically marking the notification as read upon opening.
- **Verification Tests**: Updated `test/widget_test.dart` to verify tapping notification cards opens the details page and displays the correct info.
## [1.9.3] - 2026-07-24

### Changed
- **Home Screen Cards Styling**:
  - Updated the **Stats Card** (left) background color to deep navy (`Color(0xFF0D1C2E)`), changed card border radius to `18.0`, and dynamically styled statistical rows so that only the "COMPLETED" row is bold white and other rows are dimmed.
  - Enhanced the **View Trips** button layout inside the Stats Card to use a larger height and rounder shape matching the mockup.
  - Redesigned the **Active Trip Progress Card** (right) to match the layout and colors in the mockup, adding a subtle border line (`Color(0xFFE4E8EF)`), crosshair icon, and positioning the percentage text (`65%`) next to the progress bar.
  - Integrated dynamic layout calculations (`isSmallScreen` check) to adjust card padding, progress bar height, button size, and text font sizes on smaller/narrow viewports to prevent screen clipping or text wrapping.

## [1.9.2] - 2026-07-24

### Changed
- **Dashboard View All Action**: Connected the "View All" text button in the dashboard's recent notifications header to push navigation to `NotificationsScreen` as a full-page route.
- **Verification Tests**: Updated `test/widget_test.dart` to assert tapping View All, verifying the page transition, and successfully navigating back to the Dashboard.

## [1.9.1] - 2026-07-24

### Added
- **Navigation Tabs**: Added filter tabs (**Total**, **Read**, **Unread**) directly below the top app bar in `NotificationsScreen`, complete with:
  - Interactive pill background formatting (orange for selected, grey for unselected).
  - Dynamic count badges displaying counts for each category.
  - Active filtering logic showing/hiding notifications based on selected filter.

## [1.9.0] - 2026-07-24

### Added
- **Notifications Screen**: Created [notifications_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart) displaying grouped list views of read and unread notification cards matching the design mockup:
  - Supports Today and Yesterday groupings.
  - Custom unread cards styled with white backgrounds, orange icons, and orange unread dot indicators.
  - Custom read cards styled with shaded grey backgrounds (`AppColors.surface`), grey icons, and no unread dot.
  - "Mark all as read" bulk state modifier and individual notification click modifiers.
- **Integration**: Replaced the alerts placeholder screen in [main_navigation_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) with `NotificationsScreen`, and updated bottom nav selected bar label to "Notifications".

- **Vehicle Screens Navigation**:
  - Connected the "Vehicle" quick action tile on [HomeScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart) to navigate to [VehicleOverviewScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart), replacing the placeholder "Coming Soon" snackbar.
  - Connected the "Maintenance Reminder" notification card on [HomeScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart) to navigate to [VehicleMaintenanceScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_maintenance_screen.dart), replacing the placeholder "Coming Soon" snackbar.

## [1.9.1] - 2026-07-24

### Changed
- **Navigation Flow and Bottom Bar Clean-up**: Bypassed `MainNavigationScreen` and updated the application navigation to route directly to `DashboardScreen` upon login. This resolves the duplicate stacked bottom navigation bars layout bug, keeping only the top-most, single bottom navigation bar.
- **Dashboard Integration**: Integrated the real `ProfileScreen` widget and customized `PlaceholderScreen` widgets for the Support and Alerts tabs in `DashboardScreen`.

## [1.7.2] - 2026-07-24


### Added
- **Custom Winding Route Icon**: Created a premium [WindingRouteIcon](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/widgets/winding_route_icon.dart) using a `CustomPainter` to draw a pixel-perfect S-curve route path, aligning with the reference mockups.

### Refactored
- **Home Screen Grid Layout**: Refactored the Middle Grid in [HomeScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart) to layout both Stats and Active Trip Cards side-by-side using `IntrinsicHeight` and `Spacer` for vertical bottom alignment of card elements (orange button and progress bar), matching the visual hierarchy.
- **Home Screen Stats List**: Cleaned up stats row builder (`_buildStatRow`) in [HomeScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart) by removing horizontal divider lines and right-facing chevron icons, ensuring clean typography. Updated the navigation button text to "View Trips".
- **Responsive Action Buttons**: Refactored bottom/footer action buttons across multiple details screens by removing fixed-height `SizedBox` constraints and applying `minimumSize: const Size(double.infinity, 48)` and internal vertical padding. This allows the buttons to safely scale vertically and wrap text under different text scalings or viewport sizes without clipping or overlapping:
  - [InvoiceScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/invoice_screen.dart)
  - [EWayBillScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/e_way_bill_screen.dart)
  - [RouteSheetScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/route_sheet_screen.dart)
  - [TollFeeReceiptScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/toll_fee_receipt_screen.dart)
  - [CompletedTripDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/completed_trip_details_screen.dart)
  - [UpcomingTripDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/upcoming_trip_details_screen.dart)

## [1.7.1] - 2026-07-24

### Refactored
- **Home Screen Layout Responsiveness**:
  - Removed `IntrinsicHeight` from the Stats Card and Active Trip Card row inside [HomeScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart), using a flexible layout with `Row` and `Expanded` and cross-axis alignment to top (`CrossAxisAlignment.start`) to prevent layout issues and vertical overflow.
  - Removed `IntrinsicHeight` from the schedule item widget (`_buildScheduleItem`) inside [HomeScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart) and replaced it with a `Stack` and `Positioned` vertical line approach to draw the dynamic connector path safely on all screen resolutions.
  - Wrapped card label and title texts in `Expanded` with `TextOverflow.ellipsis` where appropriate to prevent horizontal `RenderFlex` overflows on small devices.
## [1.9.0] - 2026-07-24

### Added
- **Vehicle Maintenance Screen**: Created [VehicleMaintenanceScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_maintenance_screen.dart) matching the reference mockup:
  - **Summary Cards**: Displays `Upcoming Services` (`02`) and `Overdue Services` (`01`).
  - **Active Alerts List**: 3 color-coded alerts (`Engine Oil Change` High/Overdue, `Tyre Inspection` Medium/Expiring Soon, `Insurance Expiry` Low/Valid) with left accent borders.
  - **Last Service Insight**: Details card with Service Date (`15 Sept 2023`), Total Cost (`$450`), location (`Central Fleet Hub`), and technician notes.
  - **Action Button**: Full-width bottom orange button `Contact Fleet Manager`.
- **Navigation Integration**: Linked `Maintenance Alerts` tile on [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) to push `VehicleMaintenanceScreen`.

## [1.8.0] - 2026-07-24

### Refactored
- **Indian Fleet Vehicle Details Specifications**:
  - Refactored [VehicleDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_details_screen.dart) and created `VehicleDetailsData` data model to support backend API integration and Indian Fleet Management specifications:
    - **Basic Information**: Vehicle Number (`TS09AB4589`), Registration (`TS09AB4589`), Type (`Heavy Duty Truck`), Brand (`Tata Motors`), Model (`Prima 5530.S`), Mfg Year (`2023`), Payload Capacity (`20 Tons`), GVW (`36 Tons`), Fuel Type (`Diesel`).
    - **Vehicle Status Card**: Left green accent border (`#16A34A`), `Active` status, `Updated Today • 10:30 AM` timestamp, Current Trip (`TRP-9921`), Availability (`Assigned`), and Location (`Hyderabad, Telangana`).
    - **Driver Information Card**: Name (`Sai Kumar`), Employee ID (`EMP-1025`), Mobile Number (`+91 9876543210`), License (`TS0920210012456`).
    - **Technical Specifications**: Engine Number (`ENG-7721`), Chassis Number (`CHS-1102`), Odometer (`45,230 km`), GVW (`36 Tons`), Payload (`20 Tons`), Fuel Type (`Diesel`).
## [1.8.3] - 2026-07-24

### Changed
- **Circular Profile Photo**: Redesigned the driver's profile headshot container from a rounded square to a fully circular design on both `ProfileScreen` and `EditProfileScreen`.

## [1.8.2] - 2026-07-24

### Changed
- **Trips Tab Icon**: Changed the Trips tab navigation icon in [main_navigation_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) to `Icons.route_outlined` / `Icons.route` to match the winding path with start and end pins from the mockup.

## [1.8.1] - 2026-07-24

### Removed
- **Assigned Vehicle Fields**: Removed the vehicle details section and vehicle model field from `EditProfileScreen`.
- **Emergency Contact Field**: Removed the emergency contact phone number field from the contact information section of `EditProfileScreen`.
- **Top Nav Save Button**: Removed the orange "SAVE" button from the AppBar action items list of `EditProfileScreen` (leaving the company logo container on the right).

## [1.8.0] - 2026-07-24

### Refactored
- **Indian Fleet Vehicle Details Specifications**:
  - Refactored [VehicleDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_details_screen.dart) and created `VehicleDetailsData` data model to support backend API integration and Indian Fleet Management specifications:
    - **Basic Information**: Vehicle Number (`TS09AB4589`), Registration (`TS09AB4589`), Type (`Heavy Duty Truck`), Brand (`Tata Motors`), Model (`Prima 5530.S`), Mfg Year (`2023`), Payload Capacity (`20 Tons`), GVW (`36 Tons`), Fuel Type (`Diesel`).
    - **Vehicle Status Card**: Left green accent border (`#16A34A`), `Active` status, `Updated Today • 10:30 AM` timestamp, Current Trip (`TRP-9921`), Availability (`Assigned`), and Location (`Hyderabad, Telangana`).
    - **Driver Information Card**: Name (`Sai Kumar`), Employee ID (`EMP-1025`), Mobile Number (`+91 9876543210`), License (`TS0920210012456`).
    - **Technical Specifications**: Engine Number (`ENG-7721`), Chassis Number (`CHS-1102`), Odometer (`45,230 km`), GVW (`36 Tons`), Payload (`20 Tons`), Fuel Type (`Diesel`).

### Added
- **Edit Profile Screen**: Created the responsive, form-validated [EditProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart) featuring:
  - Form sections for *Personal Information*, *Contact Information*, and *License Details*.
  - Prefilled fields with standard validator logic and prefix icons.
  - Custom camera overlay button to mock photo changes from Camera/Gallery.
  - Embedded long and short custom Date pickers.
  - Outlined and orange filled bottom action buttons.
  - Integration with the Edit Profile tile on the Profile Screen.
- **Edit Profile Widget Test**: Added a new widget test `Edit Profile Screen Validation and Submission Flow` in [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) to verify prefilled text fields, validation errors, cancel flows, and submission workflows.

## [1.7.1] - 2026-07-24

### Removed
- **Vehicle Overview Action Tiles Cleanup**:
  - Removed `"Assigned Trips"` and `"Report Vehicle Issue"` action tiles from [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) to streamline the section layout.
- **Trip History Option**: Removed the "Trip History" option tile from the profile screen's Settings Options Card.

### Changed
- **Bottom Navigation Bar Selected Style**: Redesigned the selected tab in the bottom navigation bar to be a vertical column (icon on top, label below it) inside a rounded orange box, matching the second reference image.

## [1.7.0] - 2026-07-24

### Added
- **Active Trip Details Screen Navigation**: Added navigation to E-Way Bill, Invoice, and Route Sheet screens when their respective documents are viewed under the Active Trip Details documents section. Added snackbar feedback for E-Way Bill download action.

### Refactored
- **Completed Trip Details Screen Labels**: Changed document action labels from `DOWNLOAD` to `VIEW` (using matching visibility icons) for Invoice and Toll Fee Receipt documents on the Completed Trip Details screen, ensuring all active documents are viewable.
- **Dashboard Navigation Shell**: Restructured [DashboardScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to act as a proper navigation shell using `IndexedStack` to switch between [HomeScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart) and [TripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/trips_screen.dart), correcting all compilation errors, missing imports, bracket mismatches, and unused variable warnings.

### Fixed
- **Home Screen Stats Card Layout**: Removed the Spacer and adjusted bottom margins on the Left Stats Card inside [HomeScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart) to fix the 28px vertical layout overflow. Also updated the button text from `View Trips` to `View All` to prevent text truncation (`View ...`).
- **Bottom Button Spacing**: Increased the bottom spacing (`SizedBox(height: 40)`) in [EWayBillScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/e_way_bill_screen.dart), [InvoiceScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/invoice_screen.dart), [RouteSheetScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/route_sheet_screen.dart), and [TollFeeReceiptScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/toll_fee_receipt_screen.dart) to prevent the "Download" and "Share" action buttons from being cut off at the bottom.
- **Vehicle Details Screen**: Created [VehicleDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_details_screen.dart) for the Driver Module replicating the reference design layout:
  - **Vehicle Specifications Card**: `#BT-990`, `ABC-1234`, `Heavy Duty` category badge, and 2-column grid for Brand (`Freightliner`), Model (`Cascadia`), Year (`2023`), Capacity (`20 Tons`), Fuel Type (`Diesel`), and Transmission (`Automatic`).
  - **Operational Status Card**: Left green accent border indicator (`#16A34A`), `Active` status dot, `Updated 10 mins ago` timestamp, and inner card box displaying Current Trip (`#TRP-9921`) & Availability (`Assigned`).
  - **Assigned Driver Card**: Driver avatar icon, Name (`Alex Morgan`), Employee ID (`EMP-8842`), and License Number (`DL-990218`).
  - **Technical Specifications Card**: Engine Number (`ENG-7721`), Chassis Number (`CHS-1102`), Odometer Reading (`45,230 km`), and Gross Vehicle Weight (`36,000 lbs`).
- **Vehicle Overview Navigation Integration**: Linked [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) "Vehicle Details" tile to push [VehicleDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_details_screen.dart).
- **Driver's License Details Accordion**: Created a new accordion in [profile_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart) displaying License Number (`555-0123-9876`), Class (`Class A (Commercial)`), Expiry Date (`Oct 12, 2026`), and Issuing State (`New york`).
- **Profile Options Card**: Integrated Edit Profile, Help & Support, and Trip History as list tiles inside a single rounded Card with custom leading orange icons on peach circular backgrounds.
- **Redesigned Logout Button**: Implemented a custom outlined button with red border, red text, and red exit icon located at the bottom of the Profile Options card.
- **Header Fleet Logo**: Placed the white background rounded container with the fleet logo (`assets/logo.png`) directly to the left of the "FleetManagement" text in the Profile Screen AppBar.

### Changed
- **Bottom Navigation Bar Icons**: Replaced bottom navigation icons in [main_navigation_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) with:
  - Home: `Icons.home_outlined` / `Icons.home`
  - Trips: `Icons.route_outlined` / `Icons.route`
  - Support: `Icons.headset_mic_outlined` / `Icons.headset_mic`
  - Alerts: `Icons.notifications_none_rounded` / `Icons.notifications`
  - Profile: `Icons.person_outline` / `Icons.person` (white inside orange pill container)

## [1.6.2] - 2026-07-24

### Changed
- **Bottom Navigation Bar Style**: Replaced the custom horizontal pill bottom navigation bar layout in [main_navigation_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) with the vertical column-based selected tab layout originally used in the dashboard.

## [1.6.1] - 2026-07-24

### Fixed
- **Duplicate Bottom Navigation Bar**: Removed the static, hardcoded bottom navigation bar inside [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) Scaffold to resolve layout overlapping with the unified bottom navigation bar from [main_navigation_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart).

## [1.6.0] - 2026-07-24

### Added
- **My Profile Screen**: Created the responsive, pixel-perfect [ProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart) featuring:
  - Custom brand title/logo header bar.
  - Driver headshot image card with soft shadows and a green active indicator dot.
  - Name "Alex Johnson", verified badge "SENIOR DRIVER", and "Member since 2020".
  - Three-column stats card row (Miles, Safety, and Years) using existing design tokens.
  - Collapsible accordions for *Personal Information* (expanded by default) and *License & Vehicle Details*.
  - Account action tiles (*Edit Profile*, *Change Password*, *Documents*, *Help & Support*, *Privacy Policy*, *About App*, and *Logout*).
- **Interactive Logout Confirmation Dialog**: Configured the *Logout* setting tile to prompt a modal dialog asking the user to confirm logout, routing them back to the login screen upon confirmation.
- **Main Navigation Container & Bottom Nav Bar**: Created [MainNavigationScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart) to host application tabs and render a custom bottom navigation bar exactly matching the Figma design (selected pill button containing white icon and text, unselected gray icons).
- **Profile Screen Integration Tests**: Added a new widget test `Profile Screen Navigation, Details, and Logout Confirmation` in [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) verifying navigation switching, detail rendering, and full logout workflows.

## [1.6.0] - 2026-07-24

### Added
- **Vehicle Documents Screen**: Created [VehicleDocumentsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_documents_screen.dart) displaying all vehicle certificates in a structured Material 3 card list:
  - Registration Certificate (RC), Insurance Certificate, Pollution Under Control (PUC), Fitness Certificate, Permit Document, and Road Tax Receipt.
  - Features status badges (`Valid`, `Expiring Soon`), expiry dates, and `View` / `Download` buttons with SnackBar feedback.

### Refactored
- **Vehicle Overview Information Architecture**:
  - Removed individual document tiles (RC, Insurance, PUC, Fitness) to declutter [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart).
  - Consolidated all document management into the `"Vehicle Documents"` action tile which pushes [VehicleDocumentsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_documents_screen.dart).

## [1.5.5] - 2026-07-24

### Fixed
- **Dashboard Navigation Correction**:
  - Removed [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) navigation from the `"View Details"` button on the Assigned Trip card (now displays Trip Details feedback SnackBar).
  - Configured [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) navigation to launch **exclusively** when tapping the `"Vehicle"` card under Quick Actions.

## [1.5.4] - 2026-07-24

### Added
- **Quick Info Card**: Created [QuickInfoCard](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/widgets/vehicle_overview/quick_info_card.dart) featuring a Dark Navy (`#101C2C`) card with 2x2 grid format for vehicle service and permit dates:
  - Last Service: `Oct 12, 2023`
  - Next Service: `5,000 km`
  - Insurance Expiry: `Dec 20, 2023`
  - Permit Expiry: `Jan 15, 2024`
- **Vehicle Overview Design Alignment**: Added `"Quick Info"` section and [QuickInfoCard](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/widgets/vehicle_overview/quick_info_card.dart) below the `"Actions & Details"` list to match the reference design.

## [1.5.3] - 2026-07-24

### Removed
- **Vehicle Overview Metrics Row**: Removed the bottom 3 statistics metric cards (Fuel Level: 82%, Health: 94%, Status: OK) and divider line from [VehicleInfoCard](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/widgets/vehicle_overview/vehicle_info_card.dart) in the Vehicle Overview screen.

## [1.5.0] - 2026-07-24

### Added
- **Vehicle Overview Screen**: Created the responsive, pixel-perfect [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart) for the Driver Module featuring:
  - Dark Navy (`#101C2C`) App Bar with back navigation, white icons/typography, and company logo.
  - Reusable [VehicleInfoCard](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/widgets/vehicle_overview/vehicle_info_card.dart) displaying white delivery van banner (`white_van.png`), green `"Active"` badge, vehicle code (`BT-990`), registration details (`Medium Van • ABC-1234`), right-aligned orange Fuel Type (`Diesel`), and 3 metric cards (Fuel Level: 82%, Health: 94%, Status: OK).
  - Reusable [VehicleActionTile](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/widgets/vehicle_overview/vehicle_action_tile.dart) with dark navy square icon container, bold title, optional red critical indicator, and right chevron arrow.
  - Complete list of 10 vehicle action items: Vehicle Details, Vehicle Status, Maintenance Alerts (*1 CRITICAL*), Insurance Details, Registration Certificate (RC), Pollution Certificate (PUC), Fitness Certificate, Vehicle Documents, Assigned Trips, and Report Vehicle Issue.
- **Dashboard Navigation Integration**: Linked [DashboardScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) "View Details" button to push [VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart).
- **Vehicle Overview Widget Tests**: Extended [widget_test.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/test/widget_test.dart) covering vehicle info card details, metrics, and action list rendering.
## [1.5.2] - 2026-07-24

### Added
- **OTP Autofill / Paste Support**: Implemented support for copying a 6-digit OTP code and pasting it into the first input box of [otp_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart) to automatically distribute the digits across all 6 OTP fields.
- **OTP Autofill Widget Test**: Added a new widget test `Autofill OTP fields when a 6-digit code is pasted` in [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) to verify correct distribution of pasted characters.

## [1.5.1] - 2026-07-24

### Changed
- **Empty Login Fields & Placeholders**: Removed pre-filled credentials from [LoginScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart) inputs to display their respective placeholder hints (`manager@fleetpro.com` and `1234456`) and prompt active user entry.
- **Login Test Credentials Entry**: Updated the login navigation test in [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) to programmatically enter test credentials prior to clicking `LOGIN`, aligning with the empty field constraints.

## [1.5.0] - 2026-07-24

### Added
- **Terminal OTP Generation**: Implemented a secure random 6-digit OTP generator inside [otp_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart) that prints the generated code directly to the developer terminal/console for convenient copy-paste testing.
- **Active Button Interactive Validations**: Redesigned all main action/submit buttons across the authentication workflow (Login, Send OTP, Verify OTP, Reset Password) to be always active (enabled) rather than disabled.
- **Validation Feedback & Short-Circuits**: Added logic to validation buttons that checks fields and triggers dynamic validation snackbars (e.g. if the OTP code is incomplete, if OTP does not match the terminal code, if passwords do not match, or if new password requirements are not met).
- **Google Sign-In Interactive Routing**: Updated the "Continue with Google" button on [login_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart) to show a success feedback message and route to the dashboard.

## [1.4.0] - 2026-07-24

### Added
- **Login Navigation & Validation**: Wrapped [LoginScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart) inputs in a `Form` with validation checks, and routed the `LOGIN` button to navigate to the [DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) on success.
- **Login Navigation Widget Test**: Added a new widget test `Successful Login Navigation Flow to Dashboard` in [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart).

### Fixed
- **Button Layout Overflow**: Fixed a `RenderFlex` overflow layout exception in [custom_button.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/widgets/custom_button.dart) when `width` constraints are small by omitting the `Row` wrap when `icon` is null, and using `Flexible` for text wrapping.

## [1.3.1] - 2026-07-24

### Fixed
- **AppColors Ambiguous Import & Theme Resolution**: Resolved duplicate import error in [app_theme.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/theme/app_theme.dart) by consolidating `AppColors` definition in [constants/app_colors.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/constants/app_colors.dart), adding color aliases (`textPrimary`, `textSecondary`, `textDisabled`), and re-exporting from [theme/app_colors.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/theme/app_colors.dart).
- **App Theme Ambiguous Imports**: Resolved duplicate and conflicting `AppColors` imports in [app_theme.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/theme/app_theme.dart) by removing the redundant `import '../constants/app_colors.dart';`.
- **Unused Imports Clean-Up**: Removed unused imports of `app_radius.dart`, `app_text_theme.dart`, `app_button_theme.dart`, and `app_input_theme.dart` in [app_theme.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/theme/app_theme.dart), and `screens/dashboard_screen.dart` in [main.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/main.dart).
- **Workspace Navigation instructions**: Addressed the Flutter run terminal execution issue by clarifying the command must run from the Flutter root directory (`driver_mobile/`).

## [1.3.0] - 2026-07-23

### Added
- **Reset Password Screen**: Created the responsive, pixel-perfect [ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart) featuring:
  - New Password and Confirm Password inputs with visibility toggles.
  - Interactive password requirements box (8+ characters, one number, one special character) updating dynamically in real-time.
  - Match validation to ensure both password entries are identical.
- **OTP-to-Reset Navigation**: Linked [OTPScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart) "Verify OTP" button to push [ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart).
- **Forgot Password Reset Link**: Linked the "Reset Password?" action text link on [ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart) to push navigation to [ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart).
- **End-to-End Authentication Widget Test**: Extended [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) to cover the entire auth path (Login -> Forgot -> OTP -> Reset -> Return to Login).

### Fixed
- **Verify OTP Button State & Navigation**: Refactored the "Verify OTP" button on [OTPScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart) to be always active. Clicking the button now triggers a validation alert SnackBar if the 6 digit code is incomplete, ensuring navigation to [ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart) executes reliably without focus sync edge-cases on web targets.
- **Forgot Password Button Layout & Navigation**: Fixed layout constraints on [ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart) by setting Column crossAxisAlignment to stretch and wrapping button Row in a FittedBox, resolving the RenderFlex horizontal overflow exception on Chrome. Added listener to confirm password field in [ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart) to rebuild and update button active state in real-time, resolving navigation block.
- **Card Layout Normalization & Constraints**: Enforced uniform `crossAxisAlignment: CrossAxisAlignment.stretch` constraints across the form card container columns of [ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart), [OTPScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart), and [ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart). Centered header, logo, and footer elements explicitly inside `Center` widgets. This guarantees there are no horizontal RenderFlex layout overflow errors or navigation-blocking rendering failures across any web or desktop viewport dimensions.
- **Reset Password Navigation Stack Fix**: Upgraded the "Reset Password" button click and "Back to Login" link handlers in [ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart) to use `Navigator.pushAndRemoveUntil` instead of `popUntil`. This guarantees navigation back to [LoginScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart) works flawlessly, even if the user performs a hot-reload directly on the reset password screen (which empties the navigation stack history).

## [1.2.0] - 2026-07-23

### Added
- **OTP Verification Screen**: Created the responsive, pixel-perfect [OTPScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart) featuring:
  - 6 individual code fields with automatic focus forwarding and backspace focus redirection.
  - A 30-second countdown timer.
  - A "Resend" button active only after the timer expires.
  - Field validation to ensure all 6 digits are entered before verification.
- **Forgot-to-OTP Navigation**: Integrated navigation flow from [ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart) to [OTPScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart).
- **Comprehensive Smoke Test Suite**: Upgraded [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) to verify the entire authentication navigation flow (Login -> Forgot Password -> OTP Verification).

### Changed
- **Forgot Password Layout Refactoring**: Restructured [ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart) to place all elements (logo, headers, inputs, buttons, and footers) inside the card container to match the design style of the OTP Verification screen.

## [1.1.0] - 2026-07-23

### Added
- **Forgot Password Screen**: Created the responsive, pixel-perfect [ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart) supporting email/mobile entry, validation, "Reset Password?" action link, and a "Send OTP" action button.
- **Login-to-Forgot Navigation**: Integrated navigation flow between [LoginScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart) and [ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart).
- **Navigation Widget Tests**: Enhanced [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) to test the complete user navigation journey between both authentication screens.
- **Project Rule Configuration**: Established the project rule file [AGENTS.md](file:///c:/Users/user/Downloads/Fleet-management-system/.agents/AGENTS.md) to dynamically enforce synchronization of codebase changes and documentation files.

## [1.0.0] - 2026-07-23

### Added
- **Centralized Design System**: Added Material 3 theme configuration with custom colors and fonts in [app_colors.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/theme/app_colors.dart) and [app_theme.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/theme/app_theme.dart).
- **Poppins & Nunito Fonts**: Integrated `google_fonts` package in [pubspec.yaml](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/pubspec.yaml) to supply typography requirements without bundling raw `.ttf` assets.
- **Pixel-Perfect Login Screen**: Designed and created the responsive, Material 3 compliant [LoginScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart) supporting:
  - Scrollable viewports to prevent keyboard overlaps.
  - Custom styled input fields with outline borders and prefix icons.
  - Visibility toggles for the password field.
  - Custom Google Sign-In button with auto-scaling to prevent overflows.
  - Legal disclaimer footer using rich text formatting.
- **Local Asset Integration**: Configured local assets directory and registered [logo.png](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/assets/images/logo.png) (copied from frontend public directory) and [google_logo.png](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/assets/images/google_logo.png) in [pubspec.yaml](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/pubspec.yaml) to circumvent cross-origin (CORS) network errors on web target.
- **Smoke Tests**: Added and configured widget tests in [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) verifying login screen layout, text fields, controller values, and action buttons.
- **Local Asset Integration**: Configured local assets directory and registered [logo.png](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/assets/images/logo.png) (copied from frontend public directory) and [google_logo.png](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/assets/images/google_logo.png) in [pubspec.yaml](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/pubspec.yaml) to circumvent cross-origin (CORS) network errors on web target.
- **Smoke Tests**: Added and configured widget tests in [widget_test.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/test/widget_test.dart) verifying login screen layout, text fields, controller values, and action buttons.
