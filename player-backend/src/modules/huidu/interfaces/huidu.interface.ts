// --- Game Launch (Seamless /game/v1) ---
export interface HuiduLaunchPayload {
  timestamp: string;
  agency_uid: string;
  member_account: string;
  game_uid: string;
  credit_amount: string;
  currency_code: string;
  language: string;
  home_url?: string;
  platform?: number; // 1=web, 2=H5
  callback_url?: string;
}

export interface HuiduLaunchResponse {
  code: number;
  msg: string;
  payload: { game_launch_url: string };
}

// --- Callback (Huidu calls us) ---
export interface HuiduCallbackPayload {
  serial_number: string; // UUID (idempotency key)
  currency_code: string;
  game_uid: string;
  member_account: string;
  win_amount: string; // Negative = refund
  bet_amount: string; // Negative = refund
  timestamp: string; // ms
  game_round: string;
  data: string; // Sports event JSON
}

export interface HuiduCallbackResponsePayload {
  credit_amount: string;
  timestamp: string;
}

// --- Supplier/Game List (GET endpoints) ---
export interface HuiduSupplier {
  code: string;
  name: string;
  currency: string;
  lang: string;
  status: number; // 0=disabled, 1=enabled
}

export interface HuiduGame {
  game_uid: string;
  game_name: string;
  game_type: string;
  lang: string;
  status: number;
  currency: string;
}

// --- Error codes ---
export const HUIDU_ERROR_CODES: Record<number, string> = {
  0: 'Success',
  10002: 'Agency not exist',
  10004: 'Payload error',
  10005: 'System error',
  10008: 'Game does not exist',
  10011: 'Player currencies do not match',
  10012: 'Player name already exists',
  10013: 'Currency not supported',
  10014: 'PlayerName incorrect',
  10015: 'Player account limited to a-z and 0-9',
  10016: 'Account frozen',
  10017: 'Manufacturer does not exist',
  10018: 'Line does not support currency',
  10022: 'Incorrect parameters',
  10023: 'Player name min 3 chars',
  10024: 'Wallet mode mismatch',
  10025: 'Insufficient wallet balance',
  10030: 'Too many requests',
  10033: 'home_url cannot contain ?',
  10034: 'System maintenance',
};
