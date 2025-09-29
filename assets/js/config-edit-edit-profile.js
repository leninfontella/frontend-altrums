// Função para mostrar mensagens
function showMessage(message, type = "success") {
  const messageBox = document.getElementById("message-box");
  if (!messageBox) {
    console.log(`Mensagem (${type}):`, message);
    return;
  }

  messageBox.textContent = message;
  messageBox.className = `success-message ${
    type === "error" ? "error" : ""
  } show`;

  setTimeout(() => {
    messageBox.classList.remove("show");
  }, 3000);
}

// Detectar dispositivos móveis
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Gerar URL do placeholder com iniciais
function getInitialsPlaceholderUrl(userName) {
  const nameToPass = userName && typeof userName === "string" ? userName : "";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nameToPass
  )}&background=00d4ff&color=fff&size=120`;
}

// Atualizar foto de perfil (versão simplificada e confiável)
function updateProfilePhotoDisplay(photoUrl, forceRefresh = false) {
  const profileImage = document.getElementById("profile-image");
  if (!profileImage) return;

  console.log("Atualizando foto de perfil:", photoUrl);

  if (photoUrl) {
    let imageUrl = photoUrl;

    // Construir URL completa se necessário
    if (!photoUrl.startsWith("http") && window.apiConfig?.baseURL) {
      imageUrl = window.apiConfig.baseURL + photoUrl;
    }

    // Cache busting APENAS quando forceRefresh for true
    if (forceRefresh) {
      const separator = imageUrl.includes("?") ? "&" : "?";
      imageUrl = `${imageUrl}${separator}t=${Date.now()}`;
    }

    profileImage.src = imageUrl;

    // Efeito visual simples
    profileImage.style.opacity = "0.8";
    setTimeout(() => {
      profileImage.style.opacity = "1";
    }, 200);

    // Fallback em caso de erro
    profileImage.onerror = function () {
      console.log("Erro ao carregar imagem, usando placeholder");
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      this.src = getInitialsPlaceholderUrl(
        userData.name || userData.fullName || ""
      );
    };
  } else {
    // Usar placeholder
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    profileImage.src = getInitialsPlaceholderUrl(
      userData.name || userData.fullName || ""
    );
  }
}

// Limpar dados do usuário anterior
function clearUserData() {
  console.log("Limpando dados do usuário anterior...");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const profileImage = document.getElementById("profile-image");

  if (nameInput) nameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (phoneInput) phoneInput.value = "";
  if (profileImage) {
    profileImage.src = getInitialsPlaceholderUrl("");
  }

  originalFormData = {};
}

// Carregar dados da API (versão simplificada)
async function loadUserDataFromAPI() {
  try {
    console.log("Carregando dados da API...");

    if (typeof Auth === "undefined" || !Auth.getToken()) {
      console.error("Sistema de autenticação não disponível");
      showMessage("Sessão expirada. Redirecionando...", "error");
      setTimeout(() => (window.location.href = "/index.html"), 2000);
      return;
    }

    clearUserData();
    const userData = await Auth.getProfile();

    if (userData) {
      console.log("Dados recebidos da API:", userData);
      populateFormWithData(userData);
      setOriginalFormData({
        name: userData.name || userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        hasNewPhoto: false,
      });
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      throw new Error("Dados não recebidos da API");
    }
  } catch (error) {
    console.error("Erro ao carregar dados da API:", error);
    if (error.message.includes("401") || error.message.includes("Token")) {
      showMessage("Sessão expirada. Redirecionando...", "error");
      setTimeout(() => (window.location.href = "/index.html"), 2000);
    } else {
      loadUserProfileFromLocalStorage();
      showMessage(
        "Carregado do cache local. Dados podem estar desatualizados.",
        "error"
      );
    }
  }
}

// Preencher formulário
function populateFormWithData(userData) {
  console.log("Preenchendo formulário:", userData);

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  if (nameInput) nameInput.value = userData.name || userData.fullName || "";
  if (emailInput) emailInput.value = userData.email || "";
  if (phoneInput) phoneInput.value = userData.phone || "";

  // Atualizar foto de perfil
  const photoUrl = userData.profilePhotoUrl || userData.avatar;
  if (photoUrl) {
    updateProfilePhotoDisplay(photoUrl, false);
  } else {
    updateProfilePhotoDisplay(null);
  }
}

// Carregar do localStorage (fallback)
function loadUserProfileFromLocalStorage() {
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (userData) {
    console.log("Carregando dados locais:", userData);
    populateFormWithData(userData);
    setOriginalFormData({
      name: userData.name || userData.fullName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      hasNewPhoto: false,
    });
  } else {
    showMessage("Nenhum dado encontrado. Faça login novamente.", "error");
    setTimeout(() => (window.location.href = "/index.html"), 2000);
  }
}

// Salvar perfil (versão simplificada e mais confiável)
async function saveProfile() {
  try {
    if (typeof Auth === "undefined" || !Auth.getToken()) {
      showMessage("Sessão expirada. Faça login novamente.", "error");
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

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    // Validações básicas
    if (!name) {
      showMessage("Nome é obrigatório", "error");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("Email válido é obrigatório", "error");
      return;
    }

    const profileData = { name, email, phone };
    const photoInput = document.getElementById("photo-input");

    if (photoInput?.files?.[0]) {
      const file = photoInput.files[0];

      if (!file.type.startsWith("image/")) {
        showMessage("Selecione apenas arquivos de imagem", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showMessage("A imagem deve ter menos de 5MB", "error");
        return;
      }

      // Upload com FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("profilePhoto", file);

      // Usar apiConfig padrão sem modificações
      const response = await fetch(`${window.apiConfig.baseURL}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await handleSuccessfulUpdate(result.user);
        photoInput.value = "";
      } else {
        throw new Error(result.message || "Erro ao salvar perfil");
      }
    } else {
      // Sem foto - usar Auth diretamente
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
      setTimeout(() => (window.location.href = "/index.html"), 2000);
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

// Tratar atualização bem-sucedida (versão simplificada)
async function handleSuccessfulUpdate(updatedUserData) {
  console.log("Atualização bem-sucedida:", updatedUserData);

  localStorage.setItem("userData", JSON.stringify(updatedUserData));

  // Atualizar foto com cache busting APENAS se há nova foto
  const hasNewPhoto = document.getElementById("photo-input")?.files?.length > 0;
  updateProfilePhotoDisplay(
    updatedUserData.profilePhotoUrl || updatedUserData.avatar,
    hasNewPhoto
  );

  // Sincronização via Auth
  if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
    const photoUrl = updatedUserData.profilePhotoUrl || updatedUserData.avatar;
    if (photoUrl) {
      Auth.updateProfilePhoto(photoUrl);
    }
  }

  // Atualizar UserService se disponível
  if (window.userService) {
    window.userService.updateUserData(updatedUserData);
  }

  // Disparar eventos
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

  setOriginalFormData(getCurrentFormData());
  showMessage("Perfil salvo com sucesso!", "success");
}

