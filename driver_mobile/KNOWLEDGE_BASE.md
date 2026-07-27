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
- **[MessageFleetManagerScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/message_fleet_manager_screen.dart)** - Message Fleet Manager screen delivering an enterprise chat interface for Rajesh Sharma featuring compact profile header, incoming white bubbles, outgoing orange `#FF7A1A` bubbles, document attachment cards (`Fuel_Receipt.jpg`, `Route_Sheet.pdf`, `Delivery_Challan.pdf`), timestamps, and fixed bottom message input bar.
- **[SupportHistoryScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart)** - Support History screen displaying Dark Navy header, search bar, filter chips (`All`, `Open`, `In Progress`, `Resolved`, `Rejected`), card list of realistic Indian vehicle maintenance tickets (`Engine Overheating`, `Tyre Puncture`, `Brake Service Required`, `Battery Not Charging`, `GPS Device Not Working`, `Breakdown Assistance`) with priority badges, vehicle registrations, trip IDs, status indicators, and an orange `+` FAB opening RaiseTicketScreen.
- **[RaiseTicketScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/raise_ticket_screen.dart)** - Raise Ticket form screen featuring Operational Support info card, Ticket Category dropdown, LOW/MEDIUM/HIGH priority segment toggle, Subject input field, Detailed Description text area, dashed file upload container, and an orange Submit Ticket CTA.
- **[TicketDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/ticket_details_screen.dart)** - Ticket Details screen displaying Dark Navy header with category subtitle, Original Description card with horizontal attachment thumbnails (`Engine_Check.jpg`, `Diag_Graph.png`, `Engine_Rpt.pdf`), vertical Updates & Conversation timeline with role-based avatars (Fleet Support, Driver, Mechanic), and a fixed bottom reply bar.
- **[ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart)** - Password reset screen containing password requirement indicators (length, numbers, special characters), confirm match verification, and back to login redirects.
- **[MainNavigationScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart)** - Navigation host containing a premium custom bottom navigation bar switching between Home (Home icon), Trips (Route icon), Support (Headset icon), Notifications (Bell icon), and Profile (Person icon), with selected tab styled as a vertical column inside a rounded orange box, supporting programmatically triggered tab changes via a static `selectedTabNotifier`.
- **[ProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart)** - Premium user profile screen containing driver details (name, active status circular headshot, verified Senior Driver badge), a three-column stats card row (miles, safety, years), collapsible accordions for Personal Information and Driver's License Details, and a settings card enclosing Edit Profile, Help & Support, and a red custom outlined Logout button.
- **[EditProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart)** - Driver profile editing screen displaying prefilled forms across three categories (Personal, Contact, and License details), featuring standard validator rules, calendar date selection, Camera/Gallery circular profile image changes, and custom Save/Cancel action buttons at the bottom.
- **[NotificationsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart)** - Grouped list view for Today and Yesterday notifications, styling read/unread items distinctively with custom badge colors, interactive click-to-read triggers, and sub-appbar filter tabs for Total, Read, and Unread notifications. Designed as a primary tab view without a back button, using a shared static `notifications` list to synchronize read states with the Dashboard.
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
- **[DashboardScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart)** - The main driver dashboard home page interface presenting active trip overview cards (with stats card and active trip progress card), timeline journey indicators, operational quick actions (Vehicle, Fuel, Issue, Schedule, Settings, Trips), recent notifications, and the day's schedule.
- **[SettingsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/settings/settings_screen.dart)** - Application settings page matching the design mockup in Settings.png. Features profile header, grouped list section cards with internal dividers for Account & Security, App Preferences, Notifications, and Legal & Support, dynamic language switcher modal, reactive dark mode toggle switch, and confirm log out dialog.
- **[ChangePasswordScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/settings/change_password_screen.dart)** - Change Password screen featuring forms for Current Password, New Password, and Confirm Password with visible/obscure eye toggles, and dynamic validation checklist for length, uppercase, and special characters.
- **[TwoFactorAuthScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/settings/two_factor_auth_screen.dart)** - Two-Factor Authentication screen containing step 1 settings (2FA toggle, SMS/Email/App selection, phone number field, backup codes generator, and info card) and step 2 verification (smartphone security illustration, 6-digit textfields with auto-focus movement, and validation).
- **[NotificationSettingsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/settings/notification_settings_screen.dart)** - Notification settings preferences screen matching design mockup in Notification Settings.png. Features Preferences adjustment header banner, and segmented switches for Route Alerts, Vehicle Maintenance, Safety & Performance, System Preferences, and Notification Channels.
- **[TripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/trips_screen.dart)** - Screen listing active, upcoming, and completed trips for the driver, including statistical summary cards.
- **[MainNavigationScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart)** - The single unified bottom navigation container. It contains the custom bottom navigation bar and switches between Home (DashboardScreen), Trips, Support, Alerts, and Profile views using an `IndexedStack`. It supports programmatic tab transitions via static `selectedTabNotifier`, text labels on unselected items, and a notification dot badge on the Alerts icon.
- **[DashboardScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart)** - Redesigned main dashboard screen featuring a dark navy header background, greeting with generated offline avatar asset, curved sheet container body, dark active trip overview card (Pickup/Destination stepper, progress percentage box, live label, timeline path, details CTA), horizontal scroll view for quick actions (Vehicle, Fuel, Issue, Schedule, Trips, Settings), overview card with four stats widgets, schedule timeline milestones, and notification tiles list.
- **[ScheduleScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/schedule_screen.dart)** - Schedule Maintenance screen displaying a week calendar view, list of completed and scheduled assigned trips, weather conditions, and day driving metrics.
- **[TodaysScheduleScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/todays_schedule_screen.dart)** - Screen displaying today's schedule milestones, remaining stops progress timeline, telemetry cards, and real-time mapping details.
- **[AssignmentDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/assignment_details_screen.dart)** - Detailed assignment sheet showing trip ID status metrics, weight load specifications, and stops route progress.
- **[UpcomingScheduleScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/upcoming_schedule_screen.dart)** - Screen showing 7-day schedule blocks, weekly distance/fuel summaries, and outstanding delivery count.
- **[TripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/trips_screen.dart)** - Screen listing active, upcoming, and completed trips for the driver, including statistical summary cards, an in-body search bar, and AppBar brand logo alignment.
- **[ProfileScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart)** - Premium user profile screen containing driver details, stats card row (miles, safety, years), collapsible accordions for Personal Information and Driver's License Details, and settings card.
- **[HelpSupportScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/profile/help_support_screen.dart)** - Help & Support screen matching design mockup in Help & Support.png. Features search help field with dynamic FAQ list filtering, common help category cards, and Frequently Asked Questions expandable cards.
- **[EditProfileScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart)** - Driver profile editing screen displaying prefilled forms across Personal, Contact, and License details categories.
- **[NotificationsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart)** - Grouped list view for Today and Yesterday notifications, styling read/unread items distinctively with custom badge colors and filter tabs.
- **[NotificationDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart)** - Notification details page featuring clean type-specific badge coloring, read status display, and detailed payload card.
- **[VehicleOverviewScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart)** - Vehicle Overview screen for drivers featuring top vehicle banner image, green status badge, vehicle code/registration details, 4 operational action tiles (Vehicle Details, Vehicle Status, Maintenance Alerts, Vehicle Documents) linked to their respective screens, and a dark navy Quick Info card.
- **[VehicleDocumentsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_documents_screen.dart)** - Dedicated Vehicle Documents management screen displaying RC, Insurance, PUC, Fitness, Permit, and Road Tax certificates with expiry dates, status badges (Valid / Expiring Soon), and View/Download action buttons.
- **[VehicleDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_details_screen.dart)** - Comprehensive Vehicle Details screen displaying specs grid (Brand, Model, Year, Capacity, Fuel Type, Transmission), green-accented operational status card, assigned driver info, and technical specifications.
- **[VehicleMaintenanceScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_maintenance_screen.dart)** - Vehicle Maintenance screen displaying service summary cards (Upcoming Services: 02, Overdue Services: 01), color-coded active alerts with priority badges, last service insight card, and bottom "Contact Fleet Manager" button.
- **[VehicleStatusScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_status_screen.dart)** - Telemetry and Live Vehicle Status screen featuring top vehicle overview card (`TS09AB4589`, `On Trip`, `24,500 km`), live map tracking card, speed/distance stats, 4-column vehicle health indicators, trip timeline stepper, and bottom dark navy live refresh button.

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
