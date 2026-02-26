document.addEventListener("DOMContentLoaded", () => {
  // Determine API URL - works on localhost and Vercel
  const API_URL = window.location.origin;

  /* ===== Typing Effect ===== */
  const text = "Student • Web Developer • Creator";
  let i = 0;
  const typing = document.querySelector(".typing");

  function typeEffect() {
    if (i < text.length) {
      typing.textContent += text.charAt(i);
      i++;
      setTimeout(typeEffect, 60);
    }
  }
  typeEffect();

  /* ===== Scroll Reveal ===== */
  function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach(el => {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - 100) {
        el.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", reveal);
  reveal();

  /* ===== Form Submit ===== */
  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("successMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json();

      if (!res.ok) {
        successMsg.textContent = data.error || "Error sending message";
        successMsg.style.color = "red";
        return;
      }

      successMsg.textContent = data.message;
      successMsg.style.color = "lightgreen";
      form.reset();
    } catch (error) {
      successMsg.textContent = "Server Error!";
      successMsg.style.color = "red";
      console.error("Error:", error);
    }
  });
});
