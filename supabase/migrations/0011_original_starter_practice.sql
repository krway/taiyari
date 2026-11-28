with starter(id, exam_id, prompt, options, correct_option, explanation) as (
  values
    ('b91dbdc7-0dcf-47eb-970d-cfb5cb7eee55'::uuid, 'rrb-ntpc',
     'A train covers 180 km in 2 hours 30 minutes. What is its average speed?',
     array['60 km/h', '72 km/h', '75 km/h', '90 km/h'], 2,
     'Two hours and 30 minutes equals 2.5 hours. Divide 180 km by 2.5 hours to get 72 km/h.'),
    ('20a07d84-eaf2-4783-96b7-f39f864defc0'::uuid, 'rrb-ntpc',
     'A ticket costs ₹800 before a 15% discount. What is the discounted price?',
     array['₹120', '₹650', '₹680', '₹785'], 3,
     'The discount is 15% of ₹800, which is ₹120. Subtract ₹120 from ₹800 to get ₹680.'),
    ('d341e78b-fb29-4f20-9466-fa5590b64063'::uuid, 'rrb-group-d',
     'Divide 84 items in the ratio 3:4. How many items are in the larger share?',
     array['36', '42', '46', '48'], 4,
     'There are 7 equal parts and each part contains 84 ÷ 7 = 12 items. The larger share is 4 × 12 = 48.'),
    ('124af1d0-6419-4f4d-9a7e-46b21396373b'::uuid, 'rrb-group-d',
     'Six identical machines complete a job in 8 hours. How long do four such machines take at the same rate?',
     array['8 hours', '10 hours', '12 hours', '16 hours'], 3,
     'The job takes 6 × 8 = 48 machine-hours. Four machines take 48 ÷ 4 = 12 hours.')
), inserted as (
  insert into public.practice_questions (id, exam_id, subject_slug, source_kind, difficulty, prompt, options, status)
  select id, exam_id, 'mathematics', 'editorial', 'easy', prompt, options, 'published'
  from starter
  on conflict (id) do nothing
  returning id
)
insert into public.practice_question_solutions (question_id, correct_option, explanation)
select i.id, s.correct_option, s.explanation
from inserted i join starter s on s.id=i.id;
