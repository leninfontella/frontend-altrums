// edit-profile.js - VERSÃO COM CAMPO CPF

// Função para mostrar mensagens
function showMessage(message, type = "success") {
  const messageBox = document.getElementById("message-box");
  if (!messageBox) {
    // console.log(`Mensagem (${type}):`, message);
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

// 🔧 FUNÇÃO: Limpar máscara do telefone
function cleanPhoneNumber(phone) {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

// 🔧 FUNÇÃO: Aplicar máscara ao telefone
function applyPhoneMask(phone) {
  if (!phone) return "";

  const cleaned = cleanPhoneNumber(phone);

  if (cleaned.length > 10) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (cleaned.length > 6) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (cleaned.length > 2) {
    return cleaned.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else if (cleaned.length > 0) {
    return cleaned.replace(/^(\d*)/, "($1");
  }

  return "";
}

// 🔧 FUNÇÃO: Aplicar máscara ao CPF
function applyCpfMask(cpf) {
  if (!cpf) return "";

  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length > 9) {
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
  } else if (cleaned.length > 6) {
    return cleaned.replace(/^(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  } else if (cleaned.length > 3) {
    return cleaned.replace(/^(\d{3})(\d{0,3})/, "$1.$2");
  }

  return cleaned;
}

// Função para gerar URL do placeholder com iniciais
function getInitialsPlaceholderUrl(userName) {
  const nameToPass = userName && typeof userName === "string" ? userName : "";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nameToPass,
  )}&background=00d4ff&color=fff&size=120`;
}

// 🔧 FUNÇÃO CORRIGIDA: updateProfilePhotoDisplayFixed
function updateProfilePhotoDisplayFixed(photoUrl, forceRefresh = false) {
  const profileImage = document.getElementById("profile-image");
  if (!profileImage) return;

  // console.log("🖼️  Atualizando foto de perfil:", photoUrl);

  const isInvalidUrl =
    !photoUrl ||
    typeof photoUrl !== "string" ||
    photoUrl.includes("👤") ||
    photoUrl.includes("�") ||
    photoUrl === "null" ||
    photoUrl === "undefined" ||
    photoUrl.trim() === "";

  if (isInvalidUrl) {
    console.warn("⚠️  URL inválida detectada, usando placeholder");
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    const userName = userData.name || userData.fullName || "";
    profileImage.src = getInitialsPlaceholderUrl(userName);
    return;
  }

  if (!photoUrl.startsWith("http://") && !photoUrl.startsWith("https://")) {
    console.warn("⚠️  URL sem protocolo detectada:", photoUrl);

    if (window.apiConfig && window.apiConfig.baseURL) {
      photoUrl = window.apiConfig.baseURL + photoUrl;
      // console.log("🔧 URL construída:", photoUrl);
    } else {
      console.error("❌ apiConfig não disponível, usando placeholder");
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      const userName = userData.name || userData.fullName || "";
      profileImage.src = getInitialsPlaceholderUrl(userName);
      return;
    }
  }

  let imageUrl = photoUrl;
  if (forceRefresh) {
    const separator = imageUrl.includes("?") ? "&" : "?";
    imageUrl = `${imageUrl}${separator}t=${Date.now()}&v=${Math.random()}`;
    // console.log("🔄 Cache busting aplicado:", imageUrl);
  }

  profileImage.src = imageUrl;
  profileImage.style.opacity = "0.7";
  setTimeout(() => {
    profileImage.style.opacity = "1";
  }, 300);

  profileImage.onerror = function () {
    console.error("❌ Erro ao carregar imagem:", imageUrl);

    if (forceRefresh && imageUrl.includes("?t=")) {
      const cleanUrl = imageUrl.split("?t=")[0];
      // console.log("🔄 Tentando sem cache bust:", cleanUrl);
      this.src = cleanUrl;
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    const userName = userData.name || userData.fullName || "";
    this.src = getInitialsPlaceholderUrl(userName);
  };
}

// 🔧 FUNÇÃO CORRIGIDA: forceRefreshAllProfileImages
function forceRefreshAllProfileImages(photoUrl) {
  // console.log("🔄 Forçando refresh de imagens de perfil");

  if (!photoUrl || typeof photoUrl !== "string" || photoUrl.includes("👤")) {
    console.warn("⚠️  URL inválida, não atualizando imagens");
    return;
  }

  let fullUrl = photoUrl;
  if (!photoUrl.startsWith("http")) {
    if (window.apiConfig && window.apiConfig.baseURL) {
      fullUrl = window.apiConfig.baseURL + photoUrl;
    } else {
      console.error("❌ Não é possível construir URL completa");
      return;
    }
  }

  const timestamp = Date.now();
  const cacheBustedUrl = `${fullUrl}${
    fullUrl.includes("?") ? "&" : "?"
  }t=${timestamp}&v=${Math.random()}`;

  // console.log("🌐 URL com cache busting:", cacheBustedUrl);

  const selectors = [
    "[data-user-photo]",
    ".profile-image",
    ".user-avatar",
    ".profile-avatar",
    "#profile-image",
    ".user-profile-image",
    "img[alt*='perfil']",
    "img[alt*='profile']",
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

  // console.log(`✅ ${updatedCount} elementos de imagem atualizados`);
}

function clearUserData() {
  // console.log("Limpando dados do usuário anterior...");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const cpfInput = document.getElementById("cpf");
  const phoneInput = document.getElementById("phone");
  const profileImage = document.getElementById("profile-image");

  if (nameInput) nameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (cpfInput) cpfInput.value = "";
  if (phoneInput) phoneInput.value = "";
  if (profileImage) {
    profileImage.src = getInitialsPlaceholderUrl("");
  }

  originalFormData = {};
}

async function loadUserDataFromAPI() {
  try {
    // console.log("🔄 PRIORIDADE: Carregando dados da API...");

    if (typeof Auth === "undefined" || !Auth.getToken()) {
      console.error("Sistema de autenticação não disponível ou token ausente");
      showMessage("Sessão expirada. Redirecionando...", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
      return;
    }

    clearUserData();

    const userData = await Auth.getProfile();

    if (userData) {
      // console.log("✅ Dados atualizados recebidos da API:", userData);

      populateFormWithData(userData);

      setOriginalFormData({
        name: userData.name || userData.fullName || "",
        email: userData.email || "",
        phone: cleanPhoneNumber(userData.phone || ""),
        hasNewPhoto: false,
      });

      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      throw new Error("Dados não recebidos da API");
    }
  } catch (error) {
    console.error("❌ Erro ao carregar dados da API:", error);

    if (error.message.includes("401") || error.message.includes("Token")) {
      showMessage("Sessão expirada. Redirecionando...", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
      return;
    }

    // console.log("⚠️  Usando dados locais como fallback...");
    loadUserProfileFromLocalStorage();
    showMessage(
      "Carregado do cache local. Algumas informações podem estar desatualizadas.",
      "error",
    );
  }
}

function populateFormWithData(userData) {
  // console.log("📝 Preenchendo formulário com dados:", userData);

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const cpfInput = document.getElementById("cpf");
  const phoneInput = document.getElementById("phone");
  const profileImage = document.getElementById("profile-image");

  if (nameInput) nameInput.value = userData.name || userData.fullName || "";
  if (emailInput) emailInput.value = userData.email || "";

  // Preencher CPF com máscara
  if (cpfInput) {
    const cpfValue = userData.cpf || userData.document || "";
    cpfInput.value = cpfValue ? applyCpfMask(cpfValue) : "CPF não cadastrado";
  }

  if (phoneInput) {
    // 🔧 CORREÇÃO: Normalizar antes de aplicar máscara
    const normalizedPhone = normalizePhoneFromAPI(userData.phone || "");
    phoneInput.value = applyPhoneMask(normalizedPhone);

    // console.log("📞 Telefone aplicado:", {
    //   recebido: userData.phone,
    //   normalizado: normalizedPhone,
    //   comMascara: phoneInput.value,
    // });
  }

  if (profileImage) {
    const photoUrl = userData.profilePhotoUrl || userData.avatar;

    if (
      photoUrl &&
      typeof photoUrl === "string" &&
      photoUrl.startsWith("http")
    ) {
      updateProfilePhotoDisplayFixed(photoUrl, false);
    } else {
      profileImage.src = getInitialsPlaceholderUrl(
        userData.name || userData.fullName,
      );
    }
  }
}

function loadUserProfileFromLocalStorage() {
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (userData) {
    // console.log("📦 Carregando dados locais como fallback:", userData);
    populateFormWithData(userData);

    setOriginalFormData({
      name: userData.name || userData.fullName || "",
      email: userData.email || "",
      phone: cleanPhoneNumber(userData.phone || ""),
      hasNewPhoto: false,
    });
  } else {
    // console.log("❌ Nenhum dado local encontrado");
    showMessage("Nenhum dado encontrado. Faça login novamente.", "error");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 2000);
  }
}

async function saveProfile() {
  try {
    if (typeof Auth === "undefined" || !Auth.getToken()) {
      showMessage("Sessão expirada. Faça login novamente.", "error");
      return;
    }

    const currentUserData = Auth.getUserData();
    if (!currentUserData || !currentUserData.id) {
      showMessage("Dados de usuário inválidos. Faça login novamente.", "error");
      return;
    }

    const saveButtons = document.querySelectorAll(
      ".save-button, .save-content-btn",
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
    const phone = cleanPhoneNumber(phoneRaw);

    // console.log("📞 Telefone capturado:", {
    //   raw: phoneRaw,
    //   cleaned: phone,
    // });

    if (!name) {
      showMessage("Nome é obrigatório", "error");
      return;
    }

    if (!email) {
      showMessage("Email é obrigatório", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("Email inválido", "error");
      return;
    }

    if (phone && phone.length > 0 && (phone.length < 10 || phone.length > 11)) {
      showMessage("Telefone deve ter 10 ou 11 dígitos", "error");
      return;
    }

    const profileData = {
      name,
      email,
      phone,
    };

    // console.log("💾 Dados de texto a serem salvos:", profileData);

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

      const photoFormData = new FormData();
      photoFormData.append("profilePhoto", file);

      // console.log("📤 Iniciando upload da nova foto...");

      const uploadResponse = await window.apiConfig.post(
        "/api/profile/upload-photo",
        photoFormData,
      );
      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(
          uploadResult.message ||
            "Erro ao fazer upload para o servidor de armazenamento",
        );
      }

      // console.log(
      //   "✅ Upload de foto concluído. Resultado:",
      //   uploadResult.message
      // );

      const updateResult = await Auth.updateProfile(profileData);

      if (updateResult.success) {
        photoInput.value = "";
        await handleSuccessfulUpdate(
          uploadResult.user || updateResult.user || updateResult.data,
        );

        setOriginalFormData({
          name: name,
          email: email,
          phone: phone,
          hasNewPhoto: false,
        });
      } else {
        throw new Error(
          updateResult.message || "Erro ao salvar dados do perfil",
        );
      }
    } else {
      // console.log(
      //   "💾 Salvando perfil SEM foto nova. ProfileData:",
      //   profileData
      // );

      const result = await Auth.updateProfile(profileData);

      if (result.success) {
        await handleSuccessfulUpdate(result.user || result.data);

        setOriginalFormData({
          name: name,
          email: email,
          phone: phone,
          hasNewPhoto: false,
        });

        // console.log("✅ Perfil salvo com sucesso! Telefone:", phone);
      } else {
        throw new Error(result.message || "Erro ao salvar perfil");
      }
    }
  } catch (error) {
    console.error("❌ Erro ao salvar perfil:", error);

    if (error.message.includes("upload para o servidor de armazenamento")) {
      showMessage(
        "Erro ao fazer upload para o servidor de armazenamento. Verifique os logs do Backend.",
        "error",
      );
    } else if (
      error.message.includes("401") ||
      error.message.includes("Token")
    ) {
      showMessage("Sessão expirada. Faça login novamente.", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
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
        "error",
      );
    }
  } finally {
    const saveButtons = document.querySelectorAll(
      ".save-button, .save-content-btn",
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
    // console.log("✅ Processando atualização bem-sucedida");
    // console.log("📦 Dados recebidos:", updatedUserData);

    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    const newPhotoUrl = updatedUserData.profilePhotoUrl || null;

    // console.log("🔍 Nova foto URL:", {
    //   value: newPhotoUrl,
    //   type: typeof newPhotoUrl,
    //   isValid:
    //     newPhotoUrl &&
    //     typeof newPhotoUrl === "string" &&
    //     newPhotoUrl.startsWith("http"),
    // });

    if (
      newPhotoUrl &&
      typeof newPhotoUrl === "string" &&
      newPhotoUrl.startsWith("http")
    ) {
      // console.log("✅ URL válida, atualizando imagens");
      updateProfilePhotoDisplayFixed(newPhotoUrl, true);

      setTimeout(() => {
        forceRefreshAllProfileImages(newPhotoUrl);
      }, 100);

      if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
        Auth.updateProfilePhoto(newPhotoUrl);
      }

      window.dispatchEvent(
        new CustomEvent("profilePhotoUpdated", {
          detail: {
            photoUrl: newPhotoUrl,
            forceRefresh: true,
            timestamp: Date.now(),
          },
        }),
      );

      if (typeof BroadcastChannel !== "undefined") {
        try {
          const channel = new BroadcastChannel("profile_updates");
          channel.postMessage({
            type: "PHOTO_UPDATED",
            photoUrl: newPhotoUrl,
            timestamp: Date.now(),
          });
          channel.close();
        } catch (e) {
          // console.log("BroadcastChannel não disponível");
        }
      }
    } else {
      // console.log("⚠️  Sem foto válida, usando placeholder");
      const userName = updatedUserData.name || updatedUserData.fullName || "";
      const profileImage = document.getElementById("profile-image");
      if (profileImage) {
        profileImage.src = getInitialsPlaceholderUrl(userName);
      }
    }

    showMessage("Perfil salvo com sucesso!", "success");
  } catch (error) {
    console.error("❌ Erro em handleSuccessfulUpdate:", error);
    showMessage("Perfil salvo, mas houve erro na atualização visual", "error");
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
      formData,
    );
    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Foto atualizada com sucesso!", "success");

      if (result.profilePhoto && result.profilePhoto.url) {
        updateProfilePhotoDisplayFixed(result.profilePhoto.url, true);
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
        }),
      );

      photoInput.value = "";
    } else {
      showMessage(result.message || "Erro ao atualizar foto", "error");
    }
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    showMessage("Erro de conexão", "error");
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
        // console.log("📨 Recebida atualização de foto de outra aba/página");
        const photoUrl = event.data.photoUrl;
        if (photoUrl) {
          updateProfilePhotoDisplayFixed(photoUrl, true);
          forceRefreshAllProfileImages(photoUrl);
        }
      }
    };
  } catch (e) {
    // console.log("BroadcastChannel não disponível neste navegador");
  }
}

window.addEventListener("storage", function (e) {
  if (e.key === "lastPhotoUpdate" || e.key === "currentPhotoUrl") {
    // console.log("📨 Detectada mudança no localStorage de outra aba");
    setTimeout(() => {
      const photoUrl = localStorage.getItem("currentPhotoUrl");
      if (photoUrl) {
        forceRefreshAllProfileImages(photoUrl);
      }
    }, 100);
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  // console.log("🚀 DOM carregado, iniciando carregamento do perfil...");

  clearUserData();

  try {
    await loadUserDataFromAPI();
  } catch (error) {
    console.error("❌ Falha crítica no carregamento:", error);
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

function hasUnsavedChanges() {
  const currentData = getCurrentFormData();
  const originalData = getOriginalFormData();

  // 🔧 CORREÇÃO: Comparar telefones SEM máscara
  const currentPhone = cleanPhoneNumber(currentData.phone);
  const originalPhone = cleanPhoneNumber(originalData.phone);

  // console.log("🔍 Verificando mudanças:", {
  //   current: currentData,
  //   original: originalData,
  //   phonesClean: {
  //     current: currentPhone,
  //     original: originalPhone,
  //     areEqual: currentPhone === originalPhone,
  //   },
  // });

  const hasChanges =
    currentData.name !== originalData.name ||
    currentData.email !== originalData.email ||
    currentPhone !== originalPhone || // 🔧 Usar versões limpas
    currentData.hasNewPhoto !== originalData.hasNewPhoto;

  // console.log("📊 Tem mudanças?", hasChanges);

  return hasChanges;
}

// 🔧 ADICIONAR função para normalizar telefone ao receber da API
function normalizePhoneFromAPI(phone) {
  if (!phone) return "";

  // Remove máscara e retorna apenas dígitos
  const cleaned = phone.replace(/\D/g, "");

  // console.log("📞 Normalizando telefone:", {
  //   original: phone,
  //   normalizado: cleaned,
  // });

  return cleaned;
}

function setOriginalFormData(data) {
  originalFormData = {
    ...data,
    phone: normalizePhoneFromAPI(data.phone), // 🔧 Normalizar aqui
  };
  // console.log("📝 OriginalFormData atualizado:", originalFormData);
}

function getCurrentFormData() {
  return {
    name: document.getElementById("name")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    phone: cleanPhoneNumber(
      document.getElementById("phone")?.value.trim() || "",
    ),
    hasNewPhoto: document.getElementById("photo-input")?.files.length > 0,
  };
}

let originalFormData = {};

function getOriginalFormData() {
  return originalFormData;
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
    showMessage("Erro de conexão", "error");
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
    errors.push("Email é obrigatório");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email inválido");
  }

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
      // console.log("🔄 Sincronização automática segura...");
      await loadUserDataFromAPI();
    }
  } catch (error) {
    // console.log("⚠️  Erro na sincronização automática:", error);
  }
}

setInterval(syncUserDataSafe, 5 * 60 * 1000);

window.addEventListener("online", () => {
  // console.log("🌐 Reconectado à internet");
  if (!hasUnsavedChanges()) {
    syncUserDataSafe();
  }
});

window.addEventListener("offline", () => {
  // console.log("📡 Desconectado da internet");
  showMessage(
    "Modo offline. Algumas funcionalidades podem estar limitadas.",
    "error",
  );
});

async function forceReloadUserData() {
  // console.log("🔄 Recarregamento forçado dos dados...");
  clearUserData();
  await loadUserDataFromAPI();
}

window.addEventListener("storage", function (e) {
  if (e.key === "authToken" || e.key === "userData") {
    // console.log("🔄 Mudança de usuário detectada, recarregando dados...");
    setTimeout(() => {
      forceReloadUserData();
    }, 100);
  }
});

// Máscara dinâmica de telefone
document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");

      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      } else {
        value = value.replace(/^(\d*)/, "($1");
      }

      e.target.value = value;
    });

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
  applyCpfMask,
  updateProfilePhotoDisplayFixed,
  handleSuccessfulUpdate,
  populateFormWithData,
  setOriginalFormData,
  getOriginalFormData,
  getCurrentFormData,
  hasUnsavedChanges,
};
