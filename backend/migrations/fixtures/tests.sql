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
  -- admin:admin2
  E'admin',
  E'$2a$06$tKpDiLx4OLJqwwqX8WnBEe275M/C2ySYoXzahUxtcgG37DMjlDH8y'),
(
  -- voter:voter2
  E'voter',
  E'$2a$06$nbdo5REuQJCQRN2dNXFDzuHqa1YAzaPmWKmnkLKabFycVJoZ3lbQG'),
(
  -- newbie:newbie2
  E'newbie',
  E'$2a$06$/yhMZa390uXt65wXmknHeuwDKJUdF0XBwRSDrpsj45xc1/dMTqpXq');

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

