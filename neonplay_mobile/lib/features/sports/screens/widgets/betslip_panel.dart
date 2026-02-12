import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_gradients.dart';
import '../../models/sports_models.dart';
import '../../providers/betslip_provider.dart';
import '../../providers/sports_provider.dart';

/// Bottom sheet betslip panel for placing bets.
class BetslipPanel extends ConsumerWidget {
  const BetslipPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final betslip = ref.watch(betslipProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.3,
      maxChildSize: 0.9,
      builder: (_, scrollController) => Container(
        decoration: const BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: ListView(
          controller: scrollController,
          padding: const EdgeInsets.all(16),
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.mutedForeground,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Betslip (${betslip.selections.length})',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.foreground,
                  ),
                ),
                if (betslip.selections.isNotEmpty)
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () =>
                          ref.read(betslipProvider.notifier).clearSelections(),
                      borderRadius: BorderRadius.circular(6),
                      child: const Padding(
                        padding:
                            EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        child: Text(
                          'Clear All',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.destructive,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            // Tabs: Single / Combo / System
            _BetTypeTabs(
              activeTab: betslip.activeTab,
              onChanged: (tab) =>
                  ref.read(betslipProvider.notifier).setActiveTab(tab),
            ),
            const SizedBox(height: 16),

            // Selections list
            if (betslip.selections.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(
                  child: Text(
                    'Tap odds to add selections',
                    style: TextStyle(color: AppColors.mutedForeground),
                  ),
                ),
              )
            else
              ...betslip.selections.map((s) => _SelectionCard(
                    selection: s,
                    onRemove: () => ref
                        .read(betslipProvider.notifier)
                        .removeSelection(s.matchId),
                  )),

            if (betslip.selections.isNotEmpty) ...[
              const SizedBox(height: 16),

              // Stake input
              _StakeInput(
                stake: betslip.stake,
                onChanged: (v) =>
                    ref.read(betslipProvider.notifier).setStake(v),
              ),
              const SizedBox(height: 16),

              // Summary
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.muted,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Odds',
                            style: TextStyle(
                                color: AppColors.mutedForeground,
                                fontSize: 13)),
                        Text(betslip.totalOdds.toStringAsFixed(2),
                            style: const TextStyle(
                                color: AppColors.foreground,
                                fontWeight: FontWeight.w700)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Potential Win',
                            style: TextStyle(
                                color: AppColors.mutedForeground,
                                fontSize: 13)),
                        Text(
                          '\$${betslip.potentialWin.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Place bet button
              _PlaceBetButton(
                isSubmitting: betslip.isSubmitting,
                onPressed: () => _placeBet(context, ref, betslip),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _placeBet(
      BuildContext context, WidgetRef ref, BetslipState betslip) async {
    if (betslip.isSubmitting) return;

    HapticFeedback.mediumImpact();
    ref.read(betslipProvider.notifier).setSubmitting(true);

    try {
      final repo = ref.read(sportsRepositoryProvider);
      await repo.placeBet(
        type: betslip.activeTab == 'single' ? 'single' : 'combo',
        stake: betslip.stake,
        currency: 'USD',
        selections: betslip.selections
            .map((s) => {
                  'matchId': s.matchId,
                  'marketId': s.marketId,
                  'oddId': s.oddId,
                  'selection': s.selection,
                })
            .toList(),
      );
      ref.read(betslipProvider.notifier).clearSelections();
      if (context.mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Bet placed successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to place bet: $e'),
            backgroundColor: AppColors.destructive,
          ),
        );
      }
    } finally {
      ref.read(betslipProvider.notifier).setSubmitting(false);
    }
  }
}

/// Place bet button with loading state and press feedback.
class _PlaceBetButton extends StatefulWidget {
  final bool isSubmitting;
  final VoidCallback onPressed;

  const _PlaceBetButton({required this.isSubmitting, required this.onPressed});

  @override
  State<_PlaceBetButton> createState() => _PlaceBetButtonState();
}

class _PlaceBetButtonState extends State<_PlaceBetButton> {
  double _scale = 1.0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _scale = 0.96),
      onTapUp: (_) {
        setState(() => _scale = 1.0);
        if (!widget.isSubmitting) widget.onPressed();
      },
      onTapCancel: () => setState(() => _scale = 1.0),
      child: AnimatedScale(
        scale: _scale,
        duration: const Duration(milliseconds: 100),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            gradient: widget.isSubmitting ? null : AppGradients.primary,
            color: widget.isSubmitting ? AppColors.muted : null,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: widget.isSubmitting
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: AppColors.foreground,
                    ),
                  )
                : const Text(
                    'Place Bet',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}

class _BetTypeTabs extends StatelessWidget {
  final String activeTab;
  final ValueChanged<String> onChanged;

  const _BetTypeTabs({required this.activeTab, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.muted,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: ['single', 'combo', 'system'].map((tab) {
          final isActive = activeTab == tab;
          return Expanded(
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => onChanged(tab),
                borderRadius: BorderRadius.circular(8),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color:
                        isActive ? AppColors.primary : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      tab[0].toUpperCase() + tab.substring(1),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isActive
                            ? AppColors.primaryForeground
                            : AppColors.mutedForeground,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _SelectionCard extends StatelessWidget {
  final BetSelectionModel selection;
  final VoidCallback onRemove;

  const _SelectionCard({required this.selection, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  selection.matchName,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.foreground,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${selection.market} - ${selection.selection}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.mutedForeground,
                  ),
                ),
              ],
            ),
          ),
          Text(
            selection.oddsAtPlacement.toStringAsFixed(2),
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 8),
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onRemove,
              borderRadius: BorderRadius.circular(12),
              child: const Padding(
                padding: EdgeInsets.all(4),
                child: Icon(Icons.close,
                    size: 18, color: AppColors.mutedForeground),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StakeInput extends StatefulWidget {
  final double stake;
  final ValueChanged<double> onChanged;

  const _StakeInput({required this.stake, required this.onChanged});

  @override
  State<_StakeInput> createState() => _StakeInputState();
}

class _StakeInputState extends State<_StakeInput> {
  late final TextEditingController _controller;

  static const _quickStakes = [10.0, 50.0, 100.0, 500.0];

  @override
  void initState() {
    super.initState();
    _controller =
        TextEditingController(text: widget.stake.toStringAsFixed(0));
  }

  @override
  void didUpdateWidget(_StakeInput old) {
    super.didUpdateWidget(old);
    // Update text only when stake changes externally (quick stake buttons)
    if (old.stake != widget.stake) {
      final newText = widget.stake.toStringAsFixed(0);
      if (_controller.text != newText) {
        _controller.text = newText;
        _controller.selection = TextSelection.collapsed(offset: newText.length);
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Stake',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.foreground,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const Text('\$',
                  style: TextStyle(
                      color: AppColors.foreground,
                      fontSize: 16,
                      fontWeight: FontWeight.w700)),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _controller,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[\d.]')),
                  ],
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.foreground,
                  ),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: '0',
                    hintStyle: TextStyle(color: AppColors.mutedForeground),
                  ),
                  onChanged: (value) {
                    final parsed = double.tryParse(value);
                    if (parsed != null && parsed > 0) {
                      widget.onChanged(parsed);
                    }
                  },
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: _quickStakes
              .map(
                (qs) => Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          widget.onChanged(qs);
                        },
                        borderRadius: BorderRadius.circular(8),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: widget.stake == qs
                                ? AppColors.primary
                                : AppColors.muted,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Center(
                            child: Text(
                              '\$${qs.toStringAsFixed(0)}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: widget.stake == qs
                                    ? AppColors.primaryForeground
                                    : AppColors.mutedForeground,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}
