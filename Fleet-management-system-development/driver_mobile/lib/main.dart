import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

import 'theme/app_colors.dart';
import 'theme/app_theme.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main_navigation_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/notification_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Firebase initialization failed: $e');
  }
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
      ],
      child: MaterialApp(
        title: 'Fleet Driver Mobile',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        home: const AuthSessionWrapper(),
      ),
    );
  }
}

class AuthSessionWrapper extends StatefulWidget {
  const AuthSessionWrapper({super.key});

  @override
  State<AuthSessionWrapper> createState() => _AuthSessionWrapperState();
}

class _AuthSessionWrapperState extends State<AuthSessionWrapper> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AuthProvider>(context, listen: false).initializeSession();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (!auth.isSessionInitialized) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            ),
          );
        }
        if (auth.isAuthenticated && auth.driver != null) {
          return const MainNavigationScreen();
        }
        return const LoginScreen();
      },
    );
  }
}

class DesignSystemShowcaseScreen extends StatefulWidget {
  const DesignSystemShowcaseScreen({super.key});

  @override
  State<DesignSystemShowcaseScreen> createState() =>
      _DesignSystemShowcaseScreenState();
}

class _DesignSystemShowcaseScreenState
    extends State<DesignSystemShowcaseScreen> {
  int _currentNavIndex = 0;
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fleet Driver Mobile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.account_circle_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Section
            Text(
              'Design System',
              style: Theme.of(context).textTheme.displayLarge,
            ),
            const SizedBox(height: 4),
            Text(
              'Material 3 design system for the driver application.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const Divider(height: 32, color: AppColors.divider),

            // Typography Showcase
            _buildSectionHeader('TYPOGRAPHY SCALE'),
            _buildTypographyRow(
              context,
              'Heading 1',
              'Poppins Bold 28',
              Theme.of(context).textTheme.displayLarge!,
            ),
            _buildTypographyRow(
              context,
              'Heading 2',
              'Poppins SemiBold 24',
              Theme.of(context).textTheme.displayMedium!,
            ),
            _buildTypographyRow(
              context,
              'Heading 3',
              'Poppins Medium 20',
              Theme.of(context).textTheme.displaySmall!,
            ),
            _buildTypographyRow(
              context,
              'Body Large',
              'Nunito 16',
              Theme.of(context).textTheme.bodyLarge!,
            ),
            _buildTypographyRow(
              context,
              'Body Medium',
              'Nunito 14',
              Theme.of(context).textTheme.bodyMedium!,
            ),
            _buildTypographyRow(
              context,
              'Caption',
              'Nunito 12',
              Theme.of(context).textTheme.bodySmall!,
            ),

            const Divider(height: 32, color: AppColors.divider),

            // Buttons & CTAs Showcase
            _buildSectionHeader('BUTTONS & ACTIONS'),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                ElevatedButton(
                  onPressed: () {},
                  child: const Text('Primary Button'),
                ),
                FilledButton(
                  onPressed: () {},
                  child: const Text('Primary CTA (Orange)'),
                ),
                OutlinedButton(
                  onPressed: () {},
                  child: const Text('Outlined Button'),
                ),
                TextButton(onPressed: () {}, child: const Text('Text Action')),
              ],
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.directions_run),
              label: const Text('Start Active Trip'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 54),
              ),
            ),

            const Divider(height: 32, color: AppColors.divider),

            // Status Badges
            _buildSectionHeader('STATUS CHIPS & BADGES'),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildStatusChip('Completed', AppColors.success),
                _buildStatusChip('Pending', AppColors.warning),
                _buildStatusChip('Low Fuel', AppColors.error),
                _buildStatusChip('On Route', AppColors.info),
              ],
            ),

            const Divider(height: 32, color: AppColors.divider),

            // Cards Showcase
            _buildSectionHeader('CARDS & UTILITIES'),

            // Trip Card (Success State)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                // Using 8dp grid spacing
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Trip ID #92841',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        _buildStatusChip('Completed', AppColors.success),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildInfoRow(
                      context,
                      Icons.location_on_outlined,
                      'Origin: Portland Warehouse A',
                    ),
                    const SizedBox(height: 8),
                    _buildInfoRow(
                      context,
                      Icons.flag_outlined,
                      'Destination: Seattle Logistics Hub',
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Driver: Marcus Vance',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        Text(
                          'Distance: 174 miles',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Active Warning Card
            Card(
              color: AppColors.surface,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.warning_amber_rounded,
                          color: AppColors.error,
                          size: 24,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Vehicle Alert',
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(
                                color: AppColors.error,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tire pressure warning triggered in rear-left tire. Please stop at the next service depot.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),

            const Divider(height: 32, color: AppColors.divider),

            // Forms & Inputs
            _buildSectionHeader('INPUT FIELDS & FORMS'),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'Driver License Number',
                      hintText: 'Enter your 8-digit license',
                      prefixIcon: Icon(Icons.badge_outlined),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Security PIN',
                      hintText: 'Enter access code',
                      prefixIcon: Icon(Icons.lock_outline),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(
              height: 48,
            ), // Spacing before the bottom of the scroll view
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentNavIndex,
        onTap: (index) {
          setState(() {
            _currentNavIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.local_shipping_outlined),
            activeIcon: Icon(Icons.local_shipping),
            label: 'Trips',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings_outlined),
            activeIcon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        tooltip: 'Emergency Call',
        child: const Icon(Icons.phone_in_talk),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: AppColors.textSecondary,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildTypographyRow(
    BuildContext context,
    String label,
    String fontDetails,
    TextStyle style,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: Theme.of(context).textTheme.titleSmall),
                Text(
                  fontDetails,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textDisabled,
                  ),
                ),
              ],
            ),
          ),
          Expanded(flex: 7, child: Text('Fleet Navy', style: style)),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(76), width: 1),
      ),
      child: Text(
        label,
        style: GoogleFonts.nunito(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Expanded(
          child: Text(text, style: Theme.of(context).textTheme.bodyMedium),
        ),
      ],
    );
  }
}
