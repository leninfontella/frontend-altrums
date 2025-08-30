// Função para mostrar mensagens
function showMessage(message, type = "success") {
  const messageBox = document.getElementById("message-box");
  messageBox.textContent = message;

  // Remover classes anteriores e adicionar a nova
  messageBox.className = `success-message ${
    type === "error" ? "error" : ""
  } show`;

  // Ocultar a mensagem após 3 segundos
  setTimeout(() => {
    messageBox.classList.remove("show");
  }, 3000);
}

// Função para salvar o perfil
async function saveProfile() {
  try {
    // Verificar se a API está disponível
    if (!window.apiConfig) {
      showMessage("Configuração da API não encontrada", "error");
      return;
    }

    // Mostrar loading
    const saveButtons = document.querySelectorAll(
      ".save-button, .save-content-btn"
    );
    saveButtons.forEach((btn) => {
      btn.disabled = true;
      btn.innerHTML = btn.classList.contains("save-button")
        ? '<i class="fas fa-spinner fa-spin"></i>'
        : "Salvando...";
    });

    // Obter dados do formulário
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    // Validações básicas
    if (!name) {
      showMessage("Nome é obrigatório", "error");
      return;
    }

    if (!email) {
      showMessage("Email é obrigatório", "error");
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("Email inválido", "error");
      return;
    }

    // Criar FormData para envio
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);

    // Adicionar foto se foi selecionada
    const photoInput = document.getElementById("photo-input");
    if (photoInput.files && photoInput.files[0]) {
      formData.append("profilePhoto", photoInput.files[0]);
    }

    // Enviar para API usando apiConfig
    const response = await window.apiConfig.put("/api/profile", formData);

    const result = await response.json();

    if (response.ok && result.success) {
      // Atualizar dados locais
      if (result.user) {
        // Atualizar localStorage com novos dados, incluindo a URL da foto
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            profilePhotoUrl: result.user.profilePhotoUrl, // Garante que a URL da foto seja salva
            coins: result.user.coins,
            level: result.user.level,
            xp: result.user.xp,
          })
        );

        // Atualizar foto de perfil em todas as páginas se houver userService
        if (window.userService && result.user.profilePhotoUrl) {
          window.userService.updateProfilePhotoEverywhere(
            result.user.profilePhotoUrl
          );
        }
      }

      showMessage("Perfil salvo com sucesso!", "success");

      // Limpar input de arquivo após sucesso
      photoInput.value = "";
    } else {
      // Tratar erros específicos
      let errorMessage = "Erro ao salvar perfil";

      if (result.message) {
        errorMessage = result.message;
      } else if (response.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente.";
      } else if (response.status === 413) {
        errorMessage = "Arquivo muito grande. Máximo 5MB.";
      } else if (response.status === 400) {
        errorMessage = "Dados inválidos. Verifique as informações.";
      }

      showMessage(errorMessage, "error");
    }
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      showMessage("Erro de conexão. Verifique sua internet.", "error");
    } else {
      showMessage("Erro inesperado. Tente novamente.", "error");
    }
  } finally {
    // Restaurar botões
    const saveButtons = document.querySelectorAll(
      ".save-button, .save-content-btn"
    );
    saveButtons.forEach((btn) => {
      btn.disabled = false;
      btn.innerHTML = btn.classList.contains("save-button")
        ? '<i class="fas fa-check"></i>'
        : "Salvar Informações";
    });
  }
}

// Função para carregar os dados do perfil do localStorage
function loadUserProfile() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (userData) {
    // Preencher os campos do formulário
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");

    if (nameInput) nameInput.value = userData.name || "";
    if (emailInput) emailInput.value = userData.email || "";
    if (phoneInput) phoneInput.value = userData.phone || "";
  }
}

// Adicionar o evento para carregar o perfil ao iniciar a página
document.addEventListener("DOMContentLoaded", loadUserProfile);

// Voltar para configurações
const goBack = document.getElementById("go-back");
if (goBack) {
  goBack.addEventListener("click", (e) => {
    e.preventDefault();

    // Verificar se há mudanças não salvas
    if (hasUnsavedChanges()) {
      if (confirm("Você tem alterações não salvas. Deseja continuar?")) {
        navigateBack();
      }
    } else {
      navigateBack();
    }
  });
}

function navigateBack() {
  // Tentar voltar na história ou ir para configurações
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "../../configuracao/html/index.html";
  }
}

// Verificar mudanças não salvas
function hasUnsavedChanges() {
  const currentData = getCurrentFormData();
  const originalData = getOriginalFormData();

  return JSON.stringify(currentData) !== JSON.stringify(originalData);
}

function getCurrentFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    hasNewPhoto: document.getElementById("photo-input").files.length > 0,
  };
}

let originalFormData = {};

function getOriginalFormData() {
  return originalFormData;
}

function setOriginalFormData(data) {
  originalFormData = { ...data };
}

// Pré-visualização da imagem selecionada
const photoInput = document.getElementById("photo-input");
const profileImage = document.getElementById("profile-image");

if (photoInput && profileImage) {
  photoInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      showMessage("Por favor, selecione apenas imagens", "error");
      photoInput.value = ""; // Limpar input
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("A imagem deve ter menos de 5MB", "error");
      photoInput.value = ""; // Limpar input
      return;
    }

    // Validar dimensões mínimas (opcional)
    const img = new Image();
    img.onload = function () {
      if (this.width < 100 || this.height < 100) {
        showMessage("A imagem deve ter pelo menos 100x100 pixels", "error");
        photoInput.value = "";
        return;
      }

      // Mostrar preview se tudo estiver ok
      const reader = new FileReader();
      reader.onload = function (e) {
        profileImage.src = e.target.result;
        profileImage.style.transform = "scale(1.02)";
        setTimeout(() => {
          profileImage.style.transform = "scale(1)";
        }, 200);
      };
      reader.readAsDataURL(file);
    };

    img.onerror = function () {
      showMessage("Arquivo de imagem corrompido", "error");
      photoInput.value = "";
    };

    img.src = URL.createObjectURL(file);
  });
}

