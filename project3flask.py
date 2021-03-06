import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask import Flask, jsonify, render_template, redirect, url_for, request
from Resources.config import sql_pass
import os
#################################################
# Database Setup
#################################################
engine = create_engine(f'postgresql://postgres:{sql_pass}@localhost/NBA')
conn=engine.connect()
print(conn.execute("SELECT * from salary"))

# Reflect an existing database into a new model
Base = automap_base()

# Reflect the tables
Base.prepare(engine, reflect=True)


#################################################
# Flask Setup
#################################################
app = Flask(__name__)
#################################################
# Flask Routes
#################################################
@app.route("/")
def index():
    """List all available api routes."""
    # return (
    #     f"Available Routes:<br/>"
    #     f"/api/v1.0/teamsalary<br/>"
    #     f"/api/v1.0/salary<br/>"
    #     f"/api/v1.0/resultstosalary<br/>"
    #     f"/api/v1.0/bangforbuck"
    # )
    return render_template( "index.html")

@app.route("/psvt", methods = ['GET', 'POST'])
def psvt():
    return render_template( "player_salaries_vs_teams.html")
    
@app.route("/taa", methods = ['GET', 'POST'])
def taa():
    return render_template( "teams_and_allstars.html")

@app.route("/avs", methods = ['GET', 'POST'])
def avs():
    return render_template( "avs.html")

@app.route("/api/v1.0/teamsalary")
def teamsalary():
    engine = create_engine(f'postgresql://postgres:{sql_pass}@localhost/NBA')
    conn=engine.connect()
    query2="""
    SELECT team, sum(salary) as "Total Salary Paid"
    FROM public.salary
    group by team
    """
    results=conn.execute(query2)
    teamsalary = []
    for  team, salary in results:
        teamsalary_dict = {}
        teamsalary_dict["team"] = team
        teamsalary_dict["salary"] = float(salary)
        teamsalary.append(teamsalary_dict)
    return jsonify(teamsalary)

@app.route("/api/v1.0/salary")
def salary():
    all_salary = []
    engine = create_engine(f'postgresql://postgres:{sql_pass}@localhost/NBA')
    conn=engine.connect()
    query="""
    SELECT player, team, sum(salary)
    FROM public.salary
    group by player, team
    """
    results=conn.execute(query)
    for player, team, salary in results:
        all_salary_dict = {}
        all_salary_dict["player"] = player
        all_salary_dict["team"] = team
        all_salary_dict["salary"] = float(salary)
        all_salary.append(all_salary_dict)
    return jsonify(all_salary)

@app.route("/api/v1.0/resultstosalary")
def resultstosalary():
    resultstosalary = []
    engine = create_engine(f'postgresql://postgres:{sql_pass}@localhost/NBA')
    conn=engine.connect()
    query3="""
    SELECT  s.team, t.win, t.loss, sum(s.salary)
    FROM public.salary s, team_stats t
    where s.team = t.team
    group by s.team, t.win, t.loss
    order by s.team
    """ 
    results=conn.execute(query3)
    for team,win,loss,salary in results:
        all_stats_dict = {}
        all_stats_dict["team"] = team
        all_stats_dict["win"]=win
        all_stats_dict["loss"]=loss
        all_stats_dict["salary"] = float(salary)
        resultstosalary.append(all_stats_dict)
    return jsonify(resultstosalary)

@app.route("/api/v1.0/bangforbuck")
def bangforbuck():
    bangforbuck_list = []
    engine = create_engine(f'postgresql://postgres:{sql_pass}@localhost/NBA')
    conn=engine.connect()
    query4="""

select stats.player, salary.salary, stats.points_per_game, ROUND(stats.total_games * stats.points_per_game)
as "totalpoints", ROUND(salary.salary/stats.points_per_game) as "bangforbuck"
from stats, salary where stats.player = salary.player and stats.points_per_game > 0
group by stats.player, salary.salary, stats.points_per_game, totalpoints, bangforbuck
order by stats.player;
"""
    results=conn.execute(query4)
    for player,salary,points_per_game,totalpoints,bangforbuck in results:
        bangforbuck_dict = {}
        bangforbuck_dict["player"]=player
        bangforbuck_dict["salary"] = float(salary)
        bangforbuck_dict["points_per_game"] = float(points_per_game)
        bangforbuck_dict["totalpoints"] = float(totalpoints)
        bangforbuck_dict["bangforbuck"] = float(bangforbuck)
        print(bangforbuck_dict)
        bangforbuck_list.append(bangforbuck_dict)
    return jsonify(bangforbuck_list)

if __name__ == '__main__':
    app.run(debug=True)