import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:driver_mobile/main.dart';
import 'package:driver_mobile/screens/vehicle_overview_screen.dart';
import 'package:driver_mobile/screens/vehicle_documents_screen.dart';
import 'package:driver_mobile/screens/vehicle_details_screen.dart';

void main() {
  testWidgets('Complete Authentication Navigation Flow Smoke Test', (
    WidgetTester tester,
  ) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

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

  testWidgets('Vehicle Overview Screen rendering and action tiles test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: VehicleOverviewScreen(),
      ),
    );

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

  testWidgets('Vehicle Documents Screen rendering and document list test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: VehicleDocumentsScreen(),
      ),
    );

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

  testWidgets('Vehicle Details Screen rendering and spec cards test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: VehicleDetailsScreen(),
      ),
    );

    // 1. Verify App Bar & Title
    expect(find.text('Vehicle Details'), findsOneWidget);

    // 2. Verify Basic Information Card 1
    expect(find.text('Basic Information'), findsOneWidget);
    expect(find.text('TS09AB4589'), findsOneWidget);
    expect(find.text('Reg: TS09AB4589'), findsOneWidget);
    expect(find.text('Heavy Duty Truck'), findsOneWidget);
    expect(find.text('Tata Motors'), findsOneWidget);
    expect(find.text('Prima 5530.S'), findsOneWidget);
    expect(find.text('2023'), findsOneWidget);
    expect(find.text('20 Tons'), findsNWidgets(2));
    expect(find.text('36 Tons'), findsNWidgets(2));

    // 3. Verify Operational Status Card 2
    expect(find.text('Vehicle Status'), findsOneWidget);
    expect(find.text('Active'), findsOneWidget);
    expect(find.text('Updated Today • 10:30 AM'), findsOneWidget);
    expect(find.text('TRP-9921'), findsOneWidget);
    expect(find.text('Assigned'), findsOneWidget);
    expect(find.text('Hyderabad, Telangana'), findsOneWidget);

    // 4. Verify Driver Information Card 3
    expect(find.text('Driver Information'), findsOneWidget);
    expect(find.text('Sai Kumar'), findsOneWidget);
    expect(find.text('EMP-1025'), findsOneWidget);
    expect(find.text('+91 9876543210'), findsOneWidget);
    expect(find.text('TS0920210012456'), findsOneWidget);

    // 5. Verify Technical Specifications Card 4
    expect(find.text('Technical Specifications'), findsOneWidget);
    expect(find.text('ENG-7721'), findsOneWidget);
    expect(find.text('CHS-1102'), findsOneWidget);
    expect(find.text('45,230 km'), findsOneWidget);
  });
}
