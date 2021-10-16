TRUNCATE TABLE {{SCHEMA}}.users CASCADE;

--- Users ---
INSERT INTO {{SCHEMA}}.users (
  "username",
  "email",
  "phone")
VALUES (
  E'admin',
  E'admin@gmail.com',
  E'+3581234567'),
(
  E'newbie',
  E'newbie@gmail.com',
  NULL),
(
  E'voter',
  E'voter@gmail.com',
  NULL);

--- Passwords ---
INSERT INTO {{SCHEMA}}.user_passwords (
  "username",
  "password_hash")
VALUES (
  -- admin:password
  E'admin',
  crypt(
    'password', gen_salt(
      'bf', 4))),
(
  -- voter:password
  E'voter',
  crypt(
    'password', gen_salt(
      'bf', 4))),
(
  -- newbie:password
  E'newbie',
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
  E'voter'),
(
  E'voter',
  E'voter');

