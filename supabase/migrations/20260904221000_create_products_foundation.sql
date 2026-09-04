create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  symbol text not null check (char_length(trim(symbol)) between 1 and 16),
  kind text not null check (kind in ('mass', 'volume', 'piece', 'package')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz,
  unique (organization_id, symbol)
);

create table public.allergens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz,
  unique (organization_id, name)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz,
  unique (organization_id, name)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 160),
  category text not null check (char_length(trim(category)) between 2 and 80),
  base_unit_id uuid not null references public.units (id),
  purchase_unit_id uuid references public.units (id),
  supplier_id uuid references public.suppliers (id),
  initial_loss_percent numeric(5,2) not null default 0 check (
    initial_loss_percent >= 0 and initial_loss_percent <= 95
  ),
  thermal_loss_percent numeric(5,2) not null default 0 check (
    thermal_loss_percent >= 0 and thermal_loss_percent <= 95
  ),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz,
  unique (organization_id, name)
);

create table public.product_allergens (
  product_id uuid not null references public.products (id) on delete cascade,
  allergen_id uuid not null references public.allergens (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  primary key (product_id, allergen_id)
);

create table public.product_unit_conversions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  from_unit_id uuid not null references public.units (id),
  to_unit_id uuid not null references public.units (id),
  factor numeric(18,6) not null check (factor > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz,
  check (from_unit_id <> to_unit_id),
  unique (organization_id, product_id, from_unit_id, to_unit_id)
);

create table public.product_packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  supplier_id uuid references public.suppliers (id),
  unit_id uuid not null references public.units (id),
  package_size numeric(18,6) not null check (package_size > 0),
  label text not null check (char_length(trim(label)) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz
);

create table public.product_prices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  supplier_id uuid references public.suppliers (id),
  package_id uuid references public.product_packages (id),
  price_net numeric(12,2) not null check (price_net > 0),
  currency text not null default 'PLN' check (currency = 'PLN'),
  valid_from date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id),
  archived_at timestamptz
);

create index units_organization_id_idx on public.units (organization_id) where archived_at is null;
create index allergens_organization_id_idx on public.allergens (organization_id) where archived_at is null;
create index suppliers_organization_id_idx on public.suppliers (organization_id) where archived_at is null;
create index products_organization_id_idx on public.products (organization_id) where archived_at is null;
create index product_allergens_organization_id_idx on public.product_allergens (organization_id);
create index product_unit_conversions_product_id_idx
  on public.product_unit_conversions (product_id)
  where archived_at is null;
create index product_packages_product_id_idx on public.product_packages (product_id) where archived_at is null;
create index product_prices_product_id_valid_from_idx
  on public.product_prices (product_id, valid_from desc)
  where archived_at is null;

create trigger units_set_updated_at
  before update on public.units
  for each row execute function public.set_updated_at();

create trigger allergens_set_updated_at
  before update on public.allergens
  for each row execute function public.set_updated_at();

create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger product_unit_conversions_set_updated_at
  before update on public.product_unit_conversions
  for each row execute function public.set_updated_at();

create trigger product_packages_set_updated_at
  before update on public.product_packages
  for each row execute function public.set_updated_at();

create trigger product_prices_set_updated_at
  before update on public.product_prices
  for each row execute function public.set_updated_at();

alter table public.units enable row level security;
alter table public.allergens enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.product_allergens enable row level security;
alter table public.product_unit_conversions enable row level security;
alter table public.product_packages enable row level security;
alter table public.product_prices enable row level security;

create policy "Members can read units"
  on public.units for select
  to authenticated
  using (public.is_active_member(organization_id) and archived_at is null);

create policy "Managers can manage units"
  on public.units for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager', 'chef']))
  with check (public.has_organization_role(organization_id, array['owner', 'manager', 'chef']));

create policy "Members can read allergens"
  on public.allergens for select
  to authenticated
  using (public.is_active_member(organization_id) and archived_at is null);

create policy "Managers can manage allergens"
  on public.allergens for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager', 'chef']))
  with check (public.has_organization_role(organization_id, array['owner', 'manager', 'chef']));

create policy "Members can read suppliers"
  on public.suppliers for select
  to authenticated
  using (public.is_active_member(organization_id) and archived_at is null);

create policy "Managers and warehouse can manage suppliers"
  on public.suppliers for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager', 'chef', 'warehouse']))
  with check (
    public.has_organization_role(organization_id, array['owner', 'manager', 'chef', 'warehouse'])
  );

create policy "Members can read products"
  on public.products for select
  to authenticated
  using (public.is_active_member(organization_id) and archived_at is null);

create policy "Managers and warehouse can manage products"
  on public.products for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager', 'chef', 'warehouse']))
  with check (
    public.has_organization_role(organization_id, array['owner', 'manager', 'chef', 'warehouse'])
  );

create policy "Members can read product allergens"
  on public.product_allergens for select
  to authenticated
  using (public.is_active_member(organization_id));

create policy "Managers can manage product allergens"
  on public.product_allergens for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager', 'chef']))
  with check (public.has_organization_role(organization_id, array['owner', 'manager', 'chef']));

create policy "Members can read product conversions"
  on public.product_unit_conversions for select
  to authenticated
  using (public.is_active_member(organization_id) and archived_at is null);

create policy "Managers can manage product conversions"
  on public.product_unit_conversions for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager', 'chef']))
  with check (public.has_organization_role(organization_id, array['owner', 'manager', 'chef']));

create policy "Members can read product packages"
  on public.product_packages for select
  to authenticated
  using (public.is_active_member(organization_id) and archived_at is null);

create policy "Managers and warehouse can manage product packages"
  on public.product_packages for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager', 'chef', 'warehouse']))
  with check (
    public.has_organization_role(organization_id, array['owner', 'manager', 'chef', 'warehouse'])
  );

create policy "Members can read product prices"
  on public.product_prices for select
  to authenticated
  using (public.is_active_member(organization_id) and archived_at is null);

create policy "Managers and warehouse can manage product prices"
  on public.product_prices for all
  to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'manager', 'chef', 'warehouse']))
  with check (
    public.has_organization_role(organization_id, array['owner', 'manager', 'chef', 'warehouse'])
  );
