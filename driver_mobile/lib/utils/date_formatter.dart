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
  if (dateInput == null) return 'N/A';
  try {
    final String strInput = dateInput.toString();
    if (strInput.toLowerCase().contains('tomorrow') ||
        strInput.toLowerCase().contains('yesterday') ||
        strInput.toLowerCase().contains('today') ||
        strInput.toLowerCase().contains('scheduled')) {
      return strInput;
    }
    final DateTime dt = dateInput is DateTime
        ? dateInput
        : DateTime.parse(strInput).toLocal();
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

String formatNotificationTime(dynamic dateInput) {
  if (dateInput == null) return 'Just now';
  try {
    final DateTime dt = dateInput is DateTime
        ? dateInput
        : DateTime.parse(dateInput.toString()).toLocal();
    final Duration diff = DateTime.now().difference(dt);

    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';

    return formatIndianDate(dt);
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
