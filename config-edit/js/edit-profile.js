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

// Função para atualizar a exibição da foto de perfil
function updateProfilePhotoDisplay(photoUrl) {
  const profileImage = document.getElementById("profile-image");
  if (!profileImage) return;

  if (photoUrl) {
    let imageUrl = photoUrl;

    // Se a URL não começar com http/https, adicionar baseURL
    if (
      !photoUrl.startsWith("http") &&
      window.apiConfig &&
      window.apiConfig.baseURL
    ) {
      imageUrl = window.apiConfig.baseURL + photoUrl;
    }

    // Adicionar timestamp para evitar cache
    const urlWithTimestamp = imageUrl.includes("?")
      ? `${imageUrl}&t=${Date.now()}`
      : `${imageUrl}?t=${Date.now()}`;

    profileImage.src = urlWithTimestamp;

    // Efeito visual de atualização
    profileImage.style.opacity = "0.7";
    setTimeout(() => {
      profileImage.style.opacity = "1";
    }, 300);

    // Fallback em caso de erro
    profileImage.onerror = function () {
      console.log("Erro ao carregar imagem:", urlWithTimestamp);
      this.src = "https://placehold.co/120x120/00d4ff/ffffff?text=User";
    };
  } else {
    // Se não há foto, usar placeholder
    profileImage.src = "https://placehold.co/120x120/00d4ff/ffffff?text=User";
  }
}

// 🔧 FUNÇÃO CORRIGIDA: Limpar dados do usuário anterior
function clearUserData() {
  console.log("🧹 Limpando dados do usuário anterior...");

  // Limpar formulário
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const profileImage = document.getElementById("profile-image");

  if (nameInput) nameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (phoneInput) phoneInput.value = "";

  // Limpar foto para placeholder
  if (profileImage) {
    profileImage.src = "https://placehold.co/120x120/00d4ff/ffffff?text=User";
  }

  // Limpar dados originais
  originalFormData = {};
}

// 🔧 FUNÇÃO MELHORADA: Carregar dados da API com limpeza prévia
async function loadUserDataFromAPI() {
  try {
    console.log("🔄 PRIORIDADE: Carregando dados da API...");

    // Verificar se Auth está disponível
    if (typeof Auth === "undefined" || !Auth.getToken()) {
      console.error(
        "⚠ Sistema de autenticação não disponível ou token ausente"
      );
      showMessage("Sessão expirada. Redirecionando...", "error");
      setTimeout(() => {
        window.location.href = "../../login/html/login.html";
      }, 2000);
      return;
    }

    // 🔧 CRÍTICO: Sempre limpar dados anteriores ANTES de carregar novos
    clearUserData();

    // Usar Auth para buscar dados atualizados do usuário atual
    const userData = await Auth.getProfile();

    if (userData) {
      console.log("✅ Dados atualizados recebidos da API:", userData);

      // Preencher formulário com dados do usuário correto
      populateFormWithData(userData);

      // Definir dados originais para comparação
      setOriginalFormData({
        name: userData.name || userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        hasNewPhoto: false,
      });

      // 🔧 CRÍTICO: Atualizar localStorage apenas com dados do usuário atual
      localStorage.setItem("userData", JSON.stringify(userData));

      showMessage("Dados carregados com sucesso", "success");
    } else {
      throw new Error("Dados não recebidos da API");
    }
  } catch (error) {
    console.error("⚠ Erro ao carregar dados da API:", error);

    if (error.message.includes("401") || error.message.includes("Token")) {
      showMessage("Sessão expirada. Redirecionando...", "error");
      setTimeout(() => {
        window.location.href = "../../login/html/login.html";
      }, 2000);
      return;
    }

    // Fallback: usar dados locais apenas se API falhar
    console.log("⚠️ Usando dados locais como fallback...");
    loadUserProfileFromLocalStorage();
    showMessage(
      "Carregado do cache local. Algumas informações podem estar desatualizadas.",
      "error"
    );
  }
}

