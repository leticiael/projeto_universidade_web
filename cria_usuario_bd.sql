  ALTER LOGIN sa ENABLE;
  GO
  ALTER LOGIN sa WITH PASSWORD = '123456';
  GO
  SELECT name, is_disabled, type_desc FROM sys.server_principals WHERE name = 'sa';