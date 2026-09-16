import re

with open("src/mock/AuthPages.tsx", "r") as f:
    code = f.read()

# Make sure we use useMock from AuthPages
code = code.replace("const { signIn } = useMock();", "const { signIn, clearHistory } = useMock();")

start_str = "const submit = async (e: FormEvent) => {"
end_str = "  };\n\n  const handleGoogle"

start_idx = code.find(start_str)
end_idx = code.find(end_str)

new_submit = """const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let success = false;
    let backendUser = null;

    try {
      // 1. Try Firebase if it's an email
      if (email.includes("@")) {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const idToken = await cred.user.getIdToken();
          
          const fbRes = await fetch("/api/auth/firebase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken, role: "student" }) // role ignored for existing users
          });
          
          if (fbRes.ok) {
            success = true;
          } else {
             console.warn("Firebase token rejected by backend");
          }
        } catch (err: any) {
          console.warn("Firebase login failed, falling back to classic", err);
        }
      }

      // 2. Fallback to Classic Backend Login
      if (!success) {
        const getRes = await fetch("/login");
        const html = await getRes.text();
        const match = html.match(/id="csrf_token"\\s+value="([^"]+)"/);
        const csrfToken = match ? match[1] : "";

        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, password: password, csrf_token: csrfToken })
        });
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
           const data = await res.json();
           if (res.ok) {
              success = true;
           } else {
              throw new Error(data.detail || "Invalid credentials");
           }
        } else {
           throw new Error("Invalid response from backend (Check CORS or CSRF)");
        }
      }

      // 3. Fetch synced profile info from /api/auth/me
      if (success) {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
           backendUser = await meRes.json();
        } else {
           // Fallback to minimal profile if /me fails for some reason
           backendUser = { id: "user", username: email, email: email, full_name: email.split("@")[0], role: "student" };
        }
        
        // Map roles: owner/admin -> teacher view in Mock app
        const rawRole = backendUser.role?.toLowerCase() || "student";
        const isTeacherView = ["teacher", "owner", "admin"].includes(rawRole);
        
        if (["owner", "admin"].includes(rawRole)) {
            clearHistory(); // clear dummy data for owners
        }

        const name = backendUser.full_name || backendUser.username || email;
        const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

        const mockUser = {
            id: backendUser.id.toString(),
            name: name,
            email: backendUser.email || email,
            role: isTeacherView ? "teacher" : "student",
            initials: initials || "ME"
        };
        
        signIn(mockUser);
        navigate("/app");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
"""

if start_idx != -1 and end_idx != -1:
    code = code[:start_idx] + new_submit + code[end_idx:]
    with open("src/mock/AuthPages.tsx", "w") as f:
        f.write(code)
    print("Fixed AuthPages.tsx Submit")
else:
    print("Could not find submit block")
