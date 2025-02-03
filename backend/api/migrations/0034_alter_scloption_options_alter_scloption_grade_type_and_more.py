# Generated by Django 5.0.3 on 2024-05-01 22:10

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_grade_text_bg_grade_text_cs_grade_text_de_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='scloption',
            options={'verbose_name': 'SCL Option', 'verbose_name_plural': 'SCL Options'},
        ),
        migrations.AlterField(
            model_name='scloption',
            name='grade_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='scl_options', to='api.gradetype'),
        ),
        migrations.AlterField(
            model_name='scloption',
            name='question',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scl_options', to='api.question'),
        ),
    ]
