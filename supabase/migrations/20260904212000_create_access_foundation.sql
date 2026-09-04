create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 120),
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (
    role in ('owner', 'manager', 'chef', 'cook', 'warehouse', 'packing')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz,
  unique (organization_id, user_id)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz,
  unique (organization_id, name)
);

create index organization_memberships_user_id_idx
  on public.organization_memberships (user_id)
  where archived_at is null;

create index organization_memberships_organization_id_idx
  on public.organization_memberships (organization_id)
  where archived_at is null;

create index locations_organization_id_idx
  on public.locations (organization_id)
  where archived_at is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger organization_memberships_set_updated_at
  before update on public.organization_memberships
  for each row execute function public.set_updated_at();

create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

create or replace function public.is_active_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.archived_at is null
  );
$$;

create or replace function public.has_organization_role(
  target_organization_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.role = any(allowed_roles)
      and membership.archived_at is null
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.locations enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Members can read active organizations"
  on public.organizations for select
  to authenticated
  using (public.is_active_member(id) and archived_at is null);

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Owners and managers can update organizations"
  on public.organizations for update
  to authenticated
  using (public.has_organization_role(id, array['owner', 'manager']))
  with check (public.has_organization_role(id, array['owner', 'manager']));

create policy "Members can read memberships in their organizations"
  on public.organization_memberships for select
  to authenticated
  using (public.is_active_member(organization_id));

create policy "Owners and managers can manage memberships"
  on public.organization_memberships for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager']))
  with check (public.has_organization_role(organization_id, array['owner', 'manager']));

create policy "Users can create owner membership for organizations they created"
  on public.organization_memberships for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1
      from public.organizations organization
      where organization.id = organization_id
        and organization.created_by = auth.uid()
        and organization.archived_at is null
    )
  );

create policy "Members can read active locations"
  on public.locations for select
  to authenticated
  using (public.is_active_member(organization_id) and archived_at is null);

create policy "Owners and managers can manage locations"
  on public.locations for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager']))
  with check (public.has_organization_role(organization_id, array['owner', 'manager']));
