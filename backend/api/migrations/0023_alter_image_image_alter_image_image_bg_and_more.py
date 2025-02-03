# Generated by Django 5.0.3 on 2024-04-21 17:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_image_question'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='image',
            field=models.ImageField(upload_to='media/images'),
        ),
        migrations.AlterField(
            model_name='image',
            name='image_bg',
            field=models.ImageField(null=True, upload_to='media/images'),
        ),
        migrations.AlterField(
            model_name='image',
            name='image_cs',
            field=models.ImageField(null=True, upload_to='media/images'),
        ),
        migrations.AlterField(
            model_name='image',
            name='image_de',
            field=models.ImageField(null=True, upload_to='media/images'),
        ),
        migrations.AlterField(
            model_name='image',
            name='image_en',
            field=models.ImageField(null=True, upload_to='media/images'),
        ),
        migrations.AlterField(
            model_name='image',
            name='image_hr',
            field=models.ImageField(null=True, upload_to='media/images'),
        ),
        migrations.AlterField(
            model_name='image',
            name='image_hu',
            field=models.ImageField(null=True, upload_to='media/images'),
        ),
        migrations.AlterField(
            model_name='image',
            name='image_sk',
            field=models.ImageField(null=True, upload_to='media/images'),
        ),
        migrations.AlterField(
            model_name='image',
            name='image_sl',
            field=models.ImageField(null=True, upload_to='media/images'),
        ),
    ]
