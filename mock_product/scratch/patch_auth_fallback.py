import re

with open("src/mock/AuthPages.tsx", "r") as f:
    code = f.read()

new_submit = """  const submit = async (e: FormEvent) => {
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
        // Fallback to classic backend login
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, password: password, csrf_token: "" })
        });
        const data = await res.json();
        if (res.ok) {
           success = true;
           userRole = data.user ? data.user.role : (data.redirect && data.redirect.includes("dashboard") ? "teacher" : "student");
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
  };"""

code = re.sub(
    r'const submit = async \(e: FormEvent\) => \{.*?finally \{\n      setLoading\(false\);\n    \}\n  \};',
    new_submit,
    code,
    flags=re.DOTALL
)

# Fix the field type so usernames can be entered!
code = code.replace('<Field label="Email"><Input type="email" required placeholder="you@example.com"',
                    '<Field label="Email or Username"><Input type="text" required placeholder="you@example.com or username"')

with open("src/mock/AuthPages.tsx", "w") as f:
    f.write(code)
