-- ============================================================================
-- Schéma SQL pour OskarDB (Supabase)
-- Base de données pour OsKaR - Outil de gestion d'objectifs avec IA
-- ============================================================================

-- Activer les extensions nécessaires
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. PROFILES (Extension de auth.users)
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  company text,
  role text,
  avatar_url text,
  company_profile jsonb,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index pour recherche rapide
create index profiles_email_idx on profiles(email);

-- RLS pour profiles
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can view team members profiles"
  on profiles for select
  using (
    exists (
      select 1 from team_members tm1
      join team_members tm2 on tm1.team_id = tm2.team_id
      where tm1.user_id = auth.uid()
      and tm2.user_id = profiles.id
    )
  );

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Trigger pour mettre à jour updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 2. TEAMS (Équipes)
-- ============================================================================

create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  owner_id uuid references profiles(id) on delete cascade not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index teams_owner_id_idx on teams(owner_id);

alter table teams enable row level security;

-- Note: Les politiques RLS pour teams seront créées après team_members

create trigger update_teams_updated_at
  before update on teams
  for each row
  execute function update_updated_at_column();

-- Fonction pour vérifier l'appartenance à une équipe (Security Definer pour éviter la récursion)
create or replace function public.check_is_team_member(t_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.team_members
    where team_id = t_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Fonction pour vérifier le rôle admin dans une équipe
create or replace function public.check_is_team_admin(t_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.team_members
    where team_id = t_id
    and user_id = auth.uid()
    and role in ('OWNER', 'ADMIN')
  );
end;
$$ language plpgsql security definer set search_path = public;

create table team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role team_role not null default 'MEMBER',
  joined_at timestamptz default now(),
  unique(team_id, user_id)
);

create index team_members_team_id_idx on team_members(team_id);
create index team_members_user_id_idx on team_members(user_id);

alter table team_members enable row level security;

create policy "Team members can view team members"
  on team_members for select
  using (public.check_is_team_member(team_id));

create policy "Team admins can manage members"
  on team_members for all
  using (public.check_is_team_admin(team_id));

