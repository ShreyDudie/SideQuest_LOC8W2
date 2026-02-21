from django.urls import path
from .views import SignupView, LoginView

# =============================================================================
# Auth-only URL patterns — login and signup
# Submission/dashboard endpoints were removed (referenced missing models).
# =============================================================================
urlpatterns = [
    path("signup/", SignupView.as_view()),
    path("login/", LoginView.as_view()),
]