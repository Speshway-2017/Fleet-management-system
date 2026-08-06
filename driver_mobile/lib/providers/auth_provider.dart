import 'package:flutter/material.dart';
import '../repositories/auth_repository.dart';
import '../models/driver_model.dart';
import '../screens/settings/notification_settings_screen.dart';
import '../services/socket_service.dart';

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
        final profile = await _authRepository.fetchProfile();
        if (profile != null) {
          _driver = profile;
          _syncNotificationPreferences();
          _isAuthenticated = true;
          SocketService.initSocket();
        } else {
          _isAuthenticated = false;
          await _authRepository.logout();
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
      final data = await _authRepository.login(identifier, password);
      if (data['driver'] != null) {
        _driver = DriverModel.fromJson(data['driver']);
        _syncNotificationPreferences();
      }
      _isAuthenticated = true;
      if (_driver != null) {
        SocketService.initSocket();
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
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authRepository.logout();
      _driver = null;
      _isAuthenticated = false;
      SocketService.disconnect();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
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
        _driver = profile;
        _syncNotificationPreferences();
        _isAuthenticated = true;
      } else {
        _isAuthenticated = false;
        await _authRepository.logout();
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      if (e.toString().contains('401') || e.toString().contains('Unauthorized') || e.toString().contains('unauthorized')) {
        _isAuthenticated = false;
        await _authRepository.logout();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final profile = await _authRepository.updateProfile(data);
      if (profile != null) {
        _driver = profile;
        _syncNotificationPreferences();
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      if (e.toString().contains('401') || e.toString().contains('Unauthorized') || e.toString().contains('unauthorized')) {
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
      if (e.toString().contains('401') || e.toString().contains('Unauthorized') || e.toString().contains('unauthorized')) {
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
