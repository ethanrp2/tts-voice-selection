-- ============================================================
--  Full schema for tts-voice-selection (voices-v2)
--  Run this in a fresh Supabase project's SQL Editor.
-- ============================================================

-- 1. VOICES
CREATE TABLE IF NOT EXISTS public.voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('cartesia', 'elevenlabs', 'rime')),
  cartesia_voice_id text,
  elevenlabs_voice_id text,
  rime_speaker text,
  description text,
  active boolean NOT NULL DEFAULT true,
  flag_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT voices_provider_voice_id_consistency_chk CHECK (
    (provider = 'cartesia'   AND cartesia_voice_id IS NOT NULL AND elevenlabs_voice_id IS NULL)
    OR
    (provider = 'elevenlabs' AND elevenlabs_voice_id IS NOT NULL AND cartesia_voice_id IS NULL)
    OR
    (provider = 'rime'       AND coalesce(rime_speaker, cartesia_voice_id) IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS voices_provider_name_uidx
  ON public.voices (provider, name);

CREATE UNIQUE INDEX IF NOT EXISTS voices_cartesia_voice_id_uidx
  ON public.voices (cartesia_voice_id)
  WHERE provider = 'cartesia' AND cartesia_voice_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS voices_elevenlabs_voice_id_uidx
  ON public.voices (elevenlabs_voice_id)
  WHERE provider = 'elevenlabs' AND elevenlabs_voice_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS voices_rime_speaker_uidx
  ON public.voices (rime_speaker)
  WHERE provider = 'rime' AND rime_speaker IS NOT NULL;


-- 2. PHRASES
CREATE TABLE IF NOT EXISTS public.phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  use_case text,
  industry text,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 3. MATCHUPS
CREATE TABLE IF NOT EXISTS public.matchups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_a_id uuid NOT NULL REFERENCES public.voices(id),
  voice_b_id uuid NOT NULL REFERENCES public.voices(id),
  phrase_id uuid NOT NULL REFERENCES public.phrases(id),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 4. VOTES
CREATE TABLE IF NOT EXISTS public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matchup_id uuid NOT NULL REFERENCES public.matchups(id),
  category text NOT NULL CHECK (category = ANY (ARRAY['appeal', 'empathy', 'authority', 'energy'])),
  winner text NOT NULL CHECK (winner IN ('a', 'b')),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 5. ELO RATINGS
CREATE TABLE IF NOT EXISTS public.elo_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id uuid NOT NULL REFERENCES public.voices(id),
  category text NOT NULL CHECK (category = ANY (ARRAY['appeal', 'empathy', 'authority', 'energy'])),
  rating integer NOT NULL DEFAULT 1200,
  match_count integer NOT NULL DEFAULT 0,
  win_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (voice_id, category)
);


-- 6. VOICE FLAGS
CREATE TABLE IF NOT EXISTS public.voice_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id uuid NOT NULL REFERENCES public.voices(id),
  matchup_id uuid REFERENCES public.matchups(id),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
--  Seed industry × use case phrases  (7 industries × 6 use cases × 2 phrases = 84)
-- ============================================================

-- Healthcare × Outbound Lead Qualification
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Hi, this is Sarah from Lakewood Medical Group. I''m following up on your inquiry about becoming a new patient — do you have a couple of minutes so I can gather some basic information and match you with the right provider?',
   'Outbound Lead Qualification', 'Healthcare', 'Agent responsible for qualifying new patient inquiries and conducting intake screenings', true),
  ('Good afternoon! I''m reaching out from Dr. Chen''s office. I saw you requested information about our cardiology services — could you tell me a bit about what prompted your visit so we can make sure you''re seen by the right specialist?',
   'Outbound Lead Qualification', 'Healthcare', 'Agent responsible for qualifying new patient inquiries and conducting intake screenings', true);

