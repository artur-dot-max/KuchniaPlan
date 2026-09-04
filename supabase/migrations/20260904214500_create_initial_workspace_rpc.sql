create or replace function public.create_initial_workspace(
  organization_name text,
  location_name text
)
returns table (
  organization_id uuid,
  location_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required to create a workspace.';
  end if;

  if char_length(trim(organization_name)) < 2 or char_length(trim(organization_name)) > 120 then
    raise exception 'Organization name must have between 2 and 120 characters.';
  end if;

  if char_length(trim(location_name)) < 2 or char_length(trim(location_name)) > 120 then
    raise exception 'Location name must have between 2 and 120 characters.';
  end if;

  insert into public.organizations (name, created_by)
  values (trim(organization_name), current_user_id)
  returning id into organization_id;

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role,
    created_by
  )
  values (
    organization_id,
    current_user_id,
    'owner',
    current_user_id
  );

  insert into public.locations (organization_id, name, created_by)
  values (organization_id, trim(location_name), current_user_id)
  returning id into location_id;

  return next;
end;
$$;

grant execute on function public.create_initial_workspace(text, text) to authenticated;
