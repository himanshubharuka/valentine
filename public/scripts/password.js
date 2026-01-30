// scripts/password.js
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const passwordInput = document.getElementById("passwordInput");
  const unlockBtn = document.getElementById("unlockBtn");
  const messageDiv = document.getElementById("message");
  const attemptCount = document.getElementById("attemptCount");
  const showHintBtn = document.getElementById("showHint");
  const extraHint = document.getElementById("extraHint");

  // Backend URL

  const BACKEND_URL = "http://localhost:3003";
  console.log(BACKEND_URL);
  // Helper function to show messages
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = "message";

    if (type === "success") {
      messageDiv.style.color = "#4ade80";
      messageDiv.style.background = "rgba(74, 222, 128, 0.1)";
      messageDiv.style.border = "1px solid rgba(74, 222, 128, 0.3)";
    } else if (type === "error") {
      messageDiv.style.color = "#f87171";
      messageDiv.style.background = "rgba(248, 113, 113, 0.1)";
      messageDiv.style.border = "1px solid rgba(248, 113, 113, 0.3)";
    } else {
      messageDiv.style.color = "rgba(255, 255, 255, 0.9)";
      messageDiv.style.background = "rgba(255, 255, 255, 0.05)";
    }
  }

  // Focus on input field
  passwordInput.focus();

  // Enter key to submit
  passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      unlockBtn.click();
    }
  });

  // Unlock button click
  unlockBtn.addEventListener("click", async function () {
    const password = passwordInput.value.trim();

    if (!password) {
      showMessage("Please enter the password!", "error");
      passwordInput.classList.add("shake");
      setTimeout(() => passwordInput.classList.remove("shake"), 500);
      return;
    }

    // Update attempt count
    const currentAttempts = parseInt(attemptCount.textContent) + 1;
    attemptCount.textContent = currentAttempts;

    // Show loading state
    unlockBtn.disabled = true;
    unlockBtn.innerHTML = "Checking... ⏳";

    try {
      // Call backend API
      console.log("+==================================================");
      const response = await fetch(`${BACKEND_URL}/api/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: password,
          sessionId: "valentine_" + Date.now(),
        }),
      });

      const result = await response.json();

      // Reset button state
      unlockBtn.disabled = false;
      unlockBtn.innerHTML = "Unlock My Heart 💖";

      if (result.success) {
        // ✅ SUCCESS - Password correct!
        showMessage(
          "Password correct! Unlocking your special message... 💖",
          "success",
        );

        // Store authentication token for home.html
        localStorage.setItem("valentine_authenticated", "true");
        localStorage.setItem("valentine_auth_time", Date.now().toString());

        // Store session token if provided
        if (result.sessionId) {
          localStorage.setItem("valentine_session", result.sessionId);
        }

        // Redirect after delay
        setTimeout(() => {
          window.location.href = result.redirectUrl || "home.html";
        }, 2000);
      } else {
        // ❌ FAILED - Password incorrect

        if (currentAttempts >= 3) {
          // Locked out
          showMessage("Too many attempts! Try again later.", "error");
          unlockBtn.disabled = true;
          unlockBtn.textContent = "Locked 🔒";
          passwordInput.disabled = true;

          // Show the hint after locking
          extraHint.classList.add("show");

          // Reset after 10 seconds
          setTimeout(() => {
            attemptCount.textContent = "0";
            unlockBtn.disabled = false;
            unlockBtn.textContent = "Unlock My Heart 💖";
            passwordInput.disabled = false;
            passwordInput.value = "";
            messageDiv.textContent = "";
            messageDiv.className = "message";
            passwordInput.focus();
          }, 10000);
        } else {
          // Wrong password but still have attempts
          showMessage(result.message || "Wrong password!", "error");

          // Shake animation
          passwordInput.classList.add("shake");
          setTimeout(() => passwordInput.classList.remove("shake"), 500);

          // Clear input
          passwordInput.value = "";
          passwordInput.focus();
        }
      }
    } catch (error) {
      // Network or server error
      console.error("Error connecting to backend:", error);
      unlockBtn.disabled = false;
      unlockBtn.innerHTML = "Unlock My Heart 💖";
      showMessage("Could not connect to server. Please try again.", "error");
    }
  });

  // Show extra hint
  showHintBtn.addEventListener("click", function () {
    extraHint.classList.toggle("show");
    showHintBtn.textContent = extraHint.classList.contains("show")
      ? "Hide hint 🙈"
      : "Need another hint? 🤔";
  });
});
