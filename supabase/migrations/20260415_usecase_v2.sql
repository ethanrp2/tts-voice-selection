-- Deactivate old phrases
UPDATE phrases SET active = false WHERE active = true;

-- ============================================================
-- 7 industries × 10 use cases = 70 phrases
-- ============================================================

-- ---- HEALTHCARE ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('You requested info about our orthopedic program — can I ask a few quick questions to see if you''re a good fit?',
 'Lead Qualification', 'Healthcare', 'Vetting prospects and initial vetting', true),
('I have an opening with Dr. Chen on Thursday at 2 PM — would you like me to book that for you?',
 'Appt. Scheduling', 'Healthcare', 'Booking and calendar management', true),
('Your visit on March 12th has a remaining balance of two forty-five — want me to walk you through payment options?',
 'Financial Services', 'Healthcare', 'Billing, payments, and balance checks', true),
('Your prescription refill has been approved and is ready for pickup — is there anything else I can help with?',
 'Customer Support', 'Healthcare', 'FAQs, troubleshooting, and general help', true),
('Let me make sure I connect you with the right department — are you calling about an existing appointment or a new concern?',
 'Inbound Triage', 'Healthcare', 'Intent recognition and routing', true),
('I can see your lab results are in — would you like me to walk you through next steps or send them to your portal?',
 'Account Management', 'Healthcare', 'Profile updates and status checks', true),
('Before I pull up your records, I just need to verify your date of birth and the last four of your SSN.',
 'Authentication', 'Healthcare', 'Identity verification and security', true),
('Let me check if Dr. Patel is in-network for your plan — can you give me your insurance provider and member ID?',
 'Healthcare/Insurance', 'Healthcare', 'Benefits verification and location searches', true),
('Our office is closed for the evening, but I can take down your info so a coordinator reaches out first thing tomorrow.',
 'Lead Capture', 'Healthcare', 'After-hours intake', true),
('I understand the cost is a concern — we do offer financing that makes it much more manageable, want me to explain?',
 'Objection Handling', 'Healthcare', 'Retention and addressing concerns', true);

-- ---- INSURANCE ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('Thanks for requesting a quote — what provider are you with now so I can get you an accurate comparison?',
 'Lead Qualification', 'Insurance', 'Vetting prospects and initial vetting', true),
('I''d love to set up a call with one of our licensed advisors — do mornings or afternoons work better?',
 'Appt. Scheduling', 'Insurance', 'Booking and calendar management', true),
('Your premium payment from the 1st hasn''t come through — can we get that handled to keep your coverage active?',
 'Financial Services', 'Insurance', 'Billing, payments, and balance checks', true),
('Your auto policy renewal is coming up next month — would you like to review any coverage changes before it kicks in?',
 'Customer Support', 'Insurance', 'FAQs, troubleshooting, and general help', true),
('I can help route you to the right team — are you calling about a new claim, an existing policy, or billing?',
 'Inbound Triage', 'Insurance', 'Intent recognition and routing', true),
('Your claim from last week has been approved — the payout should hit your account within three to five business days.',
 'Account Management', 'Insurance', 'Profile updates and status checks', true),
('For security, I''ll need to verify your policy number and the name on the account before making any changes.',
 'Authentication', 'Insurance', 'Identity verification and security', true),
('Let me look up whether that specialist is covered under your plan — what''s the provider''s name and your member ID?',
 'Healthcare/Insurance', 'Insurance', 'Benefits verification and location searches', true),
('We''re closed right now, but I can collect your details so an agent calls you back when we open — what''s the best number?',
 'Lead Capture', 'Insurance', 'After-hours intake', true),
('I hear you — switching feels like a hassle, but our rates are 20 percent lower and we handle the entire transfer.',
 'Objection Handling', 'Insurance', 'Retention and addressing concerns', true);

-- ---- HOME SERVICES ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('You submitted a request for a roof inspection — can I ask a couple questions so we send the right crew?',
 'Lead Qualification', 'Home Services', 'Vetting prospects and initial vetting', true),
('I''ve got a plumber available Wednesday afternoon or Thursday morning — which window works best for you?',
 'Appt. Scheduling', 'Home Services', 'Booking and calendar management', true),
