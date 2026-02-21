from django.urls import path
from .views import (
    SignupView,
    LoginView,
    AllSubmissionsView,
    MySubmissionsView,
    JudgeSubmissionsView,
    DashboardDataView,
    UpdateSubmissionStatusView,
)

urlpatterns = [
    path("signup/", SignupView.as_view()),
    path("login/", LoginView.as_view()),

    path("admin/submissions/", AllSubmissionsView.as_view()),
    path("student/submissions/", MySubmissionsView.as_view()),
    path("judge/submissions/", JudgeSubmissionsView.as_view()),

    path("dashboard/", DashboardDataView.as_view()),
    path("submission/<int:pk>/update/", UpdateSubmissionStatusView.as_view()),
]