// Função para preencher formulário com dados específicos
function populateFormWithData(userData) {
  console.log("📝 Preenchendo formulário com dados:", userData);

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  if (nameInput) nameInput.value = userData.name || userData.fullName || "";
  if (emailInput) emailInput.value = userData.email || "";
  if (phoneInput) phoneInput.value = userData.phone || "";

  // Atualizar foto de perfil
  if (userData.profilePhotoUrl) {
    updateProfilePhotoDisplay(userData.profilePhotoUrl);
  } else if (userData.avatar) {
    updateProfilePhotoDisplay(userData.avatar);
  } else {
    const profileImage = document.getElementById("profile-image");
    if (profileImage) {
      profileImage.src = "https://placehold.co/120x120/00d4ff/ffffff?text=User";
    }
  }
}

// Função renomeada: Carregar do localStorage apenas como fallback
function loadUserProfileFromLocalStorage() {
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (userData) {
    console.log("📁 Carregando dados locais como fallback:", userData);
    populateFormWithData(userData);
    setOriginalFormData({
      name: userData.name || userData.fullName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      hasNewPhoto: false,
    });
  } else {
    console.log("⚠ Nenhum dado local encontrado");
    showMessage("Nenhum dado encontrado. Faça login novamente.", "error");
    setTimeout(() => {
      window.location.href = "../../login/html/login.html";
    }, 2000);
  }
}

// Função depreciada: Manter apenas para compatibilidade
function loadUserProfile() {
  console.warn("⚠️ loadUserProfile() é deprecated. Use loadUserDataFromAPI()");
  loadUserProfileFromLocalStorage();
}

