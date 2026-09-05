import os

import pytest
import requests
import urllib3
from faker import Faker

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

fake = Faker()

# https://localhost:6969 (nginx ssl) o http://localhost:8080/api/v1 (directo)
API_URL = os.getenv("API_URL", "http://localhost:8080/api/v1")

PASSWORD = "Easypass12345!"


def register_payload(login, password=PASSWORD):
    return {
        "login": login,
        "email": f"{login}@test.com",
        "password": password,
        "confirmPassword": password,
        "name": "Name",
        "surname": "Surname",
        "birthday": "1998-06-12",
        "termsAndConditions": True,
        "privacyPolicy": True,
    }


def register_user(login=None):
    """Registra un usuario y devuelve (login, json de respuesta)."""
    login = login or fake.user_name()
    resp = requests.post(
        f"{API_URL}/auth/register",
        json=register_payload(login),
        verify=False,
    )
    assert resp.status_code == 201, resp.text
    return login, resp.json()


def login_user(login, password=PASSWORD):
    """Loggea y devuelve una requests.Session con la cookie de sesión."""
    session = requests.Session()
    session.verify = False
    resp = session.post(
        f"{API_URL}/auth/login",
        json={"identifier": login, "password": password},
    )
    assert resp.status_code == 200, resp.text
    return session


def user_id(session):
    """Devuelve el id del usuario autenticado."""
    resp = session.get(f"{API_URL}/auth/me")
    assert resp.status_code == 200, resp.text
    return resp.json()["user"]["id"]


def new_user():
    """Crea y autentica un usuario nuevo. Devuelve (login, user_id, session)."""
    login = fake.user_name()
    register_user(login)
    session = login_user(login)
    return login, user_id(session), session


@pytest.fixture
def session_logged_in():
    def make():
        return new_user()

    return make
