import requests
import pytest
from faker import Faker
import os

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

fake = Faker()
#https://localhost:6969 (nginx ssl) 
API_URL = os.getenv("API_URL", "http://localhost:8080/api/v1")

@pytest.fixture
def session_logged_in():
    def user():
        login = fake.user_name()
        password = "Easypass12345!"

        regiters_json = {
            "login" : login,
            "email" : fake.email(),
            "password" : password,
            "confirmPassword" : password,
            "name" : "da igual",
            "surname" : "da igual",
            "birthday" : "1998-06-12",
            "termsAndConditions" : True,
            "PrivacyPolicy" : True
        }
        reqr = requests.post(f"{API_URL}/auth/register", json=regiters_json, verify=False)
    

        xd = reqr.json()
        assert "login" in xd["user"]
        data = reqr.json()
        xd = reqr.json()
        assert "login" in xd["user"]
        assert "email" in xd["user"]
        assert "name" in xd["user"]
        assert "surname" in xd["user"]
        assert "birthday" in xd["user"]

        session = requests.Session()
        session.verify = False
        reql = session.post(f"{API_URL}/auth/login", json = {"identifier" : login, "password" : password})
        data = reql.json()

        assert "login" in data["user"]
        assert "message" in data
        assert "requires2fa" in data
        assert "user" in data
        assert "id" in data["user"]

        return login, data["user"]["id"], session
    return user
