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

The application includes the following key authentication screens:
- **[LoginScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart)** - Pixel-perfect sign-in screen featuring email/mobile and password fields, standard validations, Google OAuth button, and forgot password navigation.
- **[ForgotPasswordScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart)** - Screen for requesting password recovery containing email/mobile validation, reset password option, and send OTP triggers.
- **[OTPScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart)** - Screen for entering the 6-digit OTP verification code containing automatic text forwarding and backward deletion, countdown timer, and resend trigger.
- **[ResetPasswordScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart)** - Password reset screen containing password requirement indicators (length, numbers, special characters), confirm match verification, and back to login redirects.
- **[MainNavigationScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart)** - [DEPRECATED] Previously used as the main navigation host; replaced by DashboardScreen to eliminate duplicate navigation bar layout overlays.
- **[ProfileScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart)** - Premium user profile screen containing driver details (name, active status circular headshot, verified Senior Driver badge), a three-column stats card row (miles, safety, years), collapsible accordions for Personal Information and Driver's License Details, and a settings card enclosing Edit Profile, Help & Support, and a red custom outlined Logout button.
- **[EditProfileScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart)** - Driver profile editing screen displaying prefilled forms across three categories (Personal, Contact, and License details), featuring standard validator rules, calendar date selection, Camera/Gallery circular profile image changes, and custom Save/Cancel action buttons at the bottom.
- **[DashboardScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/dashboard_screen.dart)** - Root navigation host containing a premium custom bottom navigation bar switching between Home (HomeScreen), Trips (TripsScreen), Support (PlaceholderScreen), Alerts (PlaceholderScreen), and Profile (ProfileScreen) views using an `IndexedStack`.

- **[HomeScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/home_screen.dart)** - The main driver dashboard interface presenting active trip overview cards (including a deep navy Stats Card and a light grey/blue bordered Active Trip Progress Card with dynamic layout scaling to handle smaller device viewports safely), timeline journey indicators, operational quick actions (e.g. "Vehicle" quick action navigating to `VehicleOverviewScreen`), recent notifications (e.g. "Maintenance Reminder" navigating to `VehicleMaintenanceScreen`), and the day's schedule.
- **[TripsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/trips_screen.dart)** - Screen listing active, upcoming, and completed trips for the driver, including statistical summary cards for easy tracking.
- **[VehicleOverviewScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart)** - Vehicle Overview screen for drivers featuring top vehicle banner image, green status badge, vehicle code/registration details, 4 operational action tiles (Vehicle Details, Vehicle Status, Maintenance Alerts, Vehicle Documents) linked to their respective screens, and a dark navy Quick Info card.
- **[VehicleDocumentsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_documents_screen.dart)** - Dedicated Vehicle Documents management screen displaying RC, Insurance, PUC, Fitness, Permit, and Road Tax certificates with expiry dates, status badges (Valid / Expiring Soon), and View/Download action buttons.
- **[VehicleDetailsScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_details_screen.dart)** - Comprehensive Vehicle Details screen displaying specs grid (Brand, Model, Year, Capacity, Fuel Type, Transmission), green-accented operational status card, assigned driver info, and technical specifications.
- **[VehicleMaintenanceScreen](file:///c:/Users/Satya/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_maintenance_screen.dart)** - Vehicle Maintenance screen displaying service summary cards (Upcoming Services: 02, Overdue Services: 01), color-coded active alerts with priority badges, last service insight card, and bottom "Contact Fleet Manager" button.

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