-- Healthcare × Customer Support
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Hi, I''m calling from Dr. Rivera''s office. I wanted to let you know that your prescription for amoxicillin has been filled and is ready for pickup at Walgreens on Main Street.',
   'Customer Support', 'Healthcare', 'Agent responsible for handling prescription updates and answering patient care questions', true),
  ('Thank you for calling Lakewood Medical. I can see your lab results have come in — your doctor has reviewed them and everything looks normal. Would you like me to send a copy to your patient portal?',
   'Customer Support', 'Healthcare', 'Agent responsible for handling prescription updates and answering patient care questions', true);

-- Healthcare × Appointment Scheduling
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I''d be happy to help you schedule that follow-up with Dr. Patel. I have openings next Tuesday at 9 AM and Thursday at 2:30 PM — which works better for you?',
   'Appointment Scheduling', 'Healthcare', 'Agent responsible for booking and confirming patient appointments', true),
  ('I see you need to reschedule your annual physical. The next available slot with your preferred doctor is Monday the 14th at 11 AM. Should I book that for you?',
   'Appointment Scheduling', 'Healthcare', 'Agent responsible for booking and confirming patient appointments', true);

-- Healthcare × Inbound Triage
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Lakewood Medical Group. I''d like to make sure you get to the right person — are you calling about an existing appointment, a new concern, or do you need to speak with a nurse?',
   'Inbound Triage', 'Healthcare', 'Agent responsible for routing patients to the right department or nurse line', true),
  ('I understand you''re experiencing some symptoms. Let me connect you with our triage nurse who can help assess the situation — please hold for just a moment.',
   'Inbound Triage', 'Healthcare', 'Agent responsible for routing patients to the right department or nurse line', true);

-- Healthcare × Account Management
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I see that the insurance on file for you is still listed as Blue Cross. Has your coverage changed at all since your last visit? I want to make sure everything is up to date before your appointment.',
   'Account Management', 'Healthcare', 'Agent responsible for updating patient records and insurance information', true),
  ('I''ve updated your address and phone number in our system. Your next statement will be sent to your new address. Is there anything else on your account you''d like me to update?',
   'Account Management', 'Healthcare', 'Agent responsible for updating patient records and insurance information', true);

-- Healthcare × After-Hours Lead Capture
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Lakewood Medical Group. Our office is currently closed, but I''d love to help. Can I get your name and the best number to reach you so we can have someone call you back first thing in the morning?',
   'After-Hours Lead Capture', 'Healthcare', 'Agent responsible for capturing new patient inquiries after hours', true),
  ('Hi, you''ve reached us after hours. I can take down your information and have our patient coordinator reach out tomorrow. What''s your name and what type of appointment are you looking for?',
   'After-Hours Lead Capture', 'Healthcare', 'Agent responsible for capturing new patient inquiries after hours', true);

-- Insurance × Outbound Lead Qualification
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Hi, this is Mike from Horizon Insurance. I''m following up on the home insurance quote you requested online — do you have a few minutes so I can ask a couple of questions and get you an accurate rate?',
   'Outbound Lead Qualification', 'Insurance', 'Agent responsible for qualifying prospects requesting policy quotes', true),
  ('Good afternoon! I''m calling from Horizon Insurance regarding your auto policy inquiry. Could you tell me about your current coverage so I can see where we might be able to save you some money?',
   'Outbound Lead Qualification', 'Insurance', 'Agent responsible for qualifying prospects requesting policy quotes', true);

-- Insurance × Customer Support
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I can absolutely help you with that claim. I see the incident was reported on March 3rd and your claim number is 4478. Your adjuster should be reaching out within the next 48 hours to schedule an inspection.',
   'Customer Support', 'Insurance', 'Agent responsible for answering coverage questions and processing claims', true),
  ('Great question — based on your current plan, that procedure would be covered at 80 percent after your $500 deductible is met. Would you like me to walk you through the pre-authorization process?',
   'Customer Support', 'Insurance', 'Agent responsible for answering coverage questions and processing claims', true);

