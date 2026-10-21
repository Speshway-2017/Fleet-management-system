// Indian Date & Time Formatter Utilities

String formatIndianDate(dynamic dateInput) {
  if (dateInput == null) return 'N/A';
  try {
    final DateTime dt = dateInput is DateTime
        ? dateInput
        : DateTime.parse(dateInput.toString()).toLocal();
    final day = dt.day.toString().padLeft(2, '0');
    final month = dt.month.toString().padLeft(2, '0');
    final year = dt.year;
    return '$day/$month/$year';
  } catch (_) {
    return dateInput.toString();
  }
}

String formatIndianDateTime(dynamic dateInput) {
  if (dateInput == null || dateInput.toString().isEmpty) return 'N/A';
  try {
    final str = dateInput.toString();
    if (str.toLowerCase().contains('tomorrow') ||
        str.toLowerCase().contains('yesterday') ||
        str.toLowerCase().contains('today') ||
        str.toLowerCase().contains('scheduled')) {
      return str;
    }
    final DateTime dt = dateInput is DateTime
        ? dateInput
        : DateTime.parse(str).toLocal();
    final day = dt.day.toString().padLeft(2, '0');
    final month = dt.month.toString().padLeft(2, '0');
    final year = dt.year;

    int hour = dt.hour;
    final period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour == 0) hour = 12;
    final hourStr = hour.toString().padLeft(2, '0');
    final minuteStr = dt.minute.toString().padLeft(2, '0');

    return '$day/$month/$year $hourStr:$minuteStr $period';
  } catch (_) {
    return dateInput.toString();
  }
}

String formatNotificationTime(String? dateStr) {
  if (dateStr == null || dateStr.isEmpty) return 'Just now';
  try {
    final parsedDate = DateTime.parse(dateStr).toLocal();
    int hour = parsedDate.hour;
    final minutes = parsedDate.minute.toString().padLeft(2, '0');
    final period = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12;
    final hourStr = hour.toString().padLeft(2, '0');

    final now = DateTime.now();
    if (parsedDate.year == now.year && parsedDate.month == now.month && parsedDate.day == now.day) {
      return '$hourStr:$minutes $period';
    } else {
      final day = parsedDate.day.toString().padLeft(2, '0');
      final month = parsedDate.month.toString().padLeft(2, '0');
      final year = parsedDate.year;
      return '$day-$month-$year $hourStr:$minutes $period';
    }
  } catch (_) {
    return 'Just now';
  }
}

String getNotificationCategory(String? dateStr) {
  if (dateStr == null || dateStr.isEmpty) return 'TODAY';
  try {
    final parsedDate = DateTime.parse(dateStr).toLocal();
    final now = DateTime.now();
    if (parsedDate.year == now.year && parsedDate.month == now.month && parsedDate.day == now.day) {
      return 'TODAY';
    }
    return 'YESTERDAY';
  } catch (_) {
    return 'TODAY';
  }
}
