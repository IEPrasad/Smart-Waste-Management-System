-- 1. Create the waste_issues table
create table public.waste_issues (
  id uuid not null default uuid_generate_v4() primary key,
  created_at timestamp with time zone not null default now(),
  citizen_id uuid references public.citizens(id) on delete set null,
  issue_type text not null check (issue_type in ('missed-pickup', 'damaged-bin', 'incorrect-sorting', 'other')),
  description text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'rejected')),
  photo_url text,
  admin_response text
);

-- 2. Enable Real-Time and Row Level Security
alter table public.waste_issues enable row level security;

-- 3. Add RLS Policies (Allows reading/writing)
create policy "Enable read access for all users" on public.waste_issues for select using (true);
create policy "Enable insert for all users" on public.waste_issues for insert with check (true);
create policy "Enable update for all users" on public.waste_issues for update using (true);

-- 4. (Optional) Insert some dummy data to test immediately
insert into public.waste_issues (issue_type, description, priority, status)
values 
  ('missed-pickup', 'Garbage truck did not come to my lane.', 'high', 'open'),
  ('damaged-bin', 'My bin lid is broken due to rough handling.', 'medium', 'in_progress');
