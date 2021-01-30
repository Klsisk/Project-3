-- Create tables
CREATE TABLE salary (
	id SERIAL,
	player VARCHAR(100),
	team VARCHAR(100),
	salary INT
);

CREATE TABLE stats (
	id SERIAL,
	player VARCHAR(100),
	age INT,
	team VARCHAR(100),
	total_games INT,
	games_started INT,
	minutes_played FLOAT,
	points_per_game FLOAT	
);

CREATE TABLE allstar (
	id SERIAL,
	player VARCHAR(100),
	position VARCHAR(100),
	team VARCHAR(100)	
);

CREATE TABLE team_stats (
	id SERIAL,
	Team VARCHAR(100),
	W INT,
	L INT,
	PSG FLOAT,
	PAG FLOAT,
	SRS FLOAT
);

-- Query to check successful load
select * from salary
select * from stats
select * from allstar
select * from team_stats
