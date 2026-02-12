import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/sports_models.dart';

/// Betslip state.
class BetslipState {
  final List<BetSelectionModel> selections;
  final double stake;
  final String activeTab; // single, combo, system
  final bool quickBetEnabled;
  final bool isOpen;
  final bool isSubmitting;

  const BetslipState({
    this.selections = const [],
    this.stake = 5,
    this.activeTab = 'single',
    this.quickBetEnabled = false,
    this.isOpen = false,
    this.isSubmitting = false,
  });

  double get totalOdds =>
      selections.fold(1.0, (acc, s) => acc * s.oddsAtPlacement);

  double get potentialWin {
    if (activeTab == 'single') {
      return selections.fold(
          0.0, (acc, s) => acc + (stake * s.oddsAtPlacement));
    }
    return stake * totalOdds;
  }

  BetslipState copyWith({
    List<BetSelectionModel>? selections,
    double? stake,
    String? activeTab,
    bool? quickBetEnabled,
    bool? isOpen,
    bool? isSubmitting,
  }) {
    return BetslipState(
      selections: selections ?? this.selections,
      stake: stake ?? this.stake,
      activeTab: activeTab ?? this.activeTab,
      quickBetEnabled: quickBetEnabled ?? this.quickBetEnabled,
      isOpen: isOpen ?? this.isOpen,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }
}

class BetslipNotifier extends Notifier<BetslipState> {
  @override
  BetslipState build() => const BetslipState();

  void addSelection(BetSelectionModel selection) {
    // Replace if same match already selected
    final updated = state.selections
        .where((s) => s.matchId != selection.matchId)
        .toList()
      ..add(selection);
    state = state.copyWith(selections: updated);
  }

  void removeSelection(String matchId) {
    state = state.copyWith(
      selections: state.selections.where((s) => s.matchId != matchId).toList(),
    );
  }

  void clearSelections() {
    state = state.copyWith(selections: []);
  }

  void setStake(double amount) {
    state = state.copyWith(stake: amount);
  }

  void setActiveTab(String tab) {
    state = state.copyWith(activeTab: tab);
  }

  void setSubmitting(bool value) {
    state = state.copyWith(isSubmitting: value);
  }

  void toggleQuickBet() {
    state = state.copyWith(quickBetEnabled: !state.quickBetEnabled);
  }

  void toggleBetslip() {
    state = state.copyWith(isOpen: !state.isOpen);
  }

  void openBetslip() {
    state = state.copyWith(isOpen: true);
  }

  void closeBetslip() {
    state = state.copyWith(isOpen: false);
  }
}

final betslipProvider = NotifierProvider<BetslipNotifier, BetslipState>(
  BetslipNotifier.new,
);
