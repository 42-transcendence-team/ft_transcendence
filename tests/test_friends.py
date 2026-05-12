import requests
import pytest
from faker import Faker

API_URL = "http://localhost:8080/api/v1"

fake = Faker()

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
        reqr = requests.post(f"{API_URL}/auth/register", json = regiters_json)

        xd = reqr.json()
        assert "login" in xd["user"]
        assert "email" in xd["user"]
        assert "name" in xd["user"]
        assert "surname" in xd["user"]
        assert "birthday" in xd["user"]

        session = requests.Session()
        reql = session.post(f"{API_URL}/auth/login", json = {"identifier" : login, "password" : password})

        data = reql.json()

        assert "login" in data["user"]
        assert "message" in data
        assert "requires2fa" in data
        assert "user" in data
        assert "id" in data["user"]

        return login, data["user"]["id"], session
    return user

def test_friend_request_success(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    user2, user2_id, user2_session = session_logged_in()
    
    print()
    print(user1, user1_id)
    print(user2, user2_id)
    #user 1 envia solicitud a user2
    friend_req = user1_session.post(f"{API_URL}/friends/requests", json = {"receiver_id" : user2_id})
    assert friend_req.status_code >= 200 and friend_req.status_code < 300
    #no exite
    req2 = user1_session.post(f"{API_URL}/friends/requests", json = {"receiver_id" : 99999})
    assert req2.status_code >= 400 and req2.status_code < 500
    #invalid json
    req3 = user1_session.post(f"{API_URL}/friends/requests", json = {"receriver" : user2_id})
    assert req3.status_code >= 400 and req3.status_code < 500
    accept_req = user2_session.patch(f"{API_URL}/friends/requests/{friend_req.json()["data"]["id"]}/accept")
    assert accept_req.status_code >= 200 and accept_req.status_code < 300
    
    block_req = user2_session.post(f"{API_URL}/friends/blocks", json = {"blocked_id": user1_id})
    assert block_req.status_code >= 200 and block_req.status_code < 300

    list_blockeduser_req = user2_session.get(f"{API_URL}/friends/blocks")
    assert list_blockeduser_req.status_code >= 200 and list_blockeduser_req.status_code < 300

    print(list_blockeduser_req.json())
    assert  list_blockeduser_req.json()["data"] != None

    unblock_user = user2_session.delete(f"{API_URL}/friends/blocks/{user1_id}")
    assert unblock_user.status_code >= 200 and unblock_user.status_code < 300

    list_blockeduser_req2 = user2_session.get(f"{API_URL}/friends/blocks")
    assert list_blockeduser_req2.status_code >= 200 and list_blockeduser_req2.status_code < 300

    print(list_blockeduser_req2.json())
    assert  list_blockeduser_req2.json()["data"] == None

    list_friends = user2_session.get(f"{API_URL}/friends/")
    assert list_friends.status_code >= 200 and list_friends.status_code < 300

    print(list_friends.json())

    assert list_friends.json()["data"] == None