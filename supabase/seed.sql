-- Production Seed: Subscription Plans Only
-- Run this ONCE in your live Supabase project to define billing tiers.
-- DO NOT insert demo academies or students here.

-- Subscription Plans
INSERT INTO subscriptions (plan_name, max_students, price, features) VALUES
  ('Starter', 100, 999.00,  '{"qr_attendance": false, "whatsapp_alerts": false, "events": false}'),
  ('Professional', 500, 2999.00, '{"qr_attendance": true, "whatsapp_alerts": true, "events": true}'),
  ('Enterprise', 9999, 7999.00, '{"qr_attendance": true, "whatsapp_alerts": true, "events": true, "custom_domain": true, "priority_support": true}')
ON CONFLICT DO NOTHING;