// Carregar dados do usuário ao inicializar
document.addEventListener("DOMContentLoaded", function () {
  loadUserData();

  // Configurar eventos de mudança para detectar alterações
  setupChangeDetection();

  // Configurar atalhos de teclado
  setupKeyboardShortcuts();
});

// Configurar detecção de mudanças
function setupChangeDetection() {
  const inputs = document.querySelectorAll("#name, #email, #phone");
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      // Adicionar indicador visual de mudança não salva (opcional)
      input.classList.add("changed");
    });
  });
}

// Configurar atalhos de teclado
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + S para salvar
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveProfile();
    }

    // Escape para voltar
    if (e.key === "Escape") {
      const goBackButton = document.getElementById("go-back");
      if (goBackButton) {
        goBackButton.click();
      }
    }
  });
}

// Função para carregar dados do usuário
async function loadUserData() {
  try {
    // Mostrar loading nos campos
    const inputs = document.querySelectorAll("#name, #email, #phone");
    inputs.forEach((input) => {
      input.disabled = true;
      input.placeholder = "Carregando...";
    });

    // Primeiro, tentar carregar do localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);

        // Preencher formulário com dados do localStorage
        document.getElementById("name").value = userData.name || "";
        document.getElementById("email").value = userData.email || "";
        document.getElementById("phone").value = userData.phone || "";

        // Carregar foto de perfil com a URL base da API
        if (userData.profilePhotoUrl) {
          profileImage.src =
            window.apiConfig.baseURL +
            userData.profilePhotoUrl +
            `?t=${Date.now()}`;
        } else {
          profileImage.src =
            "https://placehold.co/120x120/00d4ff/ffffff?text=User";
        }

        // Definir dados originais para comparação
        setOriginalFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          hasNewPhoto: false,
        });

        // Habilitar campos após carregar dados locais
        inputs.forEach((input) => {
          input.disabled = false;
        });

        // Atualizar placeholders
        document.getElementById("name").placeholder =
          "Digite seu nome completo";
        document.getElementById("email").placeholder = "Digite seu email";
        document.getElementById("phone").placeholder = "Digite seu telefone";

        // Removido o return para permitir atualização da API
        // return;
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
      }
    }

    // Se não há dados locais ou API está disponível, tentar carregar da API
    if (window.apiConfig) {
      try {
        const response = await window.apiConfig.get("/api/users/profile");

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.user) {
            const user = result.user;

            // Preencher formulário
            document.getElementById("name").value = user.name || "";
            document.getElementById("email").value = user.email || "";
            document.getElementById("phone").value = user.phone || "";

            // Carregar foto de perfil com a URL base da API
            if (user.profilePhotoUrl) {
              profileImage.src =
                window.apiConfig.baseURL +
                user.profilePhotoUrl +
                `?t=${Date.now()}`;
            } else {
              profileImage.src =
                "https://placehold.co/120x120/00d4ff/ffffff?text=User";
            }

            // Definir dados originais para comparação
            setOriginalFormData({
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              hasNewPhoto: false,
            });

            // Atualizar dados no localStorage
            localStorage.setItem("userData", JSON.stringify(user));
          }
        } else if (response.status === 401) {
          // Sessão expirada - limpar dados locais e mostrar mensagem
          localStorage.removeItem("userData");
          showMessage(
            "Sessão expirada. Por favor, faça login novamente.",
            "error"
          );

          // Opcional: redirecionar para página de login se existir
          // setTimeout(() => {
          //   window.location.href = "../../auth/login.html";
          // }, 3000);
        } else {
          throw new Error("Erro ao carregar dados da API");
        }
      } catch (error) {
        console.error("Erro ao carregar dados da API:", error);
        showMessage(
          "Erro ao conectar com servidor. Usando dados locais.",
          "error"
        );
      }
    }

    // Atualizar placeholders
    document.getElementById("name").placeholder = "Digite seu nome completo";
    document.getElementById("email").placeholder = "Digite seu email";
    document.getElementById("phone").placeholder = "Digite seu telefone";
  } catch (error) {
    console.error("Erro geral ao carregar dados do usuário:", error);
    showMessage("Erro ao carregar dados. Verifique sua conexão.", "error");
  } finally {
    // Habilitar campos
    const inputs = document.querySelectorAll("#name, #email, #phone");
    inputs.forEach((input) => {
      input.disabled = false;
    });
  }
}

// Upload apenas da foto (função separada para mudança rápida)
async function uploadPhotoOnly() {
  const photoInput = document.getElementById("photo-input");

  if (!photoInput.files || !photoInput.files[0]) {
    showMessage("Selecione uma foto primeiro", "error");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("profilePhoto", photoInput.files[0]);

    const response = await window.apiConfig.post(
      "/api/profile/upload-photo",
      formData
    );

    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Foto atualizada com sucesso!", "success");

      // Atualizar foto em todas as páginas
      if (window.userService && result.profilePhoto.url) {
        window.userService.updateProfilePhotoEverywhere(
          result.profilePhoto.url
        );
      }

      // Limpar input
      photoInput.value = "";
    } else {
      showMessage(result.message || "Erro ao atualizar foto", "error");
    }
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    showMessage("Erro de conexão", "error");
  }
}

// Exportar funções para uso global se necessário
window.editProfileFunctions = {
  saveProfile,
  uploadPhotoOnly,
  loadUserData,
  showMessage,
};
