from fixture import API_URL
from fixture import new_user


def test_notifications_empty():
    _, _, session = new_user()
    resp = session.get(f"{API_URL}/notifications")
    assert resp.status_code == 200
    assert resp.json() == []


def test_post_notification_for_friend_and_mark_read():
    _, u1, s1 = new_user()
    _, u2, s2 = new_user()

    # become friends
    resp = s1.post(f"{API_URL}/friends/requests", json={"receiver_id": u2})
    req_id = resp.json()["data"]["id"]
    s2.patch(f"{API_URL}/friends/requests/{req_id}/accept")

    # u1 creates a post -> u2 gets a POST notification
    s1.post(f"{API_URL}/posts", json={"content": "notify friend"})

    feed = s2.get(f"{API_URL}/notifications")
    assert feed.status_code == 200
    post_notifs = [n for n in feed.json() if n.get("type") == "POST"]
    assert len(post_notifs) == 1
    notif_id = post_notifs[0]["id"]
    assert notif_id is not None

    resp = s2.put(f"{API_URL}/notifications/{notif_id}/read")
    assert resp.status_code == 204

    feed = s2.get(f"{API_URL}/notifications")
    assert feed.status_code == 200
    assert all(n.get("type") != "POST" for n in feed.json())
