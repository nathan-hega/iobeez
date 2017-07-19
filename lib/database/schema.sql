--
-- DROPS
--
DROP TRIGGER IF EXISTS v_sensor_data_insert ON v_sensor_data;
DROP FUNCTION IF EXISTS get_sensor_id(TEXT);
DROP FUNCTION IF EXISTS get_account_id(TEXT);
DROP FUNCTION IF EXISTS add_sensor_log();
DROP FUNCTION IF EXISTS get_average(INTEGER, TEXT, TEXT);

DROP VIEW IF EXISTS v_sensor_data;
DROP TABLE IF EXISTS sensor_data;
DROP TABLE IF EXISTS sensor;
DROP TABLE IF EXISTS account;


--
-- TABLE CREATION
--

CREATE TABLE sensor (
  id SERIAL UNIQUE PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE account (
  id SERIAL UNIQUE PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE sensor_data (
  id SERIAL UNIQUE PRIMARY KEY,
  value INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL,
  fk_account INTEGER NOT NULL REFERENCES account (id),
  fk_sensor INTEGER NOT NULL REFERENCES sensor (id)
);


--
-- VIEW CREATION
--

CREATE OR REPLACE VIEW v_sensor_data AS (
  -- for each sensor log (entry in sensor_data), give me the human readable account name
  WITH cte_account AS (
    SELECT sensor_data.id, account.name as account_name
    FROM sensor_data
    LEFT JOIN account
      ON (sensor_data.fk_account = account.id)),

  -- for each sensor log (entry in sensor_data), give me the human readable sensor name
  cte_sensor AS (
    SELECT sensor_data.id, sensor.name as sensor_name
    FROM sensor_data
    LEFT JOIN sensor
      ON (sensor_data.fk_sensor = sensor.id))

  SELECT sensor_data.id, sensor_data.created, sensor_data.value, account_name, sensor_name
  FROM sensor_data
  LEFT JOIN cte_account ON (sensor_data.id = cte_account.id)
  LEFT JOIN cte_sensor ON (sensor_data.id = cte_sensor.id)
);

--
-- FUNCTIONS
--

--
-- Function: get_sensor_id
-- Parameters: _sensor_name (TEXT)
-- Usage: Returns the ID of _sensor_name. If _sensor_name does not exist, _sensor_name is added to the
-- sensor table and the new ID is returned.
--
CREATE OR REPLACE FUNCTION get_sensor_id(_sensor_name TEXT) RETURNS INTEGER AS $$
DECLARE
  sensor_id INTEGER;
BEGIN
  SELECT id INTO sensor_id FROM sensor WHERE name = _sensor_name;
  IF sensor_id is NULL THEN
    INSERT INTO sensor (name) VALUES (_sensor_name);
    SELECT id INTO sensor_id FROM sensor WHERE name = _sensor_name;
  END IF;
  RETURN sensor_id;
END;
$$ LANGUAGE plpgsql;

--
-- Function: get_account_id
-- Parameters: _account_name (TEXT)
-- Usage: Returns the ID of _account_name. If _account_name does not exist, _account_name is added to the
-- account table and the new ID is returned.
--
CREATE OR REPLACE FUNCTION get_account_id(_account_name TEXT) RETURNS INTEGER AS $$
DECLARE
  account_id INTEGER;
BEGIN
  SELECT id INTO account_id FROM account WHERE name = _account_name;
  IF account_id is NULL THEN
    INSERT INTO account (name) VALUES (_account_name);
    SELECT id INTO account_id FROM account WHERE name = _account_name;
  END IF;
  RETURN account_id;
END;
$$ LANGUAGE plpgsql;

--
-- Function: get_average
-- Parameters: _minutes (INTEGER), _sensor_name (TEXT), _account_name (TEXT)
-- Usage: Returns the average value for a given sensor name and account name
-- within a certain time period defined in minutes by _minutes
--
CREATE OR REPLACE FUNCTION get_average(_minutes INTEGER, _sensor_name TEXT, _account_name TEXT) RETURNS INTEGER AS $$
DECLARE
  average INTEGER;
  time_period TIMESTAMP := CURRENT_TIMESTAMP - _minutes * INTERVAL '1 minute';
BEGIN
  SELECT AVG(value) INTO average FROM v_sensor_data
  WHERE
  (
   created > time_period
   AND account_name = _account_name
   AND sensor_name = _sensor_name
  );

  RETURN average;
END;
$$ LANGUAGE plpgsql;

--
-- Function: add_sensor_log
-- Parameters: (trigger procedures have special parameters:
-- http://www.postgresql.org/docs/9.1/interactive/plpgsql-trigger.html)
-- Usage: This function replaces the account and sensor fields with their appropriate
-- IDs and then inserts a new row into the sensor_data table. This function combined with the get_
-- functions defined above, populate all tables of the database as rows are inserted into the view (v_sensor_data)
--
CREATE OR REPLACE FUNCTION add_sensor_log() RETURNS TRIGGER AS $$
DECLARE
  account_id INTEGER;
  sensor_id INTEGER;
BEGIN
  SELECT get_account_id(NEW.account_name) INTO account_id;
  SELECT get_sensor_id(NEW.sensor_name) INTO sensor_id;

  IF account_id IS NULL OR sensor_id IS NULL THEN
    RAISE EXCEPTION 'Unable to locate the appropriate IDs for insertion.';
  ELSE
    INSERT INTO sensor_data ( value, created, fk_account, fk_sensor )
    VALUES                  (NEW.value, CURRENT_TIMESTAMP, account_id, sensor_id );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--
-- TRIGGERS
--
CREATE TRIGGER v_sensor_data_insert
  INSTEAD OF INSERT ON v_sensor_data
  FOR EACH ROW
  EXECUTE PROCEDURE add_sensor_log();