-- Insurance × Appointment Scheduling
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I''d love to set you up with one of our agents for a policy review. I have availability this Wednesday at 1 PM or Friday at 10 AM — would either of those work for you?',
   'Appointment Scheduling', 'Insurance', 'Agent responsible for booking consultations with insurance agents', true),
  ('Let me schedule your annual policy review. Your agent, Jessica Torres, has openings next week on Tuesday and Thursday afternoons. Which day would you prefer?',
   'Appointment Scheduling', 'Insurance', 'Agent responsible for booking consultations with insurance agents', true);

-- Insurance × Inbound Triage
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Horizon Insurance. To get you to the right team, could you let me know if you''re calling about an existing claim, a billing question, or changes to your policy?',
   'Inbound Triage', 'Insurance', 'Agent responsible for routing callers to claims, billing, or policy departments', true),
  ('I understand you need help with your account. It sounds like this is a billing matter — let me transfer you to our billing team who can pull up your payment history right away.',
   'Inbound Triage', 'Insurance', 'Agent responsible for routing callers to claims, billing, or policy departments', true);

-- Insurance × Account Management
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Looking at your account, your auto policy renews on May 15th at a rate of $142 per month. I also noticed you might qualify for a multi-policy discount — would you like me to run those numbers?',
   'Account Management', 'Insurance', 'Agent responsible for managing policy renewals and coverage changes', true),
  ('I''ve processed the update to add your new vehicle to the policy. Your monthly premium will increase by $34, effective next billing cycle. I''ll send a confirmation to your email on file.',
   'Account Management', 'Insurance', 'Agent responsible for managing policy renewals and coverage changes', true);

-- Insurance × After-Hours Lead Capture
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thanks for calling Horizon Insurance. We''re closed for the evening, but I''d love to make sure you get that quote. Can I grab your name, phone number, and the type of coverage you''re interested in?',
   'After-Hours Lead Capture', 'Insurance', 'Agent responsible for collecting contact info from prospects requesting quotes', true),
  ('Our office is currently closed, but I can take your information so an agent can call you back tomorrow with a personalized quote. What''s the best time to reach you?',
   'After-Hours Lead Capture', 'Insurance', 'Agent responsible for collecting contact info from prospects requesting quotes', true);

-- Home Services × Outbound Lead Qualification
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Hi, this is Alex from Comfort Pro HVAC. I''m calling about the AC inspection you requested — do you have a quick moment so I can confirm a few details about your system and get you scheduled?',
   'Outbound Lead Qualification', 'Home Services', 'Agent responsible for qualifying homeowners requesting service estimates', true),
  ('Good afternoon! I''m following up on your request for a plumbing estimate. Could you tell me a bit more about the issue you''re experiencing so I can send the right technician?',
   'Outbound Lead Qualification', 'Home Services', 'Agent responsible for qualifying homeowners requesting service estimates', true);

-- Home Services × Customer Support
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I''m sorry to hear the issue came back after our last visit. Let me get a senior technician out there at no additional charge — would tomorrow morning work for you?',
   'Customer Support', 'Home Services', 'Agent responsible for troubleshooting service issues and handling follow-ups', true),
  ('Thank you for letting us know. I can see your service was completed last Tuesday. Since it''s within our 30-day guarantee, we''ll send someone back out to take another look at no cost.',
   'Customer Support', 'Home Services', 'Agent responsible for troubleshooting service issues and handling follow-ups', true);

-- Home Services × Appointment Scheduling
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I have a technician available this Thursday between 8 AM and noon, or Friday from 1 to 5 PM. Which window works best for your schedule?',
   'Appointment Scheduling', 'Home Services', 'Agent responsible for booking service windows and dispatching technicians', true),
  ('Great news — I was able to move your appointment up to tomorrow afternoon. Our technician will arrive between 2 and 4 PM, and you''ll get a text when they''re on their way.',
   'Appointment Scheduling', 'Home Services', 'Agent responsible for booking service windows and dispatching technicians', true);

