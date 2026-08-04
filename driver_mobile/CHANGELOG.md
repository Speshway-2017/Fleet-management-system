# Changelog

All notable changes to the Fleet Driver Mobile application will be documented in this file.

## [1.67.0] - 2026-08-04

### Enhanced (Manager Dashboard Real Maintenance Alerts & Click Navigation)
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
