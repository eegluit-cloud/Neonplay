import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_gradients.dart';
import '../../../core/widgets/error_state.dart';
import '../../../core/widgets/loading_state.dart';
import '../../../core/utils/debouncer.dart';
import '../providers/games_provider.dart';
import '../widgets/game_card.dart';

class CasinoScreen extends ConsumerStatefulWidget {
  /// Optional initial category slug to pre-filter (e.g. 'slots', 'crash-games').
  final String? initialCategory;

  /// Optional provider slug to filter by (e.g. 'croco-gaming').
  final String? initialProvider;

  /// When true, shows only hot games.
  final bool showHot;

  /// When true, shows only new games.
  final bool showNew;

  /// When true, shows only featured games.
  final bool showFeatured;

  const CasinoScreen({
    super.key,
    this.initialCategory,
    this.initialProvider,
    this.showHot = false,
    this.showNew = false,
    this.showFeatured = false,
  });

  @override
  ConsumerState<CasinoScreen> createState() => _CasinoScreenState();
}

class _CasinoScreenState extends ConsumerState<CasinoScreen> {
  final _searchController = TextEditingController();
  final _debouncer = Debouncer();
  String? _searchQuery;
  late String? _selectedCategory = widget.initialCategory;
  late final String? _selectedProvider = widget.initialProvider;

  @override
  void dispose() {
    _searchController.dispose();
    _debouncer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Use client-side filtered providers for hot/new/featured
    if (widget.showHot || widget.showNew || widget.showFeatured) {
      return _buildFilteredView();
    }

    final filter = GamesFilter(
      search: _searchQuery,
      category: _selectedCategory,
      provider: _selectedProvider,
    );
    final gamesAsync = ref.watch(gamesProvider(filter));

    return CustomScrollView(
      slivers: [
        // Search bar
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search games...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery != null
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = null);
                        },
                      )
                    : null,
              ),
              onChanged: (value) {
                _debouncer.call(() {
                  setState(() {
                    _searchQuery = value.isEmpty ? null : value;
                  });
                });
              },
            ),
          ),
        ),

        // Provider filter header (when viewing a provider's games)
        if (_selectedProvider != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildProviderHeader(),
            ),
          ),

        // Category chips (hide when filtering by provider)
        if (_selectedProvider == null)
          SliverToBoxAdapter(
            child: SizedBox(
              height: 40,
              child: Consumer(
                builder: (context, ref, _) {
                  final categories = ref.watch(gameCategoriesProvider);
                  return categories.when(
                    data: (cats) => ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: cats.length + 1,
                      separatorBuilder: (_, _) => const SizedBox(width: 8),
                      itemBuilder: (_, index) {
                        if (index == 0) {
                          return _CategoryChip(
                            label: 'All',
                            isSelected: _selectedCategory == null,
                            onTap: () =>
                                setState(() => _selectedCategory = null),
                          );
                        }
                        final cat = cats[index - 1];
                        return _CategoryChip(
                          label: cat.name,
                          isSelected: _selectedCategory == cat.slug,
                          onTap: () {
                            setState(() {
                              _selectedCategory = _selectedCategory == cat.slug
                                  ? null
                                  : cat.slug;
                            });
                          },
                        );
                      },
                    ),
                    loading: () => const SizedBox.shrink(),
                    error: (_, _) => const SizedBox.shrink(),
                  );
                },
              ),
            ),
          ),
        const SliverToBoxAdapter(child: SizedBox(height: 12)),

        // Games grid
        gamesAsync.when(
          data: (paginated) {
            if (paginated.data.isEmpty) {
              return const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(48),
                  child: Center(
                    child: Text('No games found',
                        style: TextStyle(color: AppColors.mutedForeground)),
                  ),
                ),
              );
            }
            return SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 3 / 4,
                ),
                delegate: SliverChildBuilderDelegate(
                  (_, index) => GameCard(game: paginated.data[index]),
                  childCount: paginated.data.length,
                ),
              ),
            );
          },
          loading: () => const SliverLoadingState(useShimmer: true),
          error: (_, _) => SliverErrorState(
            message: 'Failed to load games',
            onRetry: () => ref.invalidate(gamesProvider(filter)),
          ),
        ),
      ],
    );
  }

  /// Builds a view using client-side filtered providers (hot/new/featured).
  Widget _buildFilteredView() {
    final provider = widget.showHot
        ? hotGamesProvider
        : widget.showNew
            ? newGamesProvider
            : featuredGamesProvider;
    final gamesAsync = ref.watch(provider);

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search games...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery != null
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = null);
                        },
                      )
                    : null,
              ),
              onChanged: (value) {
                _debouncer.call(() {
                  setState(() {
                    _searchQuery = value.isEmpty ? null : value;
                  });
                });
              },
            ),
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 12)),

        gamesAsync.when(
          data: (games) {
            var filtered = games;
            if (_searchQuery != null && _searchQuery!.isNotEmpty) {
              final q = _searchQuery!.toLowerCase();
              filtered = games
                  .where((g) => g.name.toLowerCase().contains(q))
                  .toList();
            }
            if (filtered.isEmpty) {
              return const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(48),
                  child: Center(
                    child: Text('No games found',
                        style: TextStyle(color: AppColors.mutedForeground)),
                  ),
                ),
              );
            }
            return SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 3 / 4,
                ),
                delegate: SliverChildBuilderDelegate(
                  (_, index) => GameCard(game: filtered[index]),
                  childCount: filtered.length,
                ),
              ),
            );
          },
          loading: () => const SliverLoadingState(useShimmer: true),
          error: (_, _) => SliverErrorState(
            message: 'Failed to load games',
            onRetry: () => ref.invalidate(provider),
          ),
        ),
      ],
    );
  }

  Widget _buildProviderHeader() {
    return Consumer(
      builder: (context, ref, _) {
        final providersAsync = ref.watch(gameProvidersProvider);
        return providersAsync.when(
          data: (providers) {
            final prov = providers
                .where((p) => p.slug == _selectedProvider)
                .firstOrNull;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  if (prov?.logoUrl != null &&
                      prov!.logoUrl!.startsWith('assets/'))
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: Image.asset(prov.logoUrl!,
                          width: 32,
                          height: 32,
                          errorBuilder: (_, _, _) =>
                              const SizedBox.shrink()),
                    ),
                  if (prov?.logoUrl != null &&
                      prov!.logoUrl!.startsWith('assets/'))
                    const SizedBox(width: 10),
                  Text(
                    prov?.name ?? _selectedProvider!,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.foreground,
                    ),
                  ),
                ],
              ),
            );
          },
          loading: () => const SizedBox.shrink(),
          error: (_, _) => const SizedBox.shrink(),
        );
      },
    );
  }
}

/// Styled category chip with tap feedback.
class _CategoryChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            gradient: isSelected ? AppGradients.accent : null,
            color: isSelected ? null : AppColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : AppColors.mutedForeground,
            ),
          ),
        ),
      ),
    );
  }
}
