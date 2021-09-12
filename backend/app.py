from flask      import Flask, request, jsonify, current_app, g, flash, json
from flask_cors import CORS
from sqlalchemy import create_engine, text
from werkzeug.exceptions import HTTPException, NotFound
import datetime as dt
import os
from werkzeug.utils import secure_filename
import pandas as pd


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
  for medicine in req:
        calculate(medicine['name'], medicine['intake'], intake)
  data={}
  data["intake"]=intake
  print(data)
  return jsonify({
            "status": 200,
            "success": True,
            "data": data
        })


# 파일 읽고 처리하기
def csv_process(filename):
  file = pd.read_csv("./csv/"+filename, engine='python')
  data = []
    
  for i in range(0, len(file)):
      name = str(file.loc[i]['이름'])
      medicine_name = str(file.loc[i]['약품명'])
      num = file.loc[i]['섭취량']
      flag = False
      for person in data:
            if person['name'] == name:
                  calculate(medicine_name, num, person['intake'])
                  flag = True
                  break
                
      if(flag == False):
            dt = {}
            dt['name'] = name
            dt['intake'] = [] 
            calculate(medicine_name, num, dt['intake'])
            data.append(dt)
            # person name, intake를 가지고 있는 dict 를 data 에 삽입
      
      
  return data
          
        
@app.route("/api/sendfile", methods=['POST'])
def file():
  if request.method == 'POST':
    csv_file = request.files['file']
		# # 파일 안정성 확인
		# global filename
		# filename = secure_filename(csv_file.filename)
		# /csv 폴더에 저장
    # csv_file.save(os.path.join('./csv', filename))
    filename = secure_filename(str(dt.datetime.now()).replace(" ", "").replace("-","_").replace(":", "_").replace(".", "_") + ".csv")

    if not os.path.exists('csv'):
            os.makedirs('csv')

    csv_file.save('./csv/{0}'.format(filename))
    
    data = csv_process(filename)
    os.remove("./csv/"+filename)
    print(data)
    
    return jsonify({
          "status": 200,
          "success": True,
          "data": data
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5000")