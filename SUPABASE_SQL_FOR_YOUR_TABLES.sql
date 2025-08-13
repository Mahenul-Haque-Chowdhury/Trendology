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
  add column if not exists status text default 'pending' not null;

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

drop policy if exists "Insert order items" on public.order_items;
create policy "Insert order items" on public.order_items
for insert with check (true);

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
