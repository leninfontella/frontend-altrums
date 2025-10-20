// State management
let currentStep = 1;
let userEmail = "";
let verificationCode = "";
let resendTimer = null;
let resendCountdown = 0;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  updateProgress();
});

// Event Listeners
function initializeEventListeners() {
  // Step 1: Email
  const emailInput = document.getElementById("emailInput");
  const sendCodeBtn = document.getElementById("sendCodeBtn");

  emailInput.addEventListener("input", validateEmailInput);
  emailInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && isValidEmail(emailInput.value)) {
      sendVerificationCode();
    }
  });

  sendCodeBtn.addEventListener("click", sendVerificationCode);

  // Step 2: Verification Code
  const codeInputs = document.querySelectorAll(".code-input");
  const verifyCodeBtn = document.getElementById("verifyCodeBtn");
  const resendCodeBtn = document.getElementById("resendCodeBtn");
  const backToEmailBtn = document.getElementById("backToEmailBtn");

  codeInputs.forEach((input, index) => {
    input.addEventListener("input", function (e) {
      handleCodeInput(e, index);
    });

    input.addEventListener("keydown", function (e) {
      handleCodeKeydown(e, index);
    });

    input.addEventListener("paste", function (e) {
      handleCodePaste(e);
    });
  });

  verifyCodeBtn.addEventListener("click", verifyCode);
  resendCodeBtn.addEventListener("click", resendVerificationCode);
  backToEmailBtn.addEventListener("click", () => goToStep(1));

  // Step 3: New Password
  const newPasswordInput = document.getElementById("newPasswordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const toggleNewPassword = document.getElementById("toggleNewPassword");
  const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword"
  );
  const resetPasswordBtn = document.getElementById("resetPasswordBtn");
  const backToCodeBtn = document.getElementById("backToCodeBtn");

  newPasswordInput.addEventListener("input", validatePassword);
  confirmPasswordInput.addEventListener("input", validatePasswordMatch);

  toggleNewPassword.addEventListener("click", () =>
    togglePasswordVisibility("newPasswordInput", "toggleNewPassword")
  );
  toggleConfirmPassword.addEventListener("click", () =>
    togglePasswordVisibility("confirmPasswordInput", "toggleConfirmPassword")
  );

  resetPasswordBtn.addEventListener("click", resetPassword);
  backToCodeBtn.addEventListener("click", () => goToStep(2));

  // Success step
  const goToLoginBtn = document.getElementById("goToLoginBtn");
  goToLoginBtn.addEventListener("click", () => {
    window.location.href = "./login.html";
  });
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateEmailInput() {
  const emailInput = document.getElementById("emailInput");
  const sendCodeBtn = document.getElementById("sendCodeBtn");
  const isValid = isValidEmail(emailInput.value);

  sendCodeBtn.disabled = !isValid;
}

function sendVerificationCode() {
  const emailInput = document.getElementById("emailInput");
  userEmail = emailInput.value;

  if (!isValidEmail(userEmail)) {
    showNotification("Por favor, insira um e-mail válido", "error");
    return;
  }

  // Simulate API call
  showNotification("Código enviado para " + userEmail, "success");

  // Generate a random 6-digit code (in production, this would be done on the server)
  verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Código de verificação (para teste):", verificationCode);

  // Update email display
  document.getElementById("emailDisplay").textContent = userEmail;

  // Move to next step
  goToStep(2);

  // Start resend timer
  startResendTimer();
}

// Code input handling
function handleCodeInput(e, index) {
  const input = e.target;
  const value = input.value;

  // Only allow numbers
  if (!/^\d*$/.test(value)) {
    input.value = "";
    return;
  }

  if (value.length === 1) {
    input.classList.add("filled");
    // Move to next input
    if (index < 5) {
      const nextInput = document.querySelector(
        `.code-input[data-index="${index + 1}"]`
      );
      nextInput.focus();
    }
  } else {
    input.classList.remove("filled");
  }

  validateCodeInputs();
}