('The remaining balance on your kitchen remodel is twelve hundred — would you like to pay by card or set up a plan?',
 'Financial Services', 'Home Services', 'Billing, payments, and balance checks', true),
('Your HVAC visit is confirmed for Friday between 10 and 12 — the tech will call 30 minutes before arrival.',
 'Customer Support', 'Home Services', 'FAQs, troubleshooting, and general help', true),
('Got it — is this for an emergency repair or routine maintenance? That''ll help me route you to the right team.',
 'Inbound Triage', 'Home Services', 'Intent recognition and routing', true),
('Your annual maintenance plan renews next month — your last service was in September, want to schedule the next one?',
 'Account Management', 'Home Services', 'Profile updates and status checks', true),
('I just need to confirm the address on file and your last name before I can pull up your service history.',
 'Authentication', 'Home Services', 'Identity verification and security', true),
('Let me check if this repair is covered under your home warranty — what''s your policy number?',
 'Healthcare/Insurance', 'Home Services', 'Benefits verification and location searches', true),
('We''re booked for today, but I can lock in a slot for you this week — what''s your name and address?',
 'Lead Capture', 'Home Services', 'After-hours intake', true),
('I understand the quote feels high — it includes a two-year warranty on parts and labor, which most competitors don''t offer.',
 'Objection Handling', 'Home Services', 'Retention and addressing concerns', true);

-- ---- FINANCIAL SERVICES ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('Thanks for your interest in our business credit line — what''s your company''s annual revenue so I can get you accurate terms?',
 'Lead Qualification', 'Financial Services', 'Vetting prospects and initial vetting', true),
('I can set you up with a financial planner for a free portfolio review — does Tuesday at 3 or Thursday at 11 work?',
 'Appt. Scheduling', 'Financial Services', 'Booking and calendar management', true),
('Your monthly installment of three eighty is 10 days past due — would you like to make a payment or adjust the schedule?',
 'Financial Services', 'Financial Services', 'Billing, payments, and balance checks', true),
('That pending charge is a hotel hold — it should clear in 48 hours. Want me to flag it for expedited review?',
 'Customer Support', 'Financial Services', 'FAQs, troubleshooting, and general help', true),
('Are you calling about a personal account, a business account, or a loan? I''ll get you to the right specialist.',
 'Inbound Triage', 'Financial Services', 'Intent recognition and routing', true),
('Your new debit card was shipped yesterday — you should receive it within three to five business days.',
 'Account Management', 'Financial Services', 'Profile updates and status checks', true),
('I''ll need to verify the last four of your Social and your account number before I can make any changes.',
 'Authentication', 'Financial Services', 'Identity verification and security', true),
('Let me check your HSA balance and see if this expense qualifies — can you tell me the provider and the amount?',
 'Healthcare/Insurance', 'Financial Services', 'Benefits verification and location searches', true),
('Our advisors are unavailable right now, but I can schedule a callback — what time works best for you tomorrow?',
 'Lead Capture', 'Financial Services', 'After-hours intake', true),
('I understand you''re hesitant about the annual fee — but it''s offset by rewards that save most clients over five hundred a year.',
 'Objection Handling', 'Financial Services', 'Retention and addressing concerns', true);

-- ---- AUTOMOTIVE ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('I saw you were checking out the 2026 Civic online — are you actively shopping or just exploring options?',
 'Lead Qualification', 'Automotive', 'Vetting prospects and initial vetting', true),
('The model you want is available for a test drive — would Saturday morning or a weekday evening work better?',
 'Appt. Scheduling', 'Automotive', 'Booking and calendar management', true),
('Your auto lease payment from the 5th is overdue — can we process it today or set up autopay?',
 'Financial Services', 'Automotive', 'Billing, payments, and balance checks', true),
('Your vehicle is due for its 30,000-mile service — oil change, tire rotation, and brake check. Want me to book it?',
 'Customer Support', 'Automotive', 'FAQs, troubleshooting, and general help', true),
('Are you calling about sales, service, or financing? I''ll connect you with the right department.',
 'Inbound Triage', 'Automotive', 'Intent recognition and routing', true),
('Your extended warranty is active through 2028 — last service was in January, everything looks good on your end.',
 'Account Management', 'Automotive', 'Profile updates and status checks', true),
