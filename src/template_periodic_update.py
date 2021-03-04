import time

for i in range(5):
    print(f'printing loop {i}', flush=True) # Flush is there for it to be sent to JS immediately
    time.sleep(1)