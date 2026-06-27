from fixture import API_URL
from fixture import session_logged_in
from fixture import requests

from test_friends import friend_send_request

def test_list_blocks(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    #user2, user2_id, user2_session = session_logged_in()
    #print(f"usuarios:\nuser1: {user1} id: {user1_id}, user2: {user2}, id: {user2_id}\n")

    print(f"usuarios:\nuser1: {user1} id: {user1_id}")
    print('\nimprime lista blocks sin ningun block')
    req = user1_session.get(f'{API_URL}/friends/blocks', verify=False)
    print(req.json())

def test_block(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    user2, user2_id, user2_session = session_logged_in()
    print("\ntest_block\n")
    print(f"usuarios:\nuser1: {user1} id: {user1_id}, user2: {user2}, id: {user2_id}\n")

    print('\nuser 1 block user 2')
    req = user1_session.post(f'{API_URL}/friends/blocks', json = {'blocked_id': user2_id}, verify=False)
    #print(req.json())
    assert req.status_code >= 200 and req.status_code < 300

    print('\nuser 1 block user inexistente')
    req = user1_session.post(f'{API_URL}/friends/blocks', json = {'blocked_id': 999999}, verify=False)
    print(req.json())
    assert req.status_code >= 400 and req.status_code < 500

    print('\nuser 1 block user invalid json')
    req = user1_session.post(f'{API_URL}/friends/blocks', json = {'block': 999999}, verify=False)
    print(req.json())
    assert req.status_code >= 400 and req.status_code < 500

    print('\nuser 1 imprime lista blocks')
    req = user1_session.get(f'{API_URL}/friends/blocks', verify=False)
    print(req.json())
    assert req.status_code >= 200 and req.status_code < 300

    user3, user3_id, user3_session = session_logged_in()
    print(f"usuarios:\nuser3: {user3} id: {user3_id}")
    print('\nuser 1 block user 3')
    req = user1_session.post(f'{API_URL}/friends/blocks', json = {'blocked_id': user3_id}, verify=False)
    #print(req.json())
    assert req.status_code >= 200 and req.status_code < 300

    print('\nuser 1 imprime lista blocks ')
    req = user1_session.get(f'{API_URL}/friends/blocks', verify=False)
    print(req.json())

    print('\nuser 1 block a el mismo')
    req = user1_session.post(f'{API_URL}/friends/blocks', json = {'blocked_id': user1_id}, verify=False)
    print(req.json())
    assert req.status_code >= 400 and req.status_code < 500

    print('\nuser 1 block user 3 otra vez')
    req = user1_session.post(f'{API_URL}/friends/blocks', json = {'blocked_id': user3_id}, verify=False)
    print(req.json())
    assert req.status_code >= 400 and req.status_code < 500

    print('\nuser 2 block user 1')
    req = user2_session.post(f'{API_URL}/friends/blocks', json = {'blocked_id': user1_id}, verify=False)
    #print(req.json())
    assert req.status_code >= 200 and req.status_code < 300

    print('\nuser 2 imprime lista blocks ')
    req = user2_session.get(f'{API_URL}/friends/blocks', verify=False)
    print(req.json())

def test_unblock(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    user2, user2_id, user2_session = session_logged_in()
    print(f"usuarios:\nuser1: {user1} id: {user1_id}, user2: {user2}, id: {user2_id}\n")

    print('\nuser 1 block user 2')
    req = user1_session.post(f'{API_URL}/friends/blocks', json = {'blocked_id': user2_id}, verify=False)
    #print(req.json())
    assert req.status_code >= 200 and req.status_code < 300

    print('\nuser 1 imprime lista blocks')
    req = user1_session.get(f'{API_URL}/friends/blocks', verify=False)
    print(req.json())

    print('\nuser 1 borra block de user 2')
    req = user1_session.delete(f'{API_URL}/friends/blocks/{user2_id}', verify=False)
    assert req.status_code >= 200 and req.status_code < 300

    print('\nuser 1 borra block de user inexistente')
    req = user1_session.delete(f'{API_URL}/friends/blocks/{9999}', verify=False)
    print(req.json())
    assert req.status_code >= 400 and req.status_code < 500

    print('\nuser 1 imprime lista blocks despues de haber desbloqueado a user 2')
    req = user1_session.get(f'{API_URL}/friends/blocks', verify=False)
    print(req.json())
