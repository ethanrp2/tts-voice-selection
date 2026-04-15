-- Shorten all 35 phrases to single punchy sentences

-- Healthcare
UPDATE phrases SET text = 'Your prescription refill is ready for pickup — would you like to schedule your follow-up while I have you?' WHERE industry = 'Healthcare' AND use_case = 'Customer Support' AND active = true;
UPDATE phrases SET text = 'You requested info about our vision correction program — mind if I ask a few quick questions to find the best fit?' WHERE industry = 'Healthcare' AND use_case = 'Outbound Lead Qualification' AND active = true;
UPDATE phrases SET text = 'Just confirming your appointment with Dr. Chen this Thursday at 2 PM — does that still work for you?' WHERE industry = 'Healthcare' AND use_case = 'Appointment Scheduling' AND active = true;
UPDATE phrases SET text = 'You have a remaining balance of two forty-five from your March visit — want me to walk you through payment options?' WHERE industry = 'Healthcare' AND use_case = 'Payment & Collections' AND active = true;
UPDATE phrases SET text = 'It''s been over a year since your last check-up — Dr. Patel has openings next week, can I book one?' WHERE industry = 'Healthcare' AND use_case = 'Retention & Win-Back' AND active = true;

-- Insurance
UPDATE phrases SET text = 'Your auto policy renewal is coming up next month — would you like to review any coverage changes?' WHERE industry = 'Insurance' AND use_case = 'Customer Support' AND active = true;
UPDATE phrases SET text = 'Thanks for requesting a quote! What provider are you with now so I can get you an accurate comparison?' WHERE industry = 'Insurance' AND use_case = 'Outbound Lead Qualification' AND active = true;
UPDATE phrases SET text = 'I''d love to set up a quick call with one of our licensed advisors — do mornings or afternoons work better?' WHERE industry = 'Insurance' AND use_case = 'Appointment Scheduling' AND active = true;
UPDATE phrases SET text = 'Your premium payment from the 1st hasn''t come through — can we get that taken care of to keep your coverage active?' WHERE industry = 'Insurance' AND use_case = 'Payment & Collections' AND active = true;
UPDATE phrases SET text = 'Your homeowner''s policy lapsed last month — we''ve got new rates that might work better, open to a quick comparison?' WHERE industry = 'Insurance' AND use_case = 'Retention & Win-Back' AND active = true;

-- Home Services
UPDATE phrases SET text = 'Your HVAC visit is set for Friday between 10 and 12 — the tech will call 30 minutes before, anything else you need?' WHERE industry = 'Home Services' AND use_case = 'Customer Support' AND active = true;
UPDATE phrases SET text = 'You requested a roof inspection — can I ask a few questions about your roof so we send the right specialist?' WHERE industry = 'Home Services' AND use_case = 'Outbound Lead Qualification' AND active = true;
UPDATE phrases SET text = 'I''ve got a plumber available Wednesday afternoon or Thursday morning — which window works best?' WHERE industry = 'Home Services' AND use_case = 'Appointment Scheduling' AND active = true;
UPDATE phrases SET text = 'Following up on your kitchen remodel invoice — the remaining balance is twelve hundred, want to pay by card today?' WHERE industry = 'Home Services' AND use_case = 'Payment & Collections' AND active = true;
UPDATE phrases SET text = 'We serviced your AC last summer — we''re running an early-bird tune-up special, want me to get you on the schedule?' WHERE industry = 'Home Services' AND use_case = 'Retention & Win-Back' AND active = true;

