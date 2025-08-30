// Função para mostrar mensagens
function showMessage(message, type = "success") {
  const messageBox = document.getElementById("message-box");
  if (!messageBox) {
    console.log(`Mensagem (${type}):`, message);
    return;
  }

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
    if (photoInput && photoInput.files && photoInput.files[0]) {
      // Validar arquivo antes de enviar
      const file = photoInput.files[0];

      if (!file.type.startsWith("image/")) {
        showMessage("Por favor, selecione apenas arquivos de imagem", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showMessage("A imagem deve ter menos de 5MB", "error");
        return;
      }

      formData.append("profilePhoto", file);
    }

    // Enviar para API usando apiConfig
    const response = await window.apiConfig.put("/api/profile", formData);

    const result = await response.json();

    if (response.ok && result.success) {
      // Atualizar dados locais
      if (result.user) {
        // Atualizar localStorage com novos dados, incluindo a URL da foto
        const updatedUserData = {
          id: result.user.id,
          name: result.user.name,
          fullName: result.user.fullName || result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          profilePhotoUrl: result.user.profilePhotoUrl,
          avatar: result.user.avatar,
          institution: result.user.institution,
          coins: result.user.coins,
          level: result.user.level,
          xp: result.user.xp,
          maxXp: result.user.maxXp,
          score: result.user.score,
          totalDonated: result.user.totalDonated,
          totalReceived: result.user.totalReceived,
          totalDonations: result.user.totalDonations,
          stats: result.user.stats,
        };

        localStorage.setItem("userData", JSON.stringify(updatedUserData));

        // Atualizar foto de perfil na página atual
        updateProfilePhotoDisplay(result.user.profilePhotoUrl);

        // Atualizar foto de perfil em todas as páginas se houver userService
        if (window.userService && result.user.profilePhotoUrl) {
          window.userService.updateProfilePhotoEverywhere(
            result.user.profilePhotoUrl
          );
        }

        // Disparar evento customizado para outras partes da aplicação
        window.dispatchEvent(
          new CustomEvent("userDataUpdated", {
            detail: { userData: updatedUserData },
          })
        );
      }

      showMessage("Perfil salvo com sucesso!", "success");

      // Limpar input de arquivo após sucesso
      if (photoInput) {
        photoInput.value = "";
      }

      // Atualizar dados originais para nova comparação
      setOriginalFormData(getCurrentFormData());
    } else {
      // Tratar erros específicos
      let errorMessage = "Erro ao salvar perfil";

      if (result.message) {
        errorMessage = result.message;
      } else if (response.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente.";
        // Redirecionar para login se necessário
        setTimeout(() => {
          window.location.href = "../../auth/login.html";
        }, 2000);
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

// Função para atualizar a exibição da foto de perfil
function updateProfilePhotoDisplay(photoUrl) {
  const profileImage = document.getElementById("profile-image");
  if (profileImage && photoUrl) {
    // Adicionar timestamp para evitar cache
    const urlWithTimestamp = photoUrl.includes("?")
      ? `${photoUrl}&t=${Date.now()}`
      : `${photoUrl}?t=${Date.now()}`;

    profileImage.src = window.apiConfig.baseURL + urlWithTimestamp;

    // Efeito visual de atualização
    profileImage.style.opacity = "0.7";
    setTimeout(() => {
      profileImage.style.opacity = "1";
    }, 300);
  }
}

// Função para carregar os dados do perfil
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

    // Carregar foto de perfil
    const profileImage = document.getElementById("profile-image");
    if (profileImage && userData.profilePhotoUrl && window.apiConfig) {
      const photoUrl =
        window.apiConfig.baseURL +
        userData.profilePhotoUrl +
        `?t=${Date.now()}`;
      profileImage.src = photoUrl;

      // Fallback em caso de erro na imagem
      profileImage.onerror = function () {
        this.src = "https://placehold.co/120x120/00d4ff/ffffff?text=User";
      };
    }

    // Definir dados originais para comparação
    setOriginalFormData({
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      hasNewPhoto: false,
    });
  }
}

// Adicionar o evento para carregar o perfil ao iniciar a página
document.addEventListener("DOMContentLoaded", function () {
  loadUserProfile();
  setupChangeDetection();
  setupKeyboardShortcuts();
  setupPhotoPreview();
});

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
    name: document.getElementById("name")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    phone: document.getElementById("phone")?.value.trim() || "",
    hasNewPhoto: document.getElementById("photo-input")?.files.length > 0,
  };
}

