from fixture import API_URL
from fixture import session_logged_in
from fixture import requests

#get /friends 
#delete /friends/id

#/friends/requests
#requests.POST("/", friendHandler.SendFriendRequest)
#Lista de peticiones
#requests.GET("/incoming", friendHandler.ListIncomingRequests)
#requests.GET("/outgoing", friendHandler.ListOutgoingRequests)
# Aceptar peticion de amistad
# requests.PATCH("/:requestId/accept", friendHandler.AcceptFriendRequest)
# Rechazar peticion de amistad
# requests.PATCH("/:requestId/reject", friendHandler.RejectFriendRequest)
def friend_send_request(session,json):
    req = session.post(f"{API_URL}/friends/requests", json = json, verify=False)
    print(f"json enviado: {json}")
    data = req.json()
    status_code = req.status_code
    print(f"json recibido: {data}\n")
    return data, status_code
    

def test_friend_send_request(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    user2, user2_id, user2_session = session_logged_in()
    print(f"usuarios:\nuser1: {user1} id: {user1_id}, user2: {user2}, id: {user2_id}\n")

    print('suer 1 envia peticion a user 2')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : user2_id})
    assert "message" in data
    assert "data" in data
    assert "id" in data['data']
    assert "senderID" in data['data']
    assert "receiverID" in data['data']
    assert "status" in data['data']
    assert status_code >= 200 and status_code < 300 #de momento asi por que no se muy bien los status code
    
    print('user 1 envia solicitud a usuario 2 otra vez')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : user2_id})
    assert "error" in data
    assert status_code >= 400 and status_code < 500
    
    #user 2 envia solicitud a user 1, user 1 ya habia enviado req a user 2
    #que deberia pasar? se acepta automaticamente?
    
    friend_req2 = user2_session.post(f"{API_URL}/friends/requests", json = {"receiver_id" : user1_id}, verify=False)
    data = friend_req2.json()
    #assert "message" in data
    #assert "data" in data
    #assert "id" in data['data']
    #assert "senderID" in data['data']
    #assert "receiverID" in data['data']
    #assert "status" in data['data']
    assert friend_req2.status_code >= 400 and friend_req2.status_code < 500 #se espera este resultado
    #TODO: hacer in list friends request para ver que pasa
    

    print('user 1 envia solicitud a usuario que no existe')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : 9999999})
    assert "error" in data
    assert status_code >= 400 and status_code < 500

    print('user 1 envia solicitud a usuario que no existe')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : -1})
    assert "error" in data
    assert status_code >= 400 and status_code < 500

    print('user 1 enviar solicitud con json invalido')
    data, status_code = friend_send_request(user1_session, json = {"xd" : user2_id})
    assert "error" in data
    assert status_code >= 400 and status_code < 500
    
    print('user 1 enviar solicitud con json invalido')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : str(user2_id)})
    assert "error" in data
    assert status_code >= 400 and status_code < 500
    
    print('user 1 enviar solicitud con json invalido')
    data, status_code = friend_send_request(user1_session, json = {})
    assert "error" in data
    assert status_code >= 400 and status_code < 500

    print('user 1 envia solicitud el mismo')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : user1_id})
    assert "error" in data
    assert status_code >= 400 and status_code < 500

    print('envio solicitud sin autenticar')
    data, status_code = friend_send_request(requests, json = {"receiver_id" : user2_id})
    assert "error" in data
    assert status_code >= 400 and status_code < 500

