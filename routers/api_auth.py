from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel

import string, random
from master_database import SessionMaster, PlatformTenant, User
from auth import hash_pw

from auth import authenticate_user, create_session, SESSION_KEY, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    identifier: str
    password: str

@router.post("/login")
async def login_api(req: LoginRequest, response: Response):
    user = authenticate_user(req.identifier, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_session(user.id)
    # Set the cookie for the frontend
    response.set_cookie(SESSION_KEY, token, httponly=True, max_age=60*60*24*30, samesite="lax", path="/")
    
    return {
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.post("/logout")
async def logout_api(response: Response):
    response.delete_cookie(SESSION_KEY, path="/")
    return {"success": True}

@router.get("/me")
async def get_me(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }

class RegisterRequest(BaseModel):
    email: str
    password: str
    school_name: str

@router.post("/register")
async def register_api(req: RegisterRequest, response: Response):
    db = SessionMaster()
    try:
        email = req.email.strip().lower()
        if db.query(User).filter_by(email=email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
            
        # Generate tenant slug and filename
        base_slug = "".join(x for x in req.school_name.lower() if x.isalnum())[:10]
        rand_suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
        slug = f"{base_slug}_{rand_suffix}"
        db_filename = f"tenant_{slug}.db"
        
        tenant = PlatformTenant(slug=slug, db_filename=db_filename)
        db.add(tenant)
        db.flush()
        
        user = User(
            tenant_id=tenant.id,
            username=email, # Using email as username
            email=email,
            full_name=req.school_name,
            role="owner",
            password_hash=hash_pw(req.password),
            is_active=True
        )
        db.add(user)
        db.commit()
    finally:
        db.close()
        
    # Auto login after register
    user = authenticate_user(req.email, req.password)
    token = create_session(user.id)
    response.set_cookie(SESSION_KEY, token, httponly=True, max_age=60*60*24*30, samesite="lax", path="/")
    
    return {
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

class FirebaseLoginRequest(BaseModel):
    idToken: str
    role: str = "student"

@router.post("/firebase")
async def firebase_login_api(req: FirebaseLoginRequest, response: Response):
    import firebase_admin.auth as firebase_auth
    from master_database import TeacherProfile, StudentProfile
    import secrets
    
    try:
        decoded_token = firebase_auth.verify_id_token(req.idToken)
        email = decoded_token.get("email", "").strip().lower()
        name = decoded_token.get("name", email.split("@")[0])
        phone = decoded_token.get("phone_number", "")
        
        if not email:
            raise HTTPException(status_code=400, detail="Firebase token missing email")
            
        master_db = SessionMaster()
        try:
            user = master_db.query(User).filter(User.email == email).first()
            if not user:
                # User does not exist, trigger onboarding flow on frontend
                return {
                    "requires_onboarding": True,
                    "email": email,
                    "name": name,
                    "phone": phone
                }
                
            # If user exists, just log them in
            token = create_session(user.id)
            response.set_cookie(SESSION_KEY, token, httponly=True, max_age=60*60*24*30, samesite="lax", path="/")
            
            return {
                "success": True,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "full_name": user.full_name
                }
            }
        finally:
            master_db.close()
            
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase Token: {str(e)}")


class CompleteOnboardingRequest(BaseModel):
    idToken: str
    role: str
    full_name: str
    phone: str

@router.post("/onboarding")
async def complete_onboarding_api(req: CompleteOnboardingRequest, response: Response):
    import firebase_admin.auth as firebase_auth
    from master_database import TeacherProfile, StudentProfile
    import secrets
    
    try:
        decoded_token = firebase_auth.verify_id_token(req.idToken)
        email = decoded_token.get("email", "").strip().lower()
        
        if not email:
            raise HTTPException(status_code=400, detail="Firebase token missing email")
            
        master_db = SessionMaster()
        try:
            user = master_db.query(User).filter(User.email == email).first()
            if user:
                raise HTTPException(status_code=400, detail="User already exists")
                
            role = req.role.strip().lower()
            if role not in {"teacher", "student"}:
                role = "student"
                
            # Fetch or create tenant
            if role == "teacher":
                slug_base = email.split("@")[0].replace(".", "_")
                tenant_slug = f"{slug_base}_{random.randint(1000, 9999)}"
                tenant = PlatformTenant(slug=tenant_slug, db_filename=f"tenant_{tenant_slug}.db")
                master_db.add(tenant)
                master_db.flush()
            else:
                tenant = master_db.query(PlatformTenant).filter(PlatformTenant.slug == "liberum_admin").first()
                if not tenant:
                    tenant = PlatformTenant(slug="liberum_admin", db_filename="tenant_1.db")
                    master_db.add(tenant)
                    master_db.flush()
            
            prefix = email.split("@")[0].replace(".", "_")
            username = f"{prefix}_{random.randint(1000, 9999)}"
            
            user = User(
                tenant_id=tenant.id,
                username=username,
                email=email,
                phone=req.phone,
                full_name=req.full_name,
                password_hash=hash_pw(secrets.token_hex(16)),
                role=role,
                is_active=True
            )
            master_db.add(user)
            master_db.flush()
            
            if role == "teacher":
                master_db.add(TeacherProfile(user_id=user.id))
            elif role == "student":
                master_db.add(StudentProfile(user_id=user.id))
                # Add to waitlist just in case
                from database import get_tenant_engine, sessionmaker as tenant_sessionmaker
                from routers.waitlist import WaitlistEntry
                try:
                    engine = get_tenant_engine(tenant.db_filename)
                    SessionTenant = tenant_sessionmaker(bind=engine)
                    tenant_db = SessionTenant()
                    tenant_db.add(WaitlistEntry(name=req.full_name, phone=req.phone, status="new"))
                    tenant_db.commit()
                    tenant_db.close()
                except Exception as e:
                    print("Error writing Firebase student to waitlist:", e)
            
            master_db.commit()
            master_db.refresh(user)
            
            token = create_session(user.id)
            response.set_cookie(SESSION_KEY, token, httponly=True, max_age=60*60*24*30, samesite="lax", path="/")
            
            return {
                "success": True,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "full_name": user.full_name
                }
            }
        finally:
            master_db.close()
            
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Onboarding failed: {str(e)}")
            
            return {
                "success": True,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role
                }
            }
        finally:
            master_db.close()
            
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase Token: {str(e)}")
