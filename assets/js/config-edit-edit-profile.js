// edit-profile.js - VERSÃO CORRIGIDA PARA TELEFONE COM MÁSCARA

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

// 🔧 NOVA FUNÇÃO: Limpar máscara do telefone
function cleanPhoneNumber(phone) {
  if (!phone) return "";
  // Remove tudo exceto números
  return phone.replace(/\D/g, "");
}

// 🔧 NOVA FUNÇÃO: Aplicar máscara ao telefone
function applyPhoneMask(phone) {
  if (!phone) return "";

  const cleaned = cleanPhoneNumber(phone);

  if (cleaned.length > 10) {
    // Celular: (99) 99999-9999
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (cleaned.length > 6) {
    // Telefone fixo: (99) 9999-9999
    return cleaned.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (cleaned.length > 2) {
    return cleaned.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else if (cleaned.length > 0) {
    return cleaned.replace(/^(\d*)/, "($1");
  }

  return "";
}

// Função para gerar URL do placeholder com iniciais
function getInitialsPlaceholderUrl(userName) {
  const nameToPass = userName && typeof userName === "string" ? userName : "";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nameToPass
  )}&background=00d4ff&color=fff&size=120`;
}

// NOVA FUNÇÃO: Forçar refresh de TODAS as imagens (Mobile-friendly)
function forceRefreshAllProfileImages(photoUrl) {
  console.log("Forcando refresh TOTAL de imagens de perfil");

  if (!photoUrl) {
    const userData = JSON.parse(localStorage.getItem("userData"));
    photoUrl = userData?.profilePhotoUrl || userData?.avatar;
  }

  if (!photoUrl) return;

  let fullUrl = photoUrl;
  if (
    !photoUrl.startsWith("http") &&
    window.apiConfig &&
    window.apiConfig.baseURL
  ) {
    fullUrl = window.apiConfig.baseURL + photoUrl;
  }

  const timestamp = Date.now();
  const cacheBustedUrl = `${fullUrl}${
    fullUrl.includes("?") ? "&" : "?"
  }t=${timestamp}&mobile=1&v=${Math.random()}`;

  console.log("URL com cache busting:", cacheBustedUrl);

  const selectors = [
    "[data-user-photo]",
    ".profile-image",
    ".user-avatar",
    ".profile-avatar",
    "#profile-image",
    ".user-profile-image",
    "img[alt*='perfil']",
    "img[alt*='profile']",
    "img[alt*='avatar']",
    "img[src*='profile']",
    "img[src*='avatar']",
  ];

  let updatedCount = 0;

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.tagName === "IMG") {
        element.src = cacheBustedUrl;
        element.style.opacity = "0.7";
        setTimeout(() => {
          element.style.opacity = "1";
        }, 150);
        updatedCount++;
      } else if (element.style) {
        element.style.backgroundImage = `url(${cacheBustedUrl})`;
        updatedCount++;
      }
    });
  });

  console.log(`${updatedCount} elementos de imagem atualizados`);
}

function updateProfilePhotoDisplay(photoUrl) {
  const profileImage = document.getElementById("profile-image");
  if (!profileImage) return;

  if (photoUrl) {
    let imageUrl = photoUrl;

    if (
      !photoUrl.startsWith("http") &&
      window.apiConfig &&
      window.apiConfig.baseURL
    ) {
      imageUrl = window.apiConfig.baseURL + photoUrl;
    }

    profileImage.src = imageUrl;
    profileImage.style.opacity = "0.7";
    setTimeout(() => {
      profileImage.style.opacity = "1";
    }, 300);

    profileImage.onerror = function () {
      console.log("Erro ao carregar imagem:", imageUrl);
      this.src = getInitialsPlaceholderUrl("");
    };
  } else {
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    profileImage.src = getInitialsPlaceholderUrl(
      userData.name || userData.fullName
    );
  }
}

function updateProfilePhotoDisplayFixed(photoUrl, forceRefresh = false) {
  const profileImage = document.getElementById("profile-image");
  if (!profileImage) return;

  // 🚨 CORREÇÃO CRÍTICA: Previne o loop e o erro ao detectar URL inválida.
  // Se photoUrl tiver o caractere de emoji inválido (ou não for string),
  // trate-o como se fosse nulo/vazio para forçar o placeholder.
  if (photoUrl && (typeof photoUrl !== "string" || photoUrl.includes("👤"))) {
    photoUrl = null;
    console.warn(
      "⚠️ URL de foto de perfil inválida detectada e resetada para null. Usando placeholder."
    );
  }

  if (photoUrl) {
    let imageUrl = photoUrl;

    if (
      !photoUrl.startsWith("http") &&
      window.apiConfig &&
      window.apiConfig.baseURL
    ) {
      imageUrl = window.apiConfig.baseURL + photoUrl;
    }

    if (forceRefresh) {
      const separator = imageUrl.includes("?") ? "&" : "?";
      imageUrl = `${imageUrl}${separator}t=${Date.now()}&mobile=1`;
      console.log("Cache busting aplicado:", imageUrl);
    }

    profileImage.src = imageUrl;
    profileImage.style.opacity = "0.7";
    setTimeout(() => {
      profileImage.style.opacity = "1";
    }, 300);

    profileImage.onerror = function () {
      console.warn("Erro ao carregar:", imageUrl);

      if (forceRefresh && imageUrl.includes("?t=")) {
        const cleanUrl = imageUrl.split("?t=")[0];
        console.log("Tentando sem cache bust:", cleanUrl);
        // Tenta novamente sem cache-buster, o que deve levar ao fallback final na segunda falha
        this.src = cleanUrl;
        return;
      }

      // Fallback final para o placeholder de iniciais
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      const userName = userData.name || userData.fullName || "";
      this.src = getInitialsPlaceholderUrl(userName);
    };
  } else {
    // Bloco original para carregar o placeholder quando photoUrl é null ou ""
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    const userName = userData.name || userData.fullName || "";
    profileImage.src = getInitialsPlaceholderUrl(userName);
  }
}

function clearUserData() {
  console.log("Limpando dados do usuario anterior...");

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

async function loadUserDataFromAPI() {
  try {
    console.log("PRIORIDADE: Carregando dados da API...");

    if (typeof Auth === "undefined" || !Auth.getToken()) {
      console.error("Sistema de autenticacao nao disponivel ou token ausente");
      showMessage("Sessao expirada. Redirecionando...", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
      return;
    }

    clearUserData();

    const userData = await Auth.getProfile();

    if (userData) {
      console.log("Dados atualizados recebidos da API:", userData);

      populateFormWithData(userData);

      // 🔧 CORREÇÃO: Salvar telefone LIMPO no originalFormData
      setOriginalFormData({
        name: userData.name || userData.fullName || "",
        email: userData.email || "",
        phone: cleanPhoneNumber(userData.phone || ""), // ✅ Limpar máscara
        hasNewPhoto: false,
      });

      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      throw new Error("Dados nao recebidos da API");
    }
  } catch (error) {
    console.error("Erro ao carregar dados da API:", error);

    if (error.message.includes("401") || error.message.includes("Token")) {
      showMessage("Sessao expirada. Redirecionando...", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
      return;
    }

    console.log("Usando dados locais como fallback...");
    loadUserProfileFromLocalStorage();
    showMessage(
      "Carregado do cache local. Algumas informacoes podem estar desatualizadas.",
      "error"
    );
  }
}

function populateFormWithData(userData) {
  console.log("Preenchendo formulario com dados:", userData);

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const profileImage = document.getElementById("profile-image");

  if (nameInput) nameInput.value = userData.name || userData.fullName || "";
  if (emailInput) emailInput.value = userData.email || "";

  // 🔧 CORREÇÃO: Aplicar máscara ao preencher
  if (phoneInput) {
    const cleanPhone = cleanPhoneNumber(userData.phone || "");
    phoneInput.value = applyPhoneMask(cleanPhone);
  }

  if (profileImage) {
    const photoUrl = userData.profilePhotoUrl || userData.avatar;
    if (photoUrl) {
      updateProfilePhotoDisplayFixed(photoUrl, false);
    } else {
      profileImage.src = getInitialsPlaceholderUrl(
        userData.name || userData.fullName
      );
    }
  }
}

function loadUserProfileFromLocalStorage() {
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (userData) {
    console.log("Carregando dados locais como fallback:", userData);
    populateFormWithData(userData);

    // 🔧 CORREÇÃO: Salvar telefone LIMPO
    setOriginalFormData({
      name: userData.name || userData.fullName || "",
      email: userData.email || "",
      phone: cleanPhoneNumber(userData.phone || ""), // ✅ Limpar máscara
      hasNewPhoto: false,
    });
  } else {
    console.log("Nenhum dado local encontrado");
    showMessage("Nenhum dado encontrado. Faca login novamente.", "error");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 2000);
  }
}

function loadUserProfile() {
  console.warn("loadUserProfile() e deprecated. Use loadUserDataFromAPI()");
  loadUserProfileFromLocalStorage();
}

async function saveProfile() {
  try {
    if (typeof Auth === "undefined" || !Auth.getToken()) {
      showMessage("Sessao expirada. Faca login novamente.", "error");
      return;
    }

    const currentUserData = Auth.getUserData();
    if (!currentUserData || !currentUserData.id) {
      showMessage("Dados de usuario invalidos. Faca login novamente.", "error");
      return;
    }

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
    const phoneRaw = document.getElementById("phone").value.trim();

    // 🔧 CORREÇÃO CRÍTICA: Limpar máscara antes de enviar
    const phone = cleanPhoneNumber(phoneRaw);

    console.log("📞 Telefone capturado:", {
      raw: phoneRaw,
      cleaned: phone,
    });

    if (!name) {
      showMessage("Nome e obrigatorio", "error");
      return;
    }

    if (!email) {
      showMessage("Email e obrigatorio", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("Email invalido", "error");
      return;
    }

    // 🔧 CORREÇÃO: Validar telefone apenas se preenchido
    if (phone && phone.length > 0 && (phone.length < 10 || phone.length > 11)) {
      showMessage("Telefone deve ter 10 ou 11 dígitos", "error");
      return;
    }

    // 🔧 Prepara os dados de texto (JSON) para o PUT /api/profile
    const profileData = {
      name,
      email,
      phone, // ✅ Telefone limpo
    };

    console.log("💾 Dados de texto a serem salvos:", profileData);

    const photoInput = document.getElementById("photo-input");

    // ====================================================================
    // 🚨 CORREÇÃO ESTRUTURAL: SEPARAÇÃO DE REQUISIÇÃO DE FOTO E DADOS DE TEXTO
    // ====================================================================
    if (photoInput && photoInput.files && photoInput.files[0]) {
      const file = photoInput.files[0];

      // Validações de arquivo
      if (!file.type.startsWith("image/")) {
        showMessage("Por favor, selecione apenas arquivos de imagem", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showMessage("A imagem deve ter menos de 5MB", "error");
        return;
      }

      // PASSO 1: FAZER O UPLOAD DA FOTO (POST /api/profile/upload-photo)
      const photoFormData = new FormData();
      // O backend só precisa do arquivo para a rota de upload
      photoFormData.append("profilePhoto", file);

      console.log("📤 Iniciando upload da nova foto...");

      const uploadResponse = await window.apiConfig.post(
        "/api/profile/upload-photo", // Endpoint CORRETO para foto
        photoFormData
      );
      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        // Lança um erro se o upload da foto falhar (o erro 400 anterior será resolvido, mas este pode ser um erro 500)
        throw new Error(
          uploadResult.message ||
            "Erro ao fazer upload para o servidor de armazenamento"
        );
      }

      console.log(
        "✅ Upload de foto concluído. Resultado:",
        uploadResult.message
      );

      // PASSO 2: ATUALIZAR DADOS DO PERFIL (PUT /api/profile)
      // Fazemos o PUT dos dados de texto que não foram incluídos no FormData de upload.
      const updateResult = await Auth.updateProfile(profileData);

      if (updateResult.success) {
        photoInput.value = ""; // Limpa a entrada de arquivo
        await handleSuccessfulUpdate(updateResult.user || updateResult.data);

        // Atualizar o estado local (OriginalFormData)
        setOriginalFormData({
          name: name,
          email: email,
          phone: phone,
          hasNewPhoto: false,
        });
      } else {
        // Lança um erro se a atualização dos dados de texto (PUT) falhar
        throw new Error(
          updateResult.message || "Erro ao salvar dados do perfil"
        );
      }
    } else {
      // Bloco ELSE original: Salvar APENAS dados de texto (SEM foto nova)
      console.log("Salvando perfil SEM foto nova. ProfileData:", profileData);

      const result = await Auth.updateProfile(profileData);

      if (result.success) {
        await handleSuccessfulUpdate(result.user || result.data);

        // Atualizar o estado local (OriginalFormData)
        setOriginalFormData({
          name: name,
          email: email,
          phone: phone, // ✅ Telefone limpo
          hasNewPhoto: false,
        });

        console.log("✅ Perfil salvo com sucesso! Telefone:", phone);
      } else {
        throw new Error(result.message || "Erro ao salvar perfil");
      }
    }
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);

    // Tratamento de erros
    if (error.message.includes("upload para o servidor de armazenamento")) {
      showMessage(
        "Erro ao fazer upload para o servidor de armazenamento. Verifique os logs do Backend.",
        "error"
      );
    } else if (
      error.message.includes("401") ||
      error.message.includes("Token")
    ) {
      showMessage("Sessao expirada. Faca login novamente.", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
    } else if (error.message.includes("413")) {
      showMessage("Arquivo muito grande. Maximo 5MB.", "error");
    } else if (error.message.includes("400")) {
      showMessage("Dados invalidos. Verifique as informacoes.", "error");
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      showMessage("Erro de conexao. Verifique sua internet.", "error");
    } else {
      showMessage(
        error.message || "Erro inesperado. Tente novamente.",
        "error"
      );
    }
  } finally {
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

async function handleSuccessfulUpdate(updatedUserData) {
  try {
    console.log("Iniciando atualizacao bem-sucedida do perfil");
    console.log("Dados recebidos:", updatedUserData);

    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    const newPhotoUrl =
      updatedUserData.profilePhotoUrl || updatedUserData.avatar;
    console.log("Nova foto URL:", newPhotoUrl);

    if (newPhotoUrl) {
      updateProfilePhotoDisplayFixed(newPhotoUrl, true);

      setTimeout(() => {
        forceRefreshAllProfileImages(newPhotoUrl);
      }, 100);
    }

    if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
      Auth.updateProfilePhoto(newPhotoUrl);
    }

    if (window.userService) {
      window.userService.updateProfilePhoto(newPhotoUrl);
    }

    window.dispatchEvent(
      new CustomEvent("userDataUpdated", {
        detail: {
          userData: updatedUserData,
          timestamp: Date.now(),
          source: "edit-profile",
        },
      })
    );

    if (newPhotoUrl) {
      window.dispatchEvent(
        new CustomEvent("profilePhotoUpdated", {
          detail: {
            photoUrl: newPhotoUrl,
            forceRefresh: true,
            timestamp: Date.now(),
            source: "edit-profile",
          },
        })
      );
    }

    if (typeof BroadcastChannel !== "undefined") {
      try {
        const channel = new BroadcastChannel("profile_updates");
        channel.postMessage({
          type: "PHOTO_UPDATED",
          photoUrl: newPhotoUrl,
          userData: updatedUserData,
          timestamp: Date.now(),
        });
        channel.close();
        console.log("Broadcast enviado para outras abas");
      } catch (e) {
        console.log("BroadcastChannel nao disponivel");
      }
    }

    try {
      localStorage.setItem("lastPhotoUpdate", Date.now().toString());
      localStorage.setItem("currentPhotoUrl", newPhotoUrl || "");
    } catch (e) {
      console.error("Erro ao atualizar lastPhotoUpdate", e);
    }

    setTimeout(() => {
      console.log("Refresh final de seguranca");
      forceRefreshAllProfileImages(newPhotoUrl);
    }, 500);

    showMessage("Perfil salvo com sucesso!", "success");

    console.log("Atualizacao completa finalizada");
  } catch (error) {
    console.error("Erro em handleSuccessfulUpdate:", error);
    showMessage("Perfil salvo, mas houve erro na atualizacao visual", "error");
  }
}

async function uploadPhotoOnly() {
  const photoInput = document.getElementById("photo-input");

  if (!photoInput || !photoInput.files || !photoInput.files[0]) {
    showMessage("Selecione uma foto primeiro", "error");
    return;
  }

  try {
    const file = photoInput.files[0];

    if (!file.type.startsWith("image/")) {
      showMessage("Por favor, selecione apenas arquivos de imagem", "error");
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

    const response = await window.apiConfig.post(
      "/api/profile/upload-photo",
      formData
    );
    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Foto atualizada com sucesso!", "success");

      if (result.profilePhoto && result.profilePhoto.url) {
        updateProfilePhotoDisplay(result.profilePhoto.url);
      }

      if (result.user && result.user.profilePhotoUrl) {
        localStorage.setItem("userData", JSON.stringify(result.user));

        if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
          Auth.updateProfilePhoto(result.user.profilePhotoUrl);
        }
      }

      window.dispatchEvent(
        new CustomEvent("profilePhotoUpdated", {
          detail: { photoUrl: result.profilePhoto.url },
        })
      );

      photoInput.value = "";
    } else {
      showMessage(result.message || "Erro ao atualizar foto", "error");
    }
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    showMessage("Erro de conexao", "error");
  } finally {
    const uploadBtn = document.querySelector(".upload-photo-btn");
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Enviar Foto';
    }
  }
}

if (typeof BroadcastChannel !== "undefined") {
  try {
    const profileChannel = new BroadcastChannel("profile_updates");
    profileChannel.onmessage = (event) => {
      if (event.data.type === "PHOTO_UPDATED") {
        console.log("Recebida atualizacao de foto de outra aba/pagina");
        const photoUrl = event.data.photoUrl;
        if (photoUrl) {
          updateProfilePhotoDisplayFixed(photoUrl, true);
          forceRefreshAllProfileImages(photoUrl);
        }
      }
    };
  } catch (e) {
    console.log("BroadcastChannel nao disponivel neste navegador");
  }
}

window.addEventListener("storage", function (e) {
  if (e.key === "lastPhotoUpdate" || e.key === "currentPhotoUrl") {
    console.log("Detectada mudanca no localStorage de outra aba");
    setTimeout(() => {
      const photoUrl = localStorage.getItem("currentPhotoUrl");
      if (photoUrl) {
        forceRefreshAllProfileImages(photoUrl);
      }
    }, 100);
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOM carregado, iniciando carregamento do perfil...");

  clearUserData();

  try {
    await loadUserDataFromAPI();
  } catch (error) {
    console.error("Falha critica no carregamento:", error);
  }

  setupChangeDetection();
  setupKeyboardShortcuts();
  setupPhotoPreview();
});

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
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "../../configuracao/html/index.html";
  }
}

// 🔧 CORREÇÃO CRÍTICA: Comparar telefones SEM máscara
function hasUnsavedChanges() {
  const currentData = getCurrentFormData();
  const originalData = getOriginalFormData();

  console.log("🔍 Verificando mudanças:", {
    current: currentData,
    original: originalData,
  });

  // Comparar telefones sem máscara
  const hasChanges =
    currentData.name !== originalData.name ||
    currentData.email !== originalData.email ||
    cleanPhoneNumber(currentData.phone) !==
      cleanPhoneNumber(originalData.phone) ||
    currentData.hasNewPhoto !== originalData.hasNewPhoto;

  console.log("📊 Tem mudanças?", hasChanges);

  return hasChanges;
}

// 🔧 CORREÇÃO: Retornar telefone LIMPO
function getCurrentFormData() {
  return {
    name: document.getElementById("name")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    phone: cleanPhoneNumber(
      document.getElementById("phone")?.value.trim() || ""
    ), // ✅ Limpar máscara
    hasNewPhoto: document.getElementById("photo-input")?.files.length > 0,
  };
}

let originalFormData = {};

function getOriginalFormData() {
  return originalFormData;
}

function setOriginalFormData(data) {
  originalFormData = { ...data };
  console.log("📝 OriginalFormData atualizado:", originalFormData);
}

function setupPhotoPreview() {
  const photoInput = document.getElementById("photo-input");
  const profileImage = document.getElementById("profile-image");

  if (!photoInput || !profileImage) return;

  photoInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Por favor, selecione apenas imagens", "error");
      photoInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("A imagem deve ter menos de 5MB", "error");
      photoInput.value = "";
      return;
    }

    const img = new Image();
    img.onload = function () {
      if (this.width < 50 || this.height < 50) {
        showMessage("A imagem deve ter pelo menos 50x50 pixels", "error");
        photoInput.value = "";
        return;
      }

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

function showRemovePhotoModal() {
  const modal = document.getElementById("remove-photo-modal");
  if (modal) {
    modal.classList.add("show");
    document.addEventListener("keydown", handleModalEscape);

    setTimeout(() => {
      const cancelBtn = modal.querySelector(".modal-btn-cancel");
      if (cancelBtn) {
        cancelBtn.focus();
      }
    }, 100);
  }
}

function closeRemovePhotoModal() {
  const modal = document.getElementById("remove-photo-modal");
  if (modal) {
    modal.classList.remove("show");
    document.removeEventListener("keydown", handleModalEscape);
  }
}

async function confirmRemovePhoto() {
  closeRemovePhotoModal();
  await removeProfilePhotoWithoutConfirm();
}

function handleModalEscape(event) {
  if (event.key === "Escape") {
    closeRemovePhotoModal();
  }
}

document.addEventListener("click", function (event) {
  const modal = document.getElementById("remove-photo-modal");
  if (modal && event.target === modal) {
    closeRemovePhotoModal();
  }
});

function showUnsavedChangesModal() {
  const modal = document.getElementById("unsaved-modal");
  if (modal) {
    modal.classList.add("show");
    document.addEventListener("keydown", handleUnsavedModalEscape);
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

document.addEventListener("click", function (event) {
  const modal = document.getElementById("unsaved-modal");
  if (modal && event.target === modal) {
    closeUnsavedChangesModal();
  }
});

async function removeProfilePhotoWithoutConfirm() {
  try {
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

      const profileImage = document.getElementById("profile-image");
      if (profileImage) {
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        const userName = userData.name || userData.fullName || "";
        profileImage.src = getInitialsPlaceholderUrl(userName);

        profileImage.style.opacity = "0.5";
        setTimeout(() => {
          profileImage.style.opacity = "1";
        }, 300);
      }

      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      userData.profilePhotoUrl = null;
      localStorage.setItem("userData", JSON.stringify(userData));

      if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
        Auth.updateProfilePhoto(null);
      }

      const photoInput = document.getElementById("photo-input");
      if (photoInput) {
        photoInput.value = "";
      }

      window.dispatchEvent(new CustomEvent("profilePhotoRemoved"));
    } else {
      showMessage(result.message || "Erro ao remover foto", "error");
    }
  } catch (error) {
    console.error("Erro ao remover foto:", error);
    showMessage("Erro de conexao", "error");
  } finally {
    const removeBtn = document.querySelector(".remove-photo-btn");
    if (removeBtn) {
      removeBtn.disabled = false;
      removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remover Foto';
    }
  }
}

function validateForm() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phoneRaw = document.getElementById("phone").value.trim();
  const phone = cleanPhoneNumber(phoneRaw);

  const errors = [];

  if (!name || name.length < 2) {
    errors.push("Nome deve ter pelo menos 2 caracteres");
  }

  if (!email) {
    errors.push("Email e obrigatorio");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email invalido");
  }

  // 🔧 CORREÇÃO: Validar telefone limpo
  if (phone && phone.length > 0) {
    if (phone.length < 10 || phone.length > 11) {
      errors.push("Telefone deve ter 10 ou 11 dígitos");
    }
  }

  return errors;
}

async function syncUserDataSafe() {
  try {
    if (
      !hasUnsavedChanges() &&
      typeof Auth !== "undefined" &&
      navigator.onLine
    ) {
      console.log("Sincronizacao automatica segura...");
      await loadUserDataFromAPI();
    }
  } catch (error) {
    console.log("Erro na sincronizacao automatica:", error);
  }
}

setInterval(syncUserDataSafe, 5 * 60 * 1000);

window.addEventListener("online", () => {
  console.log("Reconectado a internet");
  if (!hasUnsavedChanges()) {
    syncUserDataSafe();
  }
});

window.addEventListener("offline", () => {
  console.log("Desconectado da internet");
  showMessage(
    "Modo offline. Algumas funcionalidades podem estar limitadas.",
    "error"
  );
});

async function forceReloadUserData() {
  console.log("Recarregamento forcado dos dados...");
  clearUserData();
  await loadUserDataFromAPI();
}

window.addEventListener("storage", function (e) {
  if (e.key === "authToken" || e.key === "userData") {
    console.log("Mudanca de usuario detectada, recarregando dados...");
    setTimeout(() => {
      forceReloadUserData();
    }, 100);
  }
});

// ============================
// Máscara dinâmica de telefone
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, ""); // remove tudo que não for número

      if (value.length > 11) value = value.slice(0, 11); // limita a 11 dígitos

      // Formata conforme o tamanho
      if (value.length > 10) {
        // Celular: (99) 99999-9999
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
      } else if (value.length > 6) {
        // Telefone fixo: (99) 9999-9999
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      } else {
        value = value.replace(/^(\d*)/, "($1");
      }

      e.target.value = value;
    });

    // Evita caracteres não numéricos no input
    phoneInput.addEventListener("keypress", (e) => {
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    });
  }
});

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
  forceRefreshAllProfileImages,
  cleanPhoneNumber,
  applyPhoneMask,
};
