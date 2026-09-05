from fixture import API_URL
from fixture import new_user


def test_2fa_enable_verify_disable_errors():
    _, _, session = new_user()

    # enable -> 200 with QR
    resp = session.post(f"{API_URL}/2fa/enable")
    assert resp.status_code == 200
    assert "QR" in resp.json()

    # enable again -> 200 (2FA only becomes active after verification)
    resp = session.post(f"{API_URL}/2fa/enable")
    assert resp.status_code == 200

    # verify with invalid code -> 401
    resp = session.post(f"{API_URL}/2fa/verify", json={"code": "000000"})
    assert resp.status_code == 401

    # disable with invalid code -> 401
    resp = session.post(f"{API_URL}/2fa/disable", json={"code": "000000"})
    assert resp.status_code == 401


def test_2fa_requires_auth():
    import requests

    resp = requests.post(f"{API_URL}/2fa/enable", verify=False)
    assert resp.status_code == 401
