import '../../../core/network/api_endpoints.dart';
import '../../../core/network/api_response_parser.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/models/wallet_model.dart';
import '../models/wallet_models.dart';

class WalletRepository {
  final DioClient _client;

  WalletRepository(this._client);

  Future<WalletModel> getWallet() async {
    final response = await _client.get(ApiEndpoints.wallet);
    return WalletModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<TransactionModel>> getTransactions({
    int page = 1,
    int limit = 20,
    String? dateFrom,
    String? dateTo,
  }) async {
    final response = await _client.get(
      ApiEndpoints.walletTransactions,
      queryParameters: {
        'page': page,
        'limit': limit,
        'dateFrom': ?dateFrom,
        'dateTo': ?dateTo,
      },
    );
    return ApiResponseParser.parseArray(
        response.data, TransactionModel.fromJson);
  }

  Future<Map<String, dynamic>> createDeposit(DepositRequest request) async {
    final response = await _client.post(
      ApiEndpoints.pay247CreateDeposit,
      data: request.toJson(),
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createWithdrawal(
      WithdrawRequest request) async {
    final response = await _client.post(
      ApiEndpoints.pay247CreateWithdrawal,
      data: request.toJson(),
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getCryptoOptions() async {
    final response = await _client.get(ApiEndpoints.walletCryptoOptions);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> checkPay247Status(String orderId) async {
    final response = await _client.get(
      ApiEndpoints.pay247DepositStatus(orderId),
    );
    return response.data as Map<String, dynamic>;
  }

  Future<List<CoinPackage>> getCoinPackages() async {
    final response = await _client.get(ApiEndpoints.walletPackages);
    return ApiResponseParser.parseArray(
        response.data, CoinPackage.fromJson);
  }

  Future<Map<String, dynamic>> purchaseCoins(String packageId) async {
    final response = await _client.post(
      ApiEndpoints.walletPurchase,
      data: {'packageId': packageId},
    );
    return response.data as Map<String, dynamic>;
  }
}
