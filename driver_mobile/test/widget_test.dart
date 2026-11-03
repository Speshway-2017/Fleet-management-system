import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:driver_mobile/main.dart';
import 'package:driver_mobile/screens/vehicle_overview_screen.dart';
import 'package:driver_mobile/screens/vehicle_documents_screen.dart';
import 'package:driver_mobile/services/api_service.dart';

import 'package:driver_mobile/screens/splash/splash_screen.dart';
import 'package:driver_mobile/screens/onboarding/onboarding_screen.dart';
import 'package:driver_mobile/screens/auth/login_identifier_screen.dart';
import 'package:driver_mobile/screens/auth/login_screen.dart';
import 'package:driver_mobile/providers/auth_provider.dart';
import 'package:driver_mobile/providers/notification_provider.dart';
import 'package:provider/provider.dart';

import 'package:driver_mobile/services/location_service.dart';
import 'package:driver_mobile/services/socket_service.dart';
import 'package:driver_mobile/services/fcm_service.dart';
import 'package:driver_mobile/screens/profile/profile_screen.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({'has_seen_onboarding': true});

    ProfileState.profilePhotoUrlNotifier.value = '';
    LocationTrackingService.isTest = true;
    SocketService.isTest = true;
    FcmService.isTest = true;

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
            'phoneNumber': '9876543210',
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
          'phone': '9876543210',
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
      '/driver/notifications': {
        'success': true,
        'data': []
      },
      '/driver/tickets': {
        'success': true,
        'data': []
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
    await tester.pumpAndSettle();

    // Skip onboarding to reach Login Screen via Login Identifier Screen
    if (find.text('Skip').evaluate().isNotEmpty) {
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();
    }

    if (find.text('Next').evaluate().isNotEmpty) {
      expect(find.text('Login'), findsOneWidget);
      if (find.byType(Checkbox).evaluate().isNotEmpty) {
        await tester.tap(find.byType(Checkbox));
        await tester.pumpAndSettle();
      }
      await tester.enterText(find.byType(TextFormField), 'test@fleetpro.com');
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
    }

    // 1. Verify Login Screen
    expect(find.text('Enter email or mobile number'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);

    // 2. Navigate to Forgot Password Screen
    await tester.tap(find.text('Forgot Password?'));
    await tester.pumpAndSettle();

    // 3. Verify Forgot Password Screen
    expect(find.text('Enter registered email or mobile'), findsOneWidget);

    // 4. Fill in the email textfield and press Send Verification OTP
    await tester.enterText(find.byType(TextFormField), 'test@fleetpro.com');
    await tester.pump();
    await tester.tap(find.text('Send Verification OTP'));
    await tester.pumpAndSettle();

    // 5. Verify OTP Verification Screen is loaded
    // Verify OTP screen
    expect(find.text('Verify OTP'), findsOneWidget);
    expect(find.text('Verify OTP'), findsOneWidget);

    // 6. Fill in the 6 digit OTP fields
    for (int i = 0; i < 6; i++) {
      await tester.enterText(find.byType(TextFormField).at(i), '1');
    }
    await tester.pumpAndSettle();

    // 7. Tap Verify OTP to navigate to Reset Password Screen
    await tester.tap(find.text('Verify OTP'));
    await tester.pumpAndSettle();

    // 8. Verify Reset Password Screen is loaded
    expect(find.text('Enter new password'), findsOneWidget);
    expect(find.text('Confirm new password'), findsOneWidget);
    expect(find.text('PASSWORD REQUIREMENTS'), findsOneWidget);

    // 9. Tap Sign In to return to main login screen
    await tester.ensureVisible(find.text('Sign In'));
    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle();

    // 10. Verify we are back on the Login Screen
    expect(find.text('Login'), findsOneWidget);
  });

  testWidgets('Reset Password Screen submission and validation', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MyApp());
    await tester.idle();
    await tester.pumpAndSettle();

    // Skip onboarding to reach Login Screen via Login Identifier Screen
    if (find.text('Skip').evaluate().isNotEmpty) {
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();
    }

    if (find.text('Next').evaluate().isNotEmpty) {
      if (find.byType(Checkbox).evaluate().isNotEmpty) {
        await tester.tap(find.byType(Checkbox));
        await tester.pumpAndSettle();
      }
      await tester.enterText(find.byType(TextFormField), 'test@fleetpro.com');
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
    }

    // Navigate to Forgot Password
    await tester.tap(find.text('Forgot Password?'));
    await tester.pumpAndSettle();

    // Fill email and submit
    await tester.enterText(find.byType(TextFormField), 'test@fleetpro.com');
    await tester.pump();
    await tester.tap(find.text('Send Verification OTP'));
    await tester.pumpAndSettle();

    // Fill OTP
    for (int i = 0; i < 6; i++) {
      await tester.enterText(find.byType(TextFormField).at(i), '1');
    }
    await tester.pumpAndSettle();

    // Tap Verify OTP
    await tester.tap(find.text('Verify OTP'));
    await tester.pumpAndSettle();

    // Verify Reset Password Screen is loaded
    expect(find.text('Reset Password'), findsWidgets);

    // Get TextFormFields for passwords
    final passwordFields = find.byType(TextFormField);
    expect(passwordFields, findsNWidgets(2));

    // Fill in a valid password meeting all requirements: "Pass123!"
    await tester.enterText(passwordFields.at(0), 'Pass123!');
    await tester.enterText(passwordFields.at(1), 'Pass123!');
    await tester.pump(); // trigger listeners
    await tester.pumpAndSettle();

    // Tap Reset Password
    await tester.ensureVisible(find.text('Reset Password'));
    await tester.tap(find.text('Reset Password'));
    await tester.pumpAndSettle();

    // Verify we are back on the Login Screen
    expect(find.text('Login'), findsOneWidget);
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
    await tester.pumpAndSettle();

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

    // 3. Verify Actions
    expect(find.text('View'), findsNWidgets(6));
    expect(find.text('Download'), findsNWidgets(6));
  });

  testWidgets('Profile Screen Navigation, Details, and Logout Confirmation', (
    WidgetTester tester,
  ) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());
    await tester.idle();
    await tester.pumpAndSettle();

    // Skip onboarding to reach Login Screen via Login Identifier Screen
    if (find.text('Skip').evaluate().isNotEmpty) {
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();
    }

    if (find.text('Next').evaluate().isNotEmpty) {
      if (find.byType(Checkbox).evaluate().isNotEmpty) {
        await tester.tap(find.byType(Checkbox));
        await tester.pumpAndSettle();
      }
      await tester.enterText(
        find.byType(TextFormField),
        'manager@fleetpro.com',
      );
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
    }

    // Enter credentials to log in
    await tester.enterText(
      find.byType(TextFormField).at(0),
      'manager@fleetpro.com',
    );
    await tester.enterText(find.byType(TextFormField).at(1), '1234456');
    await tester.pump();
    await tester.tap(find.text('Login'));
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
    expect(find.text('Login'), findsOneWidget);
  });

  testWidgets('Edit Profile Screen Validation and Submission Flow', (
    WidgetTester tester,
  ) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());
    await tester.idle();
    await tester.pumpAndSettle();

    // Skip onboarding to reach Login Screen via Login Identifier Screen
    if (find.text('Skip').evaluate().isNotEmpty) {
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();
    }

    if (find.text('Next').evaluate().isNotEmpty) {
      if (find.byType(Checkbox).evaluate().isNotEmpty) {
        await tester.tap(find.byType(Checkbox));
        await tester.pumpAndSettle();
      }
      await tester.enterText(
        find.byType(TextFormField),
        'manager@fleetpro.com',
      );
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
    }

    // Enter credentials to log in
    await tester.enterText(
      find.byType(TextFormField).at(0),
      'manager@fleetpro.com',
    );
    await tester.enterText(find.byType(TextFormField).at(1), '1234456');
    await tester.pump();
    await tester.tap(find.text('Login'));
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

    // Verify success snackbar is shown and we return to Profile Screen
    expect(find.text('Profile updated successfully!'), findsOneWidget);
    expect(find.text("Driver's License Details"), findsOneWidget);
  });

  testWidgets('Vehicle Overview Screen unassigned vehicle state test', (
    WidgetTester tester,
  ) async {
    ApiService.mockResponses['/driver/vehicle'] = {
      'success': true,
      'data': {
        'assigned': false,
        'vehicle': null
      }
    };

    await tester.pumpWidget(const MaterialApp(home: VehicleOverviewScreen()));
    await tester.idle();
    await tester.pump();
    await tester.pumpAndSettle();

    // Verify App Bar Title is present
    expect(find.text('Vehicle Overview'), findsOneWidget);

    // Verify correct empty state message is shown
    expect(
      find.text('A Fleet Manager has not assigned a vehicle to you yet.'),
      findsOneWidget,
    );

    // Verify vehicle action cards and headers are hidden
    expect(find.text('Vehicle Details'), findsNothing);
    expect(find.text('Vehicle Status'), findsNothing);
    expect(find.text('Maintenance Alerts'), findsNothing);
    expect(find.text('Vehicle Documents'), findsNothing);
  });

  testWidgets('Splash Screen displays brand elements and loading indicator', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({'has_seen_onboarding': true});

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ],
        child: const MaterialApp(
          home: SplashScreen(),
        ),
      ),
    );

    // Initial frame renders brand title and driver badge
    expect(find.text('FLEET MANAGEMENT'), findsOneWidget);
    expect(find.text('DRIVER MOBILE APP'), findsOneWidget);
    expect(find.text('Smart Commercial Logistics & Telemetry'), findsNothing);

    await tester.pumpAndSettle();
  });

  testWidgets('Splash Screen routes to OnboardingScreen on first launch', (
    WidgetTester tester,
  ) async {
    // Simulate first launch without onboarding completed
    SharedPreferences.setMockInitialValues({'has_seen_onboarding': false});

    await tester.pumpWidget(const MyApp());
    await tester.idle();
    await tester.pumpAndSettle();

    // Verify Onboarding Screen is loaded with slide 1 content and Next button
    expect(find.text('Welcome to\nFleet Management'), findsOneWidget);
    expect(find.text('SMART LOGISTICS'), findsOneWidget);
    expect(find.text('Skip'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);
  });

  testWidgets('Onboarding Screen slide progression and Get Started completion', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({'has_seen_onboarding': false});

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ],
        child: const MaterialApp(
          home: OnboardingScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Slide 1: Welcome
    expect(find.text('Welcome to\nFleet Management'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);

    // Advance to Slide 2: Manage Trips via Next button
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    expect(find.text('Manage Your\nAssigned Trips'), findsOneWidget);
    expect(find.text('DISPATCH SCHEDULES'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);

    // Advance to Slide 3 (Final Slide): Track Journey via Next button
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    expect(find.text('Track Your Journey\nin Real-Time'), findsOneWidget);
    expect(find.text('LIVE GPS TELEMETRY'), findsOneWidget);
    expect(find.text('Get Started'), findsOneWidget);
    // Skip button should be hidden on final slide
    expect(find.text('Skip'), findsNothing);

    // Tap Get Started button
    await tester.tap(find.text('Get Started'));
    await tester.pumpAndSettle();

    // Verify completion saved in SharedPreferences and navigated to LoginIdentifierScreen
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getBool('has_seen_onboarding'), true);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);

    // Enter email and tap Next to navigate to LoginScreen prefilled
    await tester.enterText(find.byType(TextFormField), 'driver@fleetpro.com');
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();

    expect(find.text('Login'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'driver@fleetpro.com'), findsOneWidget);
  });

  testWidgets('Onboarding Screen Skip button completes onboarding and navigates to LoginIdentifierScreen', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({'has_seen_onboarding': false});

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ],
        child: const MaterialApp(
          home: OnboardingScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Verify on slide 1 and tap Skip
    expect(find.text('Skip'), findsOneWidget);
    await tester.tap(find.text('Skip'));
    await tester.pumpAndSettle();

    // Verify preference is saved and LoginIdentifierScreen is displayed
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getBool('has_seen_onboarding'), true);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);

    // Enter mobile number and tap Next to navigate to LoginScreen prefilled
    await tester.enterText(find.byType(TextFormField), '9876543210');
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();

    expect(find.text('Login'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, '9876543210'), findsOneWidget);
  });

  group('ApiService Production & URL Configuration Tests', () {
    test('Production constants and host resolution are properly configured', () {
      expect(ApiService.productionHost, 'https://fleet.speshway.site');
      expect(ApiService.productionApiUrl, 'https://fleet.speshway.site/api');
    });

    test('isLocalAddress accurately detects local and private IP addresses', () {
      expect(ApiService.isLocalAddress('http://localhost:5000/api'), isTrue);
      expect(ApiService.isLocalAddress('http://127.0.0.1:5000/api'), isTrue);
      expect(ApiService.isLocalAddress('http://10.0.2.2:5000/api'), isTrue);
      expect(ApiService.isLocalAddress('http://192.168.1.17:5000/api'), isTrue);
      expect(ApiService.isLocalAddress('http://10.166.118.1:5000/api'), isTrue);
      expect(ApiService.isLocalAddress('192.168.0.100'), isTrue);
      expect(ApiService.isLocalAddress('https://fleet.speshway.site/api'), isFalse);
      expect(ApiService.isLocalAddress('https://fleet.speshway.site'), isFalse);
    });

    test('formatServerUrl standardizes both local and production endpoints', () {
      expect(ApiService.formatServerUrl('fleet.speshway.site'), 'https://fleet.speshway.site/api');
      expect(ApiService.formatServerUrl('https://fleet.speshway.site'), 'https://fleet.speshway.site/api');
      expect(ApiService.formatServerUrl('https://fleet.speshway.site/api'), 'https://fleet.speshway.site/api');
      expect(ApiService.formatServerUrl('10.0.2.2:5000'), 'http://10.0.2.2:5000/api');
      expect(ApiService.formatServerUrl('localhost:5000/api'), 'http://localhost:5000/api');
    });

    test('getHostFromUrl extracts valid schemes and authorities', () {
      expect(ApiService.getHostFromUrl('https://fleet.speshway.site/api'), 'https://fleet.speshway.site');
      expect(ApiService.getHostFromUrl('http://10.0.2.2:5000/api'), 'http://10.0.2.2:5000');
      expect(ApiService.getHostFromUrl('http://localhost:5000/api'), 'http://localhost:5000');
    });
  });

  group('LoginIdentifierScreen UI & Navigation Tests', () {
    testWidgets('Displays tagline, Login heading, single input and no skip or password', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LoginIdentifierScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Verify Tagline and Login heading
      expect(find.text('Drive Smarter, Manage Easier'), findsOneWidget);
      expect(find.text('Login'), findsOneWidget);

      // Verify Skip button is hidden
      expect(find.text('Skip'), findsNothing);

      // Verify label above field is hidden
      expect(find.text('Email or mobile number'), findsNothing);

      // Verify only ONE input field is present
      expect(find.byType(TextFormField), findsOneWidget);

      // Verify no password field or obscure text field is rendered
      expect(find.text('Password'), findsNothing);
      expect(find.byIcon(Icons.visibility_rounded), findsNothing);
      expect(find.byIcon(Icons.visibility_off_rounded), findsNothing);

      // Verify Next button
      expect(find.text('Next'), findsOneWidget);

      // Verify terms section and feature icons are removed
      expect(find.text('Terms & Conditions'), findsNothing);
      expect(find.text('Live GPS\nTracking'), findsNothing);
    });

    testWidgets('Validates empty and invalid inputs with error displayed outside field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LoginIdentifierScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Next with empty input
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
      expect(find.text('Please enter email or phone number'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline_rounded), findsOneWidget);

      // Enter invalid email
      await tester.enterText(find.byType(TextFormField), 'bad@domain');
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
      expect(find.text('Please enter a valid email address'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline_rounded), findsOneWidget);

      // Enter invalid phone number (too short)
      await tester.enterText(find.byType(TextFormField), '1234');
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
      expect(find.text('Please enter a valid email or phone number'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline_rounded), findsOneWidget);
    });

    testWidgets('Valid email input navigates to LoginScreen and pre-fills email field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
            ChangeNotifierProvider(create: (_) => NotificationProvider()),
          ],
          child: const MaterialApp(
            home: LoginIdentifierScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      if (find.byType(Checkbox).evaluate().isNotEmpty) {
        await tester.tap(find.byType(Checkbox));
        await tester.pumpAndSettle();
      }
      await tester.enterText(find.byType(TextFormField), 'pilot@fleetflow.com');
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // Verify LoginScreen is displayed
      expect(find.text('Login'), findsOneWidget);
      // Verify email field is pre-filled with the identifier
      expect(find.widgetWithText(TextFormField, 'pilot@fleetflow.com'), findsOneWidget);
      // Password field should now be present on LoginScreen
      expect(find.text('Enter your password'), findsOneWidget);
    });

    testWidgets('Valid phone number input navigates to LoginScreen and pre-fills phone field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
            ChangeNotifierProvider(create: (_) => NotificationProvider()),
          ],
          child: const MaterialApp(
            home: LoginIdentifierScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      if (find.byType(Checkbox).evaluate().isNotEmpty) {
        await tester.tap(find.byType(Checkbox));
        await tester.pumpAndSettle();
      }
      await tester.enterText(find.byType(TextFormField), '+91 9876543210');
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // Verify LoginScreen is displayed
      expect(find.text('Login'), findsOneWidget);
      // Verify email/phone field is pre-filled
      expect(find.widgetWithText(TextFormField, '+91 9876543210'), findsOneWidget);
    });

    testWidgets('Error message is placed outside field and clears upon input changes', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LoginIdentifierScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Next with empty input to trigger error outside field
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(find.text('Please enter email or phone number'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline_rounded), findsOneWidget);

      // Typing a character clears the error message
      await tester.enterText(find.byType(TextFormField), 'a');
      await tester.pumpAndSettle();

      expect(find.text('Please enter email or phone number'), findsNothing);
      expect(find.byIcon(Icons.error_outline_rounded), findsNothing);
    });
  });
}


