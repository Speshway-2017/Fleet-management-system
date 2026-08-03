# Knowledge Base

This document serves as the central architectural reference and development guide for the **Fleet Driver Mobile Application** built in Flutter.

---

## 1. Project Architecture

The application is structured following clean coding principles and modularity. It maintains a separation between visual/UI components, local assets, application configurations, and centralized themes.

### Folder Structure

| Path | Purpose |
| :--- | :--- |
| `assets/` | Static project assets (images, icons, vectors). |
| `assets/images/` | General images (e.g., logos, illustration graphics). |
| `lib/` | Main application Dart source code. |
| `lib/models/` | Strong-typed model definitions (`driver_model.dart`). |
| `lib/providers/` | State management provider notifier controllers (`auth_provider.dart`). |
| `lib/repositories/` | Data access layer repository interfaces (`auth_repository.dart`). |
| `lib/screens/` | Screen-level widget containers. |
| `lib/screens/auth/` | Authentication-related flows (Login, Forgot Password, etc.). |
| `lib/services/` | Backend REST API integration and location tracking services (`api_service.dart`, `location_service.dart`). |
| `lib/theme/` | Centralized design system constants and MaterialApp theme settings. |
| `test/` | Automated widget, integration, and unit tests. |
| `frontend/src/roles/driver/` | Desktop Driver Web Module (React/Vite). |
| `frontend/src/roles/driver/api/driverApi.js` | Driver Web REST API Axios integration module. |
| `frontend/src/roles/driver/hooks/` | Custom hooks (`useDriverSocket.js`, `useDriverAuth.js`). |
| `frontend/src/roles/driver/layouts/DriverLayout.jsx` | Desktop Sidebar + Header layout wrapper. |
| `frontend/src/roles/driver/pages/` | Desktop driver pages (Dashboard, Trips, TripDetails, Vehicles, Fuel, Maintenance, Documents, Notifications, Support, Profile, Settings). |

### 1.2. Application Screens

