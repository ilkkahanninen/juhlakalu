CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table Definition ----------------------------------------------
CREATE TABLE users (
  username text PRIMARY KEY UNIQUE,
  email text,
  phone text
);

-- Indices -------------------------------------------------------
CREATE UNIQUE INDEX users_pkey ON users (username text_ops);

CREATE UNIQUE INDEX users_username_key ON users (username text_ops);

-- Table Definition ----------------------------------------------
CREATE TABLE passwords (
  user_id text PRIMARY KEY REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
  password_hash text NOT NULL
);

-- Indices -------------------------------------------------------
CREATE UNIQUE INDEX passwords_pkey ON passwords (user_id text_ops);

