// userService.js - Sistema global para gerenciar dados do usuário
class GlobalUserService {
  constructor() {
    this.userData = null;
    this.listeners = new Set();
    this.photoUpdateQueue = new Set();
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    this.init();
  }

  // Inicializar o serviço
  init() {
    this.loadUserData();
    this.setupEventListeners();
    this.setupMobileOptimizations();
  }

  // 📱 NOVO: Otimizações específicas para mobile
  setupMobileOptimizations() {
    if (this.isMobile) {
      console.log("📱 Inicializando otimizações para mobile...");

      // Listener para mudanças de orientação (mobile)
      window.addEventListener("orientationchange", () => {
        setTimeout(() => {
          this.forceUpdateAllPhotos();
        }, 500);
      });

      // Listener para quando a tela volta ao foco (mobile)
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          setTimeout(() => {
            this.forceUpdateAllPhotos();
          }, 200);
        }
      });

      // Listener para mudanças na viewport (mobile)
      window.addEventListener(
        "resize",
        this.debounce(() => {
          this.forceUpdateAllPhotos();
        }, 300)
      );
    }
  }

  // 🛠️ UTILITÁRIO: Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Carregar dados do usuário
  loadUserData() {
    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        this.userData = JSON.parse(stored);
        this.notifyListeners();

        // 📱 MOBILE: Forçar atualização das fotos após carregar dados
        if (this.isMobile) {
          setTimeout(() => {
            this.forceUpdateAllPhotos();
          }, 100);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  }

  // Configurar event listeners
  setupEventListeners() {
    // Escutar eventos customizados
    window.addEventListener("userDataUpdated", (event) => {
      if (event.detail && event.detail.userData) {
        this.updateUserData(event.detail.userData);
      }
    });

    window.addEventListener("profilePhotoUpdated", (event) => {
      if (event.detail && event.detail.photoUrl) {
        this.updateProfilePhoto(event.detail.photoUrl);
      }
    });

    window.addEventListener("profilePhotoRemoved", () => {
      this.updateProfilePhoto(null);
    });

    // 📱 MOBILE: Listener específico para forçar atualização
    window.addEventListener("forcePhotoUpdate", () => {
      this.forceUpdateAllPhotos();
    });

    // Escutar mudanças no localStorage de outras abas
    window.addEventListener("storage", (event) => {
      if (event.key === "userData") {
        this.loadUserData();

        // 📱 MOBILE: Forçar atualização após mudança no storage
        if (this.isMobile) {
          setTimeout(() => {
            this.forceUpdateAllPhotos();
          }, 200);
        }
      }
    });
  }

  // Atualizar dados do usuário
  updateUserData(newUserData) {
    const oldPhotoUrl = this.userData?.profilePhotoUrl;
    this.userData = { ...this.userData, ...newUserData };
    localStorage.setItem("userData", JSON.stringify(this.userData));

    // 📱 MOBILE: Verificar se a foto mudou e forçar atualização
    const newPhotoUrl = newUserData.profilePhotoUrl;
    if (this.isMobile && oldPhotoUrl !== newPhotoUrl) {
      console.log("📱 Mobile: Foto alterada, forçando atualização imediata");
      this.forceUpdateAllPhotos();
    }

    this.notifyListeners();
  }

  // Atualizar apenas a foto de perfil
  updateProfilePhoto(photoUrl) {
    if (this.userData) {
      this.userData.profilePhotoUrl = photoUrl;
      if (photoUrl) {
        this.userData.avatar = photoUrl; // Para compatibilidade
      }
      localStorage.setItem("userData", JSON.stringify(this.userData));
      this.notifyListeners();

      // 📱 MOBILE: Atualização otimizada para dispositivos móveis
      if (this.isMobile) {
        this.updateProfilePhotoMobile(photoUrl);
      } else {
        this.updateProfilePhotoEverywhere(photoUrl);
      }
    }
  }

  // 📱 NOVO: Atualização otimizada para mobile
  updateProfilePhotoMobile(photoUrl) {
    console.log("📱 Atualizando foto de perfil em dispositivo móvel...");

    // Limpar cache de imagens primeiro
    this.clearImageCache();

    // Atualizar com delay para garantir que o cache foi limpo
    setTimeout(() => {
      this.updateProfilePhotoEverywhere(photoUrl, true);

      // Segunda tentativa com delay adicional (para conexões lentas)
      setTimeout(() => {
        this.forceUpdateAllPhotos();
      }, 500);
    }, 100);
  }

  // 🧹 NOVO: Limpar cache de imagens (importante para mobile)
  clearImageCache() {
    const profileImages = document.querySelectorAll(
      "[data-user-photo], .profile-image, .user-avatar, .profile-avatar, #profile-image, .user-profile-image"
    );

    profileImages.forEach((img) => {
      if (img.tagName === "IMG") {
        // Força o navegador a recarregar a imagem
        const originalSrc = img.src;
        img.src = "";
        setTimeout(() => {
          img.src = originalSrc;
        }, 50);
      }
    });
  }

  // 🔄 NOVO: Forçar atualização de todas as fotos
  forceUpdateAllPhotos() {
    if (!this.userData) return;

    const photoUrl = this.userData.profilePhotoUrl || this.userData.avatar;
    console.log("🔄 Forçando atualização de todas as fotos:", photoUrl);

    this.updateProfilePhotoEverywhere(photoUrl, true);
  }

  // ✨ FUNÇÃO ADICIONADA: Gerar a URL do placeholder com as iniciais do usuário
  getInitialsPlaceholderUrl(userName) {
    const nameToPass = userName && typeof userName === "string" ? userName : "";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nameToPass
    )}&background=00d4ff&color=fff&size=120`;
  }

  // Atualizar todas as imagens de perfil na página atual
  updateProfilePhotoEverywhere(photoUrl, forceRefresh = false) {
    const profileImages = document.querySelectorAll(
      "[data-user-photo], .profile-image, .user-avatar, .profile-avatar, #profile-image, .user-profile-image"
    );

    const imageUrl = this.getImageUrl(photoUrl, forceRefresh);

    profileImages.forEach((img, index) => {
      if (img.tagName === "IMG") {
        // 📱 MOBILE: Adicionar delay escalonado para evitar sobrecarga
        const delay = this.isMobile ? index * 50 : 0;

        setTimeout(() => {
          img.src = imageUrl;

          // Efeito visual de atualização
          img.style.transition = "opacity 0.3s ease";
          img.style.opacity = "0.7";
          setTimeout(() => {
            img.style.opacity = "1";
          }, 150);

          // Fallback para erro
          img.onerror = () => {
            console.warn("❌ Erro ao carregar imagem, usando placeholder");
            img.src = this.getInitialsPlaceholderUrl(
              this.getUserData()?.name || this.getUserData()?.fullName || ""
            );
          };
        }, delay);
      } else if (img.style) {
        // Para elementos com backgroundImage
        setTimeout(
          () => {
            img.style.backgroundImage = `url(${imageUrl})`;
            img.style.backgroundSize = "cover";
            img.style.backgroundPosition = "center";
          },
          this.isMobile ? index * 50 : 0
        );
      }
    });

    // Atualizar elementos específicos por ID (se existirem)
    const specificElements = [
      "profile-photo",
      "user-photo",
      "header-avatar",
      "sidebar-avatar",
      "nav-avatar",
    ];

    specificElements.forEach((id, index) => {
      const element = document.getElementById(id);
      if (element) {
        const delay = this.isMobile ? index * 30 : 0;

        setTimeout(() => {
          if (element.tagName === "IMG") {
            element.src = imageUrl;
          } else {
            element.style.backgroundImage = `url(${imageUrl})`;
            element.style.backgroundSize = "cover";
            element.style.backgroundPosition = "center";
          }
        }, delay);
      }
    });

    // 📱 MOBILE: Disparar evento personalizado após atualização
    if (this.isMobile) {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("mobilePhotoUpdateComplete", {
            detail: { photoUrl: imageUrl },
          })
        );
      }, 1000);
    }
  }

  // Obter URL completa da imagem
  getImageUrl(photoUrl, forceRefresh = false) {
    if (!photoUrl) {
      const userData = this.getUserData();
      return this.getInitialsPlaceholderUrl(
        userData?.name || userData?.fullName || ""
      );
    }

    let finalUrl;
    if (photoUrl.startsWith("http")) {
      finalUrl = photoUrl;
    } else if (window.apiConfig && window.apiConfig.baseURL) {
      finalUrl = `${window.apiConfig.baseURL}${photoUrl}`;
    } else {
      finalUrl = photoUrl;
    }

    // 📱 MOBILE: Adicionar cache busting apenas quando necessário
    if (forceRefresh || this.isMobile) {
      const separator = finalUrl.includes("?") ? "&" : "?";
      finalUrl = `${finalUrl}${separator}t=${Date.now()}&mobile=1`;
    }

    return finalUrl;
  }

  // Adicionar listener para mudanças
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remover listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notificar todos os listeners
  notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.userData);
      } catch (error) {
        console.error("Erro ao notificar listener:", error);
      }
    });
  }

  // Obter dados do usuário
  getUserData() {
    return this.userData;
  }

  // Obter foto do usuário
  getUserPhoto() {
    return this.userData?.profilePhotoUrl || this.userData?.avatar || null;
  }

  // Atualizar informações específicas
  updateField(field, value) {
    if (this.userData) {
      this.userData[field] = value;
      localStorage.setItem("userData", JSON.stringify(this.userData));
      this.notifyListeners();
    }
  }

  // Limpar dados do usuário (logout)
  clearUserData() {
    this.userData = null;
    localStorage.removeItem("userData");
    localStorage.removeItem("userProfilePhoto");
    localStorage.removeItem("currentUser");
    this.notifyListeners();
  }

  // Sincronizar com a API
  async syncWithAPI() {
    try {
      if (!window.apiConfig) return;

      const response = await window.apiConfig.get("/api/profile");

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          this.updateUserData(result.user);
          return result.user;
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar com API:", error);
    }
    return null;
  }

  // 📱 NOVO: Método específico para mobile - refresh completo
  mobileRefreshProfile() {
    if (!this.isMobile) return;

    console.log("📱 Mobile: Refresh completo do perfil...");

    // Recarregar dados do localStorage
    this.loadUserData();

    // Forçar atualização das fotos
    setTimeout(() => {
      this.forceUpdateAllPhotos();
    }, 200);

    // Notificar listeners
    this.notifyListeners();
  }
}

// Criar instância global
window.userService = new GlobalUserService();

// 📱 NOVA FUNÇÃO: Específica para mobile
function forceMobilePhotoUpdate() {
  if (window.userService && window.userService.isMobile) {
    console.log("📱 Forçando atualização da foto no mobile...");
    window.userService.mobileRefreshProfile();

    // Disparar evento global
    window.dispatchEvent(new CustomEvent("forcePhotoUpdate"));
  }
}

// Função helper para inicializar em qualquer página
function initUserService() {
  if (!window.userService) {
    window.userService = new GlobalUserService();
  }
  return window.userService;
}

// Função helper para atualizar foto de perfil
function updateUserProfilePhoto(photoUrl) {
  if (window.userService) {
    window.userService.updateProfilePhoto(photoUrl);

    // 📱 MOBILE: Forçar atualização adicional
    if (window.userService.isMobile) {
      setTimeout(() => {
        forceMobilePhotoUpdate();
      }, 500);
    }
  }
}

// Função helper para obter dados do usuário
function getUserData() {
  return window.userService ? window.userService.getUserData() : null;
}

// 📱 NOVA FUNÇÃO: Detectar se é mobile
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Exportar para uso em módulos (se necessário)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GlobalUserService,
    initUserService,
    updateUserProfilePhoto,
    getUserData,
    forceMobilePhotoUpdate,
    isMobileDevice,
  };
}

// 📱 MOBILE: Listener global para orientação
if (isMobileDevice()) {
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      forceMobilePhotoUpdate();
    }, 1000);
  });
}