-- Home Services × Inbound Triage
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Comfort Pro. I want to make sure we handle this correctly — is this an emergency situation like a gas leak or flooding, or is this a routine maintenance request?',
   'Inbound Triage', 'Home Services', 'Agent responsible for routing calls between emergency and routine service requests', true),
  ('It sounds like you may have a water leak. Let me get you connected with our emergency dispatch team right away — they can have someone out within the hour.',
   'Inbound Triage', 'Home Services', 'Agent responsible for routing calls between emergency and routine service requests', true);

-- Home Services × Account Management
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I can see you''re on our annual maintenance plan, which includes two tune-ups per year. Your next scheduled service is in June. Would you like to go ahead and pick a date?',
   'Account Management', 'Home Services', 'Agent responsible for managing recurring service plans and warranties', true),
  ('Your warranty on the water heater installation expires next month. We offer an extended service plan for $12 a month that covers parts and labor — would you like to hear more about it?',
   'Account Management', 'Home Services', 'Agent responsible for managing recurring service plans and warranties', true);

-- Home Services × After-Hours Lead Capture
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Comfort Pro. Our office is closed, but I can take your information and have someone reach out first thing tomorrow. Can I get your name, address, and a brief description of the issue?',
   'After-Hours Lead Capture', 'Home Services', 'Agent responsible for capturing homeowner inquiries outside business hours', true),
  ('We''re currently closed for the evening, but I don''t want you to have to wait. Let me grab your details so our team can call you back as soon as we open at 8 AM.',
   'After-Hours Lead Capture', 'Home Services', 'Agent responsible for capturing homeowner inquiries outside business hours', true);

-- Financial Services × Outbound Lead Qualification
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Hi, this is Jordan from Summit Financial. I''m reaching out because you expressed interest in our mortgage refinancing options — do you have a few minutes to go over your goals so I can see what rates you''d qualify for?',
   'Outbound Lead Qualification', 'Financial Services', 'Agent responsible for qualifying prospects for lending or advisory services', true),
  ('Good afternoon! I''m calling from Summit Financial regarding your inquiry about wealth management. Could you tell me a bit about your investment goals so I can connect you with the right advisor?',
   'Outbound Lead Qualification', 'Financial Services', 'Agent responsible for qualifying prospects for lending or advisory services', true);

-- Financial Services × Customer Support
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I can see the charge for $247.50 posted on March 8th. That appears to be from an authorized autopay for your utility bill. Would you like me to walk you through your recent transaction history?',
   'Customer Support', 'Financial Services', 'Agent responsible for answering questions about accounts and transactions', true),
  ('Your wire transfer of $5,000 was processed yesterday and should arrive in the recipient''s account within one to two business days. Is there anything else I can help you with?',
   'Customer Support', 'Financial Services', 'Agent responsible for answering questions about accounts and transactions', true);

-- Financial Services × Appointment Scheduling
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I''d love to get you on the calendar with one of our advisors. Rachel Kim has availability this Thursday at 3 PM or next Monday at 10 AM — would either of those work?',
   'Appointment Scheduling', 'Financial Services', 'Agent responsible for booking meetings with financial advisors', true),
  ('Let me schedule your quarterly portfolio review. Your advisor has openings next week on Wednesday afternoon or Friday morning. Which would you prefer?',
   'Appointment Scheduling', 'Financial Services', 'Agent responsible for booking meetings with financial advisors', true);

-- Financial Services × Inbound Triage
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Summit Financial. To make sure I connect you with the right team, are you calling about a checking or savings account, a loan, or investment services?',
   'Inbound Triage', 'Financial Services', 'Agent responsible for routing callers to the correct department', true),
  ('I understand you have a question about a recent transaction. Let me transfer you to our fraud prevention team — they can review the activity on your account right away.',
   'Inbound Triage', 'Financial Services', 'Agent responsible for routing callers to the correct department', true);

