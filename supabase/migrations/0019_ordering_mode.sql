-- Pre-launch ordering mode.
--
-- Razorpay has not approved the account yet, so the site must not take money
-- online: the only keys configured are rzp_test_…, and a customer walking
-- through checkout would see a "successful" payment while nothing moved.
-- Orders are taken on WhatsApp and Instagram DM instead and keyed into
-- /admin/orders/new (order_channel already supports 'whatsapp'/'instagram').
--
-- This is a switch, not a code branch anyone has to come back and unpick.
-- When Razorpay is live:
--
--   update site_settings
--      set value = jsonb_set(value, '{enabled}', '"true"')
--    where key = 'ordering';
--
-- …and the cart, checkout and Razorpay flow come back exactly as they are
-- today. No code change, no redeploy.
--
-- Values are strings to match how every other site_settings row stores them.
insert into site_settings (key, value) values (
  'ordering',
  jsonb_build_object(
    'enabled',       'false',
    -- ig.me/m/<handle> opens a DM thread with the account rather than dropping
    -- the customer on the profile. Stored as a full URL so it can be pointed
    -- somewhere else (e.g. the plain profile) without touching code.
    'instagram_url', 'https://ig.me/m/trulysusi',
    -- null = use customer_care.phone. Set this only if orders ever move to a
    -- different line from the care number.
    'whatsapp',      null,
    'notice',        'Online checkout is opening soon. For now we take orders on WhatsApp and Instagram DM.'
  )
) on conflict (key) do nothing;
