# Generated by Django 3.2.6 on 2021-09-13 06:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('enroll', '0003_auto_20210913_1152'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='fname',
            new_name='name',
        ),
    ]
