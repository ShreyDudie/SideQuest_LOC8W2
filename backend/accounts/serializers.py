from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],  # ✅ FIXED
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if user.role != data['role']:
            raise serializers.ValidationError("Role mismatch")

        data['user'] = user
        return data