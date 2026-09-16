import re

with open("src/mock/AuthPages.tsx", "r") as f:
    code = f.read()

# Locate the submit block using string manipulation to avoid regex replacement issues
start_str = "const submit = async (e: FormEvent) => {"
end_str = "  };\n\n  const handleGoogle"

start_idx = code.find(start_str)
end_idx = code.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_submit = """const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let success = false;
    let userRole = "student";

    try {
      if (email.includes("@")) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          success = true;
          userRole = email.toLowerCase().includes("aziza") || email.toLowerCase().includes("teacher") ? "teacher" : "student";
        } catch (err: any) {
          console.warn("Firebase login failed, falling back to classic", err);
        }
      }

      if (!success) {
        // Fetch CSRF token first
        const getRes = await fetch("/login");
        const html = await getRes.text();
        const match = html.match(/id="csrf_token"\\s+value="([^"]+)"/);
        const csrfToken = match ? match[1] : "";

        // Fallback to classic backend login
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, password: password, csrf_token: csrfToken })
        });
        
        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
           data = await res.json();
        } else {
           throw new Error("Invalid response from backend (Check CORS or CSRF)");
        }
        
        if (res.ok) {
           success = true;
           userRole = data.user ? data.user.role : (data.redirect && data.redirect.includes("dashboard") ? "teacher" : (data.redirect && data.redirect.includes("admin") ? "owner" : "student"));
        } else {
           throw new Error(data.detail || "Invalid credentials");
        }
      }

      if (success) {
        signIn(userRole);
        navigate("/app");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
"""
    code = code[:start_idx] + new_submit + code[end_idx:]
    with open("src/mock/AuthPages.tsx", "w") as f:
        f.write(code)
    print("Fixed AuthPages.tsx")
else:
    print("Could not find submit block")
