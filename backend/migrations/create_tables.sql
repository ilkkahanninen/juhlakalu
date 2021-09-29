CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS {{SCHEMA}};

-- Users ---------------------------------------------------------
CREATE TABLE {{SCHEMA}}.users (
  username text PRIMARY KEY UNIQUE,
  email text,
  phone text
);

CREATE UNIQUE INDEX users_username_key ON {{SCHEMA}}.users (username text_ops);

-- Passwords -----------------------------------------------------
CREATE TABLE {{SCHEMA}}.user_passwords (
  username text PRIMARY KEY REFERENCES {{SCHEMA}}.users (username) ON DELETE CASCADE ON UPDATE CASCADE,
  password_hash text NOT NULL
);

CREATE UNIQUE INDEX passwords_pkey ON {{SCHEMA}}.user_passwords (username text_ops);

-- Roles ---------------------------------------------------------
CREATE TABLE {{SCHEMA}}.roles (
  id text PRIMARY KEY,
  description text
);

INSERT INTO {{SCHEMA}}.roles (
  "id",
  "description")
VALUES (
  E'admin',
  E'Administration super human'),
(
  E'voter',
  E'Voting rights');

-- User-role mapping ---------------------------------------------
CREATE TABLE {{SCHEMA}}.user_roles (
  username text NOT NULL REFERENCES {{SCHEMA}}.users (username) ON DELETE CASCADE ON UPDATE CASCADE,
  role text NOT NULL REFERENCES {{SCHEMA}}.roles (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX user_roles_username_role_idx ON {{SCHEMA}}.user_roles (username text_ops, ROLE text_ops);

