-- Runs once SQL Server is healthy. Safe to run again.
IF DB_ID(N'place_finder') IS NULL
BEGIN
    CREATE DATABASE place_finder;
    PRINT 'Created database place_finder';
END
ELSE
    PRINT 'Database place_finder already exists';