create policy "Users can delete own team memberships"
  on team_members for delete
  using (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES FOR TEAMS (après création de team_members)
-- ============================================================================

create policy "Team members can view their teams"
  on teams for select
  using (
    exists (
      select 1 from team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team owners can update their teams"
  on teams for update
  using (owner_id = auth.uid());

create policy "Users can create teams"
  on teams for insert
  with check (owner_id = auth.uid());

-- ============================================================================
-- 4. INVITATIONS (Invitations d'équipe)
-- ============================================================================

create type invitation_status as enum ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

create table invitations (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade not null,
  email text not null,
  role team_role not null default 'MEMBER',
  invited_by uuid references profiles(id) on delete cascade not null,
  token text unique not null,
  status invitation_status default 'PENDING',
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index invitations_team_id_idx on invitations(team_id);
create index invitations_email_idx on invitations(email);
create index invitations_token_idx on invitations(token);

alter table invitations enable row level security;

create policy "Team admins can manage invitations"
  on invitations for all
  using (
    exists (
      select 1 from team_members
      where team_members.team_id = invitations.team_id
      and team_members.user_id = auth.uid()
      and team_members.role in ('OWNER', 'ADMIN')
    )
  );

-- ============================================================================
-- 5. AMBITIONS (Ambitions annuelles)
-- ============================================================================

create type ambition_category as enum (
  'GROWTH', 'INNOVATION', 'EFFICIENCY', 'CUSTOMER', 
  'TEAM', 'FINANCIAL', 'PRODUCT', 'OTHER'
);

create table ambitions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  team_id uuid references teams(id) on delete cascade,
  title text not null,
  description text,
  category ambition_category not null,
  year integer not null,
  target_value numeric,
  current_value numeric default 0,
  unit text,
  color text,
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index ambitions_user_id_idx on ambitions(user_id);
create index ambitions_team_id_idx on ambitions(team_id);
create index ambitions_year_idx on ambitions(year);

alter table ambitions enable row level security;

create policy "Users can view own ambitions"
  on ambitions for select
  using (user_id = auth.uid() or team_id in (
    select team_id from team_members where user_id = auth.uid()
  ));

create policy "Users can manage own ambitions"
  on ambitions for all
  using (user_id = auth.uid());

create trigger update_ambitions_updated_at
  before update on ambitions
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 6. KEY_RESULTS (Résultats clés)
-- ============================================================================

create table key_results (
  id uuid primary key default uuid_generate_v4(),
  ambition_id uuid references ambitions(id) on delete cascade not null,
  title text not null,
  description text,
  target_value numeric not null,
  current_value numeric default 0,
  unit text,
  deadline timestamptz,
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index key_results_ambition_id_idx on key_results(ambition_id);

alter table key_results enable row level security;

create policy "Users can view key_results of their ambitions"
  on key_results for select
  using (
    exists (
      select 1 from ambitions
      where ambitions.id = key_results.ambition_id
      and (ambitions.user_id = auth.uid() or ambitions.team_id in (
        select team_id from team_members where user_id = auth.uid()
      ))
    )
  );

create policy "Users can manage key_results of own ambitions"
  on key_results for all
  using (
    exists (
      select 1 from ambitions
      where ambitions.id = key_results.ambition_id
      and ambitions.user_id = auth.uid()
    )
  );

create trigger update_key_results_updated_at
  before update on key_results
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 7. QUARTERLY_OBJECTIVES (Objectifs trimestriels)
-- ============================================================================

create type quarter_enum as enum ('Q1', 'Q2', 'Q3', 'Q4');
create type priority_enum as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

create table quarterly_objectives (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  team_id uuid references teams(id) on delete cascade,
  ambition_id uuid references ambitions(id) on delete set null,
  title text not null,
  description text,
  quarter quarter_enum not null,
  year integer not null,
  priority priority_enum default 'MEDIUM',
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index quarterly_objectives_user_id_idx on quarterly_objectives(user_id);
create index quarterly_objectives_team_id_idx on quarterly_objectives(team_id);
create index quarterly_objectives_ambition_id_idx on quarterly_objectives(ambition_id);
create index quarterly_objectives_quarter_year_idx on quarterly_objectives(quarter, year);

alter table quarterly_objectives enable row level security;

create policy "Users can view own quarterly_objectives"
  on quarterly_objectives for select
  using (user_id = auth.uid() or team_id in (
    select team_id from team_members where user_id = auth.uid()
  ));

create policy "Users can manage own quarterly_objectives"
  on quarterly_objectives for all
  using (user_id = auth.uid());

create trigger update_quarterly_objectives_updated_at
  before update on quarterly_objectives
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 8. QUARTERLY_KEY_RESULTS (KR trimestriels)
-- ============================================================================

create table quarterly_key_results (
  id uuid primary key default uuid_generate_v4(),
  objective_id uuid references quarterly_objectives(id) on delete cascade not null,
  title text not null,
  description text,
  target_value numeric not null,
  current_value numeric default 0,
  unit text,
  deadline timestamptz,
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index quarterly_key_results_objective_id_idx on quarterly_key_results(objective_id);

alter table quarterly_key_results enable row level security;

create policy "Users can view quarterly_key_results of their objectives"
  on quarterly_key_results for select
  using (
    exists (
      select 1 from quarterly_objectives
      where quarterly_objectives.id = quarterly_key_results.objective_id
      and (quarterly_objectives.user_id = auth.uid() or quarterly_objectives.team_id in (
        select team_id from team_members where user_id = auth.uid()
      ))
    )
  );

create policy "Users can manage quarterly_key_results of own objectives"
  on quarterly_key_results for all
  using (
    exists (
      select 1 from quarterly_objectives
      where quarterly_objectives.id = quarterly_key_results.objective_id
      and quarterly_objectives.user_id = auth.uid()
    )
  );

create trigger update_quarterly_key_results_updated_at
  before update on quarterly_key_results
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 9. ACTIONS (Actions concrètes)
-- ============================================================================

create type action_status as enum ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED', 'CANCELLED');

create table actions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  team_id uuid references teams(id) on delete cascade,
  objective_id uuid references quarterly_objectives(id) on delete cascade,
  key_result_id uuid references quarterly_key_results(id) on delete set null,
  title text not null,
  description text,
  status action_status default 'TODO',
  priority priority_enum default 'MEDIUM',
  deadline timestamptz,
  assigned_to uuid references profiles(id) on delete set null,
  order_index integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

create index actions_user_id_idx on actions(user_id);
create index actions_team_id_idx on actions(team_id);
create index actions_objective_id_idx on actions(objective_id);
create index actions_assigned_to_idx on actions(assigned_to);
create index actions_status_idx on actions(status);

alter table actions enable row level security;

create policy "Users can view own actions"
  on actions for select
  using (user_id = auth.uid() or assigned_to = auth.uid() or team_id in (
    select team_id from team_members where user_id = auth.uid()
  ));

create policy "Users can manage own actions"
  on actions for all
  using (user_id = auth.uid());

create trigger update_actions_updated_at
  before update on actions
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 10. COMMENTS (Commentaires)
-- ============================================================================

create type comment_entity_type as enum ('AMBITION', 'KEY_RESULT', 'OBJECTIVE', 'ACTION');

create table comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  entity_type comment_entity_type not null,
  entity_id uuid not null,
  content text not null,
  mentions jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index comments_entity_idx on comments(entity_type, entity_id);
create index comments_user_id_idx on comments(user_id);

alter table comments enable row level security;

create policy "Users can view comments on accessible entities"
  on comments for select
  using (
    -- Commentaires sur les ambitions de l'utilisateur
    (entity_type = 'AMBITION' and exists (
      select 1 from ambitions
      where ambitions.id = comments.entity_id
      and ambitions.user_id = auth.uid()
    ))
    or
    -- Commentaires sur les objectifs de l'utilisateur
    (entity_type = 'OBJECTIVE' and exists (
      select 1 from quarterly_objectives
      where quarterly_objectives.id = comments.entity_id
      and quarterly_objectives.user_id = auth.uid()
    ))
    or
    -- Commentaires sur les key results de l'utilisateur
    (entity_type = 'KEY_RESULT' and exists (
      select 1 from quarterly_key_results qkr
      join quarterly_objectives qo on qo.id = qkr.objective_id
      where qkr.id = comments.entity_id
      and qo.user_id = auth.uid()
    ))
    or
    -- Commentaires sur les actions de l'utilisateur
    (entity_type = 'ACTION' and exists (
      select 1 from actions
      where actions.id = comments.entity_id
      and actions.user_id = auth.uid()
    ))
  );

create policy "Users can create comments"
  on comments for insert
  with check (user_id = auth.uid());

create policy "Users can update own comments"
  on comments for update
  using (user_id = auth.uid());

create policy "Users can delete own comments"
  on comments for delete
  using (user_id = auth.uid());

create trigger update_comments_updated_at
  before update on comments
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 11. NOTIFICATIONS (Notifications)
-- ============================================================================

create type notification_type as enum (
  'TEAM_INVITATION',
  'MEMBER_JOINED',
  'OBJECTIVE_SHARED',
  'COMMENT_MENTION',
  'DEADLINE_APPROACHING',
  'PROGRESS_UPDATE',
  'ACHIEVEMENT'
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  message text,
  entity_type text,
  entity_id uuid,
  read boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index notifications_user_id_idx on notifications(user_id);
create index notifications_read_idx on notifications(read);
create index notifications_created_at_idx on notifications(created_at desc);

alter table notifications enable row level security;

create policy "Users can view own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on notifications for update
  using (user_id = auth.uid());

create policy "System can create notifications"
  on notifications for insert
  with check (true);

-- ============================================================================
-- 12. SHARED_OBJECTIVES (Partage d'objectifs)
-- ============================================================================

create type share_permission as enum ('VIEW', 'EDIT');

create table shared_objectives (
  id uuid primary key default uuid_generate_v4(),
  objective_id uuid references quarterly_objectives(id) on delete cascade not null,
  shared_with_user_id uuid references profiles(id) on delete cascade,
  shared_with_team_id uuid references teams(id) on delete cascade,
  permission share_permission default 'VIEW',
  shared_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  check (
    (shared_with_user_id is not null and shared_with_team_id is null) or
    (shared_with_user_id is null and shared_with_team_id is not null)
  )
);

create index shared_objectives_objective_id_idx on shared_objectives(objective_id);
create index shared_objectives_user_id_idx on shared_objectives(shared_with_user_id);
create index shared_objectives_team_id_idx on shared_objectives(shared_with_team_id);

alter table shared_objectives enable row level security;

create policy "Users can view shares of their objectives"
  on shared_objectives for select
  using (
    shared_by = auth.uid() or
    shared_with_user_id = auth.uid() or
    shared_with_team_id in (
      select team_id from team_members where user_id = auth.uid()
    )
  );

create policy "Users can create shares for own objectives"
  on shared_objectives for insert
  with check (
    exists (
      select 1 from quarterly_objectives
      where quarterly_objectives.id = shared_objectives.objective_id
      and quarterly_objectives.user_id = auth.uid()
    )
  );

create policy "Users can delete own shares"
  on shared_objectives for delete
  using (shared_by = auth.uid());

-- ============================================================================
-- 13. PROGRESS (Historique de progression)
-- ============================================================================

create table progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  entity_type text not null,
  entity_id uuid not null,
  value numeric not null,
  note text,
  created_at timestamptz default now()
);

create index progress_entity_idx on progress(entity_type, entity_id);
create index progress_user_id_idx on progress(user_id);
create index progress_created_at_idx on progress(created_at desc);

alter table progress enable row level security;

create policy "Users can view own progress"
  on progress for select
  using (user_id = auth.uid());

create policy "Users can create progress entries"
  on progress for insert
  with check (user_id = auth.uid());

-- ============================================================================
-- 14. FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour créer automatiquement un profil lors de l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, company, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'role'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pour créer le profil automatiquement
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fonction pour calculer le pourcentage de progression
create or replace function calculate_progress_percentage(current_val numeric, target_val numeric)
returns numeric as $$
begin
  if target_val = 0 then
    return 0;
  end if;
  return round((current_val / target_val * 100)::numeric, 2);
end;
$$ language plpgsql immutable;

-- ============================================================================
-- 15. VUES UTILES
-- ============================================================================

-- Vue pour les ambitions avec progression calculée
create or replace view ambitions_with_progress 
with (security_invoker = true) as
select
  a.*,
  calculate_progress_percentage(a.current_value, a.target_value) as progress_percentage,
  count(kr.id) as key_results_count,
  avg(calculate_progress_percentage(kr.current_value, kr.target_value)) as avg_kr_progress
from ambitions a
left join key_results kr on kr.ambition_id = a.id
group by a.id;

-- Vue pour les objectifs trimestriels avec progression
create or replace view quarterly_objectives_with_progress
with (security_invoker = true) as
select
  qo.*,
  count(qkr.id) as key_results_count,
  avg(calculate_progress_percentage(qkr.current_value, qkr.target_value)) as avg_kr_progress,
  count(act.id) filter (where act.status = 'DONE') as completed_actions,
  count(act.id) as total_actions
from quarterly_objectives qo
left join quarterly_key_results qkr on qkr.objective_id = qo.id
left join actions act on act.objective_id = qo.id
group by qo.id;

-- ============================================================================
-- FIN DU SCHÉMA
-- ============================================================================

-- Instructions d'utilisation :
-- 1. Copiez ce fichier dans le SQL Editor de Supabase
-- 2. Exécutez-le pour créer toutes les tables et policies
-- 3. Vérifiez que RLS est activé sur toutes les tables
-- 4. Testez l'authentification et la création de profil automatique

