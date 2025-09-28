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

// 📱 NOVA FUNÇÃO: Detectar dispositivos móveis
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// ✨ FUNÇÃO CORRIGIDA: Gerar a URL do placeholder com as iniciais do usuário
function getInitialsPlaceholderUrl(userName) {
  const nameToPass = userName && typeof userName === "string" ? userName : "";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nameToPass
  )}&background=00d4ff&color=fff&size=120`;
}

// 📱 FUNÇÃO MELHORADA: Atualizar foto com otimizações para mobile
function updateProfilePhotoDisplay(photoUrl, forceRefresh = false) {
  const profileImage = document.getElementById("profile-image");
  if (!profileImage) return;

  console.log("📸 Atualizando foto de perfil:", photoUrl);

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

    // 📱 MOBILE: Cache busting mais agressivo para dispositivos móveis
    if (forceRefresh || isMobileDevice()) {
      const separator = imageUrl.includes("?") ? "&" : "?";
      imageUrl = `${imageUrl}${separator}t=${Date.now()}&mobile=1`;
      console.log("📱 Mobile: Cache busting aplicado:", imageUrl);
    }

    profileImage.src = imageUrl;

    // Efeito visual de atualização
    profileImage.style.opacity = "0.7";
    setTimeout(() => {
      profileImage.style.opacity = "1";
    }, 300);

    // 📱 MOBILE: Fallback melhorado para dispositivos móveis
    profileImage.onerror = function () {
      console.log("❌ Erro ao carregar imagem:", imageUrl);

      // Se falhou com cache bust, tentar sem
      if (forceRefresh && imageUrl.includes("?t=")) {
        const cleanUrl = imageUrl.split("?t=")[0];
        console.log("🔄 Tentando sem cache bust:", cleanUrl);
        this.src = cleanUrl;
        return;
      }

      // Fallback final
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      const userName = userData.name || userData.fullName || "";
      this.src = getInitialsPlaceholderUrl(userName);
    };

    // 📱 MOBILE: Verificação adicional após carregamento
    profileImage.onload = function () {
      console.log("✅ Imagem carregada com sucesso");

      // Disparar evento customizado para sincronização
      if (isMobileDevice()) {
        window.dispatchEvent(
          new CustomEvent("mobilePhotoLoaded", {
            detail: { imageUrl, success: true },
          })
        );
      }
    };
  } else {
    // Usar placeholder com iniciais
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    const userName = userData.name || userData.fullName || "";
    profileImage.src = getInitialsPlaceholderUrl(userName);
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

  // Usar um placeholder genérico
  if (profileImage) {
    profileImage.src = getInitialsPlaceholderUrl("");
  }

  // Limpar dados originais
  originalFormData = {};
}

// 🔧 FUNÇÃO MELHORADA: Carregar dados da API com otimizações mobile
async function loadUserDataFromAPI() {
  try {
    console.log("🔄 PRIORIDADE: Carregando dados da API...");

    // Verificar se Auth está disponível
    if (typeof Auth === "undefined" || !Auth.getToken()) {
      console.error(
        "⚠️ Sistema de autenticação não disponível ou token ausente"
      );
      showMessage("Sessão expirada. Redirecionando...", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
      return;
    }

    // Sempre limpar dados anteriores ANTES de carregar novos
    clearUserData();

    // Usar Auth para buscar dados atualizados
    const userData = await Auth.getProfile();

    if (userData) {
      console.log("✅ Dados atualizados recebidos da API:", userData);

      // Preencher formulário
      populateFormWithData(userData);

      // Definir dados originais
      setOriginalFormData({
        name: userData.name || userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        hasNewPhoto: false,
      });

      // ✅ CRÍTICO: Atualizar localStorage apenas com dados do usuário atual
      localStorage.setItem("userData", JSON.stringify(userData));

      // 📱 MOBILE: Forçar sincronização adicional
      if (isMobileDevice()) {
        setTimeout(() => {
          forceMobileSync(userData);
        }, 200);
      }
    } else {
      throw new Error("Dados não recebidos da API");
    }
  } catch (error) {
    console.error("⚠️ Erro ao carregar dados da API:", error);

    if (error.message.includes("401") || error.message.includes("Token")) {
      showMessage("Sessão expirada. Redirecionando...", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
      return;
    }

    // Fallback: usar dados locais
    console.log("⚠️ Usando dados locais como fallback...");
    loadUserProfileFromLocalStorage();
    showMessage(
      "Carregado do cache local. Algumas informações podem estar desatualizadas.",
      "error"
    );
  }
}

// 📱 NOVA FUNÇÃO: Sincronização forçada para mobile
function forceMobileSync(userData) {
  if (!isMobileDevice()) return;

  console.log("📱 Forçando sincronização mobile...");

  // Atualizar UserService se disponível
  if (window.userService) {
    window.userService.updateUserData(userData);
  }

  // Forçar atualização da foto com delay
  const photoUrl = userData.profilePhotoUrl || userData.avatar;
  if (photoUrl) {
    setTimeout(() => {
      updateProfilePhotoDisplay(photoUrl, true);
    }, 300);
  }

  // Disparar eventos customizados para sincronização global
  window.dispatchEvent(
    new CustomEvent("userDataUpdated", {
      detail: { userData },
    })
  );

  if (photoUrl) {
    window.dispatchEvent(
      new CustomEvent("profilePhotoUpdated", {
        detail: { photoUrl },
      })
    );
  }
}

// Função para preencher formulário com dados específicos
function populateFormWithData(userData) {
  console.log("📝 Preenchendo formulário com dados:", userData);

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const profileImage = document.getElementById("profile-image");

  if (nameInput) nameInput.value = userData.name || userData.fullName || "";
  if (emailInput) emailInput.value = userData.email || "";
  if (phoneInput) phoneInput.value = userData.phone || "";

  // 🛠 CORREÇÃO CRÍTICA: Lógica para exibir a foto ou o placeholder
  if (profileImage) {
    const photoUrl = userData.profilePhotoUrl || userData.avatar;
    if (photoUrl) {
      updateProfilePhotoDisplay(photoUrl, isMobileDevice());
    } else {
      profileImage.src = getInitialsPlaceholderUrl(
        userData.name || userData.fullName
      );
    }
  }
}

// Função para carregar do localStorage (fallback)
function loadUserProfileFromLocalStorage() {
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (userData) {
    console.log("📝 Carregando dados locais como fallback:", userData);
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
      window.location.href = "/index.html";
    }, 2000);
  }
}

// 📱 FUNÇÃO CORRIGIDA: Salvar perfil com otimizações mobile
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

    // Preparar dados
    const profileData = { name, email, phone };

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

      // Usar FormData quando há arquivo
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("profilePhoto", file);

      const response = await window.apiConfig.put("/api/profile", formData);
      const result = await response.json();

      if (response.ok && result.success) {
        await handleSuccessfulUpdate(result.user, true); // true = tem nova foto
        photoInput.value = "";
      } else {
        throw new Error(result.message || "Erro ao salvar perfil");
      }
    } else {
      // Usar Auth.updateProfile para dados sem foto
      const result = await Auth.updateProfile(profileData);

      if (result.success) {
        await handleSuccessfulUpdate(result.data, false); // false = sem nova foto
      } else {
        throw new Error(result.message || "Erro ao salvar perfil");
      }
    }
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);

    if (error.message.includes("401") || error.message.includes("Token")) {
      showMessage("Sessão expirada. Faça login novamente.", "error");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
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

// 📱 FUNÇÃO MELHORADA: Tratar atualização bem-sucedida com otimizações mobile
async function handleSuccessfulUpdate(updatedUserData, hasNewPhoto = false) {
  console.log("✅ Atualização bem-sucedida:", updatedUserData);

  // Atualizar localStorage com dados corretos
  localStorage.setItem("userData", JSON.stringify(updatedUserData));

  // 📱 MOBILE: Atualização especial para dispositivos móveis
  if (isMobileDevice()) {
    console.log("📱 Aplicando otimizações para mobile...");

    // Limpar cache de imagens primeiro
    if (hasNewPhoto) {
      clearImageCacheMobile();
    }

    // Delay maior para dispositivos móveis processarem a mudança
    setTimeout(() => {
      updateProfilePhotoDisplay(
        updatedUserData.profilePhotoUrl || updatedUserData.avatar,
        hasNewPhoto // Só força refresh se realmente há nova foto
      );

      // Segunda tentativa com delay adicional para garantir
      setTimeout(() => {
        forceMobilePhotoSync(updatedUserData);
      }, 800);
    }, 200);
  } else {
    // Desktop: atualização normal
    updateProfilePhotoDisplay(
      updatedUserData.profilePhotoUrl || updatedUserData.avatar,
      hasNewPhoto
    );
  }

  // Sincronização: Usar Auth para atualizar dados globalmente
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

  // Disparar eventos para sincronização global
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

  // 📱 MOBILE: Evento específico para mobile
  if (isMobileDevice()) {
    window.dispatchEvent(
      new CustomEvent("mobileProfileUpdated", {
        detail: {
          userData: updatedUserData,
          hasNewPhoto,
          timestamp: Date.now(),
        },
      })
    );
  }

  // Atualizar dados originais
  setOriginalFormData(getCurrentFormData());

  showMessage("Perfil salvo com sucesso!", "success");
}

// 📱 NOVA FUNÇÃO: Limpar cache de imagens específico para mobile
function clearImageCacheMobile() {
  console.log("📱 Limpando cache de imagens para mobile...");

  const profileImage = document.getElementById("profile-image");
  if (profileImage) {
    // Técnica mais agressiva de limpeza de cache para mobile
    const originalSrc = profileImage.src;
    profileImage.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 transparent gif

    setTimeout(() => {
      profileImage.src = originalSrc;
    }, 100);
  }
}

// 📱 NOVA FUNÇÃO: Sincronização forçada da foto no mobile
function forceMobilePhotoSync(userData) {
  if (!isMobileDevice()) return;

  console.log("📱 Sincronização forçada da foto no mobile...");

  const photoUrl = userData.profilePhotoUrl || userData.avatar;

  // Múltiplas tentativas de atualização para garantir sincronização
  const attempts = [500, 1000, 2000];

  attempts.forEach((delay, index) => {
    setTimeout(() => {
      console.log(`📱 Tentativa ${index + 1} de sincronização mobile`);
      updateProfilePhotoDisplay(photoUrl, true);

      // Atualizar também via UserService
      if (window.userService) {
        window.userService.forceUpdateAllPhotos();
      }

      // Disparar evento de força atualização
      window.dispatchEvent(new CustomEvent("forcePhotoUpdate"));
    }, delay);
  });
}

// 🔧 NOVA FUNÇÃO: Upload APENAS da foto (separado dos dados pessoais) - Otimizado para Mobile
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

    // 📱 MOBILE: Preview imediato da imagem selecionada
    if (isMobileDevice()) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const profileImage = document.getElementById("profile-image");
        if (profileImage) {
          profileImage.src = e.target.result;
          profileImage.style.opacity = "0.7"; // Indicar que está carregando
        }
      };
      reader.readAsDataURL(file);
    }

    // Usar endpoint específico apenas para foto
    const formData = new FormData();
    formData.append("profilePhoto", file);

    const response = await window.apiConfig.post(
      "/api/profile/upload-photo",
      formData
    );
    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Foto atualizada com sucesso!", "success");

      // 📱 MOBILE: Atualização otimizada
      if (isMobileDevice()) {
        console.log("📱 Mobile: Foto enviada, iniciando sincronização...");

        // Limpar cache primeiro
        clearImageCacheMobile();

        setTimeout(() => {
          if (result.profilePhoto && result.profilePhoto.url) {
            updateProfilePhotoDisplay(result.profilePhoto.url, true);
          }

          // Sincronização completa dos dados
          if (result.user) {
            localStorage.setItem("userData", JSON.stringify(result.user));
            forceMobilePhotoSync(result.user);
          }
        }, 200);
      } else {
        // Desktop: atualização normal
        if (result.profilePhoto && result.profilePhoto.url) {
          updateProfilePhotoDisplay(result.profilePhoto.url, true);
        }
      }

      // Usar Auth para sincronizar globalmente
      if (result.user && result.user.profilePhotoUrl) {
        localStorage.setItem("userData", JSON.stringify(result.user));

        if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
          Auth.updateProfilePhoto(result.user.profilePhotoUrl);
        }

        if (window.userService) {
          window.userService.updateUserData(result.user);
        }
      }

      // Disparar evento customizado
      const photoUrl = result.profilePhoto?.url || result.user?.profilePhotoUrl;
      if (photoUrl) {
        window.dispatchEvent(
          new CustomEvent("profilePhotoUpdated", {
            detail: { photoUrl },
          })
        );
      }

      // Limpar input
      photoInput.value = "";
    } else {
      showMessage(result.message || "Erro ao atualizar foto", "error");

      // 📱 MOBILE: Restaurar imagem anterior em caso de erro
      if (isMobileDevice()) {
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        const previousPhotoUrl = userData.profilePhotoUrl || userData.avatar;
        if (previousPhotoUrl) {
          updateProfilePhotoDisplay(previousPhotoUrl, false);
        } else {
          const profileImage = document.getElementById("profile-image");
          if (profileImage) {
            profileImage.src = getInitialsPlaceholderUrl(
              userData.name || userData.fullName
            );
          }
        }
      }
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

    // 📱 MOBILE: Restaurar opacidade da imagem
    if (isMobileDevice()) {
      const profileImage = document.getElementById("profile-image");
      if (profileImage) {
        profileImage.style.opacity = "1";
      }
    }
  }
}

// 🔧 CORREÇÃO CRÍTICA: Inicialização da página com limpeza - Otimizada para Mobile
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 DOM carregado, iniciando carregamento do perfil...");

  // 📱 MOBILE: Log do tipo de dispositivo
  if (isMobileDevice()) {
    console.log("📱 Dispositivo móvel detectado - aplicando otimizações");
  }

  // CRÍTICO: Sempre limpar dados anteriores ao carregar página
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

  // 📱 MOBILE: Configurações específicas para dispositivos móveis
  if (isMobileDevice()) {
    setupMobileOptimizations();
  }
});

// 📱 NOVA FUNÇÃO: Configurações específicas para mobile
function setupMobileOptimizations() {
  console.log("📱 Configurando otimizações para mobile...");

  // Listener para mudanças de orientação
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.profilePhotoUrl) {
        console.log("📱 Orientação mudou - recarregando foto");
        updateProfilePhotoDisplay(userData.profilePhotoUrl, true);
      }
    }, 500);
  });

  // Listener para quando a página volta ao foco
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      setTimeout(() => {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData && userData.profilePhotoUrl) {
          console.log("📱 Página focada - verificando foto");
          updateProfilePhotoDisplay(userData.profilePhotoUrl, false);
        }
      }, 200);
    }
  });

  // Listener específico para atualização mobile
  window.addEventListener("mobileProfileUpdated", (event) => {
    console.log("📱 Evento mobileProfileUpdated recebido:", event.detail);
    const { userData, hasNewPhoto } = event.detail;

    if (userData && userData.profilePhotoUrl) {
      setTimeout(() => {
        updateProfilePhotoDisplay(userData.profilePhotoUrl, hasNewPhoto);
      }, 100);
    }
  });

  // Touch events para melhor responsividade
  const profileImage = document.getElementById("profile-image");
  if (profileImage) {
    profileImage.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault(); // Previne zoom acidental
      },
      { passive: false }
    );
  }
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

// 📱 FUNÇÃO MELHORADA: Configurar pré-visualização da imagem com otimizações mobile
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

    // 📱 MOBILE: Validação adicional para dispositivos móveis
    if (isMobileDevice() && file.size > 2 * 1024 * 1024) {
      if (
        !confirm(
          "Imagem grande detectada. Pode demorar para carregar em dispositivos móveis. Continuar?"
        )
      ) {
        photoInput.value = "";
        return;
      }
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

        // 📱 MOBILE: Efeito visual otimizado para dispositivos móveis
        if (isMobileDevice()) {
          profileImage.style.transition = "all 0.3s ease";
          profileImage.style.transform = "scale(0.95)";
          setTimeout(() => {
            profileImage.style.transform = "scale(1)";
          }, 150);
        } else {
          profileImage.style.transform = "scale(1.02)";
          setTimeout(() => {
            profileImage.style.transform = "scale(1)";
          }, 200);
        }
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
    document.addEventListener("keydown", handleModalEscape);
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
    document.removeEventListener("keydown", handleModalEscape);
  }
}

// Confirmar remoção da foto
async function confirmRemovePhoto() {
  closeRemovePhotoModal();
  await removeProfilePhotoWithoutConfirm();
}

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

// Modal "Alterações não salvas"
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

// 📱 FUNÇÃO MELHORADA: Remover foto com otimizações mobile
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

      // Atualizar imagem para placeholder
      const profileImage = document.getElementById("profile-image");
      if (profileImage) {
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        const userName = userData.name || userData.fullName || "";
        profileImage.src = getInitialsPlaceholderUrl(userName);

        // 📱 MOBILE: Efeito visual otimizado
        if (isMobileDevice()) {
          profileImage.style.transition = "all 0.3s ease";
          profileImage.style.opacity = "0.5";
          setTimeout(() => {
            profileImage.style.opacity = "1";
          }, 300);
        } else {
          profileImage.style.opacity = "0.5";
          setTimeout(() => {
            profileImage.style.opacity = "1";
          }, 300);
        }
      }

      // Atualizar localStorage
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      userData.profilePhotoUrl = null;
      localStorage.setItem("userData", JSON.stringify(userData));

      // Usar Auth para sincronizar
      if (typeof Auth !== "undefined" && Auth.updateProfilePhoto) {
        Auth.updateProfilePhoto(null);
      }

      // Atualizar UserService
      if (window.userService) {
        window.userService.updateProfilePhoto(null);
      }

      // Limpar input de arquivo
      const photoInput = document.getElementById("photo-input");
      if (photoInput) {
        photoInput.value = "";
      }

      // Disparar eventos customizados
      window.dispatchEvent(new CustomEvent("profilePhotoRemoved"));

      // 📱 MOBILE: Evento específico para mobile
      if (isMobileDevice()) {
        window.dispatchEvent(
          new CustomEvent("mobilePhotoRemoved", {
            detail: { timestamp: Date.now() },
          })
        );
      }
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
    const phoneRegex =
      /^(\+55\s?)?(\(?[1-9]{2}\)?\s?)?9?[0-9]{4}[-\s]?[0-9]{4}$/;
    if (!phoneRegex.test(phone)) {
      errors.push("Formato de telefone inválido");
    }
  }

  return errors;
}

// 📱 NOVA FUNÇÃO: Sincronizar dados periodicamente (otimizada para mobile)
async function syncUserDataSafe() {
  try {
    // Só sincronizar se não há mudanças não salvas
    if (
      !hasUnsavedChanges() &&
      typeof Auth !== "undefined" &&
      navigator.onLine
    ) {
      console.log("🔄 Sincronização automática segura...");

      // 📱 MOBILE: Verificar se está em background (economizar bateria)
      if (isMobileDevice() && document.hidden) {
        console.log("📱 Mobile em background - pulando sincronização");
        return;
      }

      await loadUserDataFromAPI();
    }
  } catch (error) {
    console.log("⚠ Erro na sincronização automática:", error);
  }
}

// 📱 MOBILE: Intervalo de sincronização maior para economizar bateria
const syncInterval = isMobileDevice() ? 10 * 60 * 1000 : 5 * 60 * 1000; // 10min mobile, 5min desktop
setInterval(syncUserDataSafe, syncInterval);

// Eventos de conectividade
window.addEventListener("online", () => {
  console.log("🌐 Reconectado à internet");
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

// 📱 LISTENER GLOBAL: Detectar mudanças de usuário (otimizado para mobile)
window.addEventListener("storage", function (e) {
  if (e.key === "authToken" || e.key === "userData") {
    console.log("👤 Mudança de usuário detectada, recarregando dados...");

    // 📱 MOBILE: Delay maior para processamento
    const delay = isMobileDevice() ? 300 : 100;
    setTimeout(() => {
      forceReloadUserData();
    }, delay);
  }
});

// Exportar funções para uso global
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
  isMobileDevice,
  forceMobilePhotoSync,
  clearImageCacheMobile,
};
