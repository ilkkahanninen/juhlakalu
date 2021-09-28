CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users ---------------------------------------------------------
CREATE TABLE users (
  username text PRIMARY KEY UNIQUE,
  email text,
  phone text
);

CREATE UNIQUE INDEX users_pkey ON users (username text_ops);

CREATE UNIQUE INDEX users_username_key ON users (username text_ops);

-- Passwords -----------------------------------------------------
CREATE TABLE user_passwords (
  username text PRIMARY KEY REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
  password_hash text NOT NULL
);

CREATE UNIQUE INDEX passwords_pkey ON user_passwords (user_id text_ops);

-- Roles ---------------------------------------------------------
CREATE TABLE roles (
  id text PRIMARY KEY,
  description text
);

CREATE UNIQUE INDEX roles_pkey ON roles (id text_ops);

INSERT INTO "public"."roles" (
  "id",
  "description")
VALUES (
  E'admin',
  E'Administration super human'),
(
  E'voter',
  E'Voting rights');

-- User-role mapping ---------------------------------------------
CREATE TABLE user_roles (
  username text NOT NULL REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
  role text NOT NULL REFERENCES roles (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX user_roles_username_role_idx ON user_roles (username text_ops, ROLE text_ops);

