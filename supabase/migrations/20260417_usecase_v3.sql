-- Deactivate all existing phrases
UPDATE phrases SET active = false WHERE active = true;

-- ============================================================
-- 8 industries × 7 use cases = 56 phrases
-- ============================================================

-- ---- HEALTHCARE ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('Can you walk me through your symptoms and when they first started?',
 'Incident Intake', 'Healthcare', 'Documenting patient symptoms and incident details', true),
('You inquired about our joint replacement program, are you currently seeing a specialist?',
 'Capture & Qualification', 'Healthcare', 'Qualifying and capturing healthcare leads', true),
('Dr. Patel has an opening Thursday at 2 if you''d like me to book your follow-up.',
 'Scheduling Appointments & Coordination', 'Healthcare', 'Booking and coordinating medical appointments', true),
('Your MRI from March 12th has a remaining balance of two forty-five that we need to get resolved.',
 'Collections & Payment Recovery', 'Healthcare', 'Recovering outstanding medical balances', true),
('Your prescription refill is approved and ready for pickup at the pharmacy.',
 'Customer Support', 'Healthcare', 'General patient support and inquiries', true),
('Just following up on your procedure last week to see how recovery''s going.',
 'Post-Sale Outreach', 'Healthcare', 'Post-procedure follow-up and check-in', true),
('I''ve got a home health aide about 20 minutes from you who can be there this afternoon.',
 'Marketplace Fulfillment', 'Healthcare', 'Matching patients with available providers in real time', true);

-- ---- INSURANCE ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('I''ll need to file a claim, so can you walk me through what happened and when the damage occurred?',
 'Incident Intake', 'Insurance', 'Documenting claim details and incident information', true),
('Thanks for requesting a quote, who''s your current carrier so I can run a comparison?',
 'Capture & Qualification', 'Insurance', 'Qualifying and capturing insurance leads', true),
('I''d love to set up a call with a licensed agent to review your coverage whenever works best.',
 'Scheduling Appointments & Coordination', 'Insurance', 'Booking and coordinating agent consultations', true),
('Your premium from the 1st hasn''t posted yet and we''ll need to process it to keep coverage active.',
 'Collections & Payment Recovery', 'Insurance', 'Recovering overdue premium payments', true),
('Your auto policy renews next month so now would be a great time to review your coverage.',
 'Customer Support', 'Insurance', 'General policyholder support and inquiries', true),
('Your new homeowner''s policy has been active for 30 days and I wanted to check if you have any questions.',
 'Post-Sale Outreach', 'Insurance', 'Post-sale policy follow-up', true),
('I''m matching you with an adjuster near your location who can assess the damage today.',
 'Marketplace Fulfillment', 'Insurance', 'Matching claimants with available adjusters in real time', true);

-- ---- HOME SERVICES ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('Is the leak active right now and can you describe the damage you''re seeing?',
 'Incident Intake', 'Home Services', 'Documenting home damage and service incidents', true),
('You submitted a request for a roof inspection, is this for storm damage or routine maintenance?',
 'Capture & Qualification', 'Home Services', 'Qualifying and capturing home service leads', true),
('I''ve got a plumber available Wednesday afternoon or Thursday morning if either works for you.',
 'Scheduling Appointments & Coordination', 'Home Services', 'Booking and coordinating service appointments', true),
('The balance on your kitchen remodel is twelve hundred and we have a few payment options available.',
 'Collections & Payment Recovery', 'Home Services', 'Recovering outstanding service balances', true),
('Your HVAC technician is confirmed for Friday between 10 and noon and they''ll call before arrival.',
 'Customer Support', 'Home Services', 'General service support and appointment updates', true),
('Your new water heater was installed last month and I just wanted to check that everything''s running well.',
 'Post-Sale Outreach', 'Home Services', 'Post-installation follow-up', true),
('I found a licensed electrician about 15 minutes from you who can take the job this afternoon.',
 'Marketplace Fulfillment', 'Home Services', 'Matching homeowners with available contractors in real time', true);

-- ---- FINANCIAL SERVICES ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('I see a flagged transaction on your account and need to confirm whether the charge at Meridian Electronics was yours.',
 'Incident Intake', 'Financial Services', 'Documenting suspicious transactions and fraud incidents', true),
('Thanks for your interest in our business credit line, what''s your annual revenue so I can pull the right terms?',
 'Capture & Qualification', 'Financial Services', 'Qualifying and capturing financial product leads', true),
('I can book you a free portfolio review with one of our advisors for Tuesday at 3 if that works.',
 'Scheduling Appointments & Coordination', 'Financial Services', 'Booking and coordinating advisor meetings', true),
('Your loan installment of three eighty is 10 days past due and I''d like to help get that resolved.',
 'Collections & Payment Recovery', 'Financial Services', 'Recovering overdue loan payments', true),
('That pending charge is just a hotel authorization hold and should clear within 48 hours.',
 'Customer Support', 'Financial Services', 'General account support and inquiries', true),
('Your new checking account has been open for a month and I wanted to see if you''ve set up direct deposit yet.',
 'Post-Sale Outreach', 'Financial Services', 'Post-account-opening follow-up', true),
('I''m connecting you with a certified tax preparer in your area who has availability right now.',
 'Marketplace Fulfillment', 'Financial Services', 'Matching clients with available financial professionals in real time', true);

