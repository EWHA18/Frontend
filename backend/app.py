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

@app.errorhandler(HTTPException)
def error_handler(e):
    response = e.get_response()

    response.data = json.dumps({
        'status': e.code,
        'success': False,
        'message': e.description,
    })
    response.content_type = 'application/json'

    return response


def calculate(medicine_name, num, intake):
  product = database.execute(text("""
   SELECT
      ingredient
    FROM Medicine
      WHERE product = :medicine_name
  """), {'medicine_name': medicine_name}).fetchone()
  ingredients = product[0].split(":")
  ingredients.pop()
  for ingredient in ingredients:
    field = ingredient.split("_")
    word_id = field[0]
    classification = field[1]
    word_name = field[2]
    unit = field[3]   
    volume = float(field[4])
    isHeavyMetal = False
    if(classification=="중금속"): 
      isHeavyMetal = True
    prev=False
    
    for i in range(0,len(intake)):
      if intake[i]['word_id'] == word_id:
        intake[i]['volume'] += volume*float(num)
        prev=True

    if(prev==False):
      data={
        "word_id": word_id,
        "word_name":word_name,
        "volume":volume*float(num),
        "unit":unit,
        "isHeavyMetal": isHeavyMetal
      }
      intake.append(data)
  

@app.route("/api/sendintake", methods=['POST'])
def func():
  req=request.json
  intake=[]
  for medicine in req['data']:
        calculate(medicine['medicine_name'], medicine['num'], intake)
  data={}
  data["intake"]=intake
  print(data)
  return jsonify({
            "status": 200,
            "success": True,
            "data": data
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5000")