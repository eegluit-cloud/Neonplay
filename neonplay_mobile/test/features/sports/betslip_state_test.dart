import 'package:flutter_test/flutter_test.dart';
import 'package:neonplay_mobile/features/sports/models/sports_models.dart';
import 'package:neonplay_mobile/features/sports/providers/betslip_provider.dart';

BetSelectionModel _selection({
  String matchId = 'match1',
  double odds = 2.0,
  String selection = 'Home',
}) {
  return BetSelectionModel(
    matchId: matchId,
    marketId: 'market1',
    oddId: 'odd1',
    selection: selection,
    oddsAtPlacement: odds,
    matchName: 'Team A vs Team B',
    market: '1x2',
  );
}

void main() {
  group('BetslipState', () {
    test('default state has correct defaults', () {
      const state = BetslipState();
      expect(state.selections, isEmpty);
      expect(state.stake, 5.0);
      expect(state.activeTab, 'single');
      expect(state.quickBetEnabled, false);
      expect(state.isOpen, false);
    });

    group('totalOdds', () {
      test('returns 1.0 for no selections', () {
        const state = BetslipState();
        expect(state.totalOdds, 1.0);
      });

      test('returns odds for single selection', () {
        final state = BetslipState(
          selections: [_selection(odds: 2.5)],
        );
        expect(state.totalOdds, 2.5);
      });

      test('returns product of all odds', () {
        final state = BetslipState(
          selections: [
            _selection(matchId: 'a', odds: 2.0),
            _selection(matchId: 'b', odds: 3.0),
            _selection(matchId: 'c', odds: 1.5),
          ],
        );
        expect(state.totalOdds, closeTo(9.0, 0.001));
      });
    });

    group('potentialWin', () {
      test('single tab: sum of stake * each odds', () {
        final state = BetslipState(
          stake: 10.0,
          activeTab: 'single',
          selections: [
            _selection(matchId: 'a', odds: 2.0),
            _selection(matchId: 'b', odds: 3.0),
          ],
        );
        // 10*2 + 10*3 = 50
        expect(state.potentialWin, closeTo(50.0, 0.001));
      });

      test('combo tab: stake * product of all odds', () {
        final state = BetslipState(
          stake: 10.0,
          activeTab: 'combo',
          selections: [
            _selection(matchId: 'a', odds: 2.0),
            _selection(matchId: 'b', odds: 3.0),
          ],
        );
        // 10 * (2 * 3) = 60
        expect(state.potentialWin, closeTo(60.0, 0.001));
      });

      test('system tab: same as combo calculation', () {
        final state = BetslipState(
          stake: 5.0,
          activeTab: 'system',
          selections: [
            _selection(matchId: 'a', odds: 2.0),
            _selection(matchId: 'b', odds: 4.0),
          ],
        );
        // 5 * (2 * 4) = 40
        expect(state.potentialWin, closeTo(40.0, 0.001));
      });

      test('returns 0 for no selections in single mode', () {
        const state = BetslipState(stake: 10.0, activeTab: 'single');
        expect(state.potentialWin, 0.0);
      });

      test('returns stake for no selections in combo mode', () {
        // totalOdds = 1.0 when empty, so stake * 1.0 = stake
        const state = BetslipState(stake: 10.0, activeTab: 'combo');
        expect(state.potentialWin, 10.0);
      });
    });

    group('copyWith', () {
      test('copies with new stake', () {
        const state = BetslipState(stake: 5.0);
        final updated = state.copyWith(stake: 25.0);
        expect(updated.stake, 25.0);
        expect(updated.activeTab, 'single'); // unchanged
      });

      test('copies with new tab', () {
        const state = BetslipState(activeTab: 'single');
        final updated = state.copyWith(activeTab: 'combo');
        expect(updated.activeTab, 'combo');
        expect(updated.stake, 5.0); // unchanged
      });

      test('copies with new selections', () {
        const state = BetslipState();
        final updated = state.copyWith(
          selections: [_selection()],
        );
        expect(updated.selections.length, 1);
      });
    });
  });
}