-- Financial Services × Account Management
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Your current balance is thirteen thousand four hundred dollars, and your next payment of $450 is due on the 15th. Would you like to make a payment today or set up automatic payments?',
   'Account Management', 'Financial Services', 'Agent responsible for managing balance inquiries and payment processing', true),
  ('I''ve updated your beneficiary information as requested. The change will take effect within 5 business days. You''ll receive a confirmation letter at the address on file.',
   'Account Management', 'Financial Services', 'Agent responsible for managing balance inquiries and payment processing', true);

-- Financial Services × After-Hours Lead Capture
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Summit Financial. Our offices are currently closed, but I''d be happy to take your information so an advisor can reach out tomorrow. What services are you interested in?',
   'After-Hours Lead Capture', 'Financial Services', 'Agent responsible for collecting contact info from prospective clients', true),
  ('We''re closed for the evening, but I can make sure someone follows up with you first thing in the morning. Can I get your name, phone number, and the best time to call?',
   'After-Hours Lead Capture', 'Financial Services', 'Agent responsible for collecting contact info from prospective clients', true);

-- Automotive × Outbound Lead Qualification
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Hi, this is Chris from Parkway Motors. I''m calling about the 2025 Civic you were looking at on our website — are you still in the market? I''d love to answer any questions and get you set up for a test drive.',
   'Outbound Lead Qualification', 'Automotive', 'Agent responsible for following up with leads interested in vehicles or services', true),
  ('Good afternoon! I''m following up on your trade-in inquiry. Could you tell me a bit about your current vehicle so I can give you a preliminary estimate before you come in?',
   'Outbound Lead Qualification', 'Automotive', 'Agent responsible for following up with leads interested in vehicles or services', true);

-- Automotive × Customer Support
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I checked with our service department, and your vehicle is still covered under the powertrain warranty for another 18 months. The repair you mentioned would be fully covered — would you like me to schedule it?',
   'Customer Support', 'Automotive', 'Agent responsible for answering questions about vehicle service and warranties', true),
  ('Your oil change and tire rotation have been completed, and your car is ready for pickup. The total comes to $89.95. We also noticed your brake pads are getting low — would you like an estimate for that?',
   'Customer Support', 'Automotive', 'Agent responsible for answering questions about vehicle service and warranties', true);

-- Automotive × Appointment Scheduling
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I have service openings this Saturday at 8 AM and next Monday at 7:30 AM. Both include a complimentary loaner vehicle. Which works better for you?',
   'Appointment Scheduling', 'Automotive', 'Agent responsible for booking service appointments and test drives', true),
  ('Great, I''ve got you down for a test drive of the new Tucson this Thursday at 4 PM. Just bring your driver''s license and we''ll have the car ready for you out front.',
   'Appointment Scheduling', 'Automotive', 'Agent responsible for booking service appointments and test drives', true);

-- Automotive × Inbound Triage
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Parkway Motors. Are you looking to schedule a service appointment, inquire about a vehicle, or do you need to reach our parts department?',
   'Inbound Triage', 'Automotive', 'Agent responsible for routing callers to sales, service, or parts', true),
  ('It sounds like you''re interested in our pre-owned inventory. Let me connect you with one of our sales consultants who can walk you through what we have available.',
   'Inbound Triage', 'Automotive', 'Agent responsible for routing callers to sales, service, or parts', true);

-- Automotive × Account Management
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I''m reaching out because there''s an open recall on your 2022 Accord for a software update. It''s a quick fix and completely free — would you like me to schedule that for you?',
   'Account Management', 'Automotive', 'Agent responsible for managing service records and recall notifications', true),
  ('Looking at your service history, you''re due for your 60,000-mile maintenance. This includes a transmission fluid change and full inspection. Would you like me to book that?',
   'Account Management', 'Automotive', 'Agent responsible for managing service records and recall notifications', true);

