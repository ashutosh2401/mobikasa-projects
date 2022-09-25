import django_tables2 as tables
from .models import Candidates

class candidateTable(tables.Table):
    class Meta:
        model = Candidates
        template_name = "django_tables2/bootstrap.html"