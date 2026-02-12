import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:neonplay_mobile/core/widgets/empty_state.dart';

void main() {
  group('EmptyState', () {
    testWidgets('renders icon, title, and subtitle', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyState(
              icon: Icons.favorite_border,
              title: 'No favorites',
              subtitle: 'Add some games',
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.favorite_border), findsOneWidget);
      expect(find.text('No favorites'), findsOneWidget);
      expect(find.text('Add some games'), findsOneWidget);
    });

    testWidgets('does not show subtitle when null', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyState(
              icon: Icons.inbox,
              title: 'Empty',
            ),
          ),
        ),
      );

      expect(find.text('Empty'), findsOneWidget);
      // Only title text should exist, no subtitle
      expect(find.byType(Text), findsOneWidget);
    });

    testWidgets('renders action widget when provided', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              icon: Icons.inbox,
              title: 'Empty',
              action: ElevatedButton(
                onPressed: () {},
                child: const Text('Browse Games'),
              ),
            ),
          ),
        ),
      );

      expect(find.text('Browse Games'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });
  });
}