-- Financial Services
UPDATE phrases SET text = 'That transaction is a pending hotel hold — it should clear in 48 hours, want me to flag it for expedited review?' WHERE industry = 'Financial Services' AND use_case = 'Customer Support' AND active = true;
UPDATE phrases SET text = 'Thanks for your interest in our business credit line — what''s your company''s annual revenue so I can get you accurate terms?' WHERE industry = 'Financial Services' AND use_case = 'Outbound Lead Qualification' AND active = true;
UPDATE phrases SET text = 'I can set you up with a financial planner for a free portfolio review — does Tuesday at 3 or Thursday at 11 work?' WHERE industry = 'Financial Services' AND use_case = 'Appointment Scheduling' AND active = true;
UPDATE phrases SET text = 'Your monthly installment of three eighty is 10 days past due — would you like to make a payment or adjust the schedule?' WHERE industry = 'Financial Services' AND use_case = 'Payment & Collections' AND active = true;
UPDATE phrases SET text = 'I noticed you closed your premium checking — we''ve launched some new fee-free options that might be a better fit.' WHERE industry = 'Financial Services' AND use_case = 'Retention & Win-Back' AND active = true;

-- Automotive
UPDATE phrases SET text = 'Your vehicle is due for its 30,000-mile service — oil change, tire rotation, and brake check — want me to book it?' WHERE industry = 'Automotive' AND use_case = 'Customer Support' AND active = true;
UPDATE phrases SET text = 'I saw you were checking out the 2026 Civic — are you actively shopping or just exploring options for now?' WHERE industry = 'Automotive' AND use_case = 'Outbound Lead Qualification' AND active = true;
UPDATE phrases SET text = 'The model you''re interested in is available for a test drive — would Saturday morning or a weekday evening work?' WHERE industry = 'Automotive' AND use_case = 'Appointment Scheduling' AND active = true;
UPDATE phrases SET text = 'Your auto lease payment from the 5th is overdue — can we process it today or set up autopay?' WHERE industry = 'Automotive' AND use_case = 'Payment & Collections' AND active = true;
UPDATE phrases SET text = 'Your lease is up in 60 days — we''ve got loyalty incentives right now, want to explore an upgrade or buyout?' WHERE industry = 'Automotive' AND use_case = 'Retention & Win-Back' AND active = true;

-- Retail
UPDATE phrases SET text = 'Your order is in transit and should arrive Thursday — want me to set up a delivery notification?' WHERE industry = 'Retail' AND use_case = 'Customer Support' AND active = true;
UPDATE phrases SET text = 'Thanks for joining VIP early access! Are you mainly shopping for yourself or picking up gifts?' WHERE industry = 'Retail' AND use_case = 'Outbound Lead Qualification' AND active = true;
UPDATE phrases SET text = 'We''d love to set you up with a personal stylist this weekend — does Saturday or Sunday afternoon work better?' WHERE industry = 'Retail' AND use_case = 'Appointment Scheduling' AND active = true;
UPDATE phrases SET text = 'Your store credit balance has a forty-five dollar payment due on the 20th — want to take care of it now?' WHERE industry = 'Retail' AND use_case = 'Payment & Collections' AND active = true;
UPDATE phrases SET text = 'You still have 2,500 loyalty points expiring next month — can I help you find something to use them on?' WHERE industry = 'Retail' AND use_case = 'Retention & Win-Back' AND active = true;

-- Resorts & Hospitality
UPDATE phrases SET text = 'Your reservation is set for next Friday through Sunday — want me to add a late checkout or any special requests?' WHERE industry = 'Resorts & Hospitality' AND use_case = 'Customer Support' AND active = true;
UPDATE phrases SET text = 'Following up on your interest in our all-inclusive package — what are your preferred travel dates and guest count?' WHERE industry = 'Resorts & Hospitality' AND use_case = 'Outbound Lead Qualification' AND active = true;
UPDATE phrases SET text = 'I can book that couples'' massage for Saturday at 10 AM or 2 PM — which do you prefer?' WHERE industry = 'Resorts & Hospitality' AND use_case = 'Appointment Scheduling' AND active = true;
UPDATE phrases SET text = 'The three-fifty deposit for your reservation is due Friday — would you like to take care of that now?' WHERE industry = 'Resorts & Hospitality' AND use_case = 'Payment & Collections' AND active = true;
UPDATE phrases SET text = 'It''s been a year since your last stay — we''re offering returning guests 20 percent off midweek, shall I check dates?' WHERE industry = 'Resorts & Hospitality' AND use_case = 'Retention & Win-Back' AND active = true;