function handleCodeKeydown(e, index) {
  const input = e.target;

  // Handle backspace
  if (e.key === "Backspace" && input.value === "" && index > 0) {
    const prevInput = document.querySelector(
      `.code-input[data-index="${index - 1}"]`
    );
    prevInput.focus();
    prevInput.value = "";
    prevInput.classList.remove("filled");
    validateCodeInputs();
  }

  // Handle arrow keys
  if (e.key === "ArrowLeft" && index > 0) {
    const prevInput = document.querySelector(
      `.code-input[data-index="${index - 1}"]`
    );
    prevInput.focus();
  }

  if (e.key === "ArrowRight" && index < 5) {
    const nextInput = document.querySelector(
      `.code-input[data-index="${index + 1}"]`
    );
    nextInput.focus();
  }
}

function handleCodePaste(e) {
  e.preventDefault();
  const pastedData = e.clipboardData.getData("text").trim();

  if (/^\d{6}$/.test(pastedData)) {
    const codeInputs = document.querySelectorAll(".code-input");
    pastedData.split("").forEach((digit, index) => {
      if (index < 6) {
        codeInputs[index].value = digit;
        codeInputs[index].classList.add("filled");
      }
    });
    validateCodeInputs();
    codeInputs[5].focus();
  }
}

function validateCodeInputs() {
  const codeInputs = document.querySelectorAll(".code-input");
  const verifyCodeBtn = document.getElementById("verifyCodeBtn");

  let allFilled = true;
  codeInputs.forEach((input) => {
    if (input.value === "") {
      allFilled = false;
    }
  });

  verifyCodeBtn.disabled = !allFilled;
}

function verifyCode() {
  const codeInputs = document.querySelectorAll(".code-input");
  let enteredCode = "";

  codeInputs.forEach((input) => {
    enteredCode += input.value;
  });

  // Simulate API verification
  // In production, this would verify with the server
  if (enteredCode === verificationCode) {
    showNotification("Código verificado com sucesso!", "success");
    goToStep(3);
  } else {
    showNotification("Código inválido. Tente novamente.", "error");
    // Clear inputs
    codeInputs.forEach((input) => {
      input.value = "";
      input.classList.remove("filled");
    });
    codeInputs[0].focus();
    validateCodeInputs();
  }
}

function resendVerificationCode() {
  if (resendCountdown > 0) {
    return;
  }

  // Generate new code
  verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Novo código de verificação (para teste):", verificationCode);

  showNotification("Código reenviado para " + userEmail, "success");

  // Clear current inputs
  const codeInputs = document.querySelectorAll(".code-input");
  codeInputs.forEach((input) => {
    input.value = "";
    input.classList.remove("filled");
  });
  codeInputs[0].focus();
  validateCodeInputs();

  // Restart timer
  startResendTimer();
}

function startResendTimer() {
  const resendCodeBtn = document.getElementById("resendCodeBtn");
  resendCountdown = 60;

  resendCodeBtn.disabled = true;

  if (resendTimer) {
    clearInterval(resendTimer);
  }

  resendTimer = setInterval(() => {
    resendCountdown--;

    if (resendCountdown > 0) {
      resendCodeBtn.textContent = `Reenviar em ${resendCountdown}s`;
    } else {
      resendCodeBtn.textContent = "Reenviar Código";
      resendCodeBtn.disabled = false;
      clearInterval(resendTimer);
    }
  }, 1000);
}

// Password validation
function validatePassword() {
  const newPasswordInput = document.getElementById("newPasswordInput");
  const password = newPasswordInput.value;
  const passwordStrength = document.getElementById("passwordStrength");

  if (password.length === 0) {
    passwordStrength.style.display = "none";
    return;
  }

  passwordStrength.style.display = "block";

  // Check requirements
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  // Update requirement indicators
  updateRequirement("req-length", hasLength);
  updateRequirement("req-uppercase", hasUppercase);
  updateRequirement("req-lowercase", hasLowercase);
  updateRequirement("req-number", hasNumber);

  // Calculate strength
  let strength = 0;
  if (hasLength) strength++;
  if (hasUppercase) strength++;
  if (hasLowercase) strength++;
  if (hasNumber) strength++;

  updateStrengthIndicator(strength);
  validatePasswordMatch();
}

function updateRequirement(id, isValid) {
  const element = document.getElementById(id);
  if (isValid) {
    element.classList.add("valid");
  } else {
    element.classList.remove("valid");
  }
}

