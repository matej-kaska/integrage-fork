#!/bin/bash

docker exec -it integrage-backend-prod sh -c "
  python manage.py dumpdata api.topic --output=datadumps/topic.json &&
  python manage.py dumpdata api.subtopic --output=datadumps/sub_topic.json &&
  python manage.py dumpdata api.question --output=datadumps/question.json &&
  python manage.py dumpdata api.ocaoption --output=datadumps/oca_option.json &&
  python manage.py dumpdata api.mcaoption --output=datadumps/mca_option.json &&
  python manage.py dumpdata api.dndoption --output=datadumps/dnd_option.json &&
  python manage.py dumpdata api.asgoption --output=datadumps/asg_option.json &&
  python manage.py dumpdata api.asgquestion --output=datadumps/asg_question.json &&
  python manage.py dumpdata api.grade --output=datadumps/grade.json &&
  python manage.py dumpdata api.gradetype --output=datadumps/grade_type.json &&
  python manage.py dumpdata api.scloption --output=datadumps/scl_option.json &&
  python manage.py dumpdata api.image --output=datadumps/image.json &&
  python manage.py dumpdata api.rating --output=datadumps/rating.json
"