import sys
import os
sys.path.insert(0, '/var/app/current')
sys.path.insert(0, '/var/app/current/app')

from app.main import app
application = app
