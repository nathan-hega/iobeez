-- FUNCTION TESTS
-- OUTPUT: Id of sensor or account, depending on function called
SELECT "get_sensor_id"('electric');
SELECT "get_sensor_id"('motion');

SELECT "get_account_id"('Nate');
SELECT "get_account_id"('Locke');

-- VIEW INSERTION
-- OUTPUT: Data should be added to all appropriate tables. If data entered for sensor or name are not already in the DB,
-- the system should create rows for them automatically
INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES (1, 'Nate', 'temperature');
INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES (7, 'Locke', 'electric');
INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES (2, 'Locke', 'motion');
INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES (7, 'Nate', 'temperature');
INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES (9, 'Joey', 'smoke');
INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES (3, 'Anthony', 'temperature');
INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES (8, 'Anthony', 'electric');
INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES (2, 'Joey', 'motion');
INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES (4, 'Nate', 'smoke');