The application includes the following key screens:
The application includes the following key authentication screens:
- **[LoginScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart)** - Pixel-perfect sign-in screen featuring email/mobile and password fields, standard validations, Google OAuth button, and forgot password navigation.
- **[ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart)** - Screen for requesting password recovery containing email/mobile validation, reset password option, and send OTP triggers.
- **[OTPScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart)** - Screen for entering the 6-digit OTP verification code containing automatic text forwarding and backward deletion, countdown timer, and resend trigger.
- **[ResetPasswordScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart)** - Password reset screen containing password requirement indicators (length, numbers, special characters), confirm match verification, and back to login redirects.
- **[VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart)** - Vehicle Overview screen for drivers featuring top vehicle banner image, green status badge, vehicle code/registration details, 4 simplified operational action tiles (`Vehicle Details`, `Vehicle Status`, `Maintenance Alerts`, `Vehicle Documents`), and a dark navy Quick Info card.
- **[VehicleDocumentsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_documents_screen.dart)** - Dedicated Vehicle Documents management screen displaying RC, Insurance, PUC, Fitness, Permit, and Road Tax certificates with expiry dates, status badges (Valid / Expiring Soon), and View/Download action buttons.
- **[VehicleMaintenanceScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_maintenance_screen.dart)** - Vehicle Maintenance screen displaying service summary cards (Upcoming & Overdue Services), active alert cards with color-coded severity tags (`High`, `Medium`, `Low`) and status indicators (`OVERDUE`, `EXPIRING SOON`, `VALID`), last service insight metadata, and a navigation button to contact the fleet manager.
- **[ContactFleetManagerScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/contact_fleet_manager_screen.dart)** - Contact Fleet Manager screen displaying manager profile header with availability dot badge, detailed office/contact list, active trip assignment details, direct Call & Message action triggers, and a recent communication activity timeline.
- **[CallingFleetManagerScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/calling_fleet_manager_screen.dart)** - Calling Fleet Manager screen replicating an active Android calling interface for Ramesh Kumar with live call duration (`00:18`), phone display (`+91 98765 43210`), Current Assignment metadata card (`TRP-9901`, `MH12PQ8820`, `Mumbai → Pune`), 2x3 circular call controls (Mute, Speaker, Bluetooth active, Keypad, Add Call, Video disabled), and red End Call CTA.
- **[MessageFleetManagerScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/message_fleet_manager_screen.dart)** - Message Fleet Manager screen delivering an enterprise chat interface for Rajesh Sharma featuring compact profile header, WhatsApp-styled bottom attachment options modal (Document, Camera, Gallery, Audio, Location, Slips), file picker integration, incoming white bubbles, outgoing orange `#FF7A1A` bubbles, document attachment cards, and interactive text input bar.
- **[UpcomingTripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/upcoming_trips_screen.dart)** - Upcoming Trips screen displaying assigned/scheduled trips with Accept/Reject actions for assigned trips, departure time-gated **Start Trip** button (unlocked 15 minutes before departure), and real-time socket updates (`trip:assigned`, `trip:status-updated`, `trip:15min-reminder`).
- **[UpcomingTripDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/upcoming_trip_details_screen.dart)** - Detailed upcoming trip screen showing pickup/destination timeline, vehicle info, departure schedule, trip instructions, and time-gated Start Trip execution.
- **[ActiveTripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/active_trips_screen.dart)** - Active Trips management screen featuring real OpenStreetMap live tracking map with interactive Reroute button, **"Customer Location Reached"** arrival toggle switch (`PATCH /api/driver/trips/:id/customer-location`), unlocked Proof of Delivery (POD) Slip & Weighbridge Slip upload boxes (`POST /api/driver/pod`, `POST /api/driver/weighbridge`), real-time socket events, and instant Manager notification & approval flow.
- **[UpdateTripStatusScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/update_trip_status_screen.dart)** - Trip status update screen connected to `ApiService.uploadProofOfDelivery` and `ApiService.uploadWeighbridgeSlip`, saving uploaded image metadata to MongoDB, triggering real-time notifications to the assigned manager, and enabling manager approval to complete the trip.
- **[SupportHistoryScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart)** - Support History screen displaying Dark Navy header, search bar, 50/50 horizontal action buttons Row ("Call Manager" and "Message Manager"), full-width scrollable filter chips (`All`, `Open`, `In Progress`, `Resolved`, `Rejected`), dynamic MongoDB ticket cards loaded via `ApiService.getDriverTickets()`, vehicle registrations, trip numbers, status badges (`Mechanic Assigned`, `Mechanic Arrived`, `Repair In Progress`, `Repair Completed`, `Resolved`), and an orange `+` FAB opening RaiseTicketScreen.
- **[RaiseTicketScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/raise_ticket_screen.dart)** & **[Driver Web Maintenance Page](file:///c:/Users/Satya/Desktop/Fleet-management-system/frontend/src/roles/driver/pages/Maintenance.jsx)** - Vehicle Issue reporting interface supporting structured issue selection (**Tyre / Brake Issue**, **Mechanic / Engine Breakdown**, **Severe Accident / Emergency**, **Fuel / Payment Issue**, **Electrical Issue**, **Custom / Manual Entry**) and manual text input field. Submits ticket to `POST /api/driver/tickets` with photo attachments. Auto-binds active trip and assigned vehicle.
- **[TicketDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/ticket_details_screen.dart)** & **[Driver Web Issue Card](file:///c:/Users/Satya/Desktop/Fleet-management-system/frontend/src/roles/driver/components/IssueCard.jsx)** - Vehicle Issue tracking interface featuring status progression action buttons (**Confirm Mechanic Arrived 📍**, **Start Repair 🔧**, **Mark Repair Completed ✅**, **Need Maintenance Escalation 🛠️**), assigned mechanic info card with direct call trigger, trip continuation banner (`Resolved - Continue Trip 🚚`), severe accident cancellation alert (`Trip Cancelled (Severe Accident) 🚨`), Cloudinary photo thumbnail preview & full-screen modal, and vertical repair timeline.
- **[Manager ViewTicketsPage](file:///c:/Users/Satya/Desktop/Fleet-management-system/frontend/src/roles/manager/pages/ViewTicketsPage.jsx)** - Fleet Manager Ticket Resolution center featuring context-aware action buttons: Mechanic Assignment (Name, Phone, Location), **"Cancel Trip (Severe Accident 🚨)"** (cancels trip, sets vehicle to Maintenance, releases driver status), and **"Approve & Resolve Fuel Ticket"** (1-click fuel/payment ticket resolution).
- **[FuelOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/fuel_overview_screen.dart)** - Primary landing page for the Fuel Module opened from the Dashboard Fuel Quick Action. Features Dark Navy header, Vehicle #TS09AB4589 status card (65% fuel level, 320 km est. distance), Quick Actions row (`Add Fuel Entry` opening AddFuelEntryScreen, `Fuel History` opening FuelHistoryScreen), and Fuel Statistics cards (`Today's Consumption` 8.2L, `This Week` 54.5L, `Last Refill Cost` ₹852.20).
- **[AddFuelEntryScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/add_fuel_entry_screen.dart)** - Unified Fuel Entry interface optimized for Manager Fuel Management module schema. Features top read-only fields for `Assigned Vehicle` (`TS09AB4589`) and `Current Trip ID` (`TRP-9901`), clean unpopulated default form fields with placeholder hints (`Select Fuel Station`, `Select Fuel Type`, `e.g. 45.0`, `e.g. 4250.00`, `Select Payment Mode`, `e.g. 142850`), mandatory field validation, interactive Receipt Upload section (Camera / Gallery triggers), View Receipt invoice modal, trash bin removal action, Fleet Manager approval info note, and a manager-compatible data payload summary modal upon submission.
- **[FuelHistoryScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/fuel_history_screen.dart)** - Fuel History screen featuring Dark Navy header, search bar, filter chips (`All`, `Verified`, `Pending`, `Approved`), and card items that navigate to FuelEntryDetailsScreen upon tap.
- **[FuelEntryDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/fuel_entry_details_screen.dart)** - Detailed Fuel Entry view featuring Dark Navy header with entry ID (`#FL-4089 Details`), status banner (`Verified` / `Approved`), comprehensive fuel summary metrics, interactive Receipt Viewer Modal with itemized fuel tax invoice, official approval stamp, and PDF download action.
- **[ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart)** - Password reset screen containing password requirement indicators (length, numbers, special characters), confirm match verification, and back to login redirects.
- **[MainNavigationScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart)** - Navigation host containing a premium custom floating bottom navigation bar with fixed icon positions (zero layout movement or shift), switching between Home (Home icon), Trips (Route icon), Support (Headset icon), Alerts (Bell icon), and Profile (Person icon), highlighting selected tab with Fleet Orange accent, supporting programmatically triggered tab changes via a static `selectedTabNotifier`.
- **[ProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart)** - Premium user profile screen containing driver details (name, active status circular headshot, verified Senior Driver badge), a three-column stats card row (miles, safety, years), collapsible accordions for Personal Information and Driver's License Details, and a settings card enclosing Edit Profile, Help & Support, and a red custom outlined Logout button.
- **[EditProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart)** - Driver profile editing screen displaying prefilled forms across three categories (Personal, Contact, and License details), featuring standard validator rules, calendar date selection, Camera/Gallery circular profile image changes, and custom Save/Cancel action buttons at the bottom.
- **[NotificationsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart)** - Grouped list view for Today and Yesterday notifications, styling read/unread items distinctively with custom badge colors, interactive click-to-read triggers, and sub-appbar filter chips for All, Read, and Unread notifications. Designed as a primary tab view without a back button, using a shared static `notifications` list to synchronize read states with the Dashboard.
- **[NotificationDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart)** - Notification details page featuring clean type-specific badge coloring, read status display, a detailed scrollable card view of the notification payload, and interactive back navigation via the top AppBar back button, which programmatically switches active tab to the notifications page if opened from Dashboard.
- **[VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart)** - Vehicle Overview screen for drivers featuring top vehicle banner image, green status badge, vehicle code/registration details, 6 operational action tiles, and a dark navy Quick Info card.
- **[VehicleDocumentsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_documents_screen.dart)** - Dedicated Vehicle Documents management screen displaying RC, Insurance, PUC, Fitness, Permit, and Road Tax certificates with expiry dates, status badges (Valid / Expiring Soon), and View/Download action buttons.
- **[VehicleDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_details_screen.dart)** - Comprehensive Vehicle Details screen displaying specs grid (Brand, Model, Year, Capacity, Fuel Type, Transmission), green-accented operational status card, assigned driver info, and technical specifications.
- **[VehicleMaintenanceScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_maintenance_screen.dart)** - Vehicle Maintenance screen displaying service summary cards (Upcoming Services: 02, Overdue Services: 01), color-coded active alerts with priority badges, last service insight card, and bottom "Contact Fleet Manager" button.
- **[VehicleStatusScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_status_screen.dart)** - Telemetry and Live Vehicle Status screen featuring top vehicle overview card (`TS09AB4589`, `On Trip`, `24,500 km`), live map tracking card, speed/distance stats, 4-column vehicle health indicators, trip timeline stepper, and bottom dark navy live refresh button.
- **[LoginScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart)** - Pixel-perfect sign-in screen featuring email/mobile and password fields, standard validations, Google OAuth button, and forgot password navigation.
- **[ForgotPasswordScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart)** - Screen for requesting password recovery containing email/mobile validation, reset password option, and send OTP triggers.
- **[OTPScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart)** - Screen for entering the 6-digit OTP verification code containing automatic text forwarding and backward deletion, countdown timer, and resend trigger.
- **[ResetPasswordScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart)** - Password reset screen containing password requirement indicators, confirm match verification, and back to login redirects.
- **[MainNavigationScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart)** - The single unified bottom navigation container. It contains the custom bottom navigation bar and switches between Home (DashboardScreen), Trips, Support, Notifications, and Profile views using an `IndexedStack`. It supports programmatic tab transitions via static `selectedTabNotifier`.
- **[DashboardScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart)** - The main driver dashboard home page interface presenting the top navigation brand logo next to the greeting text, active trip overview cards (with stats card and active trip progress card), timeline journey indicators, operational quick actions (Vehicle, Fuel, Issue, Schedule, Settings, Trips), recent notifications, and the day's schedule.
- **[SettingsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart)** - Application settings page matching the design mockup in Settings.png. Features profile header, grouped list section cards with internal dividers for Account & Security, App Preferences, Notifications, and Legal & Support, dynamic language switcher modal, reactive dark mode toggle switch, and confirm log out dialog.
- **[ChangePasswordScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/settings/change_password_screen.dart)** - Change Password screen featuring forms for Current Password, New Password, and Confirm Password with visible/obscure eye toggles, and dynamic validation checklist for length, uppercase, and special characters.
- **[TwoFactorAuthScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/settings/two_factor_auth_screen.dart)** - Two-Factor Authentication screen containing step 1 settings (2FA toggle, SMS/Email/App selection, phone number field, backup codes generator, and info card) and step 2 verification (smartphone security illustration, 6-digit textfields with auto-focus movement, and validation).
- **[NotificationSettingsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/settings/notification_settings_screen.dart)** - Notification settings preferences screen matching design mockup in Notification Settings.png. Features Preferences adjustment header banner, and segmented switches for Route Alerts, Vehicle Maintenance, Safety & Performance, System Preferences, and Notification Channels.
- **[TripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/trips_screen.dart)** - Screen listing active, upcoming, and completed trips for the driver, including statistical summary cards.
- **[MainNavigationScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart)** - The single unified bottom navigation container. It contains the custom bottom navigation bar and switches between Home (DashboardScreen), Trips, Support, Alerts, and Profile views using an `IndexedStack`. It supports programmatic tab transitions via static `selectedTabNotifier`, text labels on unselected items, and a notification dot badge on the Alerts icon.
- **[DashboardScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart)** - Redesigned main dashboard screen featuring a dark navy header background, greeting with driver profile details, curved sheet body, active trip card (`_buildActiveTripCard`) with 12:8 balanced column flex layout, truncated ETA string to prevent overflow, and scale-down "View Details" button opening `TripDetailsScreen`.
- **[TripDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/trip_details_screen.dart)** - Dynamic trip details screen displaying trip overview metrics, route origin and destination, driver & vehicle info card, weight load specifications, and manifest timeline. Features an `Expanded` header column layout with text ellipsis truncation resolving RenderFlex horizontal layout overflow error. Supports assigned trip status workflow with **Reject** (outlined red button) and **Accept Trip** (elevated green button) action buttons.
- **[CompletedTripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/completed_trips_screen.dart)** - Dynamic completed trips list view fetching real completed trip records from `/api/driver/trips?status=Completed` API with route timeline info, distance, duration, and fuel metrics.
- **[ActiveTripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/active_trips_screen.dart)** - Active Trips management screen strictly displaying trips that are currently in progress (`In Progress`, `Enroute`, `On Transit`), featuring real OpenStreetMap live tracking map with interactive Reroute button, **"Customer Location Reached"** arrival toggle switch (`PATCH /api/driver/trips/:id/customer-location`), unlocked Proof of Delivery (POD) Slip & Weighbridge Slip upload boxes (`POST /api/driver/pod`, `POST /api/driver/weighbridge`), and real-time manager approval auto-completion.
- **[TripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/trips_screen.dart)** - Dynamic StatefulWidget fetching live summary card counters (`totalTrips`, `activeTrips`, `upcomingTrips`) from `/api/driver/dashboard` and real recent trip details from `/api/driver/trips/current`.
- **[MainNavigationScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart)** - Unified navigation shell featuring real-time SocketService listeners that pop up interactive floating toast SnackBars on new notifications, assigned trips, and status updates across the application.
- **[NotificationDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart)** - Notification details page featuring clean type-specific badge coloring, read status display, and detailed payload card.
- **[VehicleOverviewScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart)** / **[Driver Web Vehicles Page](file:///c:/Users/Satya/Desktop/Fleet-management-system/frontend/src/roles/driver/pages/Vehicles.jsx)** - Vehicle Overview interface for drivers bound dynamically to `/api/driver/vehicle`, `/api/driver/maintenance`, and `/api/driver/documents`. Features top vehicle banner card with photo/fallback graphic, green status badge (`Active` / `Available` / `Maintenance`), vehicle code (`BT-990`), fuel type badge (`Diesel`), 4 action tiles (`Vehicle Details`, `Vehicle Status`, `Maintenance Alerts`, `Vehicle Documents`), dark navy Quick Info component (`#101C2C`) with formatted service/expiry dates, and dynamic manager maintenance alert list (read-only progress state).
- **[VehicleDocumentsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_documents_screen.dart)** - Dedicated Vehicle Documents management screen displaying RC, Insurance, PUC, Fitness, Permit, and Road Tax certificates bound to MongoDB document metadata and expiry dates (`rcExpiry`, `insuranceExpiry`, `pollutionExpiry`, `fitnessExpiry`, `permitExpiry`), status badges (Valid / Expiring Soon / Expired), and direct external link launcher for uploaded Cloudinary documents.
- **[VehicleDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_details_screen.dart)** - Comprehensive Vehicle Details screen displaying live backend specs (Brand, Model, Mfg Year, Payload Capacity, GVW, Fuel Type, Odometer, Engine Number, Chassis Number, Driver info), operational status card, and technical specifications grid.
- **[VehicleMaintenanceScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_maintenance_screen.dart)** - Vehicle Maintenance screen bound to `/api/driver/maintenance`. Dynamically loads real Manager-created maintenance work orders from MongoDB (`Maintenance` collection), displaying live service summary counters (Upcoming & Overdue Services), active alert cards with color-coded status badges (`SCHEDULED`, `IN PROGRESS`, `OVERDUE`), last completed service insights, and a navigation button to contact the fleet manager.
- **[VehicleStatusScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_status_screen.dart)** - Telemetry and Live Vehicle Status screen featuring top vehicle overview card, real-time live location tracking card, speed/status stats, FASTag balance, fuel capacity, and live refresh controls.
- **[AddFuelEntryScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/add_fuel_entry_screen.dart)** - Fuel Entry creation screen integrated with `image_picker` (Camera & Gallery receipt upload), uploading receipts directly to Cloudinary via multipart `POST /api/driver/fuel`, displaying vehicle and trip details, and resetting form upon submission.
- **[FuelOverviewScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/fuel_overview_screen.dart)** - Fuel Overview screen fetching live driver fuel summary stats, total fuel logs, last refill cost, and assigned vehicle info from `/api/driver/fuel` and `/api/driver/vehicle`.
- **[FuelHistoryScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/fuel_history_screen.dart)** - Fuel History screen bound to `/api/driver/fuel` displaying filter chips (`All`, `Approved`, `Pending`, `Rejected`), Cloudinary receipt thumbnails, approval status badges, total amount/liters, and rejection reasons. Displays empty state when no records exist.
- **[FuelEntryDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/fuel_entry_details_screen.dart)** - Detailed fuel log screen rendering approval status banner, fuel summary grid, Cloudinary receipt image preview modal, and rejection reason alerts.

### 1.3. Reusable Custom Widgets

- **[WindingRouteIcon](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/widgets/winding_route_icon.dart)** - Custom drawn route path widget using `CustomPainter` to render an S-shaped road path with start and end nodes.

---

## 2. Centralized Design System

The application uses **Material Design 3 (M3)** with custom styling overrides.

### Color Palette

Defined in [constants/app_colors.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/constants/app_colors.dart) (and re-exported via [theme/app_colors.dart](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/theme/app_colors.dart)):

| Name | Hex Code | Primary Placement / Use Case |
| :--- | :--- | :--- |
| **Fleet Navy** (Primary) | `#0D1B2A` | AppBar, Primary Buttons, Primary Icons, Active Navigation Icons |
| **Deep Navy** (Primary Variant) | `#13293D` | Bottom Navigation Bar background, Selected Cards, Selected States |
| **Fleet Orange** (Secondary) | `#FF6A00` | Primary CTA/Action Buttons, Active Chips, Floating Action Buttons |
| **Sunset Orange** (Accent) | `#FF8C24` | Progress indicators, notification counters, badges, highlights |
| **Background** | `#FFFFFF` | Main Scaffold background |
| **Surface** | `#F7F9FC` | Cards, input fields, containers, bottom sheets |
| **Divider** | `#E4E8EF` | Borders, outlines, custom dividers |
| **Primary Text** | `#1B2430` | Titles, section headers, headings, primary labels |
| **Secondary Text** | `#667085` | Subtitles, descriptions, captions, inactive labels |
| **Disabled Text** | `#98A2B3` | Placeholders, disabled button text, inactive fields |
| **Success** | `#22C55E` | Completed trips, success status, positive alerts |
| **Warning** | `#F59E0B` | Pending status, low fuel warnings, pending actions |
| **Error** | `#EF4444` | Cancelled/failed actions, alerts, delete operations |
| **Info** | `#3B82F6` | Informational cards, vehicle/system tracking stats |

### Web Application Design System & Color Palette (Admin, Manager, Driver Web)

The Web portals (`frontend/src/roles/admin/`, `frontend/src/roles/manager/`, `frontend/src/roles/driver/`) share a unified design system and color palette:

| Component / Element | Color / Token | Usage |
| :--- | :--- | :--- |
| **Page Background** | `#F5F7FA` | Global viewport background across Admin, Manager, and Driver web modules |
| **Primary Brand Accent** | `#B45A0A` / `#9A4D08` | Warm Amber / Orange active links, primary CTA buttons, stats icons, and highlights |
| **Light Accent Background** | `#FDF3EC` / `bg-amber-50` | Active tab highlights, badge backgrounds, and secondary icon wrappers |
| **Sidebar Navigation** | `#0F0F10` (Dark Charcoal) | Collapsible/fixed dark sidebar with `#1B1B1D` active item background & left border indicator |
| **Top Header Bar** | `bg-white` (`#FFFFFF`) | Clean white header with subtle bottom border (`#E5E7EB`), dark titles (`#111827`), and Duty toggle badges |
| **Cards & Containers** | `bg-white` (`#FFFFFF`) | Pure white cards with `border border-slate-200`, `rounded-2xl`, and `shadow-sm` |
| **Typography** | `Poppins` + `Nunito` | Google Fonts `Poppins` for titles/KPI values and `Nunito` for body/subtext copy |


### Typography

Defined in [app_theme.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/theme/app_theme.dart). Fonts are served dynamically via the Google Fonts library.

- **Primary Font**: `Poppins` (Used for headers, buttons, navigation labels, and card titles).
- **Secondary Font**: `Nunito` (Used for body copy, descriptions, input text, and helper labels).

#### Scale mapping:
* **Heading 1**: Poppins (Bold, 28)
* **Heading 2**: Poppins (SemiBold, 24)
* **Heading 3**: Poppins (Medium, 20)
* **Body Large**: Nunito (Regular, 16)
* **Body Medium**: Nunito (Regular, 14)
* **Caption**: Nunito (Regular, 12)
* **Button Text**: Poppins (SemiBold, 16)

---

## 3. Coding & Design Standards

To keep the codebase clean, scalable, and easy to maintain, developers must adhere to the following:

- **Theme Consistency**: Never hardcode colors or text sizes directly in widgets. Always use `Theme.of(context).colorScheme` or references to `AppColors` and `Theme.of(context).textTheme`.
- **Spacing Guidelines**: Follow an **8dp grid system** for margins, padding, and spacing (e.g., margins of 8, 16, 24, 32).
- **Component Geometry**: Use rounded corners with a standard border radius of **12dp to 16dp** for cards, buttons, and dialogs.
- **Card Shadows**: Use soft shadows. E.g., `BoxShadow(color: AppColors.textPrimary.withAlpha(20), blurRadius: 10)`.
- **Responsiveness**:
  - Always wrap scrollable pages in a `SingleChildScrollView` to prevent keyboard rendering overflows.
  - Avoid using `IntrinsicHeight` widgets in deeply nested scrollable structures as they perform expensive layout passes. However, they may be utilized in simple, non-scrollable layouts (e.g. side-by-side dashboard cards) to match card heights dynamically.
  - Use flexible/responsive structures (`Row`, `Column`, `Flexible`, `Expanded`, or `Stack` with `Positioned` elements) for dynamic content tracking.
  - Utilize layout controls (`FittedBox`, `Flexible`, `Expanded`, `MediaQuery`, or `LayoutBuilder`) to maintain layout ratios on various viewport widths (mobile, tablet, web).
- **Responsive Buttons and Text Overflow**:
  - Avoid wrapping full-width buttons in fixed-height boxes (e.g., `SizedBox(height: 48)`) if text inside can wrap.
  - Instead, use `minimumSize: const Size(double.infinity, 48)` on button styles combined with dynamic padding to allow buttons to grow vertically if text scales up or wraps, preventing overlaps or text clipping.
- **Asset Usage**: Add all static resources (logos, graphics) locally in `assets/` and declare them in [pubspec.yaml](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/pubspec.yaml). Avoid using network calls for static assets to bypass CORS issues on Web target.

---

## 4. Development Workflow

Useful developer commands to run inside the `driver_mobile/` directory:

### Run Locally
Runs the application on a target device or emulator:
```bash
flutter run
```
To test specifically on Web Chrome:
```bash
flutter run -d chrome
```

### Static Analysis
Runs type and lint checks using rule configurations defined in `analysis_options.yaml`:
```bash
flutter analyze
```

### Run Tests
Executes the test suite in the `test/` folder:
```bash
flutter test
```

---

## 5. Authentication & API Integration System

The application connects to a Node.js/Express backend API for session operations, location broadcasts, trip processing, and document management.

### Key Architecture Components
* **`Dio` Client (`ApiService`)**: Configured with request timeouts, environment fallback IPs, and automated response mapping.
* **JWT Secure Storage**: Uses `flutter_secure_storage` to write, read, and delete JWT credentials securely.
* **Auto-Authorize Interceptor**: Intercepts outgoing REST requests inside `ApiService` to append the `Authorization: Bearer <token>` header dynamically.
* **State Management (`AuthProvider`)**: Inherits from `ChangeNotifier` to drive authentication state (`driver`, `isLoading`, `errorMessage`, `isAuthenticated`). Exposed to screens via Provider bindings.
* **Models (`DriverModel`, `ManagerModel`)**: Strongly typed JSON serialization for parsing backend collections cleanly.
* **Profile & Settings Integration**: 
  - Dynamic profile loading via `refreshProfile` in `AuthProvider` triggered on `ProfileScreen` or `SettingsScreen` initialization.
  - Profile update API endpoint integration supporting PUT operations on `/api/driver/profile` which handles updates for personal profile fields as well as settings preferences.
  - Profile image changes supporting native file manager picking (`file_picker`) converting to base64 data URIs.
  - Cloudinary profile image uploads processed on backend `updateDriverProfile` for incoming base64 data URIs.
  - Profile image updates globally synchronized across all active avatars (Profile, Edit Profile, Dashboard header, and Settings) via a shared `profilePhotoUrlNotifier`.
  - Issuing State updates mapping to driver's database `'branch'` field dynamically synced on `ProfileScreen` and `EditProfileScreen`. Made optional in edit profile validations to allow saving other properties without enforcing a value. Added backend return mapping for the `branch` field on get profile endpoints to ensure previous values pre-fill successfully on edit profile screen loads.
  - Change Password screen connected to backend endpoint `PATCH /api/auth/change-password` through `AuthProvider.changePassword()`. Added explicit `.select('+password')` behavior inside the user database queries to avoid bcrypt comparison failures.
  - Two-Factor Authentication settings (toggle state, SMS/Email methods, phone number, and generated backup recovery codes) saved in backend and synchronized. Toggling 2FA generates a random 6-digit OTP, prints it to the debugging terminal console for SMS / Email, and validates it before persisting. Supports clipboard multi-digit paste by overriding single maxLength limits.
  - Notification Preferences (route changes, traffic warnings, sound, vibration, email/SMS/Push notifications) persisted in MongoDB and loaded dynamically.
  - Language and Dark Mode selections saved instantly to backend to preserve user experience across different devices.
  - Help & Support Screen backend data binding (`GET /api/driver/support`) for live dispatcher contact phone, email, and WhatsApp launching (`url_launcher`).
  - Global reactive 401 Unauthorized handling inside `ApiService` and `AuthProvider` that automatically logs out and redirects the user to the `LoginScreen`. Explicitly ignores `/login` API endpoints to prevent state resets and ensure wrong credentials return informative validation SnackBars. Root `AuthSessionWrapper` relies on `isSessionInitialized` to restrict full-screen loaders exclusively to startup session checks.
  - Firebase integration via `firebase_core` imported and initialized asynchronously inside the mobile root `main()` entry method. Wired up with [firebase_options.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/firebase_options.dart) to pass `DefaultFirebaseOptions.currentPlatform` configuration details automatically.
  - Driver Notifications Feed integrated with backend Mongoose `Notification` collection. Provides pull-to-refresh (`GET /api/driver/notifications`), individual mark-as-read updates (`PATCH /api/driver/notifications/:id/read`), and mark-all-as-read operations (`PATCH /api/driver/notifications/read-all`). Mobile actions (`_toggleReadStatus`, `_markAllAsRead`) and Web actions (`handleNotificationClick`, `onMarkRead`) invoke backend APIs and update state immediately upon tapping or opening details.
  - Firebase Cloud Messaging integration via `FcmService` which handles requesting permission, obtaining and registering device tokens (`fcmToken` property on driver profile), listening to foreground/background messages, showing SnackBar banners, and switching to the notifications tab upon tray notification taps.
  - Dashboard recent notifications indicators dynamically read provider unread counts and clear unread states when tapped.
  - Driver Dashboard connected to live backend REST endpoints: `/api/driver/dashboard` (fetches counts for active, upcoming, completed, total trips, today's schedules, and initial notifications) and `/api/driver/trips/current` (fetches the currently running trip).
  - Active trip progress card computes real completion percentages dynamically from `actualDistance` / `estimatedDistance` values or trip statuses, supporting all pipeline stages (`Scheduled`, `Assigned`, `In Progress`, `En Route`, `At Loading`, `In Transit`, `Delivered`, `Completed`). Active trip allocation queries across `syncVehicleStatus.js` and controllers evaluate `{ status: { $nin: ['Completed', 'Cancelled', 'Rejected'] } }` to ensure active allocations remain protected across all intermediate progress stages.
  - Today's schedule timeline is dynamically drawn from the `todaySchedule` array payload, and recent notifications are fed directly from the reactive `NotificationProvider` state.
  - Periodic background polling timer (runs every 10 seconds silently) installed in [dashboard_screen.dart](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart) to refresh state.
  - Backend controller actions `createTrip` and `updateTrip` inside [manager.controller.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/controllers/manager.controller.js) automatically save driver `Notification` documents to MongoDB and simulate push notifications during trip assignment, unassignment, or status modifications.
  - Dynamic in-app local SnackBar indicators triggered on the mobile dashboard whenever a new unread notification arrives, with context actions to go directly to notifications.
  - **Socket.IO Real-Time Communication System**:
    - Persistent real-time communication channel implemented via `socket_io_client` inside [SocketService](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/services/socket_service.dart).
    - Driver client automatically registers to a driver-specific room `driver:${driverId}` upon successful login or session initialization.
    - Listens for `'notification:new'` event which triggers instant, reactive dashboard refreshes and UI updates via registered notification listeners, bypassing the periodic 10-second polling lag.
    - Automatically unsubscribes and disconnects the WebSocket stream upon logout to preserve resources.
    - Backend WebSocket server ([server.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/server.js)) updated to register `joinDriverRoom` listeners.
    - Backend notification utility ([notification.js](file:///c:/Users/user/Downloads/Fleet-management-system/backend/utils/notification.js)) routes events to the `driver:${recipient}` room when a new trip or notification is created for a user with role `DRIVER`.
    - REST endpoint `/api/driver/trips/current` returns `startLocation` and `endLocation` fields to resolve key mismatches and correctly bind database properties to the client dashboard's active trip card.

### 5.1. Trip Assignment Lifecycle & 15-Minute Start Rule
* **Accept / Reject Review Phase**:
  - When a manager creates/dispatches a trip, the initial status defaults to `"Assigned"`. The assigned driver reviews trip details (Vehicle plate, model, cargo specs, origin, destination, departure schedule, manager contact) on the Dashboard (`Current Trip Focus`) or Trips page (`Pending Response` tab) and chooses **Accept Trip** or **Reject Trip**.
  - Trips remain strictly in the **Pending Response** stage until explicitly accepted by the driver.
  - Accepting (`PATCH /api/driver/trips/:id/respond` with `{ action: 'accept' }`) updates trip status to `Accepted` and transitions the trip to **Upcoming Trips**.
  - Rejecting (`action: 'reject'`) sets trip status to `Rejected` and resets driver and assigned vehicle statuses to `AVAILABLE` / `Available`.
* **15-Minute Pre-Start Notification & Button Lock Rule**:
  - Until **15 minutes before** scheduled departure (`departureTime`), the **Start Trip** button remains **disabled (locked)** with a lock icon 🔒 and countdown unlock time indicator.
  - At **15 minutes prior to departure**, backend cron interval in `server.js` emits database notification and Socket.io event `trip:15min-reminder` to **both Driver and Assigned Manager**.
  - Start Trip button unlocks automatically when departure window is reached or passed.
* **Vehicle Cards Text Overflow & Line Break Safeguards**:
  - Vehicle registration numbers (e.g. `TG-09-AL-4587`) are protected against line breaks at hyphens (`TG-09-` line 1) using CSS `whitespace-nowrap`, responsive typography (`text-lg sm:text-xl font-bold`), `truncate`, and flexbox `min-w-0` on `SummaryCard.jsx`, `VehicleCard.jsx`, and `Vehicles.jsx`.
* **Active Trip Transition & Manager Notification**:
  - Clicking **Start Trip** sets status to `In Progress`, updates driver & vehicle statuses to `ON_TRIP` / `On Trip`, shifts trip to **Active Trips**, and dispatches `Trip Started` notification to Manager.
* **Assigned Vehicle Details Integration**:
  - Complete vehicle details (Registration/Plate number, vehicle model, type, operational status, fuel level) are displayed across trip cards and detailed view screens in both mobile and web driver applications.
* **Live GPS Map Tracking & Vehicle Movement**:
  - Active trips render an interactive Leaflet map (`MapView.jsx`) displaying live vehicle marker movement along the polyline route, real-time speed HUD, remaining distance, ETA, and 3-stop route timeline.
* **Customer Location Arrival & Trip Completion Location Update**:
  - Driver toggles ON **"Arrived at Customer Location"** switch (`PATCH /api/driver/trips/:id/customer-location` with `{ reached: true }`).
  - Switching arrival status ON automatically unlocks Proof of Delivery (POD) and Weighbridge Slip upload boxes (`POST /api/driver/pod`, `POST /api/driver/weighbridge`) for manager approval.
  - Upon trip completion (`Completed`), driver location (`driverLocation`, `currentLocation`) and vehicle location (`currentLocation`, `branch`) automatically update to the completed trip's destination / customer location (`endLocation`).
  - Driver status resets to `AVAILABLE`, allowing Fleet Managers (`CreateTripPage.jsx`) to see the driver waiting at that customer location and dispatch a new trip starting from there.
* **Notification Click Navigation System**:
  - Notifications across Driver (`NotificationCard.jsx`) and Manager (`NotificationsPage.jsx`, `NotificationDetailsPage.jsx`) portals are interactive and navigate directly to target feature pages (trip details, maintenance complaints, fuel records, driver profiles) upon click.


### 5.3. Ticket Modal Scroll, Instant Driver Maintenance & Profile Pre-fill
* **Fleet Manager Ticket View Modal Container Scroll (`ViewTicketsPage.jsx`)**:
  - Ticket edit/update modal container is wrapped with max-height restraint `max-h-[90vh]` and vertical scrolling `overflow-y-auto`, ensuring dynamic category forms and bottom action buttons (**Save Updates**, **Cancel**) remain fully accessible across all viewports.
* **Instant Maintenance Status Update & Silent Polling (`Maintenance.jsx`, `IssueCard.jsx`)**:
  - `IssueCard.jsx` updates local status state optimistically upon driver button click (**Mechanic Arrived 📍**, **Start Repair 🔧**, **Mark Repair Completed ✅**) and triggers `onStatusUpdated()` callback.
  - `Maintenance.jsx` runs background silent refreshes (`fetchTickets(true)`) and 5-second interval polling, reflecting status changes instantly on driver web without disruptive full-screen loading spinners.
* **Date Formatter & API Service Signature Integration (`date_formatter.dart`, `api_service.dart`)**:
  - Implemented `formatIndianDate`, `formatIndianDateTime`, and `formatNotificationTime` inside `date_formatter.dart` to provide uniform Indian date formatting (`dd/MM/yyyy hh:mm a`) and relative notification timestamps.
  - Specified `static void Function()? onUnauthorized;` callback return type signature and added `ApiService.getTripDetails(tripId)` in `api_service.dart`.
  - Profile fields (`fullName` / `name`, `phone` / `phoneNumber`, `email`, `licenseNumber`) pre-fill default values from `AuthContext` user object and `/driver/profile` API response, preventing empty inputs on initial render.
  - Added **Profile Information** card to `Settings.jsx` (`/driver/settings`), enabling drivers to view and update contact details directly alongside password and preferences.

