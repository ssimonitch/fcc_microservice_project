CREATE TABLE urls (
  id serial primary key,
  created_at timestamptz not null,
  last_access_at timestamptz not null,
  long_url text,
  short_url varchar(255) unique
);
