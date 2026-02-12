import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:neonplay_mobile/core/widgets/not_found_screen.dart';

void main() {
  group('NotFoundScreen', () {
    testWidgets('renders 404 text and heading', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: NotFoundScreen(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('404'), findsOneWidget);
      expect(find.text('Page Not Found'), findsOneWidget);
    });

    testWidgets('has a Go to Lobby button', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: NotFoundScreen(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Go to Lobby'), findsOneWidget);
      expect(find.byIcon(Icons.home), findsOneWidget);
    });
  });
}
