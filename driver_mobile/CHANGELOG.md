# Changelog

All notable changes to the Fleet Driver Mobile application will be documented in this file.

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
