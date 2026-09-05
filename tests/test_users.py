from fixture import API_URL
from fixture import PASSWORD
from fixture import new_user


def test_get_me():
    login, uid, session = new_user()
    resp = session.get(f"{API_URL}/users/me")
    assert resp.status_code == 200
    body = resp.json()["user"]
    assert body["id"] == uid
    assert body["login"] == login


def test_get_profile():
    login, _, session = new_user()
    resp = session.get(f"{API_URL}/users/profile/{login}")
    assert resp.status_code == 200
    assert resp.json()["data"]["login"] == login


def test_get_settings():
    _, _, session = new_user()
    resp = session.get(f"{API_URL}/users/settings")
    assert resp.status_code == 200
    assert "login" in resp.json()


def test_advanced_search():
    login, _, session = new_user()
    resp = session.get(f"{API_URL}/users/search", params={"q": login})
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert any(i["login"] == login for i in items)


def test_update_personal_data():
    _, _, session = new_user()
    resp = session.post(
        f"{API_URL}/users/data",
        json={"name": "NewName", "surname": "NewSurname"},
    )
    assert resp.status_code == 200


def test_update_password():
    _, _, session = new_user()
    new_pass = "Newpass12345!"
    resp = session.post(
        f"{API_URL}/users/password",
        json={
            "password": new_pass,
            "verify_password": new_pass,
            "previous_password": PASSWORD,
        },
    )
    assert resp.status_code == 200


def test_update_email():
    login, _, session = new_user()
    new_email = f"{login}.new@test.com"
    resp = session.post(
        f"{API_URL}/users/email",
        json={"email": new_email, "verify_email": new_email},
    )
    assert resp.status_code == 200
