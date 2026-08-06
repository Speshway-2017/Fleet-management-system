# Changelog

All notable changes to the Fleet Driver Mobile application will be documented in this file.

## [1.31.43] - 2026-08-06

### Changed
- **Mobile App Icon Display Name**:
  - Updated Android application label (`android:label="Fleet"`) in `android/app/src/main/AndroidManifest.xml`.
  - Updated iOS display name (`CFBundleDisplayName` & `CFBundleName` set to `Fleet`) in `ios/Runner/Info.plist`.
  - Updated Web title (`Fleet`) and web manifest properties in `web/index.html` and `web/manifest.json`.

## [1.31.42] - 2026-08-06

### Fixed
- **Widget Test Package Name & Import Resolution**:
  - Set `name: driver_mobile` in `driver_mobile/pubspec.yaml` to match Dart package imports (`package:driver_mobile/...`).
  - Resolved URI target errors and missing class/function definition errors in `driver_mobile/test/widget_test.dart`.
