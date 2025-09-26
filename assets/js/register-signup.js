// ========== SISTEMA DE USUÁRIOS - ADICIONADO ==========
// Função para extrair o primeiro nome
function getFirstName(fullName) {
  return fullName.trim().split(" ")[0];
}

// Função para salvar dados do usuário no localStorage
function saveUserData(userData) {
  localStorage.setItem("currentUser", JSON.stringify(userData));
}

// ========== CÓDIGO ORIGINAL MODIFICADO ==========

// Função para alternar visibilidade da senha
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

// Função para verificar força da senha
function checkPasswordStrength(password) {
  let strength = 0;
  let feedback = "";

  // Critérios de validação
  if (password.length >= 8) strength++;
  if (password.match(/[a-z]/)) strength++;
  if (password.match(/[A-Z]/)) strength++;
  if (password.match(/[0-9]/)) strength++;
  if (password.match(/[^a-zA-Z0-9]/)) strength++;

  // Resetar todas as barras
  const bars = document.querySelectorAll(".strength-bar");
  bars.forEach((bar) => (bar.className = "strength-bar"));

  // Aplicar estilo baseado na força
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

// Função para validar se as senhas coincidem
function validatePasswords() {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Limpar mensagens anteriores
  clearPasswordError();

  if (
    confirmPasswordInput.value &&
    passwordInput.value !== confirmPasswordInput.value
  ) {
    showPasswordError("As senhas não coincidem!");
    return false;
  }

  return true;
}

// Função para criar notificação estilizada
function showNotification(message, type = "error") {
  // Remove notificação anterior se existir
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Cria elemento de notificação
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

  // Adiciona ao body
  document.body.appendChild(notification);

  // Remove após 4 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add("notification-exit");
      setTimeout(() => notification.remove(), 300);
    }
  }, 4000);
}

// Função para mostrar erro de senha
function showPasswordError(message) {
  const confirmPasswordWrapper =
    document.getElementById("confirmPassword").parentElement;

  // Remove erro anterior se existir
  clearPasswordError();

  // Cria elemento de erro
  const errorDiv = document.createElement("div");
  errorDiv.className = "password-error";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ff4757;
    font-size: 12px;
    margin-top: 4px;
    animation: fadeIn 0.3s ease;
  `;

  // Adiciona após o wrapper do input
  confirmPasswordWrapper.parentElement.appendChild(errorDiv);

  // Adiciona borda vermelha ao input
  confirmPasswordWrapper.style.borderColor = "#ff4757";
}

// Função para limpar erro de senha
function clearPasswordError() {
  const existingError = document.querySelector(".password-error");
  if (existingError) {
    existingError.remove();
  }

  // Remove borda vermelha
  const confirmPasswordWrapper =
    document.getElementById("confirmPassword").parentElement;
  confirmPasswordWrapper.style.borderColor = "";
}

// Função para aplicar máscara no telefone
function phoneMask(value) {
  return value
    .replace(/\D/g, "") // Remove tudo que não é dígito
    .replace(/(\d{2})(\d)/, "($1) $2") // Aplica máscara: (XX)
    .replace(/(\d{5})(\d)/, "$1-$2") // Aplica máscara: XXXXX-XXXX
    .replace(/(-\d{4})\d+?$/, "$1"); // Limita a 4 dígitos finais
}

// Função para validar todo o formulário
function validateForm() {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("terms");
  const signupBtn = document.getElementById("signupBtn");

  // Validar senhas primeiro
  const passwordsMatch = validatePasswords();

  // Verificar se todos os campos estão preenchidos corretamente
  const isValid =
    nameInput.value.trim().length >= 2 &&
    emailInput.value.includes("@") &&
    phoneInput.value.length >= 14 &&
    passwordInput.value.length >= 6 &&
    passwordsMatch &&
    confirmPasswordInput.value.length > 0 &&
    termsCheckbox.checked;

  // Habilitar/desabilitar botão baseado na validação
  signupBtn.disabled = !isValid;

  return isValid;
}

// Função para criar efeito ripple no botão
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

// Event listeners e inicialização
document.addEventListener("DOMContentLoaded", function () {
  // Obter elementos do DOM
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("terms");
  const signupBtn = document.getElementById("signupBtn");
  const passwordStrength = document.getElementById("passwordStrength");
  const strengthText = document.getElementById("strengthText");

  // Verificar se os elementos existem antes de adicionar event listeners
  if (
    !nameInput ||
    !emailInput ||
    !phoneInput ||
    !passwordInput ||
    !confirmPasswordInput ||
    !termsCheckbox ||
    !signupBtn
  ) {
    console.error("Elementos essenciais do formulário não encontrados");
    return;
  }

  // Aplicar máscara no campo de telefone
  phoneInput.addEventListener("input", function (e) {
    e.target.value = phoneMask(e.target.value);
    validateForm();
  });

  // Verificar força da senha em tempo real
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

    validateForm();
  });

  // Validação específica para confirmação de senha
  confirmPasswordInput.addEventListener("input", function (e) {
    validateForm();
  });

  // Limpar erro quando usuário começar a digitar
  confirmPasswordInput.addEventListener("focus", function () {
    clearPasswordError();
  });

  // Adicionar event listeners para validação em todos os campos
  [nameInput, emailInput, phoneInput, termsCheckbox].forEach((field) => {
    field.addEventListener("input", validateForm);
    field.addEventListener("change", validateForm);
  });

  // Adicionar efeitos visuais de foco nos inputs
  document.querySelectorAll(".input-field").forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused");
    });
  });

  // ========== MODIFICAÇÃO PRINCIPAL - BOTÃO DE CADASTRO ==========
  // Adicionar efeito ripple no botão de cadastro
  signupBtn.addEventListener("click", async function (e) {
    e.preventDefault(); // Prevenir envio do formulário se inválido

    // Validar formulário antes de prosseguir
    if (!validateForm()) {
      return;
    }

    createRippleEffect(e, this);

    // Coletar dados do formulário
    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
      terms: termsCheckbox.checked,
    };

    // ========== SALVAR DADOS LOCALMENTE TAMBÉM ==========
    // Salvar dados do usuário no localStorage para usar na home
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      registeredAt: new Date().toISOString(),
    };
    saveUserData(userData);

    // Enviar dados para o backend
    try {
      const res = await fetch(
        "https://api-backend-coins.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        showNotification("Registro realizado com sucesso!", "success");
        localStorage.setItem("token", data.data.accessToken);

        // ========== SALVAR DADOS COMPLETOS DO USUÁRIO ==========
        // Salvar dados retornados pelo backend também
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
  });

  // Validação inicial
  validateForm();
});

// Adicionar CSS para animação de erro e notificações
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
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
