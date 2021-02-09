-- Create tables
CREATE TABLE salary (
	id SERIAL,
	player VARCHAR(100),
	team VARCHAR(100),
	salary INT
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
	win INT,
	loss INT,
	PSG DEC,
	PAG DEC,
	SRS DEC
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

select * from stats;
select * from salary;
select * from team_stats;
select * from allstar;

SELECT player, team, sum(salary)
FROM public.salary
group by player, team;

SELECT team, sum(salary) as "Total Salary Paid"
FROM public.salary
group by team;

SELECT salary.team, team_stats.win, team_stats.loss, sum(salary.salary)
FROM public.salary, team_stats 
where salary.team = team_stats.team
group by salary.team, team_stats.win, team_stats.loss
order by salary.team;

select stats.player, salary.salary, stats.points_per_game, ROUND(stats.total_games * stats.points_per_game)  
as "totalpoints", ROUND(salary.salary/stats.points_per_game) as "bangforbuck"
from stats, salary where stats.player = salary.player and stats.points_per_game > 0
group by stats.player, salary.salary, stats.points_per_game, totalpoints, bangforbuck
order by bangforbuck DESC;