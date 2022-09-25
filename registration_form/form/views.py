from django.shortcuts import render, HttpResponse

# Create your views here.
def main(request):
    return render(request,'base.html')
    # return HttpResponse("this is homepage")

def form(request):
    return render(request,"form.html")