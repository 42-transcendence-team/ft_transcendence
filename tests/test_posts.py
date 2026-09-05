from fixture import API_URL
from fixture import new_user


def test_create_post_and_feed():
    _, uid, session = new_user()
    resp = session.post(f"{API_URL}/posts", json={"content": "hello pytest"})
    assert resp.status_code == 201
    post_id = resp.json()["data"]["id"]
    assert post_id > 0

    feed = session.get(f"{API_URL}/posts/feed")
    assert feed.status_code == 200
    assert "hello pytest" in feed.text

    user_posts = session.get(f"{API_URL}/posts/user/{uid}")
    assert user_posts.status_code == 200
    assert "hello pytest" in user_posts.text

    by_id = session.get(f"{API_URL}/posts/{post_id}")
    assert by_id.status_code == 200


def test_comment_and_like():
    _, _, session = new_user()
    resp = session.post(f"{API_URL}/posts", json={"content": "post with comments"})
    assert resp.status_code == 201
    post_id = resp.json()["data"]["id"]

    resp = session.post(
        f"{API_URL}/posts/{post_id}/comments",
        json={"content": "nice post"},
    )
    assert resp.status_code == 201

    comments = session.get(f"{API_URL}/posts/{post_id}/comments")
    assert comments.status_code == 200
    assert "nice post" in comments.text

    like = session.post(f"{API_URL}/posts/{post_id}/likes")
    assert like.status_code == 200

    unlike = session.delete(f"{API_URL}/posts/{post_id}/likes")
    assert unlike.status_code == 200


def test_create_post_requires_auth():
    import requests

    resp = requests.post(f"{API_URL}/posts", json={"content": "no auth"}, verify=False)
    assert resp.status_code == 401
