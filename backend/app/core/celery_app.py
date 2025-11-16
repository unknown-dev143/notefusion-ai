from __future__ import absolute_import
import os
from celery import Celery
from ..config import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.config.settings')

# Create the Celery app
app = Celery('notefusion')

# Load configuration from our config file
app.config_from_object('app.core.celery_config')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Create necessary queues on startup
@app.on_after_configure.connect
def setup_queues(sender, **kwargs):
    # Ensure all queues are declared
    with app.connection() as conn:
        for queue in app.conf.task_queues:
            conn.default_channel.queue_declare(
                queue=queue.name,
                durable=True,
                auto_delete=False
            )

if __name__ == '__main__':
    app.start()
