import os
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plane.settings.local')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# User details
email = 'eng.kaioca@gmail.com'
username = 'kakoca'
password = 'Admin@123'  # Change this to your desired password

# Check if user already exists
if User.objects.filter(email=email).exists():
    print(f'User with email {email} already exists!')
elif User.objects.filter(username=username).exists():
    print(f'User with username {username} already exists!')
else:
    # Create superuser
    user = User.objects.create_superuser(
        email=email,
        username=username,
        password=password
    )
    print(f'Superuser created successfully!')
    print(f'Email: {email}')
    print(f'Username: {username}')
    print(f'Password: {password}')
    print('\nIMPORTANT: Please change this password after first login!')