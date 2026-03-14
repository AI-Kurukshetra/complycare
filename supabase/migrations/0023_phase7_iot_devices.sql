-- Phase 7: IoT device inventory enhancements

alter table iot_devices
  add column if not exists device_type text,
  add column if not exists ip_address text,
  add column if not exists last_seen timestamptz,
  add column if not exists firmware_version text,
  add column if not exists firmware_updated_at date,
  add column if not exists compliance_status text not null default 'compliant',
  add column if not exists encryption_status text not null default 'encrypted',
  add column if not exists network_exposure text not null default 'internal',
  add column if not exists handles_phi boolean not null default false;

DO $$
BEGIN
  if not exists (
    select 1 from pg_constraint where conname = 'iot_devices_compliance_status_check'
  ) then
    alter table iot_devices
      add constraint iot_devices_compliance_status_check
      check (compliance_status in ('compliant', 'at_risk', 'non_compliant'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'iot_devices_encryption_status_check'
  ) then
    alter table iot_devices
      add constraint iot_devices_encryption_status_check
      check (encryption_status in ('encrypted', 'partially_encrypted', 'unencrypted'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'iot_devices_network_exposure_check'
  ) then
    alter table iot_devices
      add constraint iot_devices_network_exposure_check
      check (network_exposure in ('internal', 'external', 'vpn'));
  end if;
END $$;
