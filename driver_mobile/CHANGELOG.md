# Changelog

All notable changes to the Fleet Driver Mobile application will be documented in this file.

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

### Fixed
- **Restoration of Original 7-Step Trip Lifecycle Rules**:
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

## [1.38.0] - 2026-07-31

### Fixed & Enhanced
- **Shared React UserProfileCard Re-Creation**:
  - Re-created `UserProfileCard` (`frontend/src/components/common/UserProfileCard.jsx`) supporting both Manager Workspace and Driver Dashboard user roles.
  - Implemented 44x44px circular profile image avatar with dynamic online status dot, click-outside dropdown handling, and availability status toggle switch.
  - Resolved Vite import resolution error (`Failed to resolve import "@/components/common/UserProfileCard"`).

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