-- Automotive × After-Hours Lead Capture
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thanks for calling Parkway Motors. Our dealership is closed right now, but I can take your name and number so a sales rep can reach out first thing tomorrow. Were you interested in a new or pre-owned vehicle?',
   'After-Hours Lead Capture', 'Automotive', 'Agent responsible for capturing leads from online vehicle inquiries', true),
  ('We''re currently closed, but I''d love to make sure you don''t miss out. Can I grab your contact info and the vehicle you''re interested in? Someone from our team will follow up in the morning.',
   'After-Hours Lead Capture', 'Automotive', 'Agent responsible for capturing leads from online vehicle inquiries', true);

-- Retail × Outbound Lead Qualification
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Hi, this is Taylor from Bloom & Co. I''m calling because you signed up for our VIP waitlist — I wanted to let you know our spring collection just dropped and you get early access. Can I tell you about a few pieces we picked for you?',
   'Outbound Lead Qualification', 'Retail', 'Agent responsible for qualifying interest in loyalty programs and seasonal promotions', true),
  ('Good afternoon! I''m reaching out from Bloom & Co. about our new loyalty rewards program. Based on your purchase history, you''d start with Gold status — would you like to hear about the benefits?',
   'Outbound Lead Qualification', 'Retail', 'Agent responsible for qualifying interest in loyalty programs and seasonal promotions', true);

-- Retail × Customer Support
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I''m sorry to hear about the sizing issue. I can process an exchange right away — would you like me to send the next size up, or would you prefer a full refund?',
   'Customer Support', 'Retail', 'Agent responsible for handling returns, exchanges, and order issues', true),
  ('I''ve looked into your order, and it appears the package was delivered to the wrong address. I''m going to ship a replacement today with express delivery at no extra charge.',
   'Customer Support', 'Retail', 'Agent responsible for handling returns, exchanges, and order issues', true);

-- Retail × Appointment Scheduling
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I''d love to set you up with one of our personal stylists. We have appointments available this Saturday at 11 AM and 2 PM — would either of those work?',
   'Appointment Scheduling', 'Retail', 'Agent responsible for booking personal shopping or fitting appointments', true),
  ('Your fitting appointment is confirmed for this Friday at 3 PM. Our tailor will have your suit ready to try on. Is there anything else you''d like to add to the appointment?',
   'Appointment Scheduling', 'Retail', 'Agent responsible for booking personal shopping or fitting appointments', true);

-- Retail × Inbound Triage
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Bloom & Co. I can help with that! Are you looking for information about an existing order, or would you like help finding a product?',
   'Inbound Triage', 'Retail', 'Agent responsible for routing callers to the right department or store location', true),
  ('I''d be happy to check if that item is in stock at your nearest location. Can you give me your zip code so I can look up the closest store?',
   'Inbound Triage', 'Retail', 'Agent responsible for routing callers to the right department or store location', true);

-- Retail × Account Management
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Your order shipped this morning and is expected to arrive by Thursday. I''m sending you the tracking number via text right now. Is there anything else I can help with?',
   'Account Management', 'Retail', 'Agent responsible for managing loyalty accounts and order tracking', true),
  ('Looking at your rewards account, you have 2,400 points — that''s enough for a $25 credit. Would you like to apply that to your next purchase?',
   'Account Management', 'Retail', 'Agent responsible for managing loyalty accounts and order tracking', true);

-- Retail × After-Hours Lead Capture
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling Bloom & Co. Our store is currently closed, but I can take your information and have a team member reach out when we open at 10 AM. What were you looking for today?',
   'After-Hours Lead Capture', 'Retail', 'Agent responsible for capturing customer interest outside store hours', true),
  ('We''re closed for the evening, but I''d be happy to reserve that item for you. Can I get your name, phone number, and the product you''re interested in?',
   'After-Hours Lead Capture', 'Retail', 'Agent responsible for capturing customer interest outside store hours', true);

