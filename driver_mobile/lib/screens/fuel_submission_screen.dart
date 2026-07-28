import 'package:flutter/material.dart';
import 'add_fuel_entry_screen.dart';

/// Driver Module - Fuel Submission Screen (Merged single-screen view)
/// 
/// Serves as the primary entry point for the Driver Fuel module, displaying the unified
/// Add Fuel Entry form with vehicle metadata, form inputs, inline receipt upload,
/// receipt preview, and submit/reset CTA buttons on a single page.
class FuelSubmissionScreen extends StatelessWidget {
  const FuelSubmissionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AddFuelEntryScreen();
  }
}
