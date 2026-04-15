-- Add industry and description columns to the phrases table
ALTER TABLE phrases ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE phrases ADD COLUMN IF NOT EXISTS description text;

-- Deactivate all existing phrases so the new grid takes over
UPDATE phrases SET active = false;

-- ============================================================
-- Seed industry × use-case phrases (7 industries × 5 use cases = 35)
-- ============================================================

-- ---- Healthcare ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Hi, I''m calling from Dr. Patel''s office — I wanted to let you know your prescription refill has been approved and is ready for pickup at your pharmacy. While I have you, would you like to go ahead and schedule your follow-up appointment?',
   'Customer Support', 'Healthcare', 'Agent handling appointment scheduling and prescription status updates', true),

  ('Good afternoon! I''m reaching out because you requested information about our laser vision correction program. I''d love to ask a few quick questions to see which procedure might be the best fit — do you have a couple of minutes?',
   'Outbound Lead Qualification', 'Healthcare', 'Agent qualifying patients interested in elective procedures', true),

  ('I''m calling to confirm your appointment with Dr. Chen this Thursday at 2 PM. Will you still be able to make it, or would you like me to find a different time that works better?',
   'Appointment Scheduling', 'Healthcare', 'Agent booking and confirming patient appointments', true),

  ('I''m reaching out regarding your remaining balance of two hundred forty-five dollars from your visit on March 12th. We do offer payment plans if that would be helpful — would you like me to walk you through the options?',
   'Payment & Collections', 'Healthcare', 'Agent following up on outstanding patient balances', true),

  ('We noticed it''s been over a year since your last wellness check-up, and we''d love to get you back on the schedule. Dr. Patel has some openings next week — can I book one for you?',
   'Retention & Win-Back', 'Healthcare', 'Agent re-engaging patients who haven''t visited recently', true);

-- ---- Insurance ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I see you''re calling about your auto policy — I can definitely help with that. It looks like your renewal is coming up next month. Would you like me to walk you through any coverage changes before it renews?',
   'Customer Support', 'Insurance', 'Agent answering policy questions and processing changes', true),

  ('Thanks for requesting a quote through our website! I just need to ask a few questions about your current coverage so I can make sure we''re comparing apples to apples — what provider are you with right now?',
   'Outbound Lead Qualification', 'Insurance', 'Agent qualifying leads requesting insurance quotes', true),

  ('I''d love to set up a 15-minute call with one of our licensed advisors to review your coverage options. Do mornings or afternoons generally work better for you?',
   'Appointment Scheduling', 'Insurance', 'Agent booking consultations with insurance advisors', true),

  ('I''m reaching out because your premium payment due on the 1st hasn''t come through yet. To make sure your coverage stays active, can we get that taken care of today? I can process it right over the phone.',
   'Payment & Collections', 'Insurance', 'Agent following up on overdue premium payments', true),

  ('I noticed your homeowner''s policy lapsed last month, and I wanted to check in. We''ve actually rolled out some new rates that might be more competitive — would you be open to a quick comparison?',
   'Retention & Win-Back', 'Insurance', 'Agent re-engaging policyholders who didn''t renew', true);

-- ---- Home Services ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thanks for calling! I can see your HVAC maintenance visit is scheduled for this Friday between 10 and 12. The technician will call you about 30 minutes before arrival — is there anything else I can help with?',
   'Customer Support', 'Home Services', 'Agent handling service inquiries and job status updates', true),

  ('Hi there! You submitted a request for a roof inspection on our site. Before I get a crew scheduled, can I ask a few questions about the age and type of your roof so we send the right specialist?',
   'Outbound Lead Qualification', 'Home Services', 'Agent qualifying homeowners requesting service estimates', true),

  ('I''ve got a plumber available this Wednesday afternoon or Thursday morning — which window works best for you? We''ll send you a text confirmation with a two-hour arrival window.',
   'Appointment Scheduling', 'Home Services', 'Agent booking service appointments and dispatch windows', true),

  ('I''m following up on the invoice from your kitchen remodel that was completed on the 15th. The remaining balance is twelve hundred dollars — would you like to pay by card today, or would a payment plan work better?',
   'Payment & Collections', 'Home Services', 'Agent collecting payment for completed service jobs', true),

  ('Hey, we serviced your AC unit last summer and it''s about that time again! We''re running an early-bird tune-up special this month — want me to get you on the schedule before spots fill up?',
   'Retention & Win-Back', 'Home Services', 'Agent re-engaging past customers for seasonal maintenance', true);

