-- Add use_case column to phrases table
ALTER TABLE phrases ADD COLUMN IF NOT EXISTS use_case text;

-- Deactivate all existing generic phrases
UPDATE phrases SET active = false;

-- Seed use-case-specific phrases (3 per use case = 30 total)

-- Lead Qualification
INSERT INTO phrases (text, use_case, active) VALUES
  ('Hi there! I''m reaching out because you recently expressed interest in our services — do you have a quick moment to answer a couple of questions so I can connect you with the right team?', 'Lead Qualification', true),
  ('Good afternoon — I wanted to follow up on your inquiry. Could you tell me a bit about what you''re looking for so we can make sure you''re matched with the best solution?', 'Lead Qualification', true),
  ('Hey, thanks for filling out that form! Before I transfer you, I just need to confirm a few details — what''s the best number to reach you at going forward?', 'Lead Qualification', true);

-- Appointment Scheduling
INSERT INTO phrases (text, use_case, active) VALUES
  ('I''d be happy to help you schedule that appointment. I have openings on Tuesday at 2 PM and Thursday at 10 AM — which works better for you?', 'Appt. Scheduling', true),
  ('I see you need to reschedule your visit. Let me pull up the next available slots — would you prefer morning or afternoon?', 'Appt. Scheduling', true),
  ('Great news — I was able to get you on the calendar for this Friday at 3 PM. You''ll receive a confirmation text shortly. Is there anything else I can help with?', 'Appt. Scheduling', true);

-- Financial Services
INSERT INTO phrases (text, use_case, active) VALUES
  ('I''m calling regarding your account ending in 4872. We have a few options to bring your balance current — would you like to hear about our available payment plans?', 'Financial Services', true),
  ('Your payment of two hundred forty-seven dollars and fifty cents has been processed successfully and will reflect in your account within one to two business days.', 'Financial Services', true),
  ('I can see your current balance is thirteen hundred and forty dollars. Would you like to make a payment today, or would you prefer to set up an automatic payment schedule?', 'Financial Services', true);

-- Customer Support
INSERT INTO phrases (text, use_case, active) VALUES
  ('I''m sorry to hear you''re having trouble with that. Let me walk you through a quick fix — have you tried restarting the app and logging back in?', 'Customer Support', true),
  ('I totally understand the frustration. Let me look into this for you right now — can you provide me with your order number so I can pull up the details?', 'Customer Support', true),
  ('That''s a great question! Our return policy allows exchanges within 30 days of purchase. Would you like me to start that process for you?', 'Customer Support', true);

-- Inbound Triage
INSERT INTO phrases (text, use_case, active) VALUES
  ('Thank you for calling — I''d love to get you to the right person. Can you briefly describe what you''re calling about today?', 'Inbound Triage', true),
  ('I understand you need help with your account. Let me connect you with our billing department — they''ll be able to assist you right away.', 'Inbound Triage', true),
  ('Based on what you''ve described, our technical support team would be the best fit. I''m transferring you now — please hold for just a moment.', 'Inbound Triage', true);

-- Account Management
INSERT INTO phrases (text, use_case, active) VALUES
  ('Your order shipped yesterday and is expected to arrive by Thursday. Would you like me to send you the tracking number via text?', 'Account Management', true),
  ('I''ve updated your email address on file. Is there anything else on your account you''d like me to change while I have you?', 'Account Management', true),
  ('Looking at your account now — your subscription renews on the 15th and your current plan includes the premium features. Would you like to make any changes?', 'Account Management', true);

-- Authentication
INSERT INTO phrases (text, use_case, active) VALUES
  ('For security purposes, I''ll need to verify your identity. Can you please confirm the last four digits of your Social Security number?', 'Authentication', true),
  ('I just sent a six-digit verification code to the phone number on file. Could you read that back to me when you receive it?', 'Authentication', true),
  ('Thank you for confirming that. Your identity has been verified and I''ve unlocked your account — you should be able to log in now.', 'Authentication', true);

-- Healthcare/Insurance
INSERT INTO phrases (text, use_case, active) VALUES
  ('I can help you find a provider near you. What''s your zip code, and are you looking for a general practitioner or a specialist?', 'Healthcare/Insurance', true),
  ('Let me check your coverage for that procedure. Based on your plan, it looks like it would be covered at 80 percent after your deductible is met.', 'Healthcare/Insurance', true),
  ('I found three in-network dentists within five miles of your location. Would you like me to read you their names and earliest availability?', 'Healthcare/Insurance', true);

-- Lead Capture
INSERT INTO phrases (text, use_case, active) VALUES
  ('Thanks for reaching out! Our office is currently closed, but I''d love to make sure someone gets back to you first thing tomorrow. Can I grab your name and phone number?', 'Lead Capture', true),
  ('Hi, you''ve reached us after hours. I can absolutely take your information and have an agent call you back — what''s the best time to reach you?', 'Lead Capture', true),
  ('We''re closed for the evening, but I don''t want you to have to wait. Let me collect a few details so our team can follow up with you as soon as we open.', 'Lead Capture', true);

-- Objection Handling
INSERT INTO phrases (text, use_case, active) VALUES
  ('I completely understand your concern about the price. What if I told you we have a promotional rate that could save you 20 percent for the first year?', 'Objection Handling', true),
  ('Before you cancel, I want to make sure you know about the loyalty benefits on your account. We can offer you an upgraded plan at your current rate — would you be open to hearing more?', 'Objection Handling', true),
  ('I hear you, and I appreciate your honesty. Many of our customers had the same hesitation initially but found it really made a difference. Can I set you up with a risk-free trial?', 'Objection Handling', true);
