import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:driver_mobile/main.dart';
import 'package:driver_mobile/screens/vehicle_overview_screen.dart';
import 'package:driver_mobile/screens/vehicle_documents_screen.dart';
import 'package:driver_mobile/services/api_service.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});

    // Set standard mobile screen size for testing
    final binding = TestWidgetsFlutterBinding.ensureInitialized();
    binding.platformDispatcher.views.first.physicalSize = const Size(1080, 1920);
    binding.platformDispatcher.views.first.devicePixelRatio = 1.0;

    ApiService.mockResponses = {
      '/driver/vehicle': {
        'success': true,
        'data': {
          'assigned': true,
          'vehicle': {
            'vehicleNumber': 'BT-990',
            'registrationNumber': 'ABC-1234',
            'vehicleModel': 'Medium Van',
            'vehicleType': 'Medium Van',
            'fuelType': 'Diesel',
            'odometer': 142000.0,
            'status': 'Active',
            'lastServiceDate': '2023-10-12T00:00:00.000Z',
            'nextServiceDueKm': 5000.0,
            'nextServiceDue': '5,000 km',
            'insuranceExpiry': '2023-12-20T00:00:00.000Z',
            'permitExpiry': '2024-01-15T00:00:00.000Z'
          }
        }
      },
      '/auth/forgot-password': {
        'success': true,
        'message': 'OTP sent successfully'
      },
      '/auth/verify-otp': {
        'success': true,
        'message': 'OTP verified successfully'
      },
      '/auth/reset-password': {
        'success': true,
        'message': 'Password reset successfully'
      },
      '/driver/login': {
        'success': true,
        'data': {
          'token': 'mock-jwt-token',
          'driverId': 'FF-9821',
          'managerId': 'MGR-1002',
          'organizationId': 'ORG-500',
          'driver': {
            'id': 'driver_123',
            'employeeId': 'FF-9821',
            'fullName': 'Meghana Soo',
            'email': 'meghana.soo@speshway.com',
            'phoneNumber': '+15550199',
            'licenseNumber': 'KF-402-DELTA',
            'licenseType': 'HMV',
            'licenseExpiry': '2026-12-31T00:00:00.000Z',
            'assignedVehicle': 'BT-990',
            'driverStatus': 'SENIOR_DRIVER',
            'profileImage': '',
            'branch': 'KF-402-DELTA',
            'experience': '8',
            'organization': 'org_123',
            'address': 'Pune, Maharashtra',
            'joiningDate': '2020-01-01T00:00:00.000Z',
            'dob': '1990-01-01T00:00:00.000Z',
            'performanceScore': 90,
            'tripsCompleted': 88,
            'manager': {
              'id': 'manager_123',
              'name': 'Jane Smith',
              'email': 'jane@fleetflow.com'
            }
          }
        }
      },
      '/driver/profile': {
        'success': true,
        'data': {
          'id': 'driver_123',
          'employeeId': 'FF-9821',
          'driverId': 'FF-9821',
          'fullName': 'Meghana Soo',
          'name': 'Meghana Soo',
          'email': 'meghana.soo@speshway.com',
          'phone': '+15550199',
          'status': 'Active',
          'licenseNumber': 'KF-402-DELTA',
          'licenseExpiry': '2026-12-31',
          'experienceYears': 8,
          'nextServiceDue': '5,000 km',
          'assignedVehicle': 'BT-990',
          'profilePicture': '',
          'manager': {
            'id': 'manager_123',
            'name': 'Jane Smith',
            'email': 'jane@fleetflow.com'
          },
          'organization': 'org_123',
          'address': 'Pune, Maharashtra',
          'driverStatus': 'SENIOR_DRIVER'
        }
      },
      '/driver/trips/current': {
        'success': true,
        'data': null
      },
      '/driver/dashboard': {
        'success': true,
        'data': {
          'stats': {
            'tripsCount': 0,
            'totalDistance': 0,
            'activeAlerts': 0
          }
        }
      },
      '/driver/logout': {
        'success': true,
        'message': 'Logged out successfully'
      }
    };
  });

  testWidgets('Complete Authentication Navigation Flow Smoke Test', (
    WidgetTester tester,
  ) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());
    await tester.idle();
    await tester.pump();
    debugPrint('TEST_TREE: ${tester.allWidgets.map((w) => w.runtimeType).toList()}');

    // 1. Verify Login Screen
    expect(find.text('Fleet Management'), findsOneWidget);
    expect(find.text('Welcome back'), findsOneWidget);

    // 2. Navigate to Forgot Password Screen
    await tester.tap(find.text('Forgot Password?'));
    await tester.pumpAndSettle();

    // 3. Verify Forgot Password Screen
    expect(find.text('Forgot Password'), findsOneWidget);

    // 4. Fill in the email textfield and press Send OTP
    await tester.enterText(find.byType(TextFormField), 'test@fleetpro.com');
    await tester.pump();
    await tester.tap(find.text('Send OTP'));
    await tester.pumpAndSettle();

    // 5. Verify OTP Verification Screen is loaded
    expect(find.text('OTP Verification'), findsOneWidget);
    expect(
      find.text('Verify OTP'),
      findsNWidgets(2),
    ); // "Verify OTP" header + "Verify OTP" button

    // 6. Fill in the 6 digit OTP fields
    for (int i = 0; i < 6; i++) {
      await tester.enterText(find.byType(TextFormField).at(i), '1');
    }
    await tester.pumpAndSettle();

    // 7. Tap Verify OTP to navigate to Reset Password Screen
    await tester.tap(find.text('Verify OTP').last); // Taps the button
    await tester.pumpAndSettle();

    // 8. Verify Reset Password Screen is loaded
    expect(find.text('Reset Password'), findsNWidgets(2));
    expect(find.text('Create New Password'), findsOneWidget);
    expect(find.text('NEW PASSWORD'), findsOneWidget);
    expect(find.text('CONFIRM PASSWORD'), findsOneWidget);
    expect(find.text('Password Requirements'), findsOneWidget);

    // 9. Tap Back to Login to return to main login screen
    await tester.ensureVisible(find.text('Back to Login'));
    await tester.tap(find.text('Back to Login'));
    await tester.pumpAndSettle();

    // 10. Verify we are back on the Login Screen
    expect(find.text('Welcome back'), findsOneWidget);
  });

  testWidgets('Reset Password Screen submission and validation', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MyApp());
    await tester.idle();
    await tester.pump();

    // Navigate to Forgot Password
    await tester.tap(find.text('Forgot Password?'));
    await tester.pumpAndSettle();

    // Fill email and submit
    await tester.enterText(find.byType(TextFormField), 'test@fleetpro.com');
    await tester.pump();
    await tester.tap(find.text('Send OTP'));
    await tester.pumpAndSettle();

    // Fill OTP
    for (int i = 0; i < 6; i++) {
      await tester.enterText(find.byType(TextFormField).at(i), '1');
    }
    await tester.pumpAndSettle();

    // Tap Verify OTP
    await tester.tap(find.text('Verify OTP').last);
    await tester.pumpAndSettle();

    // Verify Reset Password Screen is loaded
    expect(find.text('Create New Password'), findsOneWidget);

    // Get TextFormFields for passwords
    final passwordFields = find.byType(TextFormField);
    expect(passwordFields, findsNWidgets(2));

    // Fill in a valid password meeting all requirements: "Pass123!"
    await tester.enterText(passwordFields.at(0), 'Pass123!');
    await tester.enterText(passwordFields.at(1), 'Pass123!');
    await tester.pump(); // trigger listeners
    await tester.pumpAndSettle();

    // Verify the button is enabled (onPressed is not null)
    final resetButtonFinder = find.widgetWithText(
      ElevatedButton,
      'Reset Password',
    );
    final resetButtonWidget = tester.widget<ElevatedButton>(resetButtonFinder);
    expect(resetButtonWidget.onPressed, isNotNull);

    // Tap Reset Password
    await tester.ensureVisible(resetButtonFinder);
    await tester.tap(resetButtonFinder);
    await tester.pumpAndSettle();

    // Verify we are back on the Login Screen
    expect(find.text('Welcome back'), findsOneWidget);
  });

  testWidgets('Vehicle Overview Screen rendering and action tiles test', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: VehicleOverviewScreen()));
    await tester.idle();
    await tester.pump();

    // 1. Verify App Bar Title
    expect(find.text('Vehicle Overview'), findsOneWidget);

    // 2. Verify Vehicle Info
    expect(find.text('BT-990'), findsOneWidget);
    expect(find.text('Medium Van • ABC-1234'), findsOneWidget);
    expect(find.text('Diesel'), findsOneWidget);

    // 3. Verify Section Header & Action Items
    expect(find.text('Actions & Details'), findsOneWidget);
    expect(find.text('Vehicle Details'), findsOneWidget);
    expect(find.text('Vehicle Status'), findsOneWidget);
    expect(find.text('Maintenance Alerts'), findsOneWidget);
    expect(find.text('1 CRITICAL'), findsOneWidget);

    // 4. Verify Quick Info Section & Card
    expect(find.text('Quick Info'), findsOneWidget);
    expect(find.text('Last Service'), findsOneWidget);
    expect(find.text('Oct 12, 2023'), findsOneWidget);
    expect(find.text('Next Service'), findsOneWidget);
    expect(find.text('5,000 km'), findsOneWidget);
    expect(find.text('Insurance Expiry'), findsOneWidget);
    expect(find.text('Dec 20, 2023'), findsOneWidget);
    expect(find.text('Permit Expiry'), findsOneWidget);
    expect(find.text('Jan 15, 2024'), findsOneWidget);
  });

  testWidgets('Vehicle Documents Screen rendering and document list test', (
    WidgetTester tester,
  ) async {
    final vehicleData = {
      'vehicleNumber': 'BT-990',
      'registrationNumber': 'ABC-1234',
      'vehicleModel': 'Medium Van',
      'vehicleType': 'Medium Van',
      'fuelType': 'Diesel',
      'odometer': 142000.0,
      'status': 'Active',
      'lastServiceDate': '2023-10-12T00:00:00.000Z',
      'nextServiceDueKm': 5000.0,
      'nextServiceDue': '5,000 km',
      'rcExpiry': '2028-12-31T00:00:00.000Z',
      'insuranceExpiry': '2028-12-20T00:00:00.000Z',
      'pollutionExpiry': '2028-12-31T00:00:00.000Z',
      'fitnessExpiry': '2028-12-31T00:00:00.000Z',
      'permitExpiry': '2026-08-15T00:00:00.000Z',
      'documents': {
        'roadTax': {
          'uploadDate': '2028-12-31T00:00:00.000Z'
        }
      }
    };
    await tester.pumpWidget(MaterialApp(home: VehicleDocumentsScreen(vehicle: vehicleData)));
    await tester.idle();
    await tester.pump();

    // 1. Verify App Bar & Header
    expect(find.text('Vehicle Documents'), findsOneWidget);
    expect(find.text('All Vehicle Documents'), findsOneWidget);

    // 2. Verify Document Items
    expect(find.text('Registration Certificate (RC)'), findsOneWidget);
    expect(find.text('Insurance Certificate'), findsOneWidget);
    expect(find.text('Pollution Under Control (PUC)'), findsOneWidget);
    expect(find.text('Fitness Certificate'), findsOneWidget);
    expect(find.text('Permit Document'), findsOneWidget);
    expect(find.text('Road Tax Receipt'), findsOneWidget);

    // 3. Verify Status Badges & Actions
    expect(find.text('Valid'), findsNWidgets(5));
    expect(find.text('Expiring Soon'), findsOneWidget);
    expect(find.text('View'), findsNWidgets(6));
    expect(find.text('Download'), findsNWidgets(6));
  });

  testWidgets('Profile Screen Navigation, Details, and Logout Confirmation', (
    WidgetTester tester,
  ) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());
    await tester.idle();
    await tester.pump();

    // Enter credentials to log in
    await tester.enterText(
      find.byType(TextFormField).at(0),
      'manager@fleetpro.com',
    );
    await tester.enterText(find.byType(TextFormField).at(1), '1234456');
    await tester.pump();
    await tester.tap(find.text('LOGIN'));
    await tester.pumpAndSettle();

    // Verify Dashboard is displayed
    expect(find.text('Good Morning, Meghana 👋'), findsOneWidget);

    // Tap Profile Navigation Tab
    await tester.tap(find.byIcon(Icons.account_circle_outlined));
    await tester.pumpAndSettle();

    // Verify Profile Screen elements are loaded
    expect(find.text('Meghana Soo'), findsOneWidget);
    expect(find.text('SENIOR DRIVER'), findsOneWidget);
    expect(find.text('Member since 2020'), findsOneWidget);
    expect(find.text('Personal Information'), findsOneWidget);
    expect(find.text("Driver's License Details"), findsOneWidget);

    // Verify logout option is visible
    expect(find.text('Logout'), findsOneWidget);

    // Tap Logout to show dialog
    await tester.ensureVisible(find.text('Logout'));
    await tester.tap(find.text('Logout'));
    await tester.pumpAndSettle();

    // Verify Logout Dialog is displayed
    expect(find.text('Confirm Logout'), findsOneWidget);
    expect(find.text('Cancel'), findsOneWidget);

    // Tap Cancel to dismiss dialog
    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();
    expect(find.text('Confirm Logout'), findsNothing);

    // Tap Logout again
    await tester.ensureVisible(find.text('Logout'));
    await tester.tap(find.text('Logout'));
    await tester.pumpAndSettle();

    // Tap Logout on dialog to log out
    await tester.tap(
      find.descendant(
        of: find.byType(AlertDialog),
        matching: find.text('Logout'),
      ),
    );
    await tester.pumpAndSettle();

    // Verify we are redirected back to Login Screen
    expect(find.text('Welcome back'), findsOneWidget);
  });

  testWidgets('Edit Profile Screen Validation and Submission Flow', (
    WidgetTester tester,
  ) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());
    await tester.idle();
    await tester.pump();

    // Enter credentials to log in
    await tester.enterText(
      find.byType(TextFormField).at(0),
      'manager@fleetpro.com',
    );
    await tester.enterText(find.byType(TextFormField).at(1), '1234456');
    await tester.pump();
    await tester.tap(find.text('LOGIN'));
    await tester.pumpAndSettle();

    // Tap Profile Navigation Tab
    await tester.tap(find.byIcon(Icons.account_circle_outlined));
    await tester.pumpAndSettle();

    // Tap Edit Profile button
    await tester.ensureVisible(find.text('Edit Profile'));
    await tester.tap(find.text('Edit Profile'));
    await tester.pumpAndSettle();

    // Verify Edit Profile Screen elements are loaded and pre-filled
    expect(find.text('Driver ID: FF-9821'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Meghana Soo'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'KF-402-DELTA'), findsOneWidget);
    expect(
      find.widgetWithText(TextFormField, 'meghana.soo@speshway.com'),
      findsOneWidget,
    );

    // Test form validation: clear name field and click Save Changes
    await tester.enterText(find.byType(TextFormField).at(0), '');
    await tester.pump();
    await tester.ensureVisible(find.text('Save Changes'));
    await tester.tap(find.text('Save Changes'));
    await tester.pumpAndSettle();

    // Verify validation error
    expect(find.text('Full Name is required'), findsOneWidget);

    // Test Cancel button: click Cancel and verify we return to Profile Screen
    await tester.ensureVisible(find.text('Cancel'));
    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();
    expect(find.text("Driver's License Details"), findsOneWidget);

    // Tap Edit Profile button again
    await tester.ensureVisible(find.text('Edit Profile'));
    await tester.tap(find.text('Edit Profile'));
    await tester.pumpAndSettle();

    // Modify name and email, and tap Save Changes
    await tester.enterText(find.byType(TextFormField).at(0), 'Satya Nadella');
    await tester.enterText(
      find.byType(TextFormField).at(3),
      'satya@microsoft.com',
    );
    await tester.pump();
    await tester.ensureVisible(find.text('Save Changes'));
    await tester.tap(find.text('Save Changes'));
    await tester.pumpAndSettle();
    debugPrint('TEST_TEXTS: ${find.byType(Text).evaluate().map((el) => (el.widget as Text).data).toList()}');

    // Verify success snackbar is shown and we return to Profile Screen
    expect(find.text('Profile updated successfully!'), findsOneWidget);
    expect(find.text("Driver's License Details"), findsOneWidget);
  });
}