-- ---- Financial Services ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I can see the transaction you''re asking about — it looks like a pending hold from your hotel stay that should clear within 48 hours. Would you like me to flag it for expedited review?',
   'Customer Support', 'Financial Services', 'Agent answering account questions and resolving issues', true),

  ('Thanks for your interest in our business line of credit! To get you the most accurate terms, I just need to confirm a few details about your company''s annual revenue and how long you''ve been operating.',
   'Outbound Lead Qualification', 'Financial Services', 'Agent qualifying prospects interested in financial products', true),

  ('I''d love to set you up with one of our certified financial planners for a complimentary portfolio review. We have slots available this week — would Tuesday at 3 PM or Thursday at 11 AM work for you?',
   'Appointment Scheduling', 'Financial Services', 'Agent booking consultations with financial advisors', true),

  ('I''m reaching out because your monthly installment of three hundred eighty dollars is now 10 days past due. We want to help you stay on track — would you like to make a payment now, or discuss a modified schedule?',
   'Payment & Collections', 'Financial Services', 'Agent following up on outstanding loan payments', true),

  ('I noticed you recently closed your premium checking account, and I wanted to see if there''s anything we could have done differently. We''ve actually introduced some new fee-free options that might be a better fit.',
   'Retention & Win-Back', 'Financial Services', 'Agent re-engaging clients who closed or downgraded accounts', true);

-- ---- Automotive ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I see your vehicle is coming up on its 30,000-mile service interval. That includes an oil change, tire rotation, and brake inspection — would you like me to get that booked for you?',
   'Customer Support', 'Automotive', 'Agent answering questions about vehicle service and warranties', true),

  ('Hi! I saw you were looking at the 2026 Civic on our website. I''d love to help — are you exploring options right now, or is there a specific timeline you''re working with for your next vehicle?',
   'Outbound Lead Qualification', 'Automotive', 'Agent qualifying buyers who submitted online inquiries', true),

  ('Great news — I''ve got the model you''re interested in available for a test drive. Would this Saturday morning work, or would you prefer a weekday evening?',
   'Appointment Scheduling', 'Automotive', 'Agent booking test drives and service appointments', true),

  ('I''m reaching out about your auto lease payment that was due on the 5th. I want to make sure we keep your account in good standing — can we process that payment today, or would you like to set up autopay?',
   'Payment & Collections', 'Automotive', 'Agent following up on overdue auto loan or lease payments', true),

  ('Your lease is coming up in about 60 days, and I wanted to make sure you know about your options. We have some great loyalty incentives right now — would you be open to exploring an upgrade or a buyout?',
   'Retention & Win-Back', 'Automotive', 'Agent re-engaging customers whose leases are expiring', true);

-- ---- Retail ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I found your order — it looks like the shipment is currently in transit and should arrive by Thursday. If you''d like, I can set up a delivery notification so you know the moment it''s out for delivery.',
   'Customer Support', 'Retail', 'Agent handling order inquiries and returns', true),

  ('Thanks for signing up for our VIP early access! I just want to make sure we''re sending you the right recommendations — are you mainly shopping for yourself, or are you picking up gifts as well?',
   'Outbound Lead Qualification', 'Retail', 'Agent qualifying shoppers who signed up for promotions', true),

  ('We''d love to set you up with one of our personal stylists for a complimentary session. We have openings this weekend — would Saturday or Sunday afternoon work better for you?',
   'Appointment Scheduling', 'Retail', 'Agent booking personal shopping and styling appointments', true),

  ('I''m calling about the outstanding balance on your store credit account. Your next minimum payment of forty-five dollars is due on the 20th — would you like to make that payment now, or set up a reminder?',
   'Payment & Collections', 'Retail', 'Agent following up on outstanding store credit balances', true),

  ('We''ve missed you! It''s been a while since your last purchase, and I wanted to let you know you still have 2,500 loyalty points that expire next month. Can I help you find something to use them on?',
   'Retention & Win-Back', 'Retail', 'Agent re-engaging lapsed loyalty program members', true);

-- ---- Resorts & Hospitality ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling! I see your reservation is for next Friday through Sunday. I''d be happy to arrange a late checkout or add any special requests to your booking — is there anything you''d like?',
   'Customer Support', 'Resorts & Hospitality', 'Agent handling guest inquiries and concierge requests', true),

  ('Hi! I''m following up on your interest in our all-inclusive island package. To put together the best options, could you tell me your preferred travel dates and how many guests will be joining?',
   'Outbound Lead Qualification', 'Resorts & Hospitality', 'Agent qualifying leads interested in vacation packages', true),

  ('I''d love to get you booked for that couples'' massage during your stay. We have availability on Saturday at 10 AM or 2 PM — which would you prefer?',
   'Appointment Scheduling', 'Resorts & Hospitality', 'Agent booking spa treatments and resort activities', true),

  ('I''m reaching out about the remaining balance for your upcoming reservation. The deposit of three hundred fifty dollars is due by this Friday to confirm your booking — would you like to take care of that now?',
   'Payment & Collections', 'Resorts & Hospitality', 'Agent collecting deposits and outstanding balances for bookings', true),

  ('It''s been a year since your last visit with us, and we''d love to welcome you back! We''re offering returning guests an exclusive 20 percent discount on midweek stays — shall I check availability for you?',
   'Retention & Win-Back', 'Resorts & Hospitality', 'Agent re-engaging past guests with return offers', true);
