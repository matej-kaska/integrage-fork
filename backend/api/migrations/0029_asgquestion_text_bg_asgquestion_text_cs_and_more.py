# Generated by Django 5.0.3 on 2024-04-29 16:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_remove_asgoption_correct_position_asgquestion'),
    ]

    operations = [
        migrations.AddField(
            model_name='asgquestion',
            name='text_bg',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='asgquestion',
            name='text_cs',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='asgquestion',
            name='text_de',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='asgquestion',
            name='text_en',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='asgquestion',
            name='text_hr',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='asgquestion',
            name='text_hu',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='asgquestion',
            name='text_sk',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='asgquestion',
            name='text_sl',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
