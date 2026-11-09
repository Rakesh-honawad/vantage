-- Publishes every package whose scheduled time has passed. Called by a cron route using the secret key.
create or replace function publish_due_packages() returns int
language plpgsql security definer set search_path = public as $$
declare r record; v_no int; v_id uuid; n int := 0;
begin
  for r in select id, draft from packages where publish_at is not null and publish_at <= now() for update skip locked loop
    select coalesce(max(version_no), 0) + 1 into v_no from package_versions where package_id = r.id;
    insert into package_versions (package_id, version_no, content, note, created_by)
      values (r.id, v_no, r.draft, 'Scheduled publish', null) returning id into v_id;
    update packages set published_version_id = v_id, status = 'published', publish_at = null, updated_at = now() where id = r.id;
    insert into activity_log (actor_id, action, entity, entity_id, detail)
      values (null, 'package.publish', 'package', r.id, jsonb_build_object('version', v_no, 'note', 'Scheduled publish'));
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function publish_due_packages() from public, anon, authenticated;
grant execute on function publish_due_packages() to service_role;
