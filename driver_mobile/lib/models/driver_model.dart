class DriverModel {
  final String id;
  final String employeeId;
  final String fullName;
  final String email;
  final String phoneNumber;
  final String licenseNumber;
  final String licenseType;
  final String licenseExpiry;
  final String assignedVehicle;
  final String driverStatus;
  final bool isOnline;
  final String profileImage;
  final String branch;
  final String experience;
  final String organization;
  final String address;
  final String joiningDate;
  final String dob;
  final int performanceScore;
  final int tripsCompleted;
  final ManagerModel? manager;

  // Settings & 2FA
  final bool twoFactorEnabled;
  final String twoFactorMethod;
  final String twoFactorPhone;
  final List<String> recoveryCodes;
  final String language;
  final bool isDarkMode;
  final String fcmToken;

  // Notification Preferences
  final bool routeChanges;
  final bool trafficWarnings;
  final bool healthAlertes;
  final bool fuelWarnings;
  final bool emergencyAlerts;
  final bool tripUpdates;
  final bool sound;
  final bool vibration;
  final bool pushNotifications;
  final bool emailNotifications;
  final bool smsNotifications;

  DriverModel({
    required this.id,
    required this.employeeId,
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    required this.licenseNumber,
    required this.licenseType,
    required this.licenseExpiry,
    required this.assignedVehicle,
    required this.driverStatus,
    required this.isOnline,
    required this.profileImage,
    required this.branch,
    required this.experience,
    required this.organization,
    required this.address,
    required this.joiningDate,
    required this.dob,
    required this.performanceScore,
    required this.tripsCompleted,
    this.manager,
    required this.twoFactorEnabled,
    required this.twoFactorMethod,
    required this.twoFactorPhone,
    required this.recoveryCodes,
    required this.language,
    required this.isDarkMode,
    required this.fcmToken,
    required this.routeChanges,
    required this.trafficWarnings,
    required this.healthAlertes,
    required this.fuelWarnings,
    required this.emergencyAlerts,
    required this.tripUpdates,
    required this.sound,
    required this.vibration,
    required this.pushNotifications,
    required this.emailNotifications,
    required this.smsNotifications,
  });

  factory DriverModel.fromJson(Map<String, dynamic> json) {
    bool parseBool(dynamic val, bool fallback) {
      if (val == null) return fallback;
      if (val is bool) return val;
      return val.toString() == 'true' || val.toString() == '1';
    }

    // Check if it's the raw MongoDB model format or the profile response format
    final String idVal = json['_id'] ?? json['id'] ?? json['driverId'] ?? '';
    final String employeeIdVal = json['employeeId'] ?? idVal;
    final String nameVal = (json['fullName'] != null && json['fullName'].toString().isNotEmpty)
        ? json['fullName'].toString()
        : (json['name'] != null && json['name'].toString().isNotEmpty)
            ? json['name'].toString()
            : (json['driverName'] != null && json['driverName'].toString().isNotEmpty)
                ? json['driverName'].toString()
                : (json['driver'] is Map && json['driver']['fullName'] != null)
                    ? json['driver']['fullName'].toString()
                    : '';
    final String emailVal = json['email'] ?? '';
    final String phoneVal = json['phoneNumber'] ?? json['phone'] ?? '';
    final String licNum = json['licenseNumber'] ?? '';
    final String licType = json['licenseType'] ?? 'HMV';
    final String licExpiryVal = json['licenseExpiry'] != null ? json['licenseExpiry'].toString() : '';
    final String vehVal = json['assignedVehicle'] ?? json['vehicle'] ?? 'Unassigned';
    final String statusVal = json['driverStatus'] ?? 'OFFLINE';
    final bool isOnlineVal = json['isOnline'] is bool
        ? (json['isOnline'] as bool)
        : (json['isOnline'] != null
            ? (json['isOnline'].toString() == 'true' || json['isOnline'].toString() == '1')
            : (statusVal != 'OFFLINE' && statusVal != 'OFF_DUTY'));
    final String imgVal = json['profileImage'] ?? '';
    final String branchVal = json['branch'] ?? '';
    final String expVal = json['experience'] ?? '';
    final String orgVal = json['organization'] ?? '';
    final String addressVal = json['address'] ?? '';
    final String joiningDateVal = json['joiningDate'] != null ? json['joiningDate'].toString() : '';
    final String dobVal = json['dob'] != null ? json['dob'].toString() : '';
    
    final int perfVal = json['performanceScore'] != null 
        ? (num.tryParse(json['performanceScore'].toString())?.toInt() ?? 95) 
        : 95;
    final int tripsVal = json['tripsCompleted'] != null 
        ? (num.tryParse(json['tripsCompleted'].toString())?.toInt() ?? 0) 
        : 0;

    ManagerModel? managerVal;
    if (json['manager'] != null) {
      managerVal = ManagerModel.fromJson(json['manager']);
    } else if (json['assignedManager'] != null) {
      if (json['assignedManager'] is Map) {
        managerVal = ManagerModel.fromJson(json['assignedManager']);
      } else {
        managerVal = ManagerModel(id: json['assignedManager'].toString(), name: '', phone: '', email: '');
      }
    }

    final bool twoFactorEnabledVal = parseBool(json['twoFactorEnabled'], false);
    final String twoFactorMethodVal = json['twoFactorMethod'] ?? 'SMS';
    final String twoFactorPhoneVal = json['twoFactorPhone'] ?? '';
    final List<String> recoveryCodesVal = json['recoveryCodes'] != null 
        ? List<String>.from(json['recoveryCodes']) 
        : <String>[];
    final String languageVal = json['language'] ?? 'English (US)';
    final bool isDarkModeVal = parseBool(json['isDarkMode'], false);
    final String fcmTokenVal = json['fcmToken'] ?? '';

    final Map<String, dynamic> notifPrefs = json['notificationPreferences'] is Map 
        ? Map<String, dynamic>.from(json['notificationPreferences']) 
        : {};
    final bool routeChangesVal = parseBool(notifPrefs['routeChanges'], true);
    final bool trafficWarningsVal = parseBool(notifPrefs['trafficWarnings'], true);
    final bool healthAlertesVal = parseBool(notifPrefs['healthAlertes'], true);
    final bool fuelWarningsVal = parseBool(notifPrefs['fuelWarnings'], true);
    final bool emergencyAlertsVal = parseBool(notifPrefs['emergencyAlerts'], true);
    final bool tripUpdatesVal = parseBool(notifPrefs['tripUpdates'], true);
    final bool soundVal = parseBool(notifPrefs['sound'], true);
    final bool vibrationVal = parseBool(notifPrefs['vibration'], true);
    final bool pushNotificationsVal = parseBool(notifPrefs['pushNotifications'], true);
    final bool emailNotificationsVal = parseBool(notifPrefs['emailNotifications'], false);
    final bool smsNotificationsVal = parseBool(notifPrefs['smsNotifications'], true);

    return DriverModel(
      id: idVal,
      employeeId: employeeIdVal,
      fullName: nameVal,
      email: emailVal,
      phoneNumber: phoneVal,
      licenseNumber: licNum,
      licenseType: licType,
      licenseExpiry: licExpiryVal,
      assignedVehicle: vehVal,
      driverStatus: statusVal,
      isOnline: isOnlineVal,
      profileImage: imgVal,
      branch: branchVal,
      experience: expVal,
      organization: orgVal,
      address: addressVal,
      joiningDate: joiningDateVal,
      dob: dobVal,
      performanceScore: perfVal,
      tripsCompleted: tripsVal,
      manager: managerVal,
      twoFactorEnabled: twoFactorEnabledVal,
      twoFactorMethod: twoFactorMethodVal,
      twoFactorPhone: twoFactorPhoneVal,
      recoveryCodes: recoveryCodesVal,
      language: languageVal,
      isDarkMode: isDarkModeVal,
      fcmToken: fcmTokenVal,
      routeChanges: routeChangesVal,
      trafficWarnings: trafficWarningsVal,
      healthAlertes: healthAlertesVal,
      fuelWarnings: fuelWarningsVal,
      emergencyAlerts: emergencyAlertsVal,
      tripUpdates: tripUpdatesVal,
      sound: soundVal,
      vibration: vibrationVal,
      pushNotifications: pushNotificationsVal,
      emailNotifications: emailNotificationsVal,
      smsNotifications: smsNotificationsVal,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employeeId': employeeId,
      'fullName': fullName,
      'email': email,
      'phoneNumber': phoneNumber,
      'licenseNumber': licenseNumber,
      'licenseType': licenseType,
      'licenseExpiry': licenseExpiry,
      'assignedVehicle': assignedVehicle,
      'driverStatus': driverStatus,
      'profileImage': profileImage,
      'branch': branch,
      'experience': experience,
      'organization': organization,
      'address': address,
      'joiningDate': joiningDate,
      'dob': dob,
      'performanceScore': performanceScore,
      'tripsCompleted': tripsCompleted,
      'manager': manager?.toJson(),
      'twoFactorEnabled': twoFactorEnabled,
      'twoFactorMethod': twoFactorMethod,
      'twoFactorPhone': twoFactorPhone,
      'recoveryCodes': recoveryCodes,
      'language': language,
      'isDarkMode': isDarkMode,
      'fcmToken': fcmToken,
      'notificationPreferences': {
        'routeChanges': routeChanges,
        'trafficWarnings': trafficWarnings,
        'healthAlertes': healthAlertes,
        'fuelWarnings': fuelWarnings,
        'emergencyAlerts': emergencyAlerts,
        'tripUpdates': tripUpdates,
        'sound': sound,
        'vibration': vibration,
        'pushNotifications': pushNotifications,
        'emailNotifications': emailNotifications,
        'smsNotifications': smsNotifications,
      },
    };
  }
}

class ManagerModel {
  final String id;
  final String name;
  final String phone;
  final String email;

  ManagerModel({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
  });

  factory ManagerModel.fromJson(Map<String, dynamic> json) {
    return ManagerModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? json['phoneNumber'] ?? '',
      email: json['email'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
    };
  }
}
