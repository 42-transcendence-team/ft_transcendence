from fixture import API_URL
from fixture import new_user


def test_create_room_and_list():
    _, _, s1 = new_user()
    _, u2, s2 = new_user()

    resp = s1.post(
        f"{API_URL}/websocket/rooms",
        json={"name": "shared", "private": False, "users": [u2]},
    )
    assert resp.status_code == 200
    room_id = resp.json()["id"]
    assert room_id > 0

    rooms = s1.get(f"{API_URL}/websocket/rooms")
    assert rooms.status_code == 200
    assert "shared" in rooms.text

    # u2 is a member too
    rooms2 = s2.get(f"{API_URL}/websocket/rooms")
    assert rooms2.status_code == 200
    assert "shared" in rooms2.text


def test_websocket_me():
    _, uid, session = new_user()
    resp = session.get(f"{API_URL}/websocket/me")
    assert resp.status_code == 200
    assert resp.json()["id"] == uid


def test_create_room_requires_users():
    _, _, session = new_user()
    resp = session.post(
        f"{API_URL}/websocket/rooms",
        json={"name": "empty", "private": False, "users": []},
    )
    assert resp.status_code == 400


def test_chat_unread():
    _, _, s1 = new_user()
    _, u2, _ = new_user()

    resp = s1.post(
        f"{API_URL}/websocket/rooms",
        json={"name": "chat", "private": False, "users": [u2]},
    )
    room_id = resp.json()["id"]

    resp = s1.put(f"{API_URL}/chat/enter", json={"room_id": room_id})
    assert resp.status_code == 200

    resp = s1.get(f"{API_URL}/chat/unread/{room_id}")
    assert resp.status_code == 200
