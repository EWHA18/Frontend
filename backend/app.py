from flask import Flask, request, jsonify, current_app, g, flash, json, send_file
from flask_cors import CORS
from sqlalchemy import create_engine, text
from werkzeug.exceptions import HTTPException, NotFound
import datetime as dt
import os
from werkzeug.utils import secure_filename
import pandas as pd
import csv

app = Flask(__name__)
database = create_engine(
    "mysql+mysqlconnector://'root':1234@localhost:3306/healthcare?charset=utf8",
    encoding='cp949',
    max_overflow=0)
app.database = database

limit = {"납": 0.000264, "카드뮴": 0.000833, "총 비소": 0.001285, "총 수은": 0.000528}

cors = CORS(app,
            resources={
                r"/v1/*": {
                    "origin": "*"
                },
                r"/api/*": {
                    "origin": "*"
                }
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
    product = database.execute(
        text("""
   SELECT
      ingredient,
      heavy_intake
    FROM Medicine
      WHERE product = :medicine_name
  """), {
            'medicine_name': medicine_name
        }).fetchone()
    if product is None:
        return medicine_name

    ingredients = product[0].split(":")
    heavy_intakes = product[1].split(":")
    ingredients.pop()

    for ingredient in ingredients:
        field = ingredient.split("_")
        word_id = field[0]
        classification = field[1]
        word_name = field[2]
        unit = field[3]
        volume = float(field[4])
        isHeavyMetal = False
        if (classification == "중금속"):
            isHeavyMetal = True
        prev = False

        for i in range(0, len(intake)):
            if intake[i]['word_id'] == word_id:
                intake[i]['volume'] += volume * float(num)
                for heavy_intake in heavy_intakes:
                    if heavy_intake != "":
                        heavy_field = heavy_intake.split("_")
                        heavy_name = heavy_field[2]
                        heavy_volume = float(heavy_field[4])
                        if heavy_name == word_name:
                            intake[i]['heavy_volume'] += heavy_volume * float(num)
                    
                prev = True

        if (prev == False):
            heavy_volume = float(0)
            for heavy_intake in heavy_intakes:
                if heavy_intake != "":
                    heavy_field = heavy_intake.split("_")
                    heavy_name = heavy_field[2]
                    if heavy_name == word_name:
                            heavy_volume = float(heavy_field[4]) * float(num)
                        
            data = {
                "word_id": word_id,
                "word_name": word_name,
                "volume": volume * float(num),
                "unit": unit,
                "isHeavyMetal": isHeavyMetal,
                "percentage": 0,
                "heavy_volume": heavy_volume
            }
            intake.append(data)

    return None


@app.route("/api/sendintake", methods=['POST'])
def func():
    req = request.json
    print(req)
    intake = []
    weight = float(0)
    for medicine in req['data']:
        calculate(medicine['name'], medicine['intake'], intake)
        weight = medicine['weight']
    for ingredient in intake:
        if ingredient['word_name'] in limit:
            print(ingredient['word_name'])
            print(ingredient['heavy_volume'])
            ingredient['percentage'] = ingredient['heavy_volume'] / (
                limit[ingredient['word_name']] * float(weight)) * 100
            #0.264/1000 *A
            #10/(0.000264*A) *100%
            #volume/(limit['성분']*몸무게)*100

    data = {}
    data["intake"] = intake
    print(data)
    return jsonify({"status": 200, "success": True, "data": data})


def add_debug(NanArray):
    debugFile = open(".\\debugFile.csv",
                     mode="w",
                     newline='',
                     encoding='UTF-8')
    writer = csv.writer(debugFile)
    '''
      {
            "aaa": array,
            "bbb": array,
            "ccc": array
      }
      '''
    for key, values in NanArray.items():
        rowInfo = []
        rowInfo.append(key)
        for value in values:
            rowInfo.append(value)
        writer.writerow(rowInfo)
    debugFile.flush()
    debugFile.close()


# 파일 읽고 처리하기
def csv_process(filename):
    try:
        file = pd.read_csv("./csv/" + filename,
                           engine='python',
                           encoding='cp949')
    except:
        file = pd.read_csv("./csv/" + filename,
                           engine='python',
                           encoding='utf-8')
    data = []
    weights = {}
    print(file)
    NanArray = {}
    for i in range(0, len(file)):
      name = str(file.loc[i]['개인ID'])
      weight = file.loc[i]['추정체중(Kg)']
      medicine_name = str(file.loc[i]['데이터베이스 제품명'])
      num = file.loc[i]['1일 건기식 섭취량 (제품의 1일 권장섭취량 대비)']
      flag = False
      for person in data:
            if person['name'] == name:
                product_name = calculate(medicine_name, num, person['intake'])
                if product_name is not None:
                    if name in NanArray:
                        NanArray[name].append(product_name)
                    else:
                        arr = []
                        arr.append(product_name)
                        NanArray[name] = arr
                flag = True
                break

      if (flag == False):
            dt = {}
            dt['name'] = name
            dt['intake'] = []
            product_name = calculate(medicine_name, num, dt['intake'])
            if product_name is not None:
                  if name in NanArray:
                        NanArray[name].append(product_name)
                  else:
                        arr = []
                        arr.append(product_name)
                        NanArray[name] = arr
            weights[name] = weight
            data.append(dt)
                  # person name, intake를 가지고 있는 dict 를 data 에 삽입

    for person in data:
        for ingredient in person['intake']:
            if ingredient['word_name'] in limit:
                ingredient['percentage'] = ingredient['heavy_volume'] / (limit[ingredient['word_name']] * weights[person['name']]) * 100
    
    add_debug(NanArray)
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
        filename = secure_filename(
            str(dt.datetime.now()).replace(" ", "_").replace("-", "_").replace(
                ":", "_").replace(".", "_") + ".csv")

        if not os.path.exists('csv'):
            os.makedirs('csv')

        csv_file.save('./csv/{0}'.format(filename))

        data = csv_process(filename)
        os.remove("./csv/" + filename)

        return jsonify({"status": 200, "success": True, "data": data})


@app.route("/api/exportFile", methods=['POST'])
def exportFile():
    ingredients = []
    ingredients.append("이름")
    ingredientsName = []

    ingredientInfo = database.execute(
        text("""
        SELECT
          name
        FROM Word
      """), ).fetchall()

    for ingredient in ingredientInfo:
        ingredients.append(ingredient[0])
        ingredientsName.append(ingredient[0].split("_")[2])

    ingredients.append("납")
    ingredients.append("총 수은")
    ingredients.append("카드뮴")
    ingredients.append("총 비소")

    req = request.json
    filename = secure_filename(
        str(dt.datetime.now()).replace(" ", "").replace("-", "_").replace(
            ":", "_").replace(".", "_") + ".csv")

    exportFile = open(f".\\{filename}", mode="w", newline='', encoding='UTF-8')
    writer = csv.writer(exportFile)
    writer.writerow(ingredients)

    for userInfo in req['data']:
        rowInfo = []
        heavyMetalPercentage = []
        rowInfo.append(userInfo['name'])
        for ingredientName in ingredientsName:
            isAppended = False
            for ingredients in userInfo['intake']:
                if ingredientName == ingredients['word_name']:
                    rowInfo.append(ingredients['volume'])
                    isAppended = True
                    if ingredients['word_name'] == "납":
                        heavyMetalPercentage.append(ingredients['percentage'])
                    elif ingredients['word_name'] == "총 수은":
                        heavyMetalPercentage.append(ingredients['percentage'])
                    elif ingredients['word_name'] == "카드뮴":
                        heavyMetalPercentage.append(ingredients['percentage'])
                    elif ingredients['word_name'] == "총 비소":
                        heavyMetalPercentage.append(ingredients['percentage'])
                    break

            if isAppended == False:
                rowInfo.append(0)
                if ingredientName == "총 비소":
                    heavyMetalPercentage.append(0)
                elif ingredientName == "총 수은":
                    heavyMetalPercentage.append(0)
                elif ingredientName == "납":
                    heavyMetalPercentage.append(0)
                elif ingredientName == "카드뮴":
                    heavyMetalPercentage.append(0)

        for percentage in heavyMetalPercentage:
            rowInfo.append(percentage)

        writer.writerow(rowInfo)

    exportFile.flush()
    exportFile.close()

    return send_file(filename,
                     mimetype='text/csv',
                     as_attachment=True,
                     attachment_filename="medicineIntake.csv")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5000")