let originalFormData = {};

function getOriginalFormData() {
  return originalFormData;
}

function setOriginalFormData(data) {
  originalFormData = { ...data };
}

// Configurar pré-visualização da imagem
function setupPhotoPreview() {
  const photoInput = document.getElementById("photo-input");
  const profileImage = document.getElementById("profile-image");

  if (!photoInput || !profileImage) return;

  photoInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      showMessage("Por favor, selecione apenas imagens", "error");
      photoInput.value = "";
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("A imagem deve ter menos de 5MB", "error");
      photoInput.value = "";
      return;
    }

    // Validar dimensões mínimas
    const img = new Image();
    img.onload = function () {
      if (this.width < 50 || this.height < 50) {
        showMessage("A imagem deve ter pelo menos 50x50 pixels", "error");
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

// Função para carregar dados do usuário da API
async function loadUserDataFromAPI() {
  try {
    if (!window.apiConfig) {
      console.log("API config não disponível, usando dados locais");
      return;
    }

    const response = await window.apiConfig.get("/api/profile");

    if (response.ok) {
      const result = await response.json();

      if (result.success && result.user) {
        const user = result.user;

        // Atualizar formulário
        document.getElementById("name").value = user.name || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("phone").value = user.phone || "";

        // Atualizar foto de perfil
        const profileImage = document.getElementById("profile-image");
        if (profileImage && user.profilePhotoUrl) {
          const photoUrl =
            window.apiConfig.baseURL +
            user.profilePhotoUrl +
            `?t=${Date.now()}`;
          profileImage.src = photoUrl;
          profileImage.onerror = function () {
            this.src = "https://placehold.co/120x120/00d4ff/ffffff?text=User";
          };
        }

        // Atualizar localStorage
        localStorage.setItem("userData", JSON.stringify(user));

        // Definir dados originais
        setOriginalFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          hasNewPhoto: false,
        });
      }
    } else if (response.status === 401) {
      // Sessão expirada
      localStorage.removeItem("userData");
      showMessage("Sessão expirada. Faça login novamente.", "error");
      setTimeout(() => {
        window.location.href = "../../auth/login.html";
      }, 3000);
    } else {
      throw new Error("Erro ao carregar dados da API");
    }
  } catch (error) {
    console.error("Erro ao carregar dados da API:", error);
    showMessage("Erro ao conectar com servidor. Usando dados locais.", "error");
  }
}