('I just need your VIN or the last name on the account to pull up your vehicle records.',
 'Authentication', 'Automotive', 'Identity verification and security', true),
('Let me check if this repair falls under your extended warranty — what''s the issue you''re experiencing?',
 'Healthcare/Insurance', 'Automotive', 'Benefits verification and location searches', true),
('Our sales team is off for the day, but I can save your info and have someone reach out first thing tomorrow.',
 'Lead Capture', 'Automotive', 'After-hours intake', true),
('I know the monthly payment feels steep — we can extend the term to bring it down, want me to run those numbers?',
 'Objection Handling', 'Automotive', 'Retention and addressing concerns', true);

-- ---- RETAIL ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('Thanks for joining VIP early access — are you mainly shopping for yourself or picking up gifts?',
 'Lead Qualification', 'Retail', 'Vetting prospects and initial vetting', true),
('We''d love to set you up with a personal stylist this weekend — does Saturday or Sunday afternoon work better?',
 'Appt. Scheduling', 'Retail', 'Booking and calendar management', true),
('Your store credit has a forty-five dollar payment due on the 20th — want to take care of it now or set a reminder?',
 'Financial Services', 'Retail', 'Billing, payments, and balance checks', true),
('Your order is in transit and should arrive by Thursday — want me to set up a delivery notification?',
 'Customer Support', 'Retail', 'FAQs, troubleshooting, and general help', true),
('Are you calling about an existing order, a return, or something else? I''ll get you to the right place.',
 'Inbound Triage', 'Retail', 'Intent recognition and routing', true),
('Your loyalty account shows 2,500 points — that''s twenty-five dollars off your next purchase. Want to use them?',
 'Account Management', 'Retail', 'Profile updates and status checks', true),
('I just need the email on your account and your order number to pull up the details.',
 'Authentication', 'Retail', 'Identity verification and security', true),
('Let me check if this item is covered under our protection plan — do you have your receipt or order number?',
 'Healthcare/Insurance', 'Retail', 'Benefits verification and location searches', true),
('Our store is closed, but I can take your info and have our team send you the catalog and a first-time discount.',
 'Lead Capture', 'Retail', 'After-hours intake', true),
('I totally get it — free returns are included, so there''s no risk in trying it. Want me to add it to your cart?',
 'Objection Handling', 'Retail', 'Retention and addressing concerns', true);

-- ---- RESORTS & HOSPITALITY ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('You showed interest in our all-inclusive package — what are your preferred travel dates and guest count?',
 'Lead Qualification', 'Resorts & Hospitality', 'Vetting prospects and initial vetting', true),
('I can book that couples'' massage for Saturday at 10 AM or 2 PM — which do you prefer?',
 'Appt. Scheduling', 'Resorts & Hospitality', 'Booking and calendar management', true),
('The deposit for your reservation is due Friday — three fifty to confirm. Want to take care of it now?',
 'Financial Services', 'Resorts & Hospitality', 'Billing, payments, and balance checks', true),
('Your reservation is set for next Friday through Sunday — want me to add a late checkout or any special requests?',
 'Customer Support', 'Resorts & Hospitality', 'FAQs, troubleshooting, and general help', true),
('Are you calling about a new reservation, an existing booking, or our spa and dining services?',
 'Inbound Triage', 'Resorts & Hospitality', 'Intent recognition and routing', true),
('Your rewards account has enough points for a free night upgrade — want me to apply that to your upcoming stay?',
 'Account Management', 'Resorts & Hospitality', 'Profile updates and status checks', true),
('I just need the confirmation number and the name on the reservation to pull up your booking.',
 'Authentication', 'Resorts & Hospitality', 'Identity verification and security', true),
('Let me check if your travel insurance covers the date change — do you have your policy number handy?',
 'Healthcare/Insurance', 'Resorts & Hospitality', 'Benefits verification and location searches', true),
('Our booking team is out for the night, but I can hold a room and have someone confirm your reservation tomorrow.',
 'Lead Capture', 'Resorts & Hospitality', 'After-hours intake', true),
('I understand the rate seems high — I can offer a complimentary breakfast and spa credit to sweeten the deal.',
 'Objection Handling', 'Resorts & Hospitality', 'Retention and addressing concerns', true);
