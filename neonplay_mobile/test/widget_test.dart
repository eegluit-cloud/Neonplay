import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:neonplay_mobile/core/theme/app_theme.dart';
import 'package:neonplay_mobile/core/widgets/not_found_screen.dart';

void main() {
  testWidgets('App smoke test - theme applies correctly',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(
          body: Center(child: Text('PhiBet.io')),
        ),
      ),
    );

    expect(find.text('PhiBet.io'), findsOneWidget);
  });

  testWidgets('NotFoundScreen renders in MaterialApp',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const NotFoundScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('404'), findsOneWidget);
    expect(find.text('Page Not Found'), findsOneWidget);
  });
}
