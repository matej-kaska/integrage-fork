# Generated by Django 5.0.3 on 2024-04-29 19:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_remove_asganswer_answer_asgoneanswer_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='asgoneanswer',
            name='option',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.asgoption'),
        ),
    ]
