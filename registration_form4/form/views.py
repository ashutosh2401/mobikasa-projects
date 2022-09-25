from django.http.response import HttpResponseRedirect
from .serializers import CandidateSerializer
from django.shortcuts import render
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Candidates
from django_tables2 import SingleTableView
from .tables import candidateTable
import django_filters


# class CandidateListView(SingleTableView):
#     model = Candidates
#     table_class = candidateTable
#     template_name = 'table.html'


# Create your views here.
@api_view(['POST'])
def save_candidate(request):
    if request.method == 'POST':
        csrfmiddlewaretoken = request.POST.get('csrfmiddlewaretoken')
        fname = request.POST.get('fname')
        lname = request.POST.get('lname')
        email = request.POST.get('email')
        password = request.POST.get('pswd')
        cpassword = request.POST.get('confirmpassword')
        dob = request.POST.get('dob')
        gender = request.POST.get('gender')
        hobbies_list = request.POST.getlist('hobbies')
        hobbies = ','.join(map(str,hobbies_list))
        print('csrfmiddlewaretoken: ', csrfmiddlewaretoken)
        print('first name: ', fname)
        print('last name: ', lname)
        print('email: ', email)
        print('password: ', password)
        print('Confirm password: ', cpassword)
        print('Date of birth: ', dob)
        print('Gender: ', gender)
        print('Hobbies: ', hobbies)
        data = {'fname':fname,'lname':lname,'email':email,'password':password,'dob':dob,'gender':gender,'hobbies':hobbies}
        serializer = CandidateSerializer(data = data)
        if serializer.is_valid():
            print(serializer.validated_data)
            # serializer.save()
            # reg_form("POST")
            return HttpResponseRedirect('/',{'addon':'Data saved'})
            # return Response(serializer.data, status  = status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)

def reg_form(request):
    # if request.method == 'POST':
        # if password != cpassword:
        #     msg = "password and confirm password do not match"
        #     context = {'warning_text':msg}
        #     return render(request,"form.html",context)
        # else:
        #     msg = "password and confirm password match"
        #     context = {'warning_text':msg}
        #     return render(request,"form.html",context)
    #     data = {'fname':fname, 'lname':lname, 'email':email, 'password':password, 'dob':dob, 'gender':gender, 'hobbies':hobbies}
    #     headers = {'Content-Type':'application/json'}
    #     req = requests.post('http://127.0.0.1:8000/add_details',json = data, headers = headers)
    #     print("req",req)
    #     return render(request,"form.html")
    # else:
    # addon = 
    return render(request,"form.html")


def info_page(request):
    candidate_infos = Candidates.objects.all()
    if "text_box" in request.GET:
        print("get request received")
        print(request.GET)
        text_box = request.GET["text_box"]
        candidate_infos = Candidates.objects.filter(Q(id__icontains = text_box)|Q(fname__icontains = text_box)|Q(lname__icontains = text_box)|Q(email__icontains = text_box)|Q(dob__icontains = text_box)|Q(gender__contains = text_box)|Q(hobbies__icontains = text_box))
    return render(request,"home.html",{'candidates':candidate_infos})


def table_page(request):
    table = candidateTable(Candidates.objects.all())
    # tableinstance = CandidateListView()
    # print(tableinstance.get_table_data())
    # RequestConfig(request, paginate={"per_page": 10}).configure(table)
    # my_filter = TestFilter(request.GET)
    # my_choice = my_filter.data.get('my_choice') # This won't throw an exception
    # if my_choice: # If my_choice existed on the GET dictionary this will return non-null value
    #     table = TestTable(TestObj.objects.filter(choice=my_choice), order_by="-my_date")
    # else:
    #     table = TestTable(TestObj.objects.all(), order_by="-my_date")
    table.paginate(page=request.GET.get("page", 1), per_page=2)
    return render(request,"table.html",{'table':table})
