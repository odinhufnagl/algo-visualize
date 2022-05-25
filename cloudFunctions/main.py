import json
import cv2 as cv
import numpy as np
import base64
from flask_cors import cross_origin

def readb64(base64Data):
    encodedData = base64Data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encodedData), np.uint8)
    img = cv.imdecode(nparr, cv.IMREAD_COLOR)
    return img


@cross_origin(allowed_methods=['POST'])
def processImage(request):
    #retrieve all json from request
    base64Img = request.get_json()["image"]
    numRows = request.get_json()["numRows"]
    numCols = request.get_json()["numCols"]
    #to extract image we need to use function readb64 to get the correct format to handle
    img = cv.cvtColor(readb64(base64Img), cv.COLOR_BGR2GRAY)
    width = int(numCols)
    height = int(numRows)
    dim = (width, height)
    #this is the most important row, as it resizes the image to the demanded dimensions
    resized = cv.resize(img, dim, interpolation = cv.INTER_AREA)
    return json.dumps(resized.tolist())
    