def test_accept_reject_friend_request(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    user2, user2_id, user2_session = session_logged_in()

    print(f"usuarios:\nuser1: {user1} id: {user1_id}, user2: {user2}, id: {user2_id}\n")

    print('user 1 envia peticion a user 2')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : user2_id})
    assert "id" in data['data']
    assert "senderID" in data['data']
    assert "receiverID" in data['data']
    assert status_code >= 200 and status_code < 300

    print('user 2 acepta peticion de user 1')
    req = user2_session.patch(f"{API_URL}/friends/requests/{data['data']['id']}/accept", verify=False)
    print(req.json(), '\n')
    assert req.status_code >= 200 and req.status_code < 300

    print('user 2 envia peticion a user 1 (eran amigos ya)')
    data, status_code = friend_send_request(user2_session, json = {"receiver_id" : user1_id})
    assert status_code >= 400 and status_code < 500

    user3, user3_id, user3_session = session_logged_in()
    print('user 3 envia peticion a user 1')
    data, status_code = friend_send_request(user3_session, json = {"receiver_id" : user1_id})
    assert status_code >= 200 and status_code < 300
    
    print('user 3 intenta aceptar la propia peticion que envio a user 1')
    req = user3_session.patch(f"{API_URL}/friends/requests/{data['data']['id']}/accept", verify=False)
    print(req.json(), '\n')
    assert req.status_code >= 400 and req.status_code < 500

    print('user 2 intenta aceptar peticion de user 1 que user 3 envio')
    req = user2_session.patch(f"{API_URL}/friends/requests/{data['data']['id']}/accept", verify=False)
    print(req.json(), '\n')
    assert req.status_code >= 400 and req.status_code < 500

    print('user 1 envia peticion a user 2 otra vez')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : user2_id})
    assert status_code >= 400 and status_code < 500

    print('user 1 acepta peticion que no existe')
    req = user1_session.patch(f"{API_URL}/friends/requests/{999999}/accept", verify=False)
    print(req.json(), '\n')
    assert req.status_code >= 400 and req.status_code < 500


def test_list_friends(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    user2, user2_id, user2_session = session_logged_in()
    print(f"usuarios:\nuser1: {user1} id: {user1_id}, user2: {user2}, id: {user2_id}\n")

    print('lista de usuarios de user 1')
    req = user1_session.get(f"{API_URL}/friends/", verify=False)
    print(req.json())
    assert req.json()['data'] == [] or req.json()['data'] == None
    assert req.status_code >= 200 and req.status_code < 300

    print('user 1 envia peticion a user 2')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : user2_id})
    assert "id" in data['data']
    assert "senderID" in data['data']
    assert "receiverID" in data['data']
    assert status_code >= 200 and status_code < 300

    print('user 2 acepta peticion de user 1')
    req = user2_session.patch(f"{API_URL}/friends/requests/{data['data']['id']}/accept", verify=False)
    print(req.json(), '\n')
    assert req.status_code >= 200 and req.status_code < 300

    print('lista de usuarios de user 1')
    req = user1_session.get(f"{API_URL}/friends/", verify=False)
    print(req.json())
    assert req.status_code >= 200 and req.status_code < 300

    print("\nlista de amigos pero sin auth")
    req = requests.get(f"{API_URL}/friends/", verify=False)
    print(req.json())
    assert req.status_code >= 400 and req.status_code < 500


