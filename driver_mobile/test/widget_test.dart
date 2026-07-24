import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:driver_mobile/main.dart';

void main() {
  testWidgets('Complete Authentication Navigation Flow Smoke Test', (WidgetTester tester) async {
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
    expect(find.text('Verify OTP'), findsNWidgets(2)); // "Verify OTP" header + "Verify OTP" button

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

  testWidgets('Reset Password Screen submission and validation', (WidgetTester tester) async {
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
    final resetButtonFinder = find.widgetWithText(ElevatedButton, 'Reset Password');
    final resetButtonWidget = tester.widget<ElevatedButton>(resetButtonFinder);
    expect(resetButtonWidget.onPressed, isNotNull);

    // Tap Reset Password
    await tester.ensureVisible(resetButtonFinder);
    await tester.tap(resetButtonFinder);
    await tester.pumpAndSettle();

    // Verify we are back on the Login Screen
    expect(find.text('Welcome back'), findsOneWidget);
  });

  testWidgets('Successful Login Navigation Flow to Dashboard', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify Login Screen is loaded
    expect(find.text('Fleet Management'), findsOneWidget);
    expect(find.text('Welcome back'), findsOneWidget);

    // Enter credentials
    await tester.enterText(find.byType(TextFormField).at(0), 'manager@fleetpro.com');
    await tester.enterText(find.byType(TextFormField).at(1), '1234456');
    await tester.pump();

    // Tap Login Button
    await tester.tap(find.text('LOGIN'));
    await tester.pumpAndSettle();

    // Verify Dashboard Screen is loaded
    expect(find.text('Good Morning, Satya'), findsOneWidget);
  });

  testWidgets('Autofill OTP fields when a 6-digit code is pasted', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    // Navigate to Forgot Password
    await tester.tap(find.text('Forgot Password?'));
    await tester.pumpAndSettle();

    // Fill email and submit
    await tester.enterText(find.byType(TextFormField), 'test@fleetpro.com');
    await tester.pump();
    await tester.tap(find.text('Send OTP'));
    await tester.pumpAndSettle();

    // Verify OTP Verification Screen is loaded
    expect(find.text('OTP Verification'), findsOneWidget);

    // Paste a 6-digit OTP code into the first TextFormField
    await tester.enterText(find.byType(TextFormField).at(0), '987654');
    await tester.pumpAndSettle();

    // Verify all 6 TextFormFields are filled with the individual digits
    for (int i = 0; i < 6; i++) {
      final field = tester.widget<TextFormField>(find.byType(TextFormField).at(i));
      expect(field.controller?.text, '987654'[i]);
    }
  });
}
