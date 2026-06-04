-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Master Data Tables
CREATE TABLE pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trade_setups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mistakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE btc_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE oi_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE funding_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main Trades Table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('Long', 'Short')),
  setup TEXT NOT NULL,
  btc_context TEXT NOT NULL,
  oi TEXT NOT NULL,
  funding TEXT NOT NULL,
  trigger TEXT NOT NULL,
  margin NUMERIC NOT NULL,
  leverage INTEGER NOT NULL,
  rr NUMERIC NOT NULL,
  risk_percent NUMERIC NOT NULL,
  result_percent NUMERIC NOT NULL,
  result_usdt NUMERIC NOT NULL,
  plan_followed BOOLEAN NOT NULL DEFAULT false,
  mistake TEXT,
  notes TEXT,
  before_entry_screenshot TEXT,
  after_exit_screenshot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_trade_date ON trades(trade_date);
CREATE INDEX idx_trades_pair ON trades(pair);
CREATE INDEX idx_trades_setup ON trades(setup);

-- Enable Row Level Security
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE btc_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE oi_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Master Data Tables (Read-only for all authenticated users)
CREATE POLICY "Pairs are viewable by everyone" ON pairs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Trade setups are viewable by everyone" ON trade_setups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Mistakes are viewable by everyone" ON mistakes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "BTC contexts are viewable by everyone" ON btc_contexts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "OI conditions are viewable by everyone" ON oi_conditions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Funding conditions are viewable by everyone" ON funding_conditions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Triggers are viewable by everyone" ON triggers FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for Trades (Users can only access their own trades)
CREATE POLICY "Users can view their own trades" ON trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trades" ON trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trades" ON trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trades" ON trades FOR DELETE USING (auth.uid() = user_id);

-- Insert default master data
INSERT INTO pairs (name) VALUES 
  ('BTC/USDT'),
  ('ETH/USDT'),
  ('BNB/USDT'),
  ('SOL/USDT'),
  ('XRP/USDT');

INSERT INTO trade_setups (name) VALUES 
  ('Breakout'),
  ('Reversal'),
  ('Range'),
  ('Trend Following'),
  ('Scalp');

INSERT INTO mistakes (name) VALUES 
  ('FOMO Entry'),
  ('No Stop Loss'),
  ('Overtrading'),
  ('Revenge Trading'),
  ('Ignoring Plan'),
  ('Late Entry'),
  ('Early Exit'),
  ('Sizing Too Large');

INSERT INTO btc_contexts (name) VALUES 
  ('Bullish'),
  ('Bearish'),
  ('Sideways'),
  ('High Volatility'),
  ('Low Volatility');

INSERT INTO oi_conditions (name) VALUES 
  ('High OI'),
  ('Low OI'),
  ('OI Increasing'),
  ('OI Decreasing'),
  ('Neutral');

INSERT INTO funding_conditions (name) VALUES 
  ('Positive Funding'),
  ('Negative Funding'),
  ('Neutral Funding'),
  ('Extreme Positive'),
  ('Extreme Negative');

INSERT INTO triggers (name) VALUES 
  ('Sweep'),
  ('BOS'),
  ('CHoCH'),
  ('Retest'),
  ('Breakout'),
  ('OB'),
  ('FVG');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
