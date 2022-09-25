from django.urls import path, include
from . import views
# from .views import CandidateListView

urlpatterns = [
    path('', views.reg_form, name = 'form'),
    path('add_details', views.save_candidate, name = 'save_candidate'),
    path('home', views.info_page, name = 'info_page'),
    # path('table', CandidateListView.as_view())
    path('table', views.table_page, name = 'table_page')
]