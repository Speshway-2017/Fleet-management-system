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
| `lib/screens/` | Screen-level widget containers. |
| `lib/screens/auth/` | Authentication-related flows (Login, Forgot Password, etc.). |
| `lib/services/` | Backend REST API integration, authentication, and location tracking services (`api_service.dart`, `auth_service.dart`, `location_service.dart`). |
| `lib/theme/` | Centralized design system constants and MaterialApp theme settings. |
| `test/` | Automated widget, integration, and unit tests. |

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
- **[RaiseTicketScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/raise_ticket_screen.dart)** - Raise Ticket form screen featuring Operational Support info card, Ticket Category dropdown, LOW/MEDIUM/HIGH priority selector, Subject input field, Detailed Description text area, interactive image/photo upload dropzone with Camera/Gallery picker modal (`image_picker`), image thumbnail preview card with remove action, and orange Submit Ticket CTA submitting multipart payload to `POST /api/driver/tickets`. Automatically sets vehicle status to `Maintenance` or `Active` based on the Issue Type Rules Matrix.
- **[TicketDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/ticket_details_screen.dart)** - Ticket Details screen featuring Dark Navy header with category subtitle, Issue Flow Rules Banner (`Can Continue Trip: Yes / After Repair / No`), 5-step interactive repair progress stepper (`Open` → `Assigned` → `Arrived` → `In Repair` → `Completed`), offline assigned mechanic info card with direct call trigger (`url_launcher`), driver action buttons (`"Confirm Mechanic Arrived"`, `"Start Repair"`, `"Mark Repair Completed"`), `"Ticket Resolved - Continue Trip 🚚"` banner, uploaded Cloudinary photo thumbnail preview & tap-to-expand modal, and vertical repair activity timeline.
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
- **[VehicleOverviewScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart)** - Vehicle Overview screen bound dynamically to `/api/driver/vehicle`. Displays top `VehicleInfoCard` with real specs, status badge, network image support, 4 operational action tiles (`Vehicle Details`, `Vehicle Status`, `Maintenance Alerts`, `Vehicle Documents`), `QuickInfoCard` with formatted service/expiry dates, and a clean "No Vehicle Assigned" view when no vehicle is allocated.
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
