alter table users
  add column if not exists phone text;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'phone', new.phone)
  )
  on conflict (id)
  do update
    set
      full_name = excluded.full_name,
      avatar_url = excluded.avatar_url,
      phone = excluded.phone;
  return new;
end;
$$ language plpgsql security definer;

update public.users u
set phone = new_phone.phone_value
from (
  select id, coalesce(raw_user_meta_data->>'phone', phone) as phone_value
  from auth.users
) as new_phone
where u.id = new_phone.id
  and coalesce(u.phone, '') is distinct from coalesce(new_phone.phone_value, '');