def test_delete_friends(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    user2, user2_id, user2_session = session_logged_in()

    print(f"usuarios:\nuser1: {user1} id: {user1_id}, user2: {user2}, id: {user2_id}\n")

    print('borro de amigos un usuario que no existe')
    req = user1_session.delete(f"{API_URL}/friends/{user2_id}", verify=False)

    print('user 1 envia peticion a user 2')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : user2_id})
    assert "id" in data['data']
    assert "senderID" in data['data']
    assert "receiverID" in data['data']
    assert status_code >= 200 and status_code < 300

    print('user 2 acepta peticion de user 1')
    req = user2_session.patch(f"{API_URL}/friends/requests/{data['data']['id']}/accept", verify=False)
    print(req.json(), '\n')
    assert req.status_code >= 200 and req.status_code < 300

    print('lista de usuarios de user 1')
    req = user1_session.get(f"{API_URL}/friends/", verify=False)
    print(req.json())
    assert req.json()['data'] != [] or req.json()['data'] != None
    assert req.status_code >= 200 and req.status_code < 300

    print('lista de usuarios de user 2')
    req = user2_session.get(f"{API_URL}/friends/", verify=False)
    print(req.json())
    assert req.json()['data'] != [] or req.json()['data'] != None
    assert req.status_code >= 200 and req.status_code < 300

    print('user 1 borra de amigos a user 2')
    req = user1_session.delete(f"{API_URL}/friends/{user2_id}", verify=False)
    assert req.status_code >= 200 and req.status_code < 300

    print('lista de usuarios de user 1')
    req = user1_session.get(f"{API_URL}/friends/", verify=False)
    print(req.json())
    assert req.json()['data'] == [] or req.json()['data'] == None
    assert req.status_code >= 200 and req.status_code < 300

    print('lista de usuarios de user 2')
    req = user2_session.get(f"{API_URL}/friends/", verify=False)
    print(req.json())
    assert req.json()['data'] == [] or req.json()['data'] == None
    assert req.status_code >= 200 and req.status_code < 300

    print('user 1 envia peticion a user 2')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : user2_id})
    assert "id" in data['data']
    assert "senderID" in data['data']
    assert "receiverID" in data['data']
    assert status_code >= 200 and status_code < 300

    print('user 2 acepta peticion de user 1')
    req = user2_session.patch(f"{API_URL}/friends/requests/{data['data']['id']}/accept", verify=False)
    print(req.json(), '\n')
    assert req.status_code >= 200 and req.status_code < 300

    print('user 1 borra de amigos a user 2')
    req = user1_session.delete(f"{API_URL}/friends/{user2_id}", verify=False)
    assert req.status_code >= 200 and req.status_code < 300

    print('\nuser 2 borra de amigos a user 2')
    req = user2_session.delete(f"{API_URL}/friends/{user1_id}", verify=False)
    assert req.status_code >= 400 and req.status_code < 500

    print('\nuser 2 borra de amigos a usuario que no existe')
    req = user2_session.delete(f"{API_URL}/friends/{9999999}", verify=False)
    assert req.status_code >= 400 and req.status_code < 500


def test_list_in_out_frinds_request(session_logged_in):
    user1, user1_id, user1_session = session_logged_in()
    user2, user2_id, user2_session = session_logged_in()

    print(f"usuarios:\nuser1: {user1} id: {user1_id}, user2: {user2}, id: {user2_id}\n")

    print('user 1 envia peticion a user 2')
    data, status_code = friend_send_request(user1_session, json = {"receiver_id" : user2_id})
    assert "id" in data['data']
    assert "senderID" in data['data']
    assert "receiverID" in data['data']
    assert status_code >= 200 and status_code < 300

    print('lista incoming req user 2')
    req = user2_session.get(f"{API_URL}/friends/requests/incoming", verify=False)
    print(req.json())
    assert req.json()['data'] != [] or req.json()['data'] != None
    assert req.status_code >= 200 and req.status_code < 300

    print('lista outgoing req user 1')
    req = user1_session.get(f"{API_URL}/friends/requests/outgoing", verify=False)
    print(req.json())
    assert req.json()['data'] != [] or req.json()['data'] != None
    assert req.status_code >= 200 and req.status_code < 300

    print('user 2 acepta peticion de user 1')
    req = user2_session.patch(f"{API_URL}/friends/requests/{data['data']['id']}/accept", verify=False)
    print(req.json(), '\n')
    assert req.status_code >= 200 and req.status_code < 300

    print('lista incoming req user 2')
    req = user2_session.get(f"{API_URL}/friends/requests/incoming", verify=False)
    print(req.json())
    assert req.json()['data'] == [] or req.json()['data'] == None
    assert req.status_code >= 200 and req.status_code < 300

    print('lista outgoing req user 1')
    req = user1_session.get(f"{API_URL}/friends/requests/outgoing", verify=False)
    print(req.json())
    assert req.json()['data'] == [] or req.json()['data'] == None
    assert req.status_code >= 200 and req.status_code < 300
