import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../repositories/content_repository.dart';

final contentRepositoryProvider = Provider<ContentRepository>((ref) {
  return ContentRepository(ref.read(dioClientProvider));
});

final contentVideosProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  return ref.read(contentRepositoryProvider).getVideos();
});

final featuredVideosProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  return ref.read(contentRepositoryProvider).getFeatured();
});
