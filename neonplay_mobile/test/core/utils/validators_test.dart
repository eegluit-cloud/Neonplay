import 'package:flutter_test/flutter_test.dart';
import 'package:neonplay_mobile/core/utils/validators.dart';

void main() {
  group('Validators', () {
    group('email', () {
      test('returns error for null', () {
        expect(Validators.email(null), isNotNull);
      });

      test('returns error for empty string', () {
        expect(Validators.email(''), isNotNull);
      });

      test('returns error for invalid email', () {
        expect(Validators.email('notanemail'), isNotNull);
        expect(Validators.email('missing@tld'), isNotNull);
        expect(Validators.email('@nodomain.com'), isNotNull);
      });

      test('returns null for valid email', () {
        expect(Validators.email('user@example.com'), isNull);
        expect(Validators.email('user.name@domain.co'), isNull);
        expect(Validators.email('user123@gmail.com'), isNull);
      });
    });

    group('password', () {
      test('returns error for null', () {
        expect(Validators.password(null), isNotNull);
      });

      test('returns error for empty string', () {
        expect(Validators.password(''), isNotNull);
      });

      test('returns error for short password', () {
        expect(Validators.password('1234567'), isNotNull);
      });

      test('returns null for valid password', () {
        expect(Validators.password('12345678'), isNull);
        expect(Validators.password('SecurePassword123!'), isNull);
      });
    });

    group('username', () {
      test('returns error for null', () {
        expect(Validators.username(null), isNotNull);
      });

      test('returns error for empty string', () {
        expect(Validators.username(''), isNotNull);
      });

      test('returns error for too short', () {
        expect(Validators.username('ab'), isNotNull);
      });

      test('returns error for too long', () {
        expect(Validators.username('a' * 21), isNotNull);
      });

      test('returns error for special characters', () {
        expect(Validators.username('user@name'), isNotNull);
        expect(Validators.username('user name'), isNotNull);
        expect(Validators.username('user-name'), isNotNull);
      });

      test('returns null for valid username', () {
        expect(Validators.username('abc'), isNull);
        expect(Validators.username('user_123'), isNull);
        expect(Validators.username('TestUser'), isNull);
      });
    });

    group('required', () {
      test('returns error for null', () {
        expect(Validators.required(null), isNotNull);
      });

      test('returns error for empty/whitespace', () {
        expect(Validators.required(''), isNotNull);
        expect(Validators.required('   '), isNotNull);
      });

      test('returns null for non-empty value', () {
        expect(Validators.required('hello'), isNull);
      });

      test('includes field name in error', () {
        final result = Validators.required(null, 'Name');
        expect(result, contains('Name'));
      });
    });

    group('passwordStrength', () {
      test('returns 0 for very weak password', () {
        expect(Validators.passwordStrength('abc'), 0);
      });

      test('returns 1 for 8+ char lowercase-only password', () {
        expect(Validators.passwordStrength('abcdefgh'), 1);
      });

      test('returns higher score for mixed case + numbers', () {
        final score = Validators.passwordStrength('Abcdefgh1');
        expect(score, greaterThanOrEqualTo(2));
      });

      test('returns 4 for strong password with all criteria', () {
        final score = Validators.passwordStrength('Abcdefgh1234!@');
        expect(score, 4);
      });

      test('clamps to maximum of 4', () {
        final score = Validators.passwordStrength('VeryLongPassword123!@#\$');
        expect(score, lessThanOrEqualTo(4));
      });
    });

    group('passwordStrengthLabel', () {
      test('returns correct labels', () {
        expect(Validators.passwordStrengthLabel(0), 'Very Weak');
        expect(Validators.passwordStrengthLabel(1), 'Weak');
        expect(Validators.passwordStrengthLabel(2), 'Fair');
        expect(Validators.passwordStrengthLabel(3), 'Strong');
        expect(Validators.passwordStrengthLabel(4), 'Very Strong');
      });
    });
  });
}
