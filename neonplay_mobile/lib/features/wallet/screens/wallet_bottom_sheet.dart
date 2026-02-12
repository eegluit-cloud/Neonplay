import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../auth/providers/auth_provider.dart';

class WalletBottomSheet extends ConsumerStatefulWidget {
  const WalletBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const WalletBottomSheet(),
    );
  }

  @override
  ConsumerState<WalletBottomSheet> createState() => _WalletBottomSheetState();
}

class _WalletBottomSheetState extends ConsumerState<WalletBottomSheet>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final wallet = ref.watch(currentWalletProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      expand: false,
      builder: (_, scrollController) {
        return Column(
          children: [
            // Drag handle
            Padding(
              padding: const EdgeInsets.only(top: 12, bottom: 8),
              child: Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.muted,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),

            // Balance display
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Column(
                children: [
                  const Text(
                    'Your Balance',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    CurrencyFormatter.format(
                      wallet?.balances.usd ?? 0,
                      'USD',
                    ),
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground,
                      fontFamily: 'Orbitron',
                    ),
                  ),
                ],
              ),
            ),

            // Tab bar
            TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Deposit'),
                Tab(text: 'Withdraw'),
              ],
            ),

            // Tab content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _DepositTab(scrollController: scrollController),
                  _WithdrawTab(scrollController: scrollController),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _DepositTab extends StatefulWidget {
  final ScrollController scrollController;

  const _DepositTab({required this.scrollController});

  @override
  State<_DepositTab> createState() => _DepositTabState();
}

class _DepositTabState extends State<_DepositTab> {
  final _amountController = TextEditingController();
  int _selectedMethodIndex = 0;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _onDeposit() {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid amount')),
      );
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Deposit of \$${amount.toStringAsFixed(2)} initiated via ${_depositMethods[_selectedMethodIndex]['title']}',
        ),
      ),
    );
    Navigator.of(context).pop();
  }

  static const _depositMethods = [
    {
      'icon': Icons.credit_card,
      'title': 'Credit / Debit Card',
      'subtitle': 'Visa, Mastercard',
    },
    {
      'icon': Icons.account_balance,
      'title': 'Bank Transfer',
      'subtitle': 'UPI, NEFT, IMPS',
    },
    {
      'icon': Icons.currency_bitcoin,
      'title': 'Cryptocurrency',
      'subtitle': 'BTC, ETH, USDT, USDC',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      controller: widget.scrollController,
      padding: const EdgeInsets.all(24),
      children: [
        const Text(
          'Amount',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.foreground,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _amountController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(
            hintText: 'Enter amount',
            prefixIcon: Icon(Icons.attach_money),
          ),
        ),
        const SizedBox(height: 8),

        // Quick amounts
        Wrap(
          spacing: 8,
          children: [10, 25, 50, 100, 250, 500].map((amount) {
            return ActionChip(
              label: Text('\$$amount'),
              onPressed: () {
                _amountController.text = amount.toString();
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 24),

        const Text(
          'Payment Method',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.foreground,
          ),
        ),
        const SizedBox(height: 12),
        ...List.generate(_depositMethods.length, (index) {
          return Padding(
            padding: EdgeInsets.only(
                bottom: index < _depositMethods.length - 1 ? 8 : 0),
            child: _PaymentMethodCard(
              icon: _depositMethods[index]['icon'] as IconData,
              title: _depositMethods[index]['title'] as String,
              subtitle: _depositMethods[index]['subtitle'] as String,
              isSelected: _selectedMethodIndex == index,
              onTap: () => setState(() => _selectedMethodIndex = index),
            ),
          );
        }),
        const SizedBox(height: 24),

        ElevatedButton(
          onPressed: _onDeposit,
          child: const Text('Deposit'),
        ),
      ],
    );
  }
}

class _WithdrawTab extends StatefulWidget {
  final ScrollController scrollController;

  const _WithdrawTab({required this.scrollController});

  @override
  State<_WithdrawTab> createState() => _WithdrawTabState();
}

class _WithdrawTabState extends State<_WithdrawTab> {
  final _amountController = TextEditingController();
  int _selectedMethodIndex = 0;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _onWithdraw() {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid amount')),
      );
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Withdrawal of \$${amount.toStringAsFixed(2)} initiated via ${_withdrawMethods[_selectedMethodIndex]['title']}',
        ),
      ),
    );
    Navigator.of(context).pop();
  }

  static const _withdrawMethods = [
    {
      'icon': Icons.account_balance,
      'title': 'Bank Account',
      'subtitle': 'Direct bank transfer',
    },
    {
      'icon': Icons.currency_bitcoin,
      'title': 'Cryptocurrency',
      'subtitle': 'BTC, ETH, USDT, USDC',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      controller: widget.scrollController,
      padding: const EdgeInsets.all(24),
      children: [
        const Text(
          'Amount',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.foreground,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _amountController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(
            hintText: 'Enter amount',
            prefixIcon: Icon(Icons.attach_money),
          ),
        ),
        const SizedBox(height: 24),

        const Text(
          'Withdraw To',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.foreground,
          ),
        ),
        const SizedBox(height: 12),
        ...List.generate(_withdrawMethods.length, (index) {
          return Padding(
            padding: EdgeInsets.only(
                bottom: index < _withdrawMethods.length - 1 ? 8 : 0),
            child: _PaymentMethodCard(
              icon: _withdrawMethods[index]['icon'] as IconData,
              title: _withdrawMethods[index]['title'] as String,
              subtitle: _withdrawMethods[index]['subtitle'] as String,
              isSelected: _selectedMethodIndex == index,
              onTap: () => setState(() => _selectedMethodIndex = index),
            ),
          );
        }),
        const SizedBox(height: 24),

        ElevatedButton(
          onPressed: _onWithdraw,
          child: const Text('Withdraw'),
        ),
      ],
    );
  }
}

class _PaymentMethodCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _PaymentMethodCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.isSelected = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.08)
              : AppColors.secondary,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon,
                color: isSelected
                    ? AppColors.primary
                    : AppColors.mutedForeground,
                size: 24),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.foreground,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              isSelected ? Icons.check_circle : Icons.chevron_right,
              color: isSelected ? AppColors.primary : AppColors.mutedForeground,
            ),
          ],
        ),
      ),
    );
  }
}
