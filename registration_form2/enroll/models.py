from django.db import models

# Create your models here.
class User(models.Model):
    name = models.CharField(max_length=70)
    # lname = models.CharField(max_length=70, default= 'None')
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=100)
    # cpassword = models.CharField(max_length=100, default=password)
    # dob = models.DateField(default=0)
    # gender = models.CharField(max_length=10,default='M')
    # hobbies = models.CharField(max_length=100,default='None')

    