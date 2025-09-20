// userService.js - Sistema global para gerenciar dados do usuário
class GlobalUserService {
  constructor() {
    this.userData = null;
    this.listeners = new Set();
    this.init();
  }

  // Inicializar o serviço
  init() {
    this.loadUserData();
    this.setupEventListeners();
  }

  // Carregar dados do usuário
  loadUserData() {
    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        this.userData = JSON.parse(stored);
        this.notifyListeners();
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

    // Escutar mudanças no localStorage de outras abas
    window.addEventListener("storage", (event) => {
      if (event.key === "userData") {
        this.loadUserData();
      }
    });
  }

  // Atualizar dados do usuário
  updateUserData(newUserData) {
    this.userData = { ...this.userData, ...newUserData };
    localStorage.setItem("userData", JSON.stringify(this.userData));
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

      // Atualizar todas as imagens de perfil na página atual
      this.updateProfilePhotoEverywhere(photoUrl);
    }
  }

  // ✨ FUNÇÃO ADICIONADA: Gerar a URL do placeholder com as iniciais do usuário
  getInitialsPlaceholderUrl(userName) {
    const nameToPass = userName && typeof userName === "string" ? userName : "";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nameToPass
    )}&background=00d4ff&color=fff&size=120`;
  }

  // Atualizar todas as imagens de perfil na página atual
  updateProfilePhotoEverywhere(photoUrl) {
    const profileImages = document.querySelectorAll(
      "[data-user-photo], .profile-image, .user-avatar, .profile-avatar, #profile-image, .user-profile-image"
    );

    const imageUrl = this.getImageUrl(photoUrl);

    profileImages.forEach((img) => {
      if (img.tagName === "IMG") {
        img.src = imageUrl;

        // Efeito visual de atualização
        img.style.transition = "opacity 0.3s ease";
        img.style.opacity = "0.7";
        setTimeout(() => {
          img.style.opacity = "1";
        }, 150);

        // Fallback para erro
        img.onerror = () => {
          // Usar a nova função para gerar o placeholder correto
          this.src = this.getInitialsPlaceholderUrl(
            this.getUserData()?.name || this.getUserData()?.fullName || ""
          );
        };
      } else if (img.style) {
        // Para elementos com backgroundImage
        img.style.backgroundImage = `url(${imageUrl})`;
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

    specificElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        if (element.tagName === "IMG") {
          element.src = imageUrl;
        } else {
          element.style.backgroundImage = `url(${imageUrl})`;
        }
      }
    });
  }

  // Obter URL completa da imagem
  getImageUrl(photoUrl) {
    if (!photoUrl) {
      const userData = this.getUserData();
      return this.getInitialsPlaceholderUrl(
        userData?.name || userData?.fullName || ""
      );
    }
    if (photoUrl.startsWith("http")) {
      // A URL já é completa, retorne-a como está.
      return photoUrl;
    }
    if (window.apiConfig && window.apiConfig.baseURL) {
      // Combine a base URL com o caminho da imagem.
      return `${window.apiConfig.baseURL}${photoUrl}`;
    }
    return photoUrl; // Retornar URL como está por padrão
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
    localStorage.removeItem("userProfilePhoto"); // ✅ CORREÇÃO: Remover a foto de perfil
    localStorage.removeItem("currentUser"); // ✅ CORREÇÃO: Remover também o currentUser para total limpeza
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
}

// Criar instância global
window.userService = new GlobalUserService();

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
  }
}

// Função helper para obter dados do usuário
function getUserData() {
  return window.userService ? window.userService.getUserData() : null;
}

// Exportar para uso em módulos (se necessário)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GlobalUserService,
    initUserService,
    updateUserProfilePhoto,
    getUserData,
  };
}
