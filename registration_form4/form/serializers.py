from rest_framework import serializers
from rest_framework.utils import field_mapping
from .models import Candidates

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidates
        fields = "__all__"