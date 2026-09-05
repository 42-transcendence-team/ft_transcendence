from fixture import API_URL
from fixture import new_user
from fixture import requests


def test_send_accept_and_delete_friend():
    _, u1, s1 = new_user()
    _, u2, s2 = new_user()

    # u1 -> u2 request
    resp = s1.post(f"{API_URL}/friends/requests", json={"receiver_id": u2})
    assert resp.status_code == 201
    req_id = resp.json()["data"]["id"]
    assert req_id > 0

    # duplicate request -> conflict
    resp = s1.post(f"{API_URL}/friends/requests", json={"receiver_id": u2})
    assert resp.status_code == 409

    # u2 sees the incoming request
    resp = s2.get(f"{API_URL}/friends/requests/incoming")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) == 1

    # u1 sees the outgoing request
    resp = s1.get(f"{API_URL}/friends/requests/outgoing")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) == 1

    # u2 accepts
    resp = s2.patch(f"{API_URL}/friends/requests/{req_id}/accept")
    assert resp.status_code == 200

    # u1 lists friends
    resp = s1.get(f"{API_URL}/friends/")
    assert resp.status_code == 200
    friends = resp.json()["data"]
    assert any(f["user_id"] == u2 for f in friends)

    # u1 deletes friend
    resp = s1.delete(f"{API_URL}/friends/{u2}")
    assert resp.status_code == 204

    resp = s1.get(f"{API_URL}/friends/")
    assert resp.status_code == 200
    assert all(f["user_id"] != u2 for f in (resp.json()["data"] or []))


def test_reject_friend_request():
    _, u1, s1 = new_user()
    _, u2, s2 = new_user()

    resp = s1.post(f"{API_URL}/friends/requests", json={"receiver_id": u2})
    assert resp.status_code == 201
    req_id = resp.json()["data"]["id"]

    resp = s2.patch(f"{API_URL}/friends/requests/{req_id}/reject")
    assert resp.status_code == 200

    # accepting an already rejected request -> conflict
    resp = s2.patch(f"{API_URL}/friends/requests/{req_id}/accept")
    assert resp.status_code == 409


def test_send_request_errors():
    _, u1, s1 = new_user()
    _, u2, _ = new_user()

    # self request -> bad request
    resp = s1.post(f"{API_URL}/friends/requests", json={"receiver_id": u1})
    assert resp.status_code == 400

    # non-existent user -> not found
    resp = s1.post(f"{API_URL}/friends/requests", json={"receiver_id": 999999})
    assert resp.status_code == 404

    # invalid body -> 422/400
    resp = s1.post(f"{API_URL}/friends/requests", json={"xd": u2})
    assert resp.status_code >= 400

    # unauthenticated -> 401
    resp = requests.post(
        f"{API_URL}/friends/requests",
        json={"receiver_id": u2},
        verify=False,
    )
    assert resp.status_code == 401


def test_accept_request_errors():
    _, u1, s1 = new_user()
    _, u2, s2 = new_user()

    resp = s1.post(f"{API_URL}/friends/requests", json={"receiver_id": u2})
    assert resp.status_code == 201
    req_id = resp.json()["data"]["id"]

    # sender cannot accept its own request
    resp = s1.patch(f"{API_URL}/friends/requests/{req_id}/accept")
    assert resp.status_code == 403

    # someone else cannot accept a request not addressed to them
    _, _, s3 = new_user()
    resp = s3.patch(f"{API_URL}/friends/requests/{req_id}/accept")
    assert resp.status_code == 403

    # non-existent request
    resp = s2.patch(f"{API_URL}/friends/requests/999999/accept")
    assert resp.status_code == 404