function updateStrengthIndicator(strength) {
  const bars = ["strengthBar1", "strengthBar2", "strengthBar3", "strengthBar4"];
  const strengthText = document.getElementById("strengthText");

  // Reset all bars
  bars.forEach((barId) => {
    const bar = document.getElementById(barId);
    bar.classList.remove("weak", "medium", "strong");
  });

  if (strength === 0) {
    strengthText.textContent = "";
  } else if (strength === 1 || strength === 2) {
    strengthText.textContent = "Senha fraca";
    for (let i = 0; i < strength; i++) {
      document.getElementById(bars[i]).classList.add("weak");
    }
  } else if (strength === 3) {
    strengthText.textContent = "Senha média";
    for (let i = 0; i < strength; i++) {
      document.getElementById(bars[i]).classList.add("medium");
    }
  } else {
    strengthText.textContent = "Senha forte";
    for (let i = 0; i < strength; i++) {
      document.getElementById(bars[i]).classList.add("strong");
    }
  }
}

function validatePasswordMatch() {
  const newPasswordInput = document.getElementById("newPasswordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const resetPasswordBtn = document.getElementById("resetPasswordBtn");

  const password = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Check all requirements
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const isValid =
    hasLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

  resetPasswordBtn.disabled = !isValid;
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

function resetPassword() {
  const newPasswordInput = document.getElementById("newPasswordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");

  const password = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (password !== confirmPassword) {
    showNotification("As senhas não coincidem", "error");
    return;
  }

  // Simulate API call to reset password
  setTimeout(() => {
    showNotification("Senha redefinida com sucesso!", "success");
    goToStep(4);
  }, 500);
}

// Navigation
function goToStep(step) {
  const currentStepEl = document.querySelector(".step-container.active");

  if (currentStepEl) {
    currentStepEl.classList.add("exiting");
    currentStepEl.classList.remove("active");

    setTimeout(() => {
      currentStepEl.classList.remove("exiting");
      currentStepEl.style.display = "none";
    }, 400);
  }

  setTimeout(() => {
    const stepMap = {
      1: "step1",
      2: "step2",
      3: "step3",
      4: "successStep",
    };

    const nextStepEl = document.getElementById(stepMap[step]);
    nextStepEl.style.display = "block";

    setTimeout(() => {
      nextStepEl.classList.add("active");
    }, 10);

    currentStep = step;
    updateProgress();
    updateHeaderSubtitle();

    // Focus on first input of the new step
    if (step === 1) {
      document.getElementById("emailInput").focus();
    } else if (step === 2) {
      document.querySelector('.code-input[data-index="0"]').focus();
    } else if (step === 3) {
      document.getElementById("newPasswordInput").focus();
    }
  }, 200);
}

function updateProgress() {
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");

  const progressValues = {
    1: { width: "33.33%", text: "Etapa 1 de 3" },
    2: { width: "66.66%", text: "Etapa 2 de 3" },
    3: { width: "100%", text: "Etapa 3 de 3" },
    4: { width: "100%", text: "Concluído" },
  };

  const progress = progressValues[currentStep];
  progressFill.style.width = progress.width;
  progressText.textContent = progress.text;
}

function updateHeaderSubtitle() {
  const headerSubtitle = document.getElementById("headerSubtitle");

  const subtitles = {
    1: "Insira seu e-mail para iniciar o processo de recuperação",
    2: "Verifique seu e-mail e insira o código recebido",
    3: "Crie uma senha forte para proteger sua conta",
    4: "Sua senha foi alterada com sucesso!",
  };

  headerSubtitle.textContent = subtitles[currentStep];
}

// Notifications
function showNotification(message, type = "info") {
  // Remove existing notification
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add styles
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "16px 24px",
    borderRadius: "12px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    zIndex: "1000",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    animation: "slideInDown 0.3s ease",
    minWidth: "300px",
    textAlign: "center",
  });

  if (type === "success") {
    notification.style.background =
      "linear-gradient(135deg, #00ff88 0%, #00cc66 100%)";
  } else if (type === "error") {
    notification.style.background =
      "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)";
  } else {
    notification.style.background =
      "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)";
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutUp 0.3s ease";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes slideOutUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);
