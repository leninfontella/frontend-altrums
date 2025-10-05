// ========== SISTEMA DE USUÁRIOS ==========
function getFirstName(fullName) {
  return fullName.trim().split(" ")[0];
}

function saveUserData(userData) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  users.push(userData);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(userData));
}

// ========== CONTROLE DE STEPS ==========
let currentStep = 1;
const totalSteps = 6;
const formData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

// ========== FUNÇÕES DE NAVEGAÇÃO ==========
function updateProgress() {
  const progressFill = document.getElementById("progressFill");
  const currentStepEl = document.getElementById("currentStep");
  const percentage = (currentStep / totalSteps) * 100;

  progressFill.style.width = `${percentage}%`;
  currentStepEl.textContent = currentStep;
}

function showStep(stepNumber) {
  const allSteps = document.querySelectorAll(".step-container");
  const activeStep = document.querySelector(
    `.step-container[data-step="${stepNumber}"]`
  );
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  // Animar saída do step atual
  allSteps.forEach((step) => {
    if (step.classList.contains("active")) {
      step.classList.add("exiting");
      setTimeout(() => {
        step.classList.remove("active", "exiting");
      }, 400);
    }
  });

  // Mostrar novo step após animação
  setTimeout(() => {
    if (activeStep) {
      activeStep.classList.add("active");

      // Focar no input do step atual
      const input = activeStep.querySelector(".input-field");
      if (input) {
        input.focus();
      }
    }

    // Controlar visibilidade dos botões
    backBtn.style.display = stepNumber > 1 ? "flex" : "none";

    if (stepNumber < totalSteps) {
      nextBtn.style.display = "flex";
      submitBtn.style.display = "none";
    } else {
      nextBtn.style.display = "none";
      submitBtn.style.display = "flex";
    }

    updateProgress();
    validateCurrentStep();
  }, 400);
}

