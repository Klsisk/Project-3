import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask import Flask, jsonify
#################################################
# Database Setup
#################################################
engine = create_engine('postgresql://postgres:kkhpjk00@localhost/NBA')
conn=engine.connect()
print(conn.execute("SELECT * from salary"))
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)
# # Save reference to the table
# allstar = Base.classes.allstar
# salary=Base.classes.salary
#################################################
# Flask Setup
#################################################
app = Flask(__name__)
#################################################
# Flask Routes
#################################################
@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/allstar<br/>"
        f"/api/v1.0/salary"
    )
# @app.route("/api/v1.0/allstar")
# def allstar():
#     # Create our session (link) from Python to the DB
#     session = Session(engine)
#     """Return a list of all passenger names"""
#     # Query all passengers
#     results = session.query(Passenger.name).all()
#     session.close()
#     # Convert list of tuples into normal list
#     all_names = list(np.ravel(results))
#     return jsonify(all_names)
@app.route("/api/v1.0/salary")
def salary():
    # Create our session (link) from Python to the DB
    session = Session(engine)
    """Return a list of salary data """
    # Query all passengers
    results = session.query(salary.player, salary.team, salary.salary).all()
    session.close()
    # Create a dictionary from the row data and append to a list of all_passengers
    all_salary = []
    for player, team, salary in results:
        all_salary_dict = {}
        all_salary_dict["player"] = player
        all_salary_dict["team"] = team
        all_salary_dict["salary"] = salary
        all_salary.append(all_salary_dict)
    return jsonify(all_salary)
if __name__ == '__main__':
    app.run(debug=True)