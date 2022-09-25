from django.shortcuts import render
from .forms import model_form
from .models import User

# Create your views here.

def show_form(request):
    if request.method == 'POST':
        fm = model_form(request.POST)
        if fm.is_valid():
            nm = fm.cleaned_data['name']
            em = fm.cleaned_data['email']
            pw = fm.cleaned_data['password']
            print(nm,em,pw)
            reg = User(name = nm,email = em, password = pw)
            reg.save()
    else:
        fm = model_form()
    return render(request,'enroll/userregistration.html',{'form':fm})