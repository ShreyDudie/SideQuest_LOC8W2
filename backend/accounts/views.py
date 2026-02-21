from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import SignupSerializer, LoginSerializer

# 🔹 SIGNUP
class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🔹 LOGIN (JWT)
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,
                "email": user.email,
                "username": user.username,
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🔹 GET ALL SUBMISSIONS (ADMIN ONLY)
class AllSubmissionsView(APIView):
    

    def get(self, request):
        if request.user.role != "admin":
            return Response({"error": "Not allowed"}, status=403)

        submissions = Submission.objects.all().order_by("-id")
        serializer = SubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


# 🔹 STUDENT → ONLY THEIR SUBMISSIONS
class MySubmissionsView(APIView):

    def get(self, request):
        submissions = Submission.objects.filter(user=request.user)
        serializer = SubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


# 🔹 JUDGE → ALL PENDING SUBMISSIONS
class JudgeSubmissionsView(APIView):
    

    def get(self, request):
        if request.user.role != "judge":
            return Response({"error": "Not allowed"}, status=403)

        submissions = Submission.objects.filter(status="Pending")
        serializer = SubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


# 🔹 DASHBOARD DATA (ADMIN PANEL TABLES)
class DashboardDataView(APIView):
    

    def get(self, request):
        if request.user.role != "admin":
            return Response({"error": "Not allowed"}, status=403)

        return Response({
            "selected": SubmissionSerializer(
                Submission.objects.filter(status="Selected"), many=True
            ).data,

            "pending": SubmissionSerializer(
                Submission.objects.filter(status="Pending"), many=True
            ).data,

            "rejected": SubmissionSerializer(
                Submission.objects.filter(status="Rejected"), many=True
            ).data,
        })


# 🔹 UPDATE STATUS (JUDGE SHORTLIST BUTTON)
class UpdateSubmissionStatusView(APIView):
    

    def patch(self, request, pk):
        if request.user.role != "judge":
            return Response({"error": "Not allowed"}, status=403)

        try:
            submission = Submission.objects.get(pk=pk)
        except Submission.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        new_status = request.data.get("status")

        if new_status not in ["Selected", "Rejected"]:
            return Response({"error": "Invalid status"}, status=400)

        submission.status = new_status
        submission.save()

        return Response({
            "message": f"Submission {new_status}"
        })