-- Resorts & Hospitality × Outbound Lead Qualification
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Hi, this is Natalie from The Grand Palms Resort. I''m following up on your inquiry about our wedding packages — do you have a few minutes so I can learn more about your event and share some options?',
   'Outbound Lead Qualification', 'Resorts & Hospitality', 'Agent responsible for following up with guests interested in group bookings or packages', true),
  ('Good afternoon! I''m calling from The Grand Palms about the corporate retreat you were planning. I''d love to help you find the perfect package — could you tell me your group size and preferred dates?',
   'Outbound Lead Qualification', 'Resorts & Hospitality', 'Agent responsible for following up with guests interested in group bookings or packages', true);

-- Resorts & Hospitality × Customer Support
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I can absolutely help you modify your reservation. I''ve upgraded you to an ocean-view room at no additional charge since your original room type isn''t available. Does that work for you?',
   'Customer Support', 'Resorts & Hospitality', 'Agent responsible for handling reservation changes and guest requests', true),
  ('I''m sorry about the issue with your room. I''ve applied a credit to your account and arranged for a complimentary spa treatment during your stay. Is there anything else I can do?',
   'Customer Support', 'Resorts & Hospitality', 'Agent responsible for handling reservation changes and guest requests', true);

-- Resorts & Hospitality × Appointment Scheduling
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('I''d love to book that couples massage for you. We have availability this Saturday at 10 AM or 3 PM. The 60-minute session includes access to our thermal pools. Which time works best?',
   'Appointment Scheduling', 'Resorts & Hospitality', 'Agent responsible for booking spa treatments, dining, and activity reservations', true),
  ('Your dinner reservation at our rooftop restaurant is confirmed for Friday at 7:30 PM for a party of four. Would you like me to add any special requests, like a window table or a birthday dessert?',
   'Appointment Scheduling', 'Resorts & Hospitality', 'Agent responsible for booking spa treatments, dining, and activity reservations', true);

-- Resorts & Hospitality × Inbound Triage
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling The Grand Palms Resort. I''d love to help — are you calling about an existing reservation, a new booking, or do you need to reach a current guest?',
   'Inbound Triage', 'Resorts & Hospitality', 'Agent responsible for routing guest calls to front desk, concierge, or billing', true),
  ('It sounds like you''d like to explore activities in the area. Let me connect you with our concierge team — they can set up everything from snorkeling tours to dinner reservations.',
   'Inbound Triage', 'Resorts & Hospitality', 'Agent responsible for routing guest calls to front desk, concierge, or billing', true);

-- Resorts & Hospitality × Account Management
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Looking at your rewards account, you have 45,000 points — that''s enough for two complimentary nights at any of our resort locations. Would you like to start planning a trip?',
   'Account Management', 'Resorts & Hospitality', 'Agent responsible for managing loyalty points and guest preferences', true),
  ('I''ve noted your preferences in our system — king bed, high floor, and extra pillows. These will be applied to all your future reservations with us automatically.',
   'Account Management', 'Resorts & Hospitality', 'Agent responsible for managing loyalty points and guest preferences', true);

-- Resorts & Hospitality × After-Hours Lead Capture
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
  ('Thank you for calling The Grand Palms Resort. Our reservations team is currently unavailable, but I''d love to take your details so they can follow up tomorrow. Are you looking to book a stay or an event?',
   'After-Hours Lead Capture', 'Resorts & Hospitality', 'Agent responsible for capturing event and group booking inquiry details', true),
  ('We''re closed for the evening, but I can make sure your inquiry is prioritized. Can I get your name, phone number, and the dates you''re considering? Someone from our events team will reach out in the morning.',
   'After-Hours Lead Capture', 'Resorts & Hospitality', 'Agent responsible for capturing event and group booking inquiry details', true);
