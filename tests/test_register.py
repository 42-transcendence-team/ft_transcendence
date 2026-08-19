from fixture import API_URL
from fixture import session_logged_in
from fixture import requests


def test_register(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    user2, user2_id, user2_session = session_logged_in()
    print(f"usuarios:\nuser1: {user1} id: {user1_id}, user1: {user1}, id: {user1_id}\n")
    print(f"usuarios:\nuser1: {user2} id: {user2_id}, user2: {user2}, id: {user2_id}\n")
