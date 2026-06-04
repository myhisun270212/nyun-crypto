export interface Trade {
  id: string;
  user_id: string;
  trade_date: string;
  pair: string;
  direction: 'Long' | 'Short';
  setup: string;
  btc_context: string;
  oi: string;
  funding: string;
  trigger: string;
  margin: number;
  leverage: number;
  rr: number;
  risk_percent: number;
  result_percent: number;
  result_usdt: number;
  plan_followed: boolean;
  mistake: string | null;
  notes: string | null;
  before_entry_screenshot: string | null;
  after_exit_screenshot: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pair {
  id: string;
  name: string;
}

export interface TradeSetup {
  id: string;
  name: string;
}

export interface Mistake {
  id: string;
  name: string;
}

export interface BtcContext {
  id: string;
  name: string;
}

export interface OiCondition {
  id: string;
  name: string;
}

export interface FundingCondition {
  id: string;
  name: string;
}

export interface DashboardStats {
  total_trades: number;
  total_wins: number;
  total_losses: number;
  win_rate: number;
  total_profit_percent: number;
  total_profit_usdt: number;
  average_rr: number;
  profit_factor: number;
}

export interface AnalyticsData {
  total_trades: number;
  win_rate: number;
  profit_percent: number;
  profit_usdt: number;
  average_rr: number;
  profit_factor: number;
  best_setup: string;
  worst_setup: string;
  best_pair: string;
  worst_pair: string;
}
