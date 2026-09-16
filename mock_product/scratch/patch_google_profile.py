import re

with open("src/mock/AuthPages.tsx", "r") as f:
    code = f.read()

start_str = "  const handleGoogle = async () => {"
end_str = "  };\n\n  return"

start_idx = code.find(start_str)
end_idx = code.find(end_str)

new_google = """  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      
      const fbRes = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role: "student" })
      });
      
      if (!fbRes.ok) throw new Error("Backend authentication failed");
      
      const meRes = await fetch("/api/auth/me");
      let backendUser = null;
      if (meRes.ok) {
         backendUser = await meRes.json();
      } else {
         backendUser = { id: cred.user.uid, username: cred.user.email, email: cred.user.email, full_name: cred.user.displayName, role: "student" };
      }
      
      const rawRole = backendUser.role?.toLowerCase() || "student";
      const isTeacherView = ["teacher", "owner", "admin"].includes(rawRole);
      
      if (["owner", "admin"].includes(rawRole)) {
          clearHistory(); // clear dummy data for owners
      }

      const name = backendUser.full_name || backendUser.username || cred.user.email || "User";
      const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

      const mockUser = {
          id: backendUser.id.toString(),
          name: name,
          email: backendUser.email || cred.user.email || "",
          role: isTeacherView ? "teacher" : "student",
          initials: initials || "ME"
      };
      
      signIn(mockUser);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
"""

if start_idx != -1 and end_idx != -1:
    code = code[:start_idx] + new_google + code[end_idx:]
    with open("src/mock/AuthPages.tsx", "w") as f:
        f.write(code)
    print("Fixed AuthPages.tsx Google")
else:
    print("Could not find handleGoogle block")
