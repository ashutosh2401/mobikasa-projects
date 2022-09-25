from django import forms
from .models import User

class model_form(forms.ModelForm):
    class Meta:
        model = User
        fields = ['name','password','email']
        widgets = {
            'password': forms.PasswordInput(),
        }