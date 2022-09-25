import requests, json

URL = "http://127.0.0.1:8000/stucreate/"

data = {
    'name' : 'Ashutosh',
    'email' : 'ashutosh@gmail.com',
    'password' : 'ashutosh'
}

json_data = json.dumps(data)
r = requests.post(url = URL, data = json_data)
data = r.json()
print(data)