-- ---- AUTOMOTIVE ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('Can you walk me through what happened with the vehicle and whether it''s still drivable?',
 'Incident Intake', 'Automotive', 'Documenting vehicle incidents and damage details', true),
('I noticed you were browsing the 2026 Civic online and wanted to see if you''re actively shopping.',
 'Capture & Qualification', 'Automotive', 'Qualifying and capturing automotive leads', true),
('That model''s ready for a test drive this Saturday morning or any weekday evening if you''re interested.',
 'Scheduling Appointments & Coordination', 'Automotive', 'Booking and coordinating test drives and service', true),
('Your lease payment from the 5th is overdue and I''d like to help get it processed or set up autopay.',
 'Collections & Payment Recovery', 'Automotive', 'Recovering overdue lease and loan payments', true),
('Your vehicle''s due for its 30,000-mile service which covers the oil change, tire rotation, and brake check.',
 'Customer Support', 'Automotive', 'General vehicle support and service reminders', true),
('Congrats on your new car, just wanted to check in and see how you''re enjoying it!',
 'Post-Sale Outreach', 'Automotive', 'Post-purchase follow-up', true),
('I''ve got a roadside driver about 10 minutes out who can come jump the battery for you.',
 'Marketplace Fulfillment', 'Automotive', 'Matching drivers with available roadside assistance in real time', true);

-- ---- RETAIL ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('Sorry about the damaged shipment, can you describe the issue so I can start a replacement claim?',
 'Incident Intake', 'Retail', 'Documenting damaged orders and shipping incidents', true),
('Thanks for joining our VIP list, are you shopping for yourself or looking for gifts today?',
 'Capture & Qualification', 'Retail', 'Qualifying and capturing retail leads', true),
('We''d love to set you up with a personal stylist this weekend if Saturday or Sunday afternoon works.',
 'Scheduling Appointments & Coordination', 'Retail', 'Booking and coordinating in-store appointments', true),
('Your store credit card has a forty-five dollar payment due on the 20th that I can help you process now.',
 'Collections & Payment Recovery', 'Retail', 'Recovering overdue store credit payments', true),
('Your order shipped yesterday and is expected to arrive by Thursday.',
 'Customer Support', 'Retail', 'General order support and tracking', true),
('Your order was delivered last week and I just wanted to make sure everything arrived in good shape.',
 'Post-Sale Outreach', 'Retail', 'Post-delivery follow-up', true),
('I''ve matched you with a personal shopper nearby who can pick up and deliver your order within the hour.',
 'Marketplace Fulfillment', 'Retail', 'Matching customers with available shoppers in real time', true);

-- ---- HOSPITALITY ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('I''m sorry about the issue with your room, can you tell me what happened so I can get it resolved?',
 'Incident Intake', 'Hospitality', 'Documenting guest complaints and room incidents', true),
('You showed interest in our all-inclusive package and I''d love to get your travel dates and guest count.',
 'Capture & Qualification', 'Hospitality', 'Qualifying and capturing hospitality leads', true),
('I can book that couples'' massage for Saturday at 10 or 2, whichever works best for you.',
 'Scheduling Appointments & Coordination', 'Hospitality', 'Booking and coordinating guest services', true),
('The deposit for your reservation is three fifty and due Friday, so I can process that whenever you''re ready.',
 'Collections & Payment Recovery', 'Hospitality', 'Recovering reservation deposits and balances', true),
('Your reservation is confirmed for Friday through Sunday and I can add late checkout if you''d like.',
 'Customer Support', 'Hospitality', 'General guest support and booking inquiries', true),
('Hope you enjoyed your stay, we''d love your feedback and can offer 15% off your next visit!',
 'Post-Sale Outreach', 'Hospitality', 'Post-stay follow-up and retention', true),
('I found a local tour guide available this afternoon who specializes in the historic district.',
 'Marketplace Fulfillment', 'Hospitality', 'Matching guests with available local service providers in real time', true);

-- ---- LEGAL ----
INSERT INTO phrases (text, use_case, industry, description, active) VALUES
('Can you tell me when the incident occurred and whether you have a police report or any documentation?',
 'Incident Intake', 'Legal', 'Documenting legal incidents and gathering initial evidence', true),
('Thanks for reaching out, can you briefly describe your case so I can match you with the right attorney?',
 'Capture & Qualification', 'Legal', 'Qualifying and capturing legal leads', true),
('Attorney Davis has a free consultation open Wednesday at 4 if you''d like me to reserve that.',
 'Scheduling Appointments & Coordination', 'Legal', 'Booking and coordinating legal consultations', true),
('Your invoice for the March court filing has an outstanding balance that we''d like to get resolved today.',
 'Collections & Payment Recovery', 'Legal', 'Recovering outstanding legal fees', true),
('Your documents have been filed with the court and I''ll notify you as soon as we hear back.',
 'Customer Support', 'Legal', 'General case support and status updates', true),
('Your case was resolved last month and I just wanted to follow up in case our firm can help with anything else.',
 'Post-Sale Outreach', 'Legal', 'Post-case follow-up and retention', true),
('I''m matching you with an attorney in our network who handles personal injury and is available today.',
 'Marketplace Fulfillment', 'Legal', 'Matching clients with available attorneys in real time', true);
