# Generated by Django 5.0.3 on 2024-04-15 21:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_dndanswer_number_of_changes_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='surveyattempt',
            name='answers_generated',
        ),
    ]
