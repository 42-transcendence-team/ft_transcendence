from fixture import API_URL
from fixture import new_user


def test_block_and_unblock():
    _, u1, s1 = new_user()
    _, u2, s2 = new_user()

    # block
    resp = s1.post(f"{API_URL}/friends/blocks", json={"blocked_id": u2})
    assert resp.status_code == 200

    # duplicate block -> conflict
    resp = s1.post(f"{API_URL}/friends/blocks", json={"blocked_id": u2})
    assert resp.status_code == 409

    # self block -> bad request
    resp = s1.post(f"{API_URL}/friends/blocks", json={"blocked_id": u1})
    assert resp.status_code == 400

    # non-existent -> not found
    resp = s1.post(f"{API_URL}/friends/blocks", json={"blocked_id": 999999})
    assert resp.status_code == 404

    # list blocks
    resp = s1.get(f"{API_URL}/friends/blocks")
    assert resp.status_code == 200
    assert any(b["user_id"] == u2 for b in resp.json()["data"])

    # unblock
    resp = s1.delete(f"{API_URL}/friends/blocks/{u2}")
    assert resp.status_code == 204

    # unblock again -> not found
    resp = s1.delete(f"{API_URL}/friends/blocks/{u2}")
    assert resp.status_code == 404


def test_block_removes_friendship_and_pending_requests():
    _, u1, s1 = new_user()
    _, u2, s2 = new_user()

    # become friends
    resp = s1.post(f"{API_URL}/friends/requests", json={"receiver_id": u2})
    req_id = resp.json()["data"]["id"]
    s2.patch(f"{API_URL}/friends/requests/{req_id}/accept")

    # blocking removes the friendship
    s1.post(f"{API_URL}/friends/blocks", json={"blocked_id": u2})
    friends = s1.get(f"{API_URL}/friends/").json()["data"] or []
    assert all(f["user_id"] != u2 for f in friends)

    # blocked users cannot send a request again
    resp = s2.post(f"{API_URL}/friends/requests", json={"receiver_id": u1})
    assert resp.status_code == 403
