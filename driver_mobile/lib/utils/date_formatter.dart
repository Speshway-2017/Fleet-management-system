String formatIndianDateTime(String? dateTimeStr) {
  if (dateTimeStr == null || dateTimeStr.isEmpty) return 'N/A';
  try {
    // If it already matches custom words, return as is
    if (dateTimeStr.toLowerCase().contains('tomorrow') ||
        dateTimeStr.toLowerCase().contains('yesterday') ||
        dateTimeStr.toLowerCase().contains('today') ||
        dateTimeStr.toLowerCase().contains('scheduled')) {
      return dateTimeStr;
    }
    
    // Support parsing strings like "2026-07-31T21:00"
    final parsedDate = DateTime.parse(dateTimeStr).toLocal();
    final day = parsedDate.day.toString().padLeft(2, '0');
    final month = parsedDate.month.toString().padLeft(2, '0');
    final year = parsedDate.year;
    
    int hour = parsedDate.hour;
    final minutes = parsedDate.minute.toString().padLeft(2, '0');
    final period = hour >= 12 ? 'PM' : 'AM';
    
    hour = hour % 12;
    if (hour == 0) hour = 12;
    final hourStr = hour.toString().padLeft(2, '0');
    
    return '$day-$month-$year $hourStr:$minutes $period';
  } catch (e) {
    return dateTimeStr;
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
    if (hour == 0) hour = 12;
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
