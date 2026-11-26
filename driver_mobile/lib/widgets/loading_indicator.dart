import 'dart:math' as math;
import 'package:flutter/material.dart';

/// A realistic animated delivery truck loading widget.
/// Features:
/// - Fixed vehicle position in the middle of the screen/container
/// - Rotating wheels with rim spokes
/// - Stacked cargo boxes on the truck bed bouncing up and down independently
/// - Micro-vibrating truck body simulating road travel
/// - Moving dashed road lines traveling right-to-left underneath wheels
class LoadingIndicator extends StatefulWidget {
  final double size;
  final bool isLight;
  final Color? color;
  final String? loadingText;
  final bool showText;

  const LoadingIndicator({
    super.key,
    this.size = 64.0,
    this.isLight = false,
    this.color,
    this.loadingText = 'Loading...',
    this.showText = false,
  });

  @override
  State<LoadingIndicator> createState() => _LoadingIndicatorState();
}

class _LoadingIndicatorState extends State<LoadingIndicator>
    with TickerProviderStateMixin {
  late AnimationController _wheelController;
  late AnimationController _bounceController;
  late AnimationController _roadController;

  @override
  void initState() {
    super.initState();

    // 1. Wheel rotation controller (continuous fast spinning)
    _wheelController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    )..repeat();

    // 2. Cargo box bounce controller (up and down oscillation)
    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    )..repeat(reverse: true);

    // 3. Moving road line controller
    _roadController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..repeat();
  }

  @override
  void dispose() {
    _wheelController.dispose();
    _bounceController.dispose();
    _roadController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isCompact = widget.size < 40;

    if (isCompact) {
      // Small inline loading spinner fallback (e.g. inside small buttons)
      return SizedBox(
        width: widget.size,
        height: widget.size,
        child: CircularProgressIndicator(
          strokeWidth: 2.5,
          valueColor: AlwaysStoppedAnimation<Color>(
            widget.color ?? (widget.isLight ? Colors.white : const Color(0xFFF97316)),
          ),
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: math.max(140.0, widget.size * 2.2),
          height: math.max(90.0, widget.size * 1.4),
          child: AnimatedBuilder(
            animation: Listenable.merge([_wheelController, _bounceController, _roadController]),
            builder: (context, child) {
              final boxOffset = math.sin(_bounceController.value * math.pi) * 3.5;
              final truckVibe = math.cos(_bounceController.value * math.pi * 2) * 1.0;
              final wheelAngle = _wheelController.value * math.pi * 2;
              final roadShift = _roadController.value;

              return CustomPaint(
                painter: _RealisticTruckPainter(
                  wheelAngle: wheelAngle,
                  boxBounceOffset: boxOffset,
                  truckVibrationOffset: truckVibe,
                  roadShift: roadShift,
                  accentColor: widget.color ?? const Color(0xFF1E75D8),
                ),
              );
            },
          ),
        ),
        if (widget.showText && widget.loadingText != null) ...[
          const SizedBox(height: 8),
          Text(
            widget.loadingText!,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: widget.isLight ? Colors.white70 : const Color(0xFF64748B),
              letterSpacing: 0.5,
            ),
          ),
        ],
      ],
    );
  }
}

class _RealisticTruckPainter extends CustomPainter {
  final double wheelAngle;
  final double boxBounceOffset;
  final double truckVibrationOffset;
  final double roadShift;
  final Color accentColor;

