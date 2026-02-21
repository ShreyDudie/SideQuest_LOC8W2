# routers/face.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer
import os
import cv2
import numpy as np
from deepface import DeepFace
import shutil

router = APIRouter(prefix="/face", tags=["face"])
security = HTTPBearer()

REGISTER_DIR = "registered_faces"
os.makedirs(REGISTER_DIR, exist_ok=True)

# Replace with your actual user-from-token logic
async def get_current_user(token: str = Depends(security)):
    # Your JWT validation code here
    # Example: decode token and return user dict
    return {"pid": "example_user_123"}  # ← CHANGE THIS TO REAL LOGIC

@router.post("/register")
async def face_register(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    pid = current_user["pid"]

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(400, "Invalid image")

    # Resize to reduce processing time
    h, w = img.shape[:2]
    if max(h, w) > 720:
        scale = 720 / max(h, w)
        img = cv2.resize(img, None, fx=scale, fy=scale)

    temp_path = os.path.join(REGISTER_DIR, "temp_reg.jpg")
    cv2.imwrite(temp_path, img)

    try:
        # Check exactly one face
        DeepFace.verify(
            temp_path, temp_path,
            model_name="VGG-Face",
            detector_backend="ssd",
            enforce_detection=True,
            silent=True
        )

        final_path = os.path.join(REGISTER_DIR, f"{pid}.jpg")
        shutil.move(temp_path, final_path)

        return {"success": True, "message": f"Face registered for {pid}"}

    except ValueError as ve:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        msg = str(ve).lower()
        if "multiple" in msg:
            detail = "Multiple faces detected"
        elif "no face" in msg or "could not" in msg:
            detail = "No face detected"
        else:
            detail = "Face detection failed"
        raise HTTPException(400, detail)

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(500, str(e))

@router.post("/verify")
async def face_verify(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(400, "Invalid image")

    h, w = img.shape[:2]
    if max(h, w) > 720:
        scale = 720 / max(h, w)
        img = cv2.resize(img, None, fx=scale, fy=scale)

    temp_path = os.path.join(REGISTER_DIR, "temp_verify.jpg")
    cv2.imwrite(temp_path, img)

    best_sim = 0
    best_pid = None

    try:
        for fname in os.listdir(REGISTER_DIR):
            if not fname.endswith(".jpg") or fname == "temp_verify.jpg":
                continue
            ref_path = os.path.join(REGISTER_DIR, fname)
            try:
                result = DeepFace.verify(
                    ref_path, temp_path,
                    model_name="VGG-Face",
                    detector_backend="ssd",
                    distance_metric="cosine",
                    enforce_detection=True,
                    silent=True
                )
                sim = 1 - result["distance"]
                if sim > best_sim:
                    best_sim = sim
                    best_pid = fname.replace(".jpg", "")
            except:
                continue

        if os.path.exists(temp_path):
            os.remove(temp_path)

        return {
            "success": True,
            "verified": best_sim >= 0.70,
            "similarity": round(best_sim * 100, 1),
            "pid": best_pid if best_sim >= 0.70 else None,
            "message": "VERIFIED" if best_sim >= 0.70 else "NOT VERIFIED"
        }

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(500, str(e))