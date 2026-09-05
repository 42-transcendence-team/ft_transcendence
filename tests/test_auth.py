from fixture import API_URL
from fixture import PASSWORD
from fixture import login_user
from fixture import new_user
from fixture import register_payload
from fixture import register_user
from fixture import requests
from fixture import user_id


def test_register_and_me():
    login = "pytest_auth_user"
    register_user(login)
    session = login_user(login)

    me = session.get(f"{API_URL}/auth/me")
    assert me.status_code == 200
    body = me.json()
    assert body["authenticated"] is True
    assert body["user"]["login"] == login
    assert isinstance(user_id(session), int)


def test_register_duplicate_conflict():
    login = "pytest_dupe_user"
    register_user(login)
    resp = requests.post(
        f"{API_URL}/auth/register",
        json=register_payload(login),
        verify=False,
    )
    assert resp.status_code == 409


def test_register_invalid_payload():
    login = "pytest_invalid_user"
    payload = register_payload(login)
    payload["privacyPolicy"] = False
    resp = requests.post(
        f"{API_URL}/auth/register",
        json=payload,
        verify=False,
    )
    assert resp.status_code == 422


def test_login_wrong_password():
    login = "pytest_wrongpass"
    register_user(login)
    resp = requests.post(
        f"{API_URL}/auth/login",
        json={"identifier": login, "password": "Wrongpass12345!"},
        verify=False,
    )
    assert resp.status_code == 401


def test_login_unknown_user():
    resp = requests.post(
        f"{API_URL}/auth/login",
        json={"identifier": "no_such_user", "password": PASSWORD},
        verify=False,
    )
    assert resp.status_code == 401


def test_logout_invalidates_session():
    _, _, session = new_user()
    resp = session.post(f"{API_URL}/auth/logout")
    assert resp.status_code == 200

    # The session is no longer valid even though the cookie is still present.
    me = session.get(f"{API_URL}/auth/me")
    assert me.status_code == 401


def test_protected_route_requires_auth():
    resp = requests.get(f"{API_URL}/test", verify=False)
    assert resp.status_code == 401

    _, _, session = new_user()
    resp = session.get(f"{API_URL}/test")
    assert resp.status_code == 200
