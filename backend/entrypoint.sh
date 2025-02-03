#!/bin/sh

python manage.py collectstatic --noinput
python manage.py wait_for_dbs 
python manage.py migrate
python manage.py compilemessages
# Check if the 'loaddata' command has already been executed
if [ ! -f "db_loaded" ]; then
    # If not, run 'loaddata' and create a file to indicate that the data has been loaded
    python manage.py loaddata datadumps/user.json
    python manage.py loaddata datadumps/topic.json
    python manage.py loaddata datadumps/sub_topic.json
    python manage.py loaddata datadumps/question.json
    python manage.py loaddata datadumps/oca_option.json
    python manage.py loaddata datadumps/mca_option.json
    python manage.py loaddata datadumps/dnd_option.json
    python manage.py loaddata datadumps/asg_option.json
    python manage.py loaddata datadumps/asg_question.json
    python manage.py loaddata datadumps/grade.json
    python manage.py loaddata datadumps/grade_type.json
    python manage.py loaddata datadumps/scl_option.json
    python manage.py loaddata datadumps/image.json
    python manage.py loaddata datadumps/rating.json
    touch db_loaded
fi

exec "$@"