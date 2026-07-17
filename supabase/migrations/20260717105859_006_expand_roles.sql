/*
# Expand Profile Roles

## Changes
- Update `profiles.role` check constraint to support all COS roles.
- Roles: vendor, director, admin, finance, purchasing, hrd, pm, supervisor, qc, hse, engineer, surveyor, owner.
*/

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('vendor','director','admin','finance','purchasing','hrd','pm','supervisor','qc','hse','engineer','surveyor','owner'));
