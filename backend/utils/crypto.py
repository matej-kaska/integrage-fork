import os
from cryptography.fernet import Fernet

salt = os.getenv('DJANGO_CRYPTO_SALT')
key = os.getenv('DJANGO_CRYPTO_KEY')
cipher = Fernet(key)

def encode_pk(pk):
  data = f"{pk}:{salt}".encode()
  encrypted_data = cipher.encrypt(data)
  return encrypted_data.decode()

def decode_pk(encrypted_data):
  decrypted_data = cipher.decrypt(encrypted_data.encode()).decode()
  pk, original_salt = decrypted_data.split(':')
  if salt == original_salt:
    return pk
  else:
    return ValueError("Invalid salt")