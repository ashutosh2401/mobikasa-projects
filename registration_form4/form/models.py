from django.db import models

# Create your models here.
class Candidates(models.Model):
    fname = models.CharField(max_length=70)
    lname = models.CharField(max_length=70)
    email = models.EmailField(max_length=70)
    password = models.CharField(max_length=70)
    dob = models.DateField(max_length=70)
    gender = models.CharField(max_length=70)
    hobbies = models.CharField(max_length=150)