import requests
import time

BASE_URL = "http://127.0.0.1:5000/api"

def test_dispatch():
    print("Checking current scheduler state...")
    res = requests.get(f"{BASE_URL}/scheduler/state")
    print("State:", res.json())
    
    print("\nTriggering dispatch...")
    res = requests.post(f"{BASE_URL}/scheduler/start")
    print("Response:", res.json())
    
    time.sleep(2)
    
    print("\nChecking scheduler state again...")
    res = requests.get(f"{BASE_URL}/scheduler/state")
    print("State:", res.json())

if __name__ == "__main__":
    test_dispatch()
