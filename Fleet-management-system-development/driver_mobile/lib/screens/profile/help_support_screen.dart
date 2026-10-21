import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../constants/app_colors.dart';
import '../../widgets/custom_app_bar.dart';
import '../../services/api_service.dart';

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  // FAQ Expanded statuses
  final List<bool> _faqExpanded = [false, false, false];

  final List<Map<String, String>> _faqs = const [
    {
      'question': 'How do I update my vehicle info?',
      'answer': 'You can update vehicle details under your Profile tab or contact fleet management support to register new vehicles.',
    },
    {
      'question': 'Where can I see my daily earnings?',
      'answer': 'Your daily, weekly, and trip earnings can be viewed on the dashboard and details inside the Trips tab.',
    },
    {
      'question': 'What if the app GPS is lagging?',
      'answer': 'Ensure you have a strong network connection, enable high accuracy location permissions, or restart the application.',
    },
  ];

  Map<String, dynamic>? _supportInfo;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadSupportInfo();
  }

  Future<void> _loadSupportInfo() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final response = await ApiService.get('/driver/support');
      if (response != null && response['success'] == true) {
        setState(() {
          _supportInfo = response['data'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response?['message'] ?? 'Failed to load support contact details';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _contactSupport(String channel) async {
    if (_supportInfo == null) return;
    
    if (channel == 'Live Chat') {
      final whatsapp = _supportInfo!['whatsapp'] ?? '';
      if (whatsapp.isNotEmpty) {
        final whatsappUrl = 'https://wa.me/${whatsapp.replaceAll(RegExp(r'[^\d+]'), '')}';
        final uri = Uri.parse(whatsappUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          // Fallback to email
          final email = _supportInfo!['email'] ?? 'support@fleetapp.com';
          final emailUri = Uri.parse('mailto:$email?subject=Driver%20Support');
          if (await canLaunchUrl(emailUri)) {
            await launchUrl(emailUri);
          }
        }
      }
    } else if (channel == 'Phone Call') {
      final phone = _supportInfo!['phone'] ?? '';
      if (phone.isNotEmpty) {
        final phoneUri = Uri.parse('tel:${phone.replaceAll(' ', '')}');
        if (await canLaunchUrl(phoneUri)) {
          await launchUrl(phoneUri);
        }
      }
    }
  }



  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final bool isSmallScreen = screenWidth < 375;
    final double paddingValue = isSmallScreen ? 16.0 : 20.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        centerTitle: false,
        titleSpacing: 0.0,
        backgroundColor: AppColors.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Help & Support',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        actions: [
          Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.only(right: 16.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8.0),
            ),
            padding: const EdgeInsets.all(4.0),
            child: Image.asset(
              'assets/logo.png',
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return const Icon(
                  Icons.local_shipping,
                  color: AppColors.primary,
                  size: 18,
                );
              },
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: EdgeInsets.symmetric(horizontal: paddingValue, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // "How can we help?"
              Text(
                'How can we help?',
                style: GoogleFonts.poppins(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),

              // Search Bar
              TextField(
                controller: _searchController,
                onChanged: (val) {
                  setState(() {
                    _searchQuery = val.toLowerCase();
                  });
                },
                style: GoogleFonts.nunito(
                  fontSize: 15,
                  color: AppColors.textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: 'Search for help articles...',
                  hintStyle: GoogleFonts.nunito(
                    color: AppColors.textDisabled,
                  ),
                  prefixIcon: const Icon(
                    Icons.search,
                    color: AppColors.textSecondary,
                  ),
                  fillColor: Colors.white,
                  filled: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 16.0),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                    borderSide: const BorderSide(color: AppColors.divider, width: 1.0),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                    borderSide: const BorderSide(color: AppColors.divider, width: 1.0),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.0),
                    borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // "Common Help Categories" Grid
              Text(
                'Common Help Categories',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 14),

              // Grid view
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.35,
                children: [
                  _buildCategoryCard(
                    title: 'App Basics',
                    subtitle: 'Setup & navigation',
                    icon: Icons.info_outline_rounded,
                  ),
                  _buildCategoryCard(
                    title: 'Vehicle Issues',
                    subtitle: 'Maintenance & logs',
                    icon: Icons.build_rounded,
                  ),
                  _buildCategoryCard(
                    title: 'Route Help',
                    subtitle: 'GPS & dispatching',
                    icon: Icons.map_outlined,
                  ),
                  _buildCategoryCard(
                    title: 'Payments',
                    subtitle: 'Earnings & rewards',
                    icon: Icons.payment_rounded,
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // "Frequently Asked Questions" Section
              Text(
                'Frequently Asked Questions',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 14),

              // FAQ Items
              ..._faqs.asMap().entries.map((entry) {
                final index = entry.key;
                final faq = entry.value;
                final question = faq['question']!;
                final answer = faq['answer']!;

                if (_searchQuery.isNotEmpty &&
                    !question.toLowerCase().contains(_searchQuery) &&
                    !answer.toLowerCase().contains(_searchQuery)) {
                  return const SizedBox.shrink();
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: _buildFAQCard(
                    index: index,
                    question: question,
                    answer: answer,
                  ),
                );
              }),
              const SizedBox(height: 24),

              // "Still need help?" Section Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: AppColors.primary, // Deep dark blue #0F1E36
                  borderRadius: BorderRadius.circular(16.0),
                ),
                child: _isLoading 
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 24.0),
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        ),
                      )
                    : _errorMessage != null
                        ? Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                'Still need help?',
                                style: GoogleFonts.poppins(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Could not load support contact details. Click below to retry.',
                                style: GoogleFonts.nunito(
                                  fontSize: 13.5,
                                  color: const Color(0xFF94A3B8),
                                ),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: _loadSupportInfo,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.secondary,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                ),
                                child: Text(
                                  'Retry Connection',
                                  style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          )
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                'Still need help?',
                                style: GoogleFonts.poppins(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Our fleet operations team (managed by ${_supportInfo?['dispatcherName'] ?? 'Operations'}) is available ${_supportInfo?['workingHours'] ?? '24/7'} to assist you with any on-road issues.',
                                style: GoogleFonts.nunito(
                                  fontSize: 13.5,
                                  color: const Color(0xFF94A3B8), // slate-400
                                  height: 1.45,
                                ),
                              ),
                              const SizedBox(height: 20),

                              // Chat Button
                              if (_supportInfo?['whatsapp'] != null && _supportInfo!['whatsapp'].toString().isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: ElevatedButton.icon(
                                    onPressed: () => _contactSupport('Live Chat'),
                                    icon: const Icon(
                                      Icons.chat_bubble_outline_rounded,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                    label: Text(
                                      'Chat on WhatsApp',
                                      style: GoogleFonts.poppins(
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.secondary, // Fleet Orange
                                      minimumSize: const Size(double.infinity, 50),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12.0),
                                      ),
                                      elevation: 0,
                                    ),
                                  ),
                                ),

                              // Call Support Button
                              if (_supportInfo?['phone'] != null && _supportInfo!['phone'].toString().isNotEmpty)
                                OutlinedButton.icon(
                                  onPressed: () => _contactSupport('Phone Call'),
                                  icon: const Icon(
                                    Icons.phone_outlined,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                  label: Text(
                                    'Call Support (${_supportInfo?['phone']})',
                                    style: GoogleFonts.poppins(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: Color(0xFF475569), width: 1.5), // slate-600
                                    minimumSize: const Size(double.infinity, 50),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12.0),
                                    ),
                                    backgroundColor: Colors.transparent,
                                  ),
                                ),
                            ],
                          ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryCard({
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: const Color(0xFFEAECF0), width: 1.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFF2F4F7),
              borderRadius: BorderRadius.circular(10.0),
            ),
            child: Icon(
              icon,
              color: const Color(0xFFE05638), // Mockup red-orange tone
              size: 20,
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.poppins(
                  fontSize: 14.0,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: GoogleFonts.nunito(
                  fontSize: 11.5,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFAQCard({
    required int index,
    required String question,
    required String answer,
  }) {
    final bool isExpanded = _faqExpanded[index];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: const Color(0xFFEAECF0), width: 1.0),
      ),
      child: Column(
        children: [
          ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 2.0),
            title: Text(
              question,
              style: GoogleFonts.poppins(
                fontSize: 14.5,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            trailing: Icon(
              isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
              color: AppColors.textSecondary,
            ),
            onTap: () {
              setState(() {
                _faqExpanded[index] = !isExpanded;
              });
            },
          ),
          if (isExpanded) ...[
            const Divider(color: AppColors.divider, height: 1),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
              child: Text(
                answer,
                style: GoogleFonts.nunito(
                  fontSize: 13.5,
                  color: AppColors.textSecondary,
                  height: 1.45,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }


}
