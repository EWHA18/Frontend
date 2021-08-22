from flask      import Flask, request, jsonify, current_app, g, flash, json
from flask_cors import CORS
from sqlalchemy import create_engine, text
from datetime   import datetime, timedelta
from werkzeug.exceptions import HTTPException, NotFound
import datetime as dt

app = Flask(__name__)
database = create_engine("mysql+mysqlconnector://'root':1234@localhost:3306/healthcare?charset=utf8", encoding = 'utf-8', max_overflow = 0)
app.database = database

cors = CORS(app, resources = {
    r"/v1/*": {"origin": "*"},
    r"/api/*": {"origin": "*"}
  })

def calculate(medicine_id, medicine_name, num, intake):
  product = database.execute(text("""
    SELECT
      ingredient
      FROM Medicine
      WHERE idx = :medicine_id
  """), {'medicine_id': medicine_id}).fetchone()

      #이름으로 search
  # product = database.execute(text("""
  #   SELECT
  #     ingredient
  #     FROM Medicine
  #     WHERE product = :medicine_name
  # """), {'medicine_name': medicine_name}).fetchone()

  product = product[0]

  ingredients = product.split(":")
  ingredients = ingredients[0:-1]
  for ingredient in ingredients:
    field = ingredient.split("_")
    word_id = field[0]
    volume = float(field[1])
    unit = field[2]
    prev=False

    for i in range(0,len(intake)):
      if intake[i]['word_id'] == word_id:
        intake[i]['volume'] += volume*num
        prev=True

    if(prev==False):
      data={
        "word_id":word_id,
        "volume":volume*num,
        "unit":unit
      }
      intake.append(data)
  print(intake)

@app.route("/api/sendintake", methods=['POST'])
def func():
  req=request.json
  intake=[]
  for medicine in req:
    calculate(medicine['medicine_id'], medicine['medicine_name'], medicine['num'], intake)
  data={}
  data["intake"]=intake
  return jsonify({
            "status": 200,
            "success": True,
            "data": data
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5000")