// Upload apenas da foto (função separada para mudança rápida)
async function uploadPhotoOnly() {
  const photoInput = document.getElementById("photo-input");

  if (!photoInput || !photoInput.files || !photoInput.files[0]) {
    showMessage("Selecione uma foto primeiro", "error");
    return;
  }

  try {
    // Validar arquivo
    const file = photoInput.files[0];

    if (!file.type.startsWith("image/")) {
      showMessage("Por favor, selecione apenas arquivos de imagem", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("A imagem deve ter menos de 5MB", "error");
      return;
    }

    // Mostrar loading
    const uploadBtn = document.querySelector(".upload-photo-btn");
    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }

    const formData = new FormData();
    formData.append("profilePhoto", file);

    const response = await window.apiConfig.post(
      "/api/profile/upload-photo",
      formData
    );

    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Foto atualizada com sucesso!", "success");

      // Atualizar foto na página atual
      if (result.profilePhoto && result.profilePhoto.url) {
        updateProfilePhotoDisplay(result.profilePhoto.url);
      }

      // Atualizar dados do usuário no localStorage
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      if (result.user && result.user.profilePhotoUrl) {
        userData.profilePhotoUrl = result.user.profilePhotoUrl;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      // Atualizar foto em todas as páginas se houver userService
      if (window.userService && result.profilePhoto.url) {
        window.userService.updateProfilePhotoEverywhere(
          result.profilePhoto.url
        );
      }

      // Disparar evento customizado
      window.dispatchEvent(
        new CustomEvent("profilePhotoUpdated", {
          detail: { photoUrl: result.profilePhoto.url },
        })
      );

      // Limpar input
      photoInput.value = "";
    } else {
      showMessage(result.message || "Erro ao atualizar foto", "error");
    }
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    showMessage("Erro de conexão", "error");
  } finally {
    // Restaurar botão
    const uploadBtn = document.querySelector(".upload-photo-btn");
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Enviar Foto';
    }
  }
}

// Função para remover foto de perfil
async function removeProfilePhoto() {
  if (!confirm("Tem certeza que deseja remover sua foto de perfil?")) {
    return;
  }

  try {
    const response = await window.apiConfig.delete("/api/profile/photo");
    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Foto removida com sucesso!", "success");

      // Atualizar imagem para placeholder
      const profileImage = document.getElementById("profile-image");
      if (profileImage) {
        profileImage.src =
          "https://placehold.co/120x120/00d4ff/ffffff?text=User";
      }

      // Atualizar localStorage
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      userData.profilePhotoUrl = null;
      localStorage.setItem("userData", JSON.stringify(userData));

      // Limpar input de arquivo
      const photoInput = document.getElementById("photo-input");
      if (photoInput) {
        photoInput.value = "";
      }

      // Atualizar em todas as páginas
      if (window.userService) {
        window.userService.updateProfilePhotoEverywhere(null);
      }

      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent("profilePhotoRemoved"));
    } else {
      showMessage(result.message || "Erro ao remover foto", "error");
    }
  } catch (error) {
    console.error("Erro ao remover foto:", error);
    showMessage("Erro de conexão", "error");
  }
}

// Função para validar campos antes de salvar
function validateForm() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  const errors = [];

  if (!name || name.length < 2) {
    errors.push("Nome deve ter pelo menos 2 caracteres");
  }

  if (!email) {
    errors.push("Email é obrigatório");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email inválido");
  }

  if (phone && phone.length > 0) {
    // Validação básica para telefone brasileiro
    const phoneRegex =
      /^(\+55\s?)?(\(?[1-9]{2}\)?\s?)?9?[0-9]{4}[-\s]?[0-9]{4}$/;
    if (!phoneRegex.test(phone)) {
      errors.push("Formato de telefone inválido");
    }
  }

  return errors;
}

// Função para sincronizar dados periodicamente
async function syncUserData() {
  try {
    if (window.apiConfig && navigator.onLine) {
      await loadUserDataFromAPI();
    }
  } catch (error) {
    console.log("Erro na sincronização automática:", error);
  }
}

// Configurar sincronização automática a cada 5 minutos
setInterval(syncUserData, 5 * 60 * 1000);

// Eventos de conectividade
window.addEventListener("online", () => {
  console.log("Reconectado à internet");
  syncUserData();
});

window.addEventListener("offline", () => {
  console.log("Desconectado da internet");
  showMessage(
    "Modo offline. Algumas funcionalidades podem estar limitadas.",
    "error"
  );
});

// Exportar funções para uso global se necessário
window.editProfileFunctions = {
  saveProfile,
  uploadPhotoOnly,
  removeProfilePhoto,
  loadUserProfile,
  loadUserDataFromAPI,
  showMessage,
  validateForm,
  syncUserData,
};
