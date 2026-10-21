import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class WindingRouteIcon extends StatelessWidget {
  final double size;
  final Color color;

  const WindingRouteIcon({
    super.key,
    this.size = 28.0,
    this.color = AppColors.secondary,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _WindingRoutePainter(color: color),
    );
  }
}

class _WindingRoutePainter extends CustomPainter {
  final Color color;

  _WindingRoutePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round;

    final dotPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();
    
    final w = size.width;
    final h = size.height;
    
    // We will use 4px margin for circles
    final double margin = 4.0;
    
    final double left = margin;
    final double middle = w / 2;
    final double right = w - margin;
    
    final double top = margin;
    final double bottom = h - margin;
    
    // Corner radius for the curves
    final double radius = (middle - left) / 2;
    
    // Draw the starting dot at (left, top)
    canvas.drawCircle(Offset(left, top), 3.5, dotPaint);
    
    // Move path to start just below the dot
    path.moveTo(left, top + 3.5);
    
    // Line down to bottom-left curve start
    path.lineTo(left, bottom - radius);
    
    // Bottom-left curve (U-turn bottom-left to middle-bottom)
    path.quadraticBezierTo(left, bottom, left + radius, bottom);
    path.quadraticBezierTo(middle, bottom, middle, bottom - radius);
    
    // Line up to middle-top curve start
    path.lineTo(middle, top + radius);
    
    // Top-right curve (n-turn middle-top to right-top)
    path.quadraticBezierTo(middle, top, middle + radius, top);
    path.quadraticBezierTo(right, top, right, top + radius);
    
    // Line down to bottom-right circle
    path.lineTo(right, bottom - 3.5);
    
    canvas.drawPath(path, paint);
    
    // Draw the ending dot at (right, bottom)
    canvas.drawCircle(Offset(right, bottom), 3.5, dotPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
