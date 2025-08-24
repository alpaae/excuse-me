-- Add rarity column to excuses table
ALTER TABLE public.excuses ADD COLUMN IF NOT EXISTS rarity text NOT NULL DEFAULT 'common';

-- Add index for better performance on rarity queries
CREATE INDEX IF NOT EXISTS idx_excuses_rarity ON public.excuses(rarity);

-- Add index for user_id + rarity combination
CREATE INDEX IF NOT EXISTS idx_excuses_user_rarity ON public.excuses(user_id, rarity);
