-- Idempotent development seed data.
-- Safe to run multiple times against the same database.
-- No production secrets or real personal information.

-- ---------------------------------------------------------------------------
-- Trainers
-- ---------------------------------------------------------------------------

insert into public.trainers (id, name, bio, is_active)
values
  ('11111111-1111-4111-a111-111111111101', 'Marcus Reyes',
   'Former amateur light-heavyweight champion. 12 years coaching beginners through competitive fighters.',
   true),
  ('11111111-1111-4111-a111-111111111102', 'Dana Okafor',
   'Specializes in conditioning and technical footwork. Runs the gym''s youth program.',
   true),
  ('11111111-1111-4111-a111-111111111103', 'Iris Vance',
   'Strength & conditioning coach with a background in Olympic weightlifting.',
   true),
  ('11111111-1111-4111-a111-111111111104', 'Tommy Nakashima',
   'Retired professional cruiserweight. Currently on leave.',
   false)
on conflict (id) do update set
  name = excluded.name,
  bio = excluded.bio,
  is_active = excluded.is_active;

-- ---------------------------------------------------------------------------
-- Class sessions (mix of upcoming and one canceled)
-- ---------------------------------------------------------------------------

insert into public.class_sessions
  (id, title, description, trainer_id, starts_at, ends_at, status)
values
  ('22222222-2222-4222-a222-222222222201', 'Beginner Boxing Fundamentals',
   'Stance, guard, and the four basic punches. No experience required.',
   '11111111-1111-4111-a111-111111111101',
   now() + interval '1 day' + interval '18 hours',
   now() + interval '1 day' + interval '19 hours',
   'scheduled'),
  ('22222222-2222-4222-a222-222222222202', 'Conditioning Circuit',
   'High-intensity interval training built around boxing movement patterns.',
   '11111111-1111-4111-a111-111111111102',
   now() + interval '2 days' + interval '7 hours',
   now() + interval '2 days' + interval '8 hours',
   'scheduled'),
  ('22222222-2222-4222-a222-222222222203', 'Intermediate Sparring Prep',
   'Combination drills and pad work for members with 3+ months experience.',
   '11111111-1111-4111-a111-111111111101',
   now() + interval '3 days' + interval '18 hours',
   now() + interval '3 days' + interval '19 hours 30 minutes',
   'scheduled'),
  ('22222222-2222-4222-a222-222222222204', 'Strength & Power',
   'Olympic lift progressions and explosive power work for boxers.',
   '11111111-1111-4111-a111-111111111103',
   now() + interval '4 days' + interval '17 hours',
   now() + interval '4 days' + interval '18 hours',
   'scheduled'),
  ('22222222-2222-4222-a222-222222222205', 'Saturday Open Gym',
   'Supervised open floor time. Bring your own gloves and wraps.',
   null,
   now() + interval '5 days' + interval '10 hours',
   now() + interval '5 days' + interval '12 hours',
   'scheduled'),
  ('22222222-2222-4222-a222-222222222206', 'Youth Boxing (Ages 10-15)',
   'Introductory class focused on discipline, fitness, and fundamentals.',
   '11111111-1111-4111-a111-111111111102',
   now() + interval '2 days' + interval '16 hours',
   now() + interval '2 days' + interval '17 hours',
   'scheduled'),
  ('22222222-2222-4222-a222-222222222207', 'Advanced Sparring (Canceled)',
   'Canceled due to trainer unavailability. Kept visible for schedule history.',
   '11111111-1111-4111-a111-111111111101',
   now() + interval '3 days' + interval '20 hours',
   now() + interval '3 days' + interval '21 hours',
   'canceled')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  trainer_id = excluded.trainer_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status;

-- ---------------------------------------------------------------------------
-- Note on waivers:
-- Signed waivers are created through the public /waiver form (sign_waiver_public),
-- not seeded directly. See README.md for instructions on creating a local
-- admin account to view them at /admin/waivers.
-- ---------------------------------------------------------------------------
