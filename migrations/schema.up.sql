CREATE TABLE urls (
  id serial primary key,
  created_at timestamptz not null,
  long_url text,
  short_url varchar(255) unique,
  last_access_at timestamptz not null,
  access_count integer not null default 0
);

ALTER SEQUENCE urls_id_seq RESTART WITH 1000;

CREATE TABLE image_queries (
  id serial primary key,
  created_at timestamptz not null,
  term text
);

CREATE TABLE file_data (
  id serial primary key,
  file_name text not null,
  file_size int not null,
  file_type text not null,
  lastModified timestamptz not null
);
