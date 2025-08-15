-- This SQL adapts the app to your table names: inventory, orders, user data (renamed UserData)
-- Run in Supabase SQL editor. It will add missing columns and create order_items.

-- Ensure inventory table has required columns
alter table if exists public."Inventory" rename to inventory;

-- Add columns if missing
alter table public.inventory
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists price numeric(10,2) default 0 not null,
  add column if not exists image text,
  add column if not exists images text[] default '{}',
  add column if not exists category text default 'misc' not null,
  add column if not exists tags text[] default '{}',
  add column if not exists active boolean default true not null;

-- Ensure orders lowercase
alter table if exists public."Orders" rename to orders;

-- Add columns if missing for orders
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  -- Human-friendly short order code (e.g., ORD-ABC123) for display
  add column if not exists code text unique,
  add column if not exists created_at timestamp with time zone default now(),
  add column if not exists updated_at timestamp with time zone default now(),
  add column if not exists customer_name text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists subtotal numeric(10,2) default 0 not null,
  add column if not exists shipping numeric(10,2) default 0 not null,
  add column if not exists total numeric(10,2) default 0 not null,
  add column if not exists payment_method text,
  add column if not exists txid text,
  add column if not exists status text default 'pending' not null,
  add column if not exists tracking_number text,
  add column if not exists courier text,
  add column if not exists admin_notes text,
  add column if not exists paid_at timestamp with time zone,
  add column if not exists shipped_at timestamp with time zone;

-- Keep orders.updated_at fresh
create or replace function public.set_orders_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute procedure public.set_orders_updated_at();

-- Create order_items if not exists
create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.inventory(id) on delete set null,
  qty integer not null,
  unit_price numeric(10,2) not null
);

-- Enable RLS
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies (drop if exists, then create)
drop policy if exists "Public read inventory" on public.inventory;
create policy "Public read inventory" on public.inventory
for select using (true);

drop policy if exists "Authenticated write inventory" on public.inventory;
create policy "Authenticated write inventory" on public.inventory
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Anyone insert orders" on public.orders;
create policy "Anyone insert orders" on public.orders
for insert with check (true);

drop policy if exists "Owner can read orders" on public.orders;
create policy "Owner can read orders" on public.orders
for select using (auth.uid() = user_id or auth.role() = 'service_role');

-- Demo/admin: allow any authenticated user to read all orders
drop policy if exists "Authenticated read all orders (demo)" on public.orders;
create policy "Authenticated read all orders (demo)" on public.orders
for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- Users can read orders that match their email (if user_id is null)
drop policy if exists "User read orders by email" on public.orders;
create policy "User read orders by email" on public.orders
for select using (
  coalesce(lower(email), '') = coalesce(lower((auth.jwt() ->> 'email')), '')
);

-- Demo: allow updates/deletes to orders (consider restricting in production)
drop policy if exists "Anyone update orders" on public.orders;
create policy "Anyone update orders" on public.orders
for update using (true) with check (true);

drop policy if exists "Anyone delete orders" on public.orders;
create policy "Anyone delete orders" on public.orders
for delete using (true);

drop policy if exists "Insert order items" on public.order_items;
create policy "Insert order items" on public.order_items
for insert with check (true);

-- Allow owners to read their own order items
drop policy if exists "Owner read order items" on public.order_items;
create policy "Owner read order items" on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (auth.uid() = o.user_id or auth.role() = 'service_role')
  )
);

-- Demo/admin: allow any authenticated user to read order items
drop policy if exists "Authenticated read order items (demo)" on public.order_items;
create policy "Authenticated read order items (demo)" on public.order_items
for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- Users can read order_items if their email matches the parent order
drop policy if exists "User read order items by order email" on public.order_items;
create policy "User read order items by order email" on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and coalesce(lower(o.email), '') = coalesce(lower((auth.jwt() ->> 'email')), '')
  )
);

-- Optional: simple user profile table to mirror auth.users (aka "user data table")
alter table if exists public."UserData" rename to profiles;
alter table if exists public.user_data rename to profiles;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  avatar_url text,
  phone text,
  address text,
  city text,
  country text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Bootstrap profiles for new users automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Public read own profile" on public.profiles;
create policy "Public read own profile" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "User insert own profile" on public.profiles;
create policy "User insert own profile" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "User update own profile" on public.profiles;
create policy "User update own profile" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

-- Backfill profiles for any existing users
insert into public.profiles (id, email, name)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', u.email)
from auth.users u
on conflict (id) do nothing;

-- Optional: Separate user_details table for shipping/billing info
create table if not exists public.user_details (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  address text,
  city text,
  country text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.user_details enable row level security;

drop policy if exists "User read own details" on public.user_details;
create policy "User read own details" on public.user_details for select using (auth.uid() = id);

drop policy if exists "User upsert own details" on public.user_details;
create policy "User upsert own details" on public.user_details for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Wishlists: store per-user saved products
create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  product jsonb not null,
  created_at timestamp with time zone default now(),
  primary key (user_id, product_id)
);

alter table public.wishlists enable row level security;

drop policy if exists "Owner can manage wishlists" on public.wishlists;
create policy "Owner can manage wishlists" on public.wishlists
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional Address Book table
create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient text,
  phone text,
  address_line text,
  city text,
  country text,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.user_addresses enable row level security;
drop policy if exists "Owner manage addresses" on public.user_addresses;
create policy "Owner manage addresses" on public.user_addresses
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