function nextStep() {
  if (currentStep < totalSteps) {
    // Salvar dados do step atual
    saveStepData();

    currentStep++;
    showStep(currentStep);

    // Atualizar resumo no último step
    if (currentStep === totalSteps) {
      updateSummary();
    }
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

function saveStepData() {
  switch (currentStep) {
    case 1:
      formData.name = document.getElementById("name").value.trim();
      break;
    case 2:
      formData.email = document.getElementById("email").value.trim();
      break;
    case 3:
      formData.phone = document.getElementById("phone").value.trim();
      break;
    case 4:
      formData.password = document.getElementById("password").value;
      break;
    case 5:
      formData.confirmPassword =
        document.getElementById("confirmPassword").value;
      break;
    case 6:
      formData.terms = document.getElementById("terms").checked;
      break;
  }
}

function updateSummary() {
  document.getElementById("summaryName").textContent = formData.name;
  document.getElementById("summaryEmail").textContent = formData.email;
  document.getElementById("summaryPhone").textContent = formData.phone;
}

// ========== VALIDAÇÕES ==========
function validateStep1() {
  const nameInput = document.getElementById("name");
  return nameInput.value.trim().length >= 2;
}

function validateStep2() {
  const emailInput = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailInput.value.trim());
}

function validateStep3() {
  const phoneInput = document.getElementById("phone");
  return phoneInput.value.replace(/\D/g, "").length >= 10;
}

function validateStep4() {
  const passwordInput = document.getElementById("password");
  return passwordInput.value.length >= 6;
}

function validateStep5() {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  clearPasswordError();

  if (!confirmPasswordInput.value) {
    return false;
  }

  if (passwordInput.value !== confirmPasswordInput.value) {
    showPasswordError("As senhas não coincidem!");
    return false;
  }

  return true;
}

function validateStep6() {
  const termsCheckbox = document.getElementById("terms");
  return termsCheckbox.checked;
}

function validateCurrentStep() {
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  let isValid = false;

  switch (currentStep) {
    case 1:
      isValid = validateStep1();
      break;
    case 2:
      isValid = validateStep2();
      break;
    case 3:
      isValid = validateStep3();
      break;
    case 4:
      isValid = validateStep4();
      break;
    case 5:
      isValid = validateStep5();
      break;
    case 6:
      isValid = validateStep6();
      break;
  }

  if (currentStep < totalSteps) {
    nextBtn.disabled = !isValid;
  } else {
    submitBtn.disabled = !isValid;
  }

  return isValid;
}

// ========== FUNÇÕES AUXILIARES ==========
function togglePassword(fieldId) {
  const passwordField = document.getElementById(fieldId);
  const toggleIcon =
    passwordField.parentElement.querySelector(".password-toggle");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordField.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

function checkPasswordStrength(password) {
  let strength = 0;
  let feedback = "";

  if (password.length >= 8) strength++;
  if (password.match(/[a-z]/)) strength++;
  if (password.match(/[A-Z]/)) strength++;
  if (password.match(/[0-9]/)) strength++;
  if (password.match(/[^a-zA-Z0-9]/)) strength++;

  const bars = document.querySelectorAll(".strength-bar");
  bars.forEach((bar) => (bar.className = "strength-bar"));

  switch (strength) {
    case 0:
    case 1:
      feedback = "Muito fraca";
      if (bars[0]) bars[0].classList.add("weak");
      break;
    case 2:
      feedback = "Fraca";
      if (bars[0]) bars[0].classList.add("weak");
      if (bars[1]) bars[1].classList.add("weak");
      break;
    case 3:
      feedback = "Média";
      if (bars[0]) bars[0].classList.add("medium");
      if (bars[1]) bars[1].classList.add("medium");
      if (bars[2]) bars[2].classList.add("medium");
      break;
    case 4:
    case 5:
      feedback = "Forte";
      bars.forEach((bar) => bar.classList.add("strong"));
      break;
  }

  return { strength, feedback };
}

function showPasswordError(message) {
  const confirmPasswordWrapper =
    document.getElementById("confirmPassword").parentElement;

  clearPasswordError();

  const errorDiv = document.createElement("div");
  errorDiv.className = "password-error";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ff4757;
    font-size: 12px;
    margin-top: 8px;
    animation: fadeIn 0.3s ease;
  `;

  confirmPasswordWrapper.parentElement.appendChild(errorDiv);
  confirmPasswordWrapper.style.borderColor = "#ff4757";
}

function clearPasswordError() {
  const existingError = document.querySelector(".password-error");
  if (existingError) {
    existingError.remove();
  }

  const confirmPasswordWrapper =
    document.getElementById("confirmPassword").parentElement;
  if (confirmPasswordWrapper) {
    confirmPasswordWrapper.style.borderColor = "";
  }
}

function phoneMask(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

function showNotification(message, type = "error") {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;

  const icon =
    type === "success" ? "fa-check-circle" : "fa-exclamation-triangle";

  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${icon} notification-icon"></i>
      <span class="notification-message">${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add("notification-exit");
      setTimeout(() => notification.remove(), 300);
    }
  }, 4000);
}

function createRippleEffect(event, element) {
  if (element.disabled) return;

  const ripple = document.createElement("span");
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
  `;

  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// ========== SUBMIT DO FORMULÁRIO ==========
async function submitForm(e) {
  e.preventDefault();

  if (!validateCurrentStep()) {
    return;
  }

  createRippleEffect(e, document.getElementById("submitBtn"));

  // Salvar dados do último step
  saveStepData();

  const userData = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    registeredAt: new Date().toISOString(),
  };

  saveUserData(userData);

  try {
    const res = await fetch(
      "https://api-backend-coins.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      showNotification("Registro realizado com sucesso!", "success");
      localStorage.setItem("token", data.data.accessToken);

      if (data.data.user) {
        const completeUserData = {
          ...userData,
          id: data.data.user.id,
          token: data.data.accessToken,
        };
        saveUserData(completeUserData);
      }

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1500);
    } else {
      const errorMessage = data.errors
        ? data.errors.map((e) => e.msg).join(", ")
        : data.message;
      showNotification(errorMessage, "error");
    }
  } catch (err) {
    console.error(err);
    showNotification("Erro de conexão com o servidor", "error");
  }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", function () {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("terms");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const passwordStrength = document.getElementById("passwordStrength");
  const strengthText = document.getElementById("strengthText");

  if (
    !nameInput ||
    !emailInput ||
    !phoneInput ||
    !passwordInput ||
    !confirmPasswordInput ||
    !termsCheckbox ||
    !backBtn ||
    !nextBtn ||
    !submitBtn
  ) {
    console.error("Elementos essenciais do formulário não encontrados");
    return;
  }

  // Inicializar primeiro step
  showStep(1);

  // Event listeners dos inputs
  nameInput.addEventListener("input", validateCurrentStep);

  emailInput.addEventListener("input", validateCurrentStep);

  phoneInput.addEventListener("input", function (e) {
    e.target.value = phoneMask(e.target.value);
    validateCurrentStep();
  });

  passwordInput.addEventListener("input", function (e) {
    const password = e.target.value;

    if (password.length > 0 && passwordStrength) {
      passwordStrength.style.display = "block";
      const result = checkPasswordStrength(password);
      if (strengthText) {
        strengthText.textContent = result.feedback;
      }
    } else if (passwordStrength) {
      passwordStrength.style.display = "none";
    }

    validateCurrentStep();
  });

  confirmPasswordInput.addEventListener("input", validateCurrentStep);

  confirmPasswordInput.addEventListener("focus", clearPasswordError);

  termsCheckbox.addEventListener("change", validateCurrentStep);

  // Event listeners dos botões de navegação
  backBtn.addEventListener("click", previousStep);

  nextBtn.addEventListener("click", function (e) {
    createRippleEffect(e, this);
    nextStep();
  });

  submitBtn.addEventListener("click", submitForm);

  // Permitir navegar com Enter
  document.querySelectorAll(".input-field").forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (currentStep < totalSteps && !nextBtn.disabled) {
          nextBtn.click();
        } else if (currentStep === totalSteps && !submitBtn.disabled) {
          submitBtn.click();
        }
      }
    });

    // Efeitos visuais de foco
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused");
    });
  });

  // Atualizar total de steps
  document.getElementById("totalSteps").textContent = totalSteps;
});

// ========== ESTILOS DAS NOTIFICAÇÕES ==========
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .password-error {
    animation: fadeIn 0.3s ease;
  }
  
  .notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    min-width: 320px;
    max-width: 90vw;
    padding: 16px 20px;
    border-radius: 12px;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
    animation: notificationSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  .notification-error {
    background: linear-gradient(135deg, rgba(255, 71, 87, 0.95) 0%, rgba(255, 71, 87, 0.85) 100%);
    color: #ffffff;
  }
  
  .notification-success {
    background: linear-gradient(135deg, rgba(46, 213, 115, 0.95) 0%, rgba(46, 213, 115, 0.85) 100%);
    color: #ffffff;
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .notification-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .notification-message {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  }
  
  .notification-exit {
    animation: notificationExit 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  @keyframes notificationSlide {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes notificationExit {
    0% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
  
  @media (max-width: 480px) {
    .notification {
      min-width: calc(100vw - 40px);
      left: 20px;
      transform: none;
    }
    
    @keyframes notificationSlide {
      0% {
        opacity: 0;
        transform: translateY(-20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes notificationExit {
      0% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
  }
`;
document.head.appendChild(style);
