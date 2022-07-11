#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE TABLE users(id SERIAL PRIMARY KEY, username CHARACTER VARYING(100) UNIQUE NOT NULL, password CHARACTER VARYING(500) NOT NULL, type CHARACTER VARYING(6) NOT NULL, created_on timestamp with time zone DEFAULT clock_timestamp());
	CREATE TABLE products(id SERIAL PRIMARY KEY, name CHARACTER VARYING(500) NOT NULL, price MONEY, quantity INTEGER, user_id SERIAL REFERENCES users(id), created_on timestamp with time zone DEFAULT clock_timestamp(), last_modified timestamp with time zone DEFAULT clock_timestamp());
	CREATE TABLE orders(id SERIAL PRIMARY KEY, product_id SERIAL REFERENCES products(id), user_id SERIAL REFERENCES users(id), quantity INTEGER, created_on timestamp with time zone DEFAULT clock_timestamp(), last_modified timestamp with time zone DEFAULT clock_timestamp());
EOSQL