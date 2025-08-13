Supabase setup for Storefront

1) Create project and get keys
- Go to supabase.com, create a project.
- Copy Project URL and anon public key into .env.local (see .env.local.example).

2) SQL schema (run in Supabase SQL editor)

-- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image text,
  images text[] default '{}',
  category text not null default 'misc',
  tags text[] default '{}',
  active boolean not null default true,
  created_at timestamp with time zone default now()
);

-- orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text,
  email text,
  phone text,
  address text,
  city text,
  country text,
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text not null,
  txid text,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- order_items
create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  qty integer not null,
  unit_price numeric(10,2) not null
);

-- RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies
-- Products readable by anyone
create policy if not exists "Public read products" on public.products
for select using (true);

-- Product writes by authenticated users only
create policy if not exists "Authenticated write products" on public.products
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Orders: users can insert their own orders
create policy if not exists "Anyone insert orders" on public.orders
for insert with check (true);
-- Orders: read by owner or admin
create policy if not exists "Owner can read orders" on public.orders
for select using (auth.uid() = user_id or auth.role() = 'service_role');

-- Order items: insert when creating order
create policy if not exists "Insert order items" on public.order_items
for insert with check (true);
create policy if not exists "Read order items by admin" on public.order_items
for select using (auth.role() = 'service_role');

3) Restart dev after adding .env.local

4) Optional: seed some products via SQL insert.
