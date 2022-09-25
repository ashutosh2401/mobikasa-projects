from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('form.urls'))
]

a = {1,2,3,8,4,5}
min = a[0]

for i in range(1,len(a)):
    for j in range():
    if(a[i] < min):
        a[0] = 