  _RealisticTruckPainter({
    required this.wheelAngle,
    required this.boxBounceOffset,
    required this.truckVibrationOffset,
    required this.roadShift,
    required this.accentColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final width = size.width;
    final height = size.height;
    final groundY = height * 0.78;

    // Paints
    final blackOutline = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final truckBlueFill = Paint()
      ..color = const Color(0xFF1E75D8)
      ..style = PaintingStyle.fill;

    final darkBlueFill = Paint()
      ..color = const Color(0xFF15539B)
      ..style = PaintingStyle.fill;

    final windowFill = Paint()
      ..color = const Color(0xFFE0F2FE)
      ..style = PaintingStyle.fill;

    final boxFill1 = Paint()
      ..color = const Color(0xFFD97706)
      ..style = PaintingStyle.fill;

    final boxFill2 = Paint()
      ..color = const Color(0xFFB45309)
      ..style = PaintingStyle.fill;

    final boxFill3 = Paint()
      ..color = const Color(0xFFF59E0B)
      ..style = PaintingStyle.fill;

    final tapePaint = Paint()
      ..color = const Color(0xFF2563EB)
      ..style = PaintingStyle.fill;

    final roadLinePaint = Paint()
      ..color = const Color(0xFF94A3B8)
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    // 1. Draw Moving Road Surface Dashes (Right to Left motion)
    final roadWidth = width * 0.9;
    final startX = (width - roadWidth) / 2;
    const dashLength = 12.0;
    const dashSpace = 10.0;
    final totalDashPeriod = dashLength + dashSpace;
    final currentOffset = (roadShift * totalDashPeriod) % totalDashPeriod;

    canvas.save();
    canvas.clipRect(Rect.fromLTWH(startX, groundY + 12, roadWidth, 10));
    for (double x = startX - totalDashPeriod + currentOffset; x < startX + roadWidth + totalDashPeriod; x += totalDashPeriod) {
      canvas.drawLine(Offset(x, groundY + 14), Offset(x + dashLength, groundY + 14), roadLinePaint);
    }
    canvas.restore();

    // Base coordinates for truck
    final truckBaseY = groundY - 26 + truckVibrationOffset;
    final truckStartX = width * 0.20;

    // 2. Draw Stacked Cargo Boxes on Truck Bed (Bouncing up and down!)
    final boxBaseY = truckBaseY - boxBounceOffset;

    // Box 1 (Bottom Left)
    final b1Rect = RRect.fromRectAndRadius(
      Rect.fromLTWH(truckStartX + 4, boxBaseY - 22, 28, 22),
      const Radius.circular(2),
    );
    canvas.drawRRect(b1Rect, boxFill1);
    canvas.drawRRect(b1Rect, blackOutline);
    // Box 1 tape detail
    canvas.drawRect(Rect.fromLTWH(truckStartX + 14, boxBaseY - 22, 8, 22), tapePaint);

    // Box 2 (Bottom Right / Middle)
    final b2Rect = RRect.fromRectAndRadius(
      Rect.fromLTWH(truckStartX + 30, boxBaseY - 26, 26, 26),
      const Radius.circular(2),
    );
    canvas.drawRRect(b2Rect, boxFill2);
    canvas.drawRRect(b2Rect, blackOutline);
    // Box 2 red label detail
    canvas.drawRect(Rect.fromLTWH(truckStartX + 44, boxBaseY - 20, 6, 6), Paint()..color = const Color(0xFFEF4444));

    // Box 3 (Top Box stacked high)
    final b3Rect = RRect.fromRectAndRadius(
      Rect.fromLTWH(truckStartX + 26, boxBaseY - 44, 20, 18),
      const Radius.circular(2),
    );
    canvas.drawRRect(b3Rect, boxFill3);
    canvas.drawRRect(b3Rect, blackOutline);
    // Box 3 tape detail
    canvas.drawRect(Rect.fromLTWH(truckStartX + 34, boxBaseY - 44, 5, 18), tapePaint);

    // 3. Draw Blue Pickup Truck Bed Frame
    final bedRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(truckStartX, truckBaseY, 62, 14),
      const Radius.circular(3),
    );
    canvas.drawRRect(bedRect, darkBlueFill);
    canvas.drawRRect(bedRect, blackOutline);

    // Bed Tail Light (Orange/Red)
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(truckStartX + 2, truckBaseY + 3, 6, 8), const Radius.circular(1)),
      Paint()..color = const Color(0xFFF97316),
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(truckStartX + 2, truckBaseY + 3, 6, 8), const Radius.circular(1)),
      blackOutline..strokeWidth = 1.5,
    );

    // 4. Draw Cabin Frame & Hood
    final cabinPath = Path();
    final cabinLeft = truckStartX + 58;
    cabinPath.moveTo(cabinLeft, truckBaseY + 14);
    cabinPath.lineTo(cabinLeft, truckBaseY - 24);
    cabinPath.quadraticBezierTo(cabinLeft + 2, truckBaseY - 32, cabinLeft + 12, truckBaseY - 32);
    cabinPath.lineTo(cabinLeft + 24, truckBaseY - 32);
    cabinPath.quadraticBezierTo(cabinLeft + 32, truckBaseY - 30, cabinLeft + 34, truckBaseY - 14);
    cabinPath.lineTo(cabinLeft + 42, truckBaseY - 10);
    cabinPath.quadraticBezierTo(cabinLeft + 44, truckBaseY - 8, cabinLeft + 44, truckBaseY + 2);
    cabinPath.lineTo(cabinLeft + 44, truckBaseY + 14);
    cabinPath.close();

    canvas.drawPath(cabinPath, truckBlueFill);
    canvas.drawPath(cabinPath, blackOutline..strokeWidth = 2.5);

    // Cabin Window
    final windowPath = Path();
    windowPath.moveTo(cabinLeft + 8, truckBaseY - 26);
    windowPath.lineTo(cabinLeft + 22, truckBaseY - 26);
    windowPath.quadraticBezierTo(cabinLeft + 28, truckBaseY - 25, cabinLeft + 29, truckBaseY - 14);
    windowPath.lineTo(cabinLeft + 8, truckBaseY - 14);
    windowPath.close();

    canvas.drawPath(windowPath, windowFill);
    canvas.drawPath(windowPath, blackOutline..strokeWidth = 2.0);

    // Front Bumper / Headlight (Orange/Yellow glow)
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(cabinLeft + 38, truckBaseY + 2, 6, 8), const Radius.circular(1)),
      Paint()..color = const Color(0xFFFACC15),
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(cabinLeft + 38, truckBaseY + 2, 6, 8), const Radius.circular(1)),
      blackOutline..strokeWidth = 1.5,
    );

    // 5. Draw Rotating Wheels (Tires with rotating rim spokes)
    final rearWheelCenter = Offset(truckStartX + 20, truckBaseY + 14);
    final frontWheelCenter = Offset(cabinLeft + 26, truckBaseY + 14);
    const wheelRadius = 13.0;

    _drawRotatingWheel(canvas, rearWheelCenter, wheelRadius, wheelAngle, blackOutline);
    _drawRotatingWheel(canvas, frontWheelCenter, wheelRadius, wheelAngle, blackOutline);
  }

  void _drawRotatingWheel(Canvas canvas, Offset center, double radius, double angle, Paint outline) {
    // Outer Tire (Dark Slate)
    final tirePaint = Paint()
      ..color = const Color(0xFF334155)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, tirePaint);
    canvas.drawCircle(center, radius, outline..strokeWidth = 2.5);

    // Inner Rim (Light Slate/Grey)
    final rimPaint = Paint()
      ..color = const Color(0xFF94A3B8)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius * 0.55, rimPaint);
    canvas.drawCircle(center, radius * 0.55, outline..strokeWidth = 1.5);

    // Center Cap
    final centerCapPaint = Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius * 0.22, centerCapPaint);

    // Rotating Rim Spokes
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(angle);

    final spokePaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    for (int i = 0; i < 4; i++) {
      final spokeAngle = (i * math.pi / 2);
      final dx = math.cos(spokeAngle) * (radius * 0.50);
      final dy = math.sin(spokeAngle) * (radius * 0.50);
      canvas.drawLine(Offset.zero, Offset(dx, dy), spokePaint);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _RealisticTruckPainter oldDelegate) => true;
}
