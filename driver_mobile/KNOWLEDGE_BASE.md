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
- **[LoginScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/login_screen.dart)** - Pixel-perfect sign-in screen featuring email/mobile and password fields, standard validations, Google OAuth button, and forgot password navigation.
- **[ForgotPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/forgot_password_screen.dart)** - Screen for requesting password recovery containing email/mobile validation, reset password option, and send OTP triggers.
- **[OTPScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/otp_screen.dart)** - Screen for entering the 6-digit OTP verification code containing automatic text forwarding and backward deletion, countdown timer, and resend trigger.
- **[ResetPasswordScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/auth/reset_password_screen.dart)** - Password reset screen containing password requirement indicators (length, numbers, special characters), confirm match verification, and back to login redirects.
- **[MainNavigationScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/main_navigation_screen.dart)** - Navigation host containing a premium custom bottom navigation bar switching between Home (Home icon), Trips (Route icon), Support (Headset icon), Notifications (Bell icon), and Profile (Person icon), with selected tab styled as a vertical column inside a rounded orange box, supporting programmatically triggered tab changes via a static `selectedTabNotifier`.
- **[ProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/profile_screen.dart)** - Premium user profile screen containing driver details (name, active status circular headshot, verified Senior Driver badge), a three-column stats card row (miles, safety, years), collapsible accordions for Personal Information and Driver's License Details, and a settings card enclosing Edit Profile, Help & Support, and a red custom outlined Logout button.
- **[EditProfileScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/profile/edit_profile_screen.dart)** - Driver profile editing screen displaying prefilled forms across three categories (Personal, Contact, and License details), featuring standard validator rules, calendar date selection, Camera/Gallery circular profile image changes, and custom Save/Cancel action buttons at the bottom.
- **[NotificationsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notifications_screen.dart)** - Grouped list view for Today and Yesterday notifications, styling read/unread items distinctively with custom badge colors, interactive click-to-read triggers, and sub-appbar filter tabs for Total, Read, and Unread notifications. Designed as a primary tab view without a back button, using a shared static `notifications` list to synchronize read states with the Dashboard.
- **[NotificationDetailsScreen](file:///c:/Users/user/Downloads/Fleet-management-system/driver_mobile/lib/screens/notifications/notification_details_screen.dart)** - Notification details page featuring clean type-specific badge coloring, read status display, a detailed scrollable card view of the notification payload, and interactive back navigation via the top AppBar back button, which programmatically switches active tab to the notifications page if opened from Dashboard.
- **[VehicleOverviewScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_overview_screen.dart)** - Vehicle Overview screen for drivers featuring top vehicle banner image, green status badge, vehicle code/registration details, 6 operational action tiles, and a dark navy Quick Info card.
- **[VehicleDocumentsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/vehicle_documents_screen.dart)** - Dedicated Vehicle Documents management screen displaying RC, Insurance, PUC, Fitness, Permit, and Road Tax certificates with expiry dates, status badges (Valid / Expiring Soon), and View/Download action buttons.

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
  - Utilize layout controls (`FittedBox`, `Flexible`, `Expanded`, `MediaQuery`, or `LayoutBuilder`) to maintain layout ratios on various viewport widths (mobile, tablet, web).
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
