# Changelog

All notable changes to the Fleet Driver Mobile application will be documented in this file.

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
- **Ticket Details Screen**: Created [TicketDetailsScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/ticket_details_screen.dart) based on the reference design mockups:
  - Dark Navy (`#101C2C`) header bar with ticket ID, issue category subtitle (`VEHICLE MAINTENANCE`), and company logo badge.
  - Original Description card with timestamp (`05:30 AM`), problem text, and horizontal attachment thumbnails (`Engine_Check.jpg`, `Diag_Graph.png`, `Engine_Rpt.pdf`).
  - Updates & Conversation vertical timeline with author roles (`Fleet Support - Rajesh Sharma`, `Driver - Satya Narayana`, `Mechanic - Ramesh Kumar`), timestamps, and status updates.
  - Fixed bottom reply bar with attachment trigger icon, text field (`"Add a reply..."`), and circular primary Orange (`#FF7A1A`) send button.
  - Connected ticket cards on [SupportHistoryScreen](file:///c:/Users/Dell/Desktop/Fleet-management-system/driver_mobile/lib/screens/support_history_screen.dart) to push `TicketDetailsScreen`.

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
