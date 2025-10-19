// Variáveis globais
let passwordStrength = 0;

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔐 Página de alteração de senha carregada");

  initializePasswordToggles();
  initializePasswordStrength();
  initializeForm();
  initializeButtons();
  loadLastPasswordChange();
});

// Inicializar botões de mostrar/ocultar senha
function initializePasswordToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const icon = this.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });
}

// Inicializar indicador de força da senha
function initializePasswordStrength() {
  const newPasswordInput = document.getElementById("new-password");
  const strengthFill = document.getElementById("strength-fill");
  const strengthText = document.getElementById("strength-text");

  newPasswordInput.addEventListener("input", function () {
    const password = this.value;
    const strength = calculatePasswordStrength(password);

    passwordStrength = strength.score;

    strengthFill.className = "strength-fill";
    strengthText.className = "strength-text";

    if (password.length === 0) {
      strengthFill.style.width = "0%";
      strengthText.textContent = "";
      return;
    }

    strengthFill.classList.add(strength.class);
    strengthText.classList.add(strength.class);
    strengthText.textContent = strength.text;
  });
}

// Calcular força da senha
function calculatePasswordStrength(password) {
  let score = 0;

  if (password.length === 0) {
    return { score: 0, class: "", text: "" };
  }

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { score: 1, class: "weak", text: "Fraca" };
  } else if (score === 3) {
    return { score: 2, class: "fair", text: "Razoável" };
  } else if (score === 4) {
    return { score: 3, class: "good", text: "Boa" };
  } else {
    return { score: 4, class: "strong", text: "Forte" };
  }
}

// Inicializar formulário
function initializeForm() {
  const form = document.getElementById("change-password-form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (validateForm()) {
      await handlePasswordChange();
    }
  });

  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      clearError(this.id);
    });
  });
}

// Validar formulário
function validateForm() {
  let isValid = true;

  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  clearAllErrors();

  if (!currentPassword) {
    showError("current-password", "Digite sua senha atual");
    isValid = false;
  }

  if (!newPassword) {
    showError("new-password", "Digite sua nova senha");
    isValid = false;
  } else if (newPassword.length < 8) {
    showError("new-password", "A senha deve ter pelo menos 8 caracteres");
    isValid = false;
  } else if (passwordStrength < 2) {
    showError("new-password", "Escolha uma senha mais forte");
    isValid = false;
  }

  if (!confirmPassword) {
    showError("confirm-password", "Confirme sua nova senha");
    isValid = false;
  } else if (newPassword !== confirmPassword) {
    showError("confirm-password", "As senhas não coincidem");
    isValid = false;
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    showError("new-password", "A nova senha deve ser diferente da atual");
    isValid = false;
  }

  return isValid;
}

// Mostrar erro
function showError(inputId, message) {
  const errorElement = document.getElementById(`${inputId}-error`);
  const inputElement = document.getElementById(inputId);

  if (errorElement) {
    errorElement.textContent = message;
  }

  if (inputElement) {
    inputElement.style.borderColor = "#ef4444";
  }
}

// Limpar erro específico
function clearError(inputId) {
  const errorElement = document.getElementById(`${inputId}-error`);
  const inputElement = document.getElementById(inputId);

  if (errorElement) {
    errorElement.textContent = "";
  }

  if (inputElement) {
    inputElement.style.borderColor = "";
  }
}

// Limpar todos os erros
function clearAllErrors() {
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach((element) => {
    element.textContent = "";
  });

  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.style.borderColor = "";
  });
}

// Processar alteração de senha

const API_BASE_URL = "https://api-backend-coins.onrender.com/api";

async function handlePasswordChange() {
  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn.querySelector(".btn-loading");

  submitBtn.disabled = true;
  btnText.style.display = "none";
  btnLoading.style.display = "flex";

  try {
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;

    console.log("🔄 Iniciando alteração de senha...");

    const token = sessionStorage.getItem("token") || "";

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Senha alterada com sucesso");

      const now = new Date().toISOString();
      sessionStorage.setItem("lastPasswordChange", now);

      document.getElementById("change-password-form").reset();

      document.getElementById("strength-fill").style.width = "0%";
      document.getElementById("strength-text").textContent = "";

      showSuccessModal();
    } else {
      console.error("❌ Erro ao alterar senha:", data.message);

      if (
        data.message &&
        data.message.toLowerCase().includes("senha atual incorreta")
      ) {
        showError("current-password", "Senha atual incorreta");
      } else {
        showError("current-password", data.message || "Erro ao alterar senha");
      }
    }
  } catch (error) {
    console.error("❌ Erro na requisição:", error);
    showError(
      "current-password",
      "Erro ao conectar com o servidor. Tente novamente."
    );
  } finally {
    submitBtn.disabled = false;
    btnText.style.display = "flex";
    btnLoading.style.display = "none";
  }
}

// Mostrar modal de sucesso
function showSuccessModal() {
  const modal = document.getElementById("success-modal");
  modal.classList.remove("hidden");

  document
    .getElementById("success-ok-btn")
    .addEventListener("click", function () {
      modal.classList.add("hidden");

      setTimeout(() => {
        window.history.back();
      }, 300);
    });
}

// Inicializar botões
function initializeButtons() {
  const backBtn = document.getElementById("go-back");
  const cancelBtn = document.getElementById("cancel-btn");

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/pages/configuracao/html/configuracao.html";
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/pages/configuracao/html/configuracao.html";
      }
    });
  }
}

// Carregar data da última alteração de senha
function loadLastPasswordChange() {
  const lastChangeElement = document.getElementById("last-change-date");

  if (typeof Auth !== "undefined" && Auth.getUserData) {
    const userData = Auth.getUserData();
    if (userData && userData.lastPasswordChange) {
      const date = new Date(userData.lastPasswordChange);
      lastChangeElement.textContent = formatDate(date);
      return;
    }
  }

  const lastChange = sessionStorage.getItem("lastPasswordChange");
  if (lastChange) {
    const date = new Date(lastChange);
    lastChangeElement.textContent = formatDate(date);
  } else {
    lastChangeElement.textContent = "Nunca alterado";
  }
}

// Formatar data
function formatDate(date) {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hoje";
  } else if (diffDays === 1) {
    return "Ontem";
  } else if (diffDays < 30) {
    return `Há ${diffDays} dias`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Há ${months} ${months === 1 ? "mês" : "meses"}`;
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
}

console.log("🔐 Script de alteração de senha carregado com sucesso!");