// 🔧 FUNÇÃO CRÍTICA CORRIGIDA: Salvar perfil apenas com dados do usuário atual
async function saveProfile() {
  try {
    // Verificar autenticação
    if (typeof Auth === "undefined" || !Auth.getToken()) {
      showMessage("Sessão expirada. Faça login novamente.", "error");
      return;
    }

    // 🔧 VALIDAÇÃO: Verificar se os dados pertencem ao usuário atual
    const currentUserData = Auth.getUserData();
    if (!currentUserData || !currentUserData.id) {
      showMessage("Dados de usuário inválidos. Faça login novamente.", "error");
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

    // 🔧 VALIDAÇÃO CRÍTICA: Verificar se o email pertence ao usuário atual
    if (email && email.toLowerCase() !== currentUserData.email.toLowerCase()) {
      showMessage(
        "Não é possível alterar o email para outro usuário.",
        "error"
      );
      return;
    }

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

    // Preparar dados para atualização
    const profileData = {
      name,
      email,
      phone,
    };

    // Verificar se há nova foto
    const photoInput = document.getElementById("photo-input");
    if (photoInput && photoInput.files && photoInput.files[0]) {
      const file = photoInput.files[0];

      if (!file.type.startsWith("image/")) {
        showMessage("Por favor, selecione apenas arquivos de imagem", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showMessage("A imagem deve ter menos de 5MB", "error");
        return;
      }

      // 🔧 CORREÇÃO: Usar FormData quando há arquivo
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("profilePhoto", file);

      // Usar apiConfig diretamente para FormData
      const response = await window.apiConfig.put("/api/profile", formData);
      const result = await response.json();

      if (response.ok && result.success) {
        await handleSuccessfulUpdate(result.user);
        photoInput.value = "";
      } else {
        throw new Error(result.message || "Erro ao salvar perfil");
      }
    } else {
      // 🔧 CORREÇÃO: Usar Auth.updateProfile para dados sem foto
      const result = await Auth.updateProfile(profileData);

      if (result.success) {
        await handleSuccessfulUpdate(result.data);
      } else {
        throw new Error(result.message || "Erro ao salvar perfil");
      }
    }
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);

    if (error.message.includes("401") || error.message.includes("Token")) {
      showMessage("Sessão expirada. Faça login novamente.", "error");
      setTimeout(() => {
        window.location.href = "../../login/html/login.html";
      }, 2000);
    } else if (error.message.includes("413")) {
      showMessage("Arquivo muito grande. Máximo 5MB.", "error");
    } else if (error.message.includes("400")) {
      showMessage("Dados inválidos. Verifique as informações.", "error");
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      showMessage("Erro de conexão. Verifique sua internet.", "error");
    } else {
      showMessage(
        error.message || "Erro inesperado. Tente novamente.",
        "error"
      );
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

// Função para tratar atualização bem-sucedida
async function handleSuccessfulUpdate(updatedUserData) {
  // Atualizar localStorage com dados corretos
  localStorage.setItem("userData", JSON.stringify(updatedUserData));

  // Atualizar exibição
  updateProfilePhotoDisplay(
    updatedUserData.profilePhotoUrl || updatedUserData.avatar
  );

  // Sincronização: Usar Auth para atualizar dados globalmente
  if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
    const photoUrl = updatedUserData.profilePhotoUrl || updatedUserData.avatar;
    if (photoUrl) {
      Auth.updateProfilePhoto(photoUrl);
    }
  }

  // Disparar eventos para sincronização
  window.dispatchEvent(
    new CustomEvent("userDataUpdated", {
      detail: { userData: updatedUserData },
    })
  );

  if (updatedUserData.profilePhotoUrl) {
    window.dispatchEvent(
      new CustomEvent("profilePhotoUpdated", {
        detail: { photoUrl: updatedUserData.profilePhotoUrl },
      })
    );
  }

  // Atualizar dados originais
  setOriginalFormData(getCurrentFormData());

  showMessage("Perfil salvo com sucesso!", "success");
}

// 🔧 NOVA FUNÇÃO: Upload APENAS da foto (separado dos dados pessoais)
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

    // 🔧 CRÍTICO: Usar endpoint específico apenas para foto
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

      // Usar Auth para sincronizar globalmente
      if (result.user && result.user.profilePhotoUrl) {
        localStorage.setItem("userData", JSON.stringify(result.user));

        if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
          Auth.updateProfilePhoto(result.user.profilePhotoUrl);
        }
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

// 🔧 CORREÇÃO CRÍTICA: Inicialização da página com limpeza
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 DOM carregado, iniciando carregamento do perfil...");

  // 🔧 CRÍTICO: Sempre limpar dados anteriores ao carregar página
  clearUserData();

  // PRIORIDADE: Sempre carregar da API primeiro
  try {
    await loadUserDataFromAPI();
  } catch (error) {
    console.error("⚠ Falha crítica no carregamento:", error);
  }

  // Configurar funcionalidades da página
  setupChangeDetection();
  setupKeyboardShortcuts();
  setupPhotoPreview();
});

// Voltar para configurações
const goBack = document.getElementById("go-back");
if (goBack) {
  goBack.addEventListener("click", (e) => {
    e.preventDefault();

    if (hasUnsavedChanges()) {
      showUnsavedChangesModal();
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

// Função para remover foto de perfil
function showRemovePhotoModal() {
  const modal = document.getElementById("remove-photo-modal");
  if (modal) {
    modal.classList.add("show");

    // Adicionar evento para fechar com ESC
    document.addEventListener("keydown", handleModalEscape);

    // Focar no botão cancelar para melhor acessibilidade
    setTimeout(() => {
      const cancelBtn = modal.querySelector(".modal-btn-cancel");
      if (cancelBtn) {
        cancelBtn.focus();
      }
    }, 100);
  }
}

// Fechar modal de confirmação
function closeRemovePhotoModal() {
  const modal = document.getElementById("remove-photo-modal");
  if (modal) {
    modal.classList.remove("show");

    // Remover listener do ESC
    document.removeEventListener("keydown", handleModalEscape);
  }
}

// Confirmar remoção da foto
async function confirmRemovePhoto() {
  // Fechar modal primeiro
  closeRemovePhotoModal();

  // Executar a remoção
  await removeProfilePhotoWithoutConfirm();
}

// Função para lidar com tecla ESC na modal
function handleModalEscape(event) {
  if (event.key === "Escape") {
    closeRemovePhotoModal();
  }
}

// Fechar modal clicando fora dela
document.addEventListener("click", function (event) {
  const modal = document.getElementById("remove-photo-modal");
  if (modal && event.target === modal) {
    closeRemovePhotoModal();
  }
});

// ===== Modal "Alterações não salvas" =====
function showUnsavedChangesModal() {
  const modal = document.getElementById("unsaved-modal");
  if (modal) {
    modal.classList.add("show");
    document.addEventListener("keydown", handleUnsavedModalEscape);
    // Acessibilidade: focar o botão cancelar
    setTimeout(() => {
      modal.querySelector(".modal-btn-cancel")?.focus();
    }, 100);
  }
}

function closeUnsavedChangesModal() {
  const modal = document.getElementById("unsaved-modal");
  if (modal) {
    modal.classList.remove("show");
    document.removeEventListener("keydown", handleUnsavedModalEscape);
  }
}

function confirmLeaveWithUnsavedChanges() {
  closeUnsavedChangesModal();
  navigateBack();
}

function handleUnsavedModalEscape(event) {
  if (event.key === "Escape") {
    closeUnsavedChangesModal();
  }
}

// Fechar a modal clicando fora
document.addEventListener("click", function (event) {
  const modal = document.getElementById("unsaved-modal");
  if (modal && event.target === modal) {
    closeUnsavedChangesModal();
  }
});

// Versão da função removeProfilePhoto sem o confirm (para usar na modal)
async function removeProfilePhotoWithoutConfirm() {
  try {
    // Mostrar loading no botão de remoção
    const removeBtn = document.querySelector(".remove-photo-btn");
    if (removeBtn) {
      removeBtn.disabled = true;
      removeBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Removendo...';
    }

    const response = await window.apiConfig.delete("/api/profile/photo");
    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Foto removida com sucesso!", "success");

      // Atualizar imagem para placeholder
      const profileImage = document.getElementById("profile-image");
      if (profileImage) {
        profileImage.src =
          "https://placehold.co/120x120/00d4ff/ffffff?text=User";

        // Efeito visual de remoção
        profileImage.style.opacity = "0.5";
        setTimeout(() => {
          profileImage.style.opacity = "1";
        }, 300);
      }

      // Atualizar localStorage
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      userData.profilePhotoUrl = null;
      localStorage.setItem("userData", JSON.stringify(userData));

      // Usar Auth para sincronizar
      if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
        Auth.updateProfilePhoto(null);
      }

      // Limpar input de arquivo
      const photoInput = document.getElementById("photo-input");
      if (photoInput) {
        photoInput.value = "";
      }

      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent("profilePhotoRemoved"));
    } else {
      showMessage(result.message || "Erro ao remover foto", "error");
    }
  } catch (error) {
    console.error("Erro ao remover foto:", error);
    showMessage("Erro de conexão", "error");
  } finally {
    // Restaurar botão
    const removeBtn = document.querySelector(".remove-photo-btn");
    if (removeBtn) {
      removeBtn.disabled = false;
      removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remover Foto';
    }
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

// 🔧 NOVA FUNÇÃO: Sincronizar dados periodicamente apenas se não houver mudanças
async function syncUserDataSafe() {
  try {
    // Só sincronizar se não há mudanças não salvas
    if (
      !hasUnsavedChanges() &&
      typeof Auth !== "undefined" &&
      navigator.onLine
    ) {
      console.log("🔄 Sincronização automática segura...");
      await loadUserDataFromAPI();
    }
  } catch (error) {
    console.log("⚠️ Erro na sincronização automática:", error);
  }
}

// Configurar sincronização automática a cada 5 minutos (mais segura)
setInterval(syncUserDataSafe, 5 * 60 * 1000);

// Eventos de conectividade
window.addEventListener("online", () => {
  console.log("🌐 Reconectado à internet");
  // Sincronizar apenas se não há mudanças pendentes
  if (!hasUnsavedChanges()) {
    syncUserDataSafe();
  }
});

window.addEventListener("offline", () => {
  console.log("📵 Desconectado da internet");
  showMessage(
    "Modo offline. Algumas funcionalidades podem estar limitadas.",
    "error"
  );
});

// 🔧 NOVA FUNÇÃO: Forçar recarregamento completo dos dados
async function forceReloadUserData() {
  console.log("🔄 Recarregamento forçado dos dados...");
  clearUserData();
  await loadUserDataFromAPI();
}

// 🔧 LISTENER GLOBAL: Detectar mudanças de usuário
window.addEventListener("storage", function (e) {
  // Se o token mudou, significa que houve login/logout
  if (e.key === "authToken" || e.key === "userData") {
    console.log("👤 Mudança de usuário detectada, recarregando dados...");
    setTimeout(() => {
      forceReloadUserData();
    }, 100);
  }
});

// Exportar funções para uso global se necessário
window.editProfileFunctions = {
  saveProfile,
  uploadPhotoOnly,
  loadUserDataFromAPI,
  loadUserProfileFromLocalStorage,
  forceReloadUserData,
  showMessage,
  validateForm,
  syncUserDataSafe,
  clearUserData,
};
