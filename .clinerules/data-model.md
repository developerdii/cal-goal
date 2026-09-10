# Data Model

## localStorage schema — single key `calgoal`, `version: 3`
```jsonc
{
  "version": 3,
  "days": {
    "YYYY-MM-DD": {                      // local date key
      "date": "YYYY-MM-DD",
      "entries": [
        { "id": "uuid", "type": "item", "name": "Banana", "calories": 105, "createdAt": "ISO-8601" },
        { "id": "uuid", "type": "item", "name": "Chicken", "unit": "g", "amount": 100, "perKcal": 110, "quantity": 250, "foodId": null, "createdAt": "ISO-8601" },
        { "id": "uuid", "type": "group", "name": "Breakfast", "items": [{ "id": "uuid", "name": "Oats", "calories": 300 }], "createdAt": "ISO-8601" }
      ]
    }
  },
  "settings": { "maintenanceCalories": 2000, "goalType": "maintain|deficit|surplus", "goalAmount": 0, "currentWeight": 70 },
  "prefs": { "locale": "en|tr", "theme": "auto|light|dark" },
  "foods": [ { "id": "uuid", "type": "food|group", "name": "..." } ]
}
```
- `normalize()` in `storageService.js` applies defaults + migrates old fields (`calorieGoal` → maintenance + `maintain`).
- Week starts **Monday**, derived from date keys; history is implicit (days keyed by date, never deleted).

## Supabase schema — `supabase/schema.sql`
- Table `public.user_data`: `user_id uuid PK → auth.users(id)` (on delete cascade), `data jsonb`, `created_at`/`updated_at`.
- Row Level Security enabled; policies allow a user to select/insert/update/delete **only their own row** (`auth.uid() = user_id`).
- Client uses the **anon** public key; RLS is the actual protection.
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (see `.env.example`). `src/lib/supabase.js` exports `supabase` (null if unconfigured) + `isSupabaseConfigured`.

## Cloud sync flow (`storageService.init`)
- Guest → load local. Signed-in → load cloud row; if none and local has meaningful data, migrate local → cloud **once**, then clear local.

## Domain math
- Daily target (`settingsStore.dailyTarget`): maintain → maintenance; deficit → maintenance − goalAmount; surplus → maintenance + goalAmount.
- `dailyBalance = consumed − goal` (negative = under).
- Weekly balance = Σ `dailyBalance` over **completed days only** (today + future excluded; see `analysis.js`).
- Estimated weight change (kg) = Σ(consumed − maintenance) / 7000, completed days only.
- Serving (`utils/nutrition.js`): `resolveKcal = round((quantity / amount) * perKcal)`; `resolveQuantity` falls back to the reference amount.
- Units are language-agnostic codes (`utils/units.js`); labels via i18n `units.*` / `unitsPlural.*`.