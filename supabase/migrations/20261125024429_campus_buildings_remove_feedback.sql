-- Retire in-app feedback without deleting historical researcher data.
revoke insert on public.usability_feedback from authenticated;
comment on table public.usability_feedback is 'Archived questionnaire storage. Feedback was removed from the web application; participant inserts are disabled. Researcher access remains protected.';

-- Normalize fictional demo records to the supplied campus map.
update public.reports r set location = replacement.current_name
from (values
  ('Main Building', 'Bldg. 10 — Administration Building'),
  ('University Library', 'Bldg. 23 — Learning Resource Center'),
  ('Canteen', 'Bldg. 20 — Cafeteria'),
  ('Gymnasium', 'Bldg. 16 — Gymnasium / DRER Memorial Hall'),
  ('Student Lounge', 'Bldg. 36 — Old Student Center'),
  ('Computer Laboratory', 'Bldg. 9 — ICT Building'),
  ('Engineering Building', 'Bldg. 5 — Old Engineering Building'),
  ('Campus Quadrangle', 'Bldg. 41 — Science Complex')
) as replacement(old_name, current_name)
where r.is_demo and r.location = replacement.old_name;
update public.reports set description = replace(replace(description, 'Main Building entrance', 'Administration Building entrance'), 'quadrangle benches', 'Science Complex benches') where is_demo;

-- The two existing Gymnasium reports refer to the same mapped gymnasium.
update public.reports set location = 'Bldg. 16 — Gymnasium / DRER Memorial Hall' where not is_demo and location = 'Gymnasium';

-- The owner explicitly requested removal of this one Main Building report.
-- The location and photo guards prevent removing a subsequently edited record.
delete from public.reports where id = '35d6b8e3-9c97-45da-bb2a-e7e0849c7c73'
  and not is_demo and location = 'Main Building' and image_path is null
  and updated_at = '2026-11-24T16:22:03.566993+00:00'::timestamptz;

-- Validate new locations at the database boundary, including direct API writes.
-- Unrelated edits to any future legacy records can still preserve their location.
create or replace function public.check_campus_location() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if new.location is null or not (new.location = any (array[
    'Bldg. 1 — Arts & Culture Building',
    'Bldg. 2 — Guidance and Testing Center',
    'Bldg. 3 — College of Medicine',
    'Bldg. 5 — Old Engineering Building',
    'Bldg. 9 — ICT Building',
    'Bldg. 10 — Administration Building',
    'Bldg. 14 — Finance and Accounting Building / Senior High School Building',
    'Bldg. 15 — Gymnasium Lobby',
    'Bldg. 16 — Gymnasium / DRER Memorial Hall',
    'Bldg. 18 — Culinary Building',
    'Bldg. 19 — NSTP Building',
    'Bldg. 20 — Cafeteria',
    'Bldg. 21 — Guard House',
    'Bldg. 23 — Learning Resource Center',
    'Bldg. 24 — Girl’s Trade Building',
    'Bldg. 25 — Food Innovation Center',
    'Bldg. 26 — Food Innovation Center',
    'Bldg. 27 — University Health Center Building / Office of Student Affairs (OSA)',
    'Bldg. 28 — Old Science Building',
    'Bldg. 35 — Old Education Building',
    'Bldg. 36 — Old Student Center',
    'Bldg. 41 — Science Complex',
    'Bldg. 42 — Engineering Complex I (Right Wing)',
    'Bldg. 43 — Engineering Complex II (Left Wing)',
    'Bldg. 44 — Student Center & Education Complex',
    'Bldg. 45 — Mechanical Laboratory Shop',
    'Bldg. 47 — Technology C/L Building',
    'Bldg. 50 — Faculty Learning Resource Center',
    'Bldg. 51 — Dormitory',
    'Bldg. 52 — Fab Lab Building'
  ]::text[])) then
    raise exception 'Choose a building from the campus list.' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger reports_campus_location before insert or update of location on public.reports
for each row execute function public.check_campus_location();