// Upload APENAS da foto (versão simplificada)
async function uploadPhotoOnly() {
  const photoInput = document.getElementById("photo-input");

  if (!photoInput?.files?.[0]) {
    showMessage("Selecione uma foto primeiro", "error");
    return;
  }

  try {
    const file = photoInput.files[0];

    if (!file.type.startsWith("image/")) {
      showMessage("Selecione apenas arquivos de imagem", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("A imagem deve ter menos de 5MB", "error");
      return;
    }

    const uploadBtn = document.querySelector(".upload-photo-btn");
    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }

    const formData = new FormData();
    formData.append("profilePhoto", file);

    // Usar fetch padrão para maior confiabilidade
    const response = await fetch(
      `${window.apiConfig.baseURL}/api/profile/upload-photo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Foto atualizada com sucesso!", "success");

      if (result.user) {
        localStorage.setItem("userData", JSON.stringify(result.user));
        updateProfilePhotoDisplay(result.user.profilePhotoUrl, true);

        // Sincronização
        if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
          Auth.updateProfilePhoto(result.user.profilePhotoUrl);
        }

        if (window.userService) {
          window.userService.updateUserData(result.user);
        }

        // Evento
        window.dispatchEvent(
          new CustomEvent("profilePhotoUpdated", {
            detail: { photoUrl: result.user.profilePhotoUrl },
          })
        );
      }

      photoInput.value = "";
    } else {
      throw new Error(result.message || "Erro ao atualizar foto");
    }
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    showMessage("Erro ao enviar foto. Tente novamente.", "error");
  } finally {
    const uploadBtn = document.querySelector(".upload-photo-btn");
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Enviar Foto';
    }
  }
}

// Remover foto de perfil (versão simplificada)
async function removeProfilePhotoWithoutConfirm() {
  try {
    const removeBtn = document.querySelector(".remove-photo-btn");
    if (removeBtn) {
      removeBtn.disabled = true;
      removeBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Removendo...';
    }

    // Usar fetch padrão
    const response = await fetch(
      `${window.apiConfig.baseURL}/api/profile/photo`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Foto removida com sucesso!", "success");

      // Atualizar para placeholder
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      userData.profilePhotoUrl = null;
      localStorage.setItem("userData", JSON.stringify(userData));

      updateProfilePhotoDisplay(null);

      // Sincronização
      if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
        Auth.updateProfilePhoto(null);
      }

      if (window.userService) {
        window.userService.updateProfilePhoto(null);
      }

      // Limpar input
      const photoInput = document.getElementById("photo-input");
      if (photoInput) {
        photoInput.value = "";
      }

      // Evento
      window.dispatchEvent(new CustomEvent("profilePhotoRemoved"));
    } else {
      throw new Error(result.message || "Erro ao remover foto");
    }
  } catch (error) {
    console.error("Erro ao remover foto:", error);
    showMessage("Erro ao remover foto. Tente novamente.", "error");
  } finally {
    const removeBtn = document.querySelector(".remove-photo-btn");
    if (removeBtn) {
      removeBtn.disabled = false;
      removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remover Foto';
    }
  }
}

// Inicialização da página
document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOM carregado, iniciando carregamento do perfil...");

  clearUserData();

  try {
    await loadUserDataFromAPI();
  } catch (error) {
    console.error("Falha no carregamento:", error);
  }

  setupChangeDetection();
  setupKeyboardShortcuts();
  setupPhotoPreview();
});

// Configurar pré-visualização da imagem
function setupPhotoPreview() {
  const photoInput = document.getElementById("photo-input");
  const profileImage = document.getElementById("profile-image");

  if (!photoInput || !profileImage) return;

  photoInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Selecione apenas imagens", "error");
      photoInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("A imagem deve ter menos de 5MB", "error");
      photoInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      profileImage.src = e.target.result;
      profileImage.style.opacity = "0.8";
      setTimeout(() => {
        profileImage.style.opacity = "1";
      }, 200);
    };
    reader.readAsDataURL(file);
  });
}

// Funções auxiliares
function setupChangeDetection() {
  const inputs = document.querySelectorAll("#name, #email, #phone");
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.add("changed");
    });
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveProfile();
    }
    if (e.key === "Escape") {
      const goBackButton = document.getElementById("go-back");
      if (goBackButton) {
        goBackButton.click();
      }
    }
  });
}

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

// Navegação
function navigateBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "../../configuracao/html/index.html";
  }
}

// Modal handlers
function showRemovePhotoModal() {
  const modal = document.getElementById("remove-photo-modal");
  if (modal) {
    modal.classList.add("show");
  }
}

function closeRemovePhotoModal() {
  const modal = document.getElementById("remove-photo-modal");
  if (modal) {
    modal.classList.remove("show");
  }
}

function confirmRemovePhoto() {
  closeRemovePhotoModal();
  removeProfilePhotoWithoutConfirm();
}

function showUnsavedChangesModal() {
  const modal = document.getElementById("unsaved-modal");
  if (modal) {
    modal.classList.add("show");
  }
}

function closeUnsavedChangesModal() {
  const modal = document.getElementById("unsaved-modal");
  if (modal) {
    modal.classList.remove("show");
  }
}

function confirmLeaveWithUnsavedChanges() {
  closeUnsavedChangesModal();
  navigateBack();
}

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

// Event handlers para modals
document.addEventListener("click", function (event) {
  const removeModal = document.getElementById("remove-photo-modal");
  const unsavedModal = document.getElementById("unsaved-modal");

  if (removeModal && event.target === removeModal) {
    closeRemovePhotoModal();
  }
  if (unsavedModal && event.target === unsavedModal) {
    closeUnsavedChangesModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeRemovePhotoModal();
    closeUnsavedChangesModal();
  }
});

// Exportar funções para uso global
window.editProfileFunctions = {
  saveProfile,
  uploadPhotoOnly,
  loadUserDataFromAPI,
  loadUserProfileFromLocalStorage,
  showMessage,
  isMobileDevice,
};
