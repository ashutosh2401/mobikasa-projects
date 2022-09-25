from django import forms
from django.forms.widgets import PasswordInput

class StudentRegistration(forms.Form):
    name = forms.CharField()
    email = forms.EmailField()
    password = forms.CharField(widget=PasswordInput)