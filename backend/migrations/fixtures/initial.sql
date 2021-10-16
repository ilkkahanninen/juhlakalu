--- Users ---
INSERT INTO {{SCHEMA}}.users (
  "username",
  "email",
  "phone")
VALUES (
  E'admin',
  E'',
  E'');

--- Passwords ---
INSERT INTO {{SCHEMA}}.user_passwords (
  "username",
  "password_hash")
VALUES (
  E'admin',
  crypt(
    'password', gen_salt(
      'bf', 4)));

--- User roles ---
INSERT INTO {{SCHEMA}}.user_roles (
  "username",
  "role")
VALUES (
  E'admin',
  E'admin'),
(
  E'admin',
  E'voter');

