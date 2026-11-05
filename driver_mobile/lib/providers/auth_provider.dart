import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../repositories/auth_repository.dart';
import '../models/driver_model.dart';
import '../screens/settings/notification_settings_screen.dart';
import '../services/socket_service.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/dashboard_screen.dart';
import '../services/localization_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository = AuthRepository();

  AuthProvider();

  DriverModel? _driver;
  bool _isLoading = false;
  bool _isSessionInitialized = false;
  String? _errorMessage;
  bool _isAuthenticated = false;
  String? _forgotPasswordEmail;
  String? _verifiedOtp;

  DriverModel? get driver => _driver;
  bool get isLoading => _isLoading;
  bool get isSessionInitialized => _isSessionInitialized;
  String? get errorMessage => _errorMessage;
  String? get isAuthenticatedVal => _errorMessage; // keep other getters
  bool get isAuthenticated => _isAuthenticated;
  String? get forgotPasswordEmail => _forgotPasswordEmail;
  String? get verifiedOtp => _verifiedOtp;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void setForgotPasswordEmail(String email) {
    _forgotPasswordEmail = email;
  }

  void setVerifiedOtp(String otp) {
    _verifiedOtp = otp;
  }

  Future<void> initializeSession() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final hasToken = await _authRepository.hasToken();
      if (hasToken) {
        final prefs = await SharedPreferences.getInstance();
        final savedLanguage = prefs.getString('app_language');
        if (savedLanguage != null && savedLanguage.isNotEmpty) {
          LocalizationService.setLanguage(savedLanguage);
        }
        final cachedProfileStr = prefs.getString('driver_profile');
        if (cachedProfileStr != null && cachedProfileStr.isNotEmpty) {
          try {
            var model = DriverModel.fromJson(jsonDecode(cachedProfileStr));
            if (savedLanguage != null && savedLanguage.isNotEmpty) {
              model = model.copyWith(language: savedLanguage);
            }
            _driver = model;
            _syncNotificationPreferences();
            _isAuthenticated = true;
            ProfileState.profilePhotoUrlNotifier.value = _driver?.profileImage ?? '';
            SocketService.initSocket();
          } catch (_) {}
        }

        try {
          final profile = await _authRepository.fetchProfile();
          if (profile != null) {
            if (savedLanguage != null && savedLanguage.isNotEmpty) {
              _driver = profile.copyWith(language: savedLanguage);
            } else {
              _driver = profile;
              if (profile.language.isNotEmpty) {
                await prefs.setString('app_language', profile.language);
              }
            }
            _syncNotificationPreferences();
            _isAuthenticated = true;
            ProfileState.profilePhotoUrlNotifier.value = profile.profileImage;
            SocketService.initSocket();
          } else {
            _isAuthenticated = false;
            await _authRepository.logout();
          }
        } catch (e) {
          debugPrint('Failed to refresh profile on initialization: $e');
          if (e.toString().contains('401') || e.toString().contains('Unauthorized') || e.toString().contains('unauthorized')) {
            _isAuthenticated = false;
            await _authRepository.logout();
          } else {
            // Keep the cached profile session active
            if (_driver != null) {
              _isAuthenticated = true;
              SocketService.initSocket();
            } else {
              _isAuthenticated = false;
              await _authRepository.logout();
            }
          }
        }
      } else {
        _isAuthenticated = false;
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isAuthenticated = false;
      await _authRepository.logout();
    } finally {
      _isLoading = false;
      _isSessionInitialized = true;
      notifyListeners();
    }
  }

  Future<bool> login(String identifier, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      DashboardScreen.clearStaticCache();
      final data = await _authRepository.login(identifier, password);
      if (data['driver'] != null) {
        _driver = DriverModel.fromJson(data['driver']);
        final prefs = await SharedPreferences.getInstance();
        final savedLanguage = prefs.getString('app_language');
        if (savedLanguage != null && savedLanguage.isNotEmpty) {
          _driver = _driver!.copyWith(language: savedLanguage);
          LocalizationService.setLanguage(savedLanguage);
        } else if (_driver!.language.isNotEmpty) {
          LocalizationService.setLanguage(_driver!.language);
          await prefs.setString('app_language', _driver!.language);
        }
        _syncNotificationPreferences();
        ProfileState.profilePhotoUrlNotifier.value = _driver?.profileImage ?? '';
      }
      _isAuthenticated = true;
      if (_driver != null) {
        SocketService.connect(_driver!.id);
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isAuthenticated = false;
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> logout() async {
    _isLoading = false;
    _errorMessage = null;

    try {
      // Fire-and-forget FCM Token reset (do not await)
      _authRepository.updateProfile({'fcmToken': ''}).catchError((_) => null);

      // Perform immediate local storage purge
      await _authRepository.logout();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    } finally {
      _driver = null;
      _isAuthenticated = false;
      _isSessionInitialized = true;
      ProfileState.profilePhotoUrlNotifier.value = '';
      DashboardScreen.clearStaticCache();
      SocketService.disconnect();
      _isLoading = false;
      notifyListeners();
    }
    return true;
  }

  Future<bool> forgotPassword(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authRepository.forgotPassword(email);
      _forgotPasswordEmail = email;
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isAuthenticated = false;
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> verifyOtp(String otp) async {
    if (_forgotPasswordEmail == null) {
      _errorMessage = 'Email address is missing. Please restart forgot password.';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authRepository.verifyOtp(_forgotPasswordEmail!, otp);
      _verifiedOtp = otp;
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> resetPassword(String newPassword) async {
    if (_forgotPasswordEmail == null || _verifiedOtp == null) {
      _errorMessage = 'Session expired. Please restart forgot password process.';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authRepository.resetPassword(_forgotPasswordEmail!, _verifiedOtp!, newPassword);
      _forgotPasswordEmail = null;
      _verifiedOtp = null;
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _syncNotificationPreferences() {
    if (_driver != null) {
      NotificationSettingsState.routeChanges = _driver!.routeChanges;
      NotificationSettingsState.trafficWarnings = _driver!.trafficWarnings;
      NotificationSettingsState.healthAlertes = _driver!.healthAlertes;
      NotificationSettingsState.fuelWarnings = _driver!.fuelWarnings;
      NotificationSettingsState.emergencyAlerts = _driver!.emergencyAlerts;
      NotificationSettingsState.tripUpdates = _driver!.tripUpdates;
      NotificationSettingsState.sound = _driver!.sound;
      NotificationSettingsState.vibration = _driver!.vibration;
      NotificationSettingsState.pushNotifications = _driver!.pushNotifications;
      NotificationSettingsState.emailNotifications = _driver!.emailNotifications;
      NotificationSettingsState.smsNotifications = _driver!.smsNotifications;
    }
  }

  Future<void> refreshProfile() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final profile = await _authRepository.fetchProfile();
      if (profile != null) {
        final prefs = await SharedPreferences.getInstance();
        final savedLanguage = prefs.getString('app_language');
        if (savedLanguage != null && savedLanguage.isNotEmpty) {
          _driver = profile.copyWith(language: savedLanguage);
          LocalizationService.setLanguage(savedLanguage);
        } else {
          _driver = profile;
          if (profile.language.isNotEmpty) {
            LocalizationService.setLanguage(profile.language);
            await prefs.setString('app_language', profile.language);
          }
        }
        _syncNotificationPreferences();
        _isAuthenticated = true;
        ProfileState.profilePhotoUrlNotifier.value = profile.profileImage;
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      if (e.toString().contains('401') ||
          e.toString().contains('Unauthorized') ||
          e.toString().contains('unauthorized') ||
          e.toString().contains('No token provided')) {
        _isAuthenticated = false;
        await _authRepository.logout();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> setLanguage(String lang) async {
    final normalized = LocalizationService.normalizeLanguage(lang);

    // 0. Update localization service immediately for real-time translation across all screens
    LocalizationService.setLanguage(normalized);

    // 1. Immediate optimistic UI update
    if (_driver != null) {
      _driver = _driver!.copyWith(language: normalized);
    }
    notifyListeners();

    // 2. Persist locally to SharedPreferences
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('app_language', normalized);
      if (_driver != null) {
        await prefs.setString('driver_profile', jsonEncode(_driver!.toJson()));
      }
    } catch (e) {
      debugPrint('[AuthProvider] Error persisting app_language: $e');
    }

    // 3. Asynchronously sync to backend
    try {
      final profile = await _authRepository.updateProfile({'language': normalized});
      if (profile != null) {
        _driver = profile.copyWith(language: normalized);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('app_language', normalized);
        await prefs.setString('driver_profile', jsonEncode(_driver!.toJson()));
        notifyListeners();
      }
      return true;
    } catch (e) {
      debugPrint('[AuthProvider] Background remote language sync note: $e');
      return true;
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final token = await _authRepository.getToken();
      if (token == null || token.trim().isEmpty) {
        _errorMessage = 'Authentication token is missing. Please log in again.';
        _isAuthenticated = false;
        await _authRepository.logout();
        return false;
      }

      final prefs = await SharedPreferences.getInstance();
      final savedLanguage = prefs.getString('app_language') ?? _driver?.language ?? LocalizationService.currentLanguage;
      if (!data.containsKey('language') && savedLanguage.isNotEmpty) {
        data['language'] = savedLanguage;
      }

      final profile = await _authRepository.updateProfile(data);
      if (profile != null) {
        final activeLang = savedLanguage.isNotEmpty ? savedLanguage : profile.language;
        _driver = profile.copyWith(language: activeLang);
        if (activeLang.isNotEmpty) {
          LocalizationService.setLanguage(activeLang);
          await prefs.setString('app_language', activeLang);
          await prefs.setString('driver_profile', jsonEncode(_driver!.toJson()));
        }
        _syncNotificationPreferences();
        ProfileState.profilePhotoUrlNotifier.value = profile.profileImage;
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      if (e.toString().contains('401') ||
          e.toString().contains('Unauthorized') ||
          e.toString().contains('unauthorized') ||
          e.toString().contains('No token provided')) {
        _isAuthenticated = false;
        await _authRepository.logout();
      }
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> changePassword(String oldPassword, String newPassword) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authRepository.changePassword(oldPassword, newPassword);
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      if (e.toString().contains('401') ||
          e.toString().contains('Unauthorized') ||
          e.toString().contains('unauthorized') ||
          e.toString().contains('No token provided')) {
        _isAuthenticated = false;
        await _authRepository.logout();
      }
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
