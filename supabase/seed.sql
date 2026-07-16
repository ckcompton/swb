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
  (id, title, description, trainer_id, starts_at, ends_at, capacity, status)
values
  ('22222222-2222-4222-a222-222222222201', 'Beginner Boxing Fundamentals',
   'Stance, guard, and the four basic punches. No experience required.',
   '11111111-1111-4111-a111-111111111101',
   now() + interval '1 day' + interval '18 hours',
   now() + interval '1 day' + interval '19 hours',
   16, 'scheduled'),
  ('22222222-2222-4222-a222-222222222202', 'Conditioning Circuit',
   'High-intensity interval training built around boxing movement patterns.',
   '11111111-1111-4111-a111-111111111102',
   now() + interval '2 days' + interval '7 hours',
   now() + interval '2 days' + interval '8 hours',
   20, 'scheduled'),
  ('22222222-2222-4222-a222-222222222203', 'Intermediate Sparring Prep',
   'Combination drills and pad work for members with 3+ months experience.',
   '11111111-1111-4111-a111-111111111101',
   now() + interval '3 days' + interval '18 hours',
   now() + interval '3 days' + interval '19 hours 30 minutes',
   10, 'scheduled'),
  ('22222222-2222-4222-a222-222222222204', 'Strength & Power',
   'Olympic lift progressions and explosive power work for boxers.',
   '11111111-1111-4111-a111-111111111103',
   now() + interval '4 days' + interval '17 hours',
   now() + interval '4 days' + interval '18 hours',
   12, 'scheduled'),
  ('22222222-2222-4222-a222-222222222205', 'Saturday Open Gym',
   'Supervised open floor time. Bring your own gloves and wraps.',
   null,
   now() + interval '5 days' + interval '10 hours',
   now() + interval '5 days' + interval '12 hours',
   30, 'scheduled'),
  ('22222222-2222-4222-a222-222222222206', 'Youth Boxing (Ages 10-15)',
   'Introductory class focused on discipline, fitness, and fundamentals.',
   '11111111-1111-4111-a111-111111111102',
   now() + interval '2 days' + interval '16 hours',
   now() + interval '2 days' + interval '17 hours',
   14, 'scheduled'),
  ('22222222-2222-4222-a222-222222222207', 'Advanced Sparring (Canceled)',
   'Canceled due to trainer unavailability. Kept visible for schedule history.',
   '11111111-1111-4111-a111-111111111101',
   now() + interval '3 days' + interval '20 hours',
   now() + interval '3 days' + interval '21 hours',
   8, 'canceled')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  trainer_id = excluded.trainer_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  capacity = excluded.capacity,
  status = excluded.status;

-- ---------------------------------------------------------------------------
-- Announcements (published and unpublished)
-- ---------------------------------------------------------------------------

insert into public.announcements (id, title, body, is_published, published_at)
values
  ('33333333-3333-4333-a333-333333333301', 'New Saturday Open Gym Hours',
   'Starting this week, Saturday Open Gym runs from 10am to 12pm. Come get extra reps in.',
   true, now() - interval '2 days'),
  ('33333333-3333-4333-a333-333333333302', 'Holiday Schedule Reminder',
   'The gym will have reduced hours during the upcoming holiday week. Check the schedule page for details.',
   true, now() - interval '5 days'),
  ('33333333-3333-4333-a333-333333333303', 'Draft: New Nutrition Workshop',
   'Planning a nutrition workshop with a guest speaker. Details not yet finalized -- do not publish.',
   false, null)
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  is_published = excluded.is_published,
  published_at = excluded.published_at;

-- ---------------------------------------------------------------------------
-- Note on members/memberships/bookings:
-- These depend on auth.users rows, which must be created through Supabase
-- Auth (signup or the dashboard) rather than seeded directly. See README.md
-- for instructions on creating test member and admin accounts locally, and
-- promoting a user to admin. Once a member account exists, an admin can
-- create/activate a membership for it from /admin/members.
-- ---------------------------------------------------------------------------
