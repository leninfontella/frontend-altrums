// userService.js - Sistema global para gerenciar dados do usuário - VERSÃO CORRIGIDA

class GlobalUserService {
  constructor() {
    this.userData = null;
    this.listeners = new Set();
    this.init();
  }

  init() {
    this.loadUserData();
    this.setupEventListeners();
  }

  loadUserData() {
    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        this.userData = JSON.parse(stored);

        // 🚨 CORREÇÃO CRÍTICA: Limpa a URL inválida '👤' no carregamento
        if (
          this.userData.profilePhotoUrl &&
          typeof this.userData.profilePhotoUrl === "string" &&
          this.userData.profilePhotoUrl.includes("👤")
        ) {
          this.userData.profilePhotoUrl = null;
          console.warn(
            "⚠️ [UserService] profilePhotoUrl inválida ('👤') limpa no carregamento."
          );
        }

        this.notifyListeners();
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  }
  setupEventListeners() {
    window.addEventListener("userDataUpdated", (event) => {
      if (event.detail && event.detail.userData) {
        this.updateUserData(event.detail.userData);
      }
    });

    window.addEventListener("profilePhotoUpdated", (event) => {
      if (event.detail && event.detail.photoUrl) {
        this.updateProfilePhoto(
          event.detail.photoUrl,
          event.detail.forceRefresh
        );
      }
    });

    window.addEventListener("profilePhotoRemoved", () => {
      this.updateProfilePhoto(null);
    });

    window.addEventListener("storage", (event) => {
      if (event.key === "userData") {
        this.loadUserData();
      }
    });
  }

  updateUserData(newUserData) {
    this.userData = { ...this.userData, ...newUserData };
    localStorage.setItem("userData", JSON.stringify(this.userData));
    this.notifyListeners();
  }

  // FUNÇÃO CRÍTICA CORRIGIDA: Com cache busting agressivo para mobile
  updateProfilePhoto(photoUrl, forceRefresh = false) {
    if (this.userData) {
      this.userData.profilePhotoUrl = photoUrl;
      if (photoUrl) {
        this.userData.avatar = photoUrl;
      }
      localStorage.setItem("userData", JSON.stringify(this.userData));
      this.notifyListeners();

      // Atualizar TODAS as imagens com cache busting se forceRefresh = true
      this.updateProfilePhotoEverywhere(photoUrl, forceRefresh);
    }
  }

  getInitialsPlaceholderUrl(userName) {
    const nameToPass = userName && typeof userName === "string" ? userName : "";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nameToPass
    )}&background=00d4ff&color=fff&size=120`;
  }

  // FUNÇÃO CRÍTICA TOTALMENTE REESCRITA: Mobile-friendly
  updateProfilePhotoEverywhere(photoUrl, forceRefresh = false) {
    console.log("Atualizando fotos de perfil em todos os elementos");
    console.log("URL da foto:", photoUrl);
    console.log("Force refresh:", forceRefresh);

    const profileImages = document.querySelectorAll(
      "[data-user-photo], .profile-image, .user-avatar, .profile-avatar, #profile-image, .user-profile-image"
    );

    let imageUrl = this.getImageUrl(photoUrl);

    // CACHE BUSTING AGRESSIVO para mobile quando forceRefresh = true
    if (forceRefresh && imageUrl && !imageUrl.includes("ui-avatars.com")) {
      const separator = imageUrl.includes("?") ? "&" : "?";
      imageUrl = `${imageUrl}${separator}t=${Date.now()}&mobile=1&v=${Math.random()}`;
      console.log("URL com cache busting:", imageUrl);
    }

    let updatedCount = 0;

    profileImages.forEach((img) => {
      if (img.tagName === "IMG") {
        img.src = imageUrl;

        img.style.transition = "opacity 0.3s ease";
        img.style.opacity = "0.7";
        setTimeout(() => {
          img.style.opacity = "1";
        }, 150);

        img.onerror = () => {
          const userName =
            this.getUserData()?.name || this.getUserData()?.fullName || "";
          img.src = this.getInitialsPlaceholderUrl(userName);
        };

        updatedCount++;
      } else if (img.style) {
        img.style.backgroundImage = `url(${imageUrl})`;
        updatedCount++;
      }
    });

    // Atualizar elementos específicos por ID
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
          updatedCount++;
        } else {
          element.style.backgroundImage = `url(${imageUrl})`;
          updatedCount++;
        }
      }
    });

    console.log(`Total de ${updatedCount} elementos atualizados`);
  }

  getImageUrl(photoUrl) {
    if (!photoUrl) {
      const userData = this.getUserData();
      return this.getInitialsPlaceholderUrl(
        userData?.name || userData?.fullName || ""
      );
    }
    if (photoUrl.startsWith("http")) {
      return photoUrl;
    }
    if (window.apiConfig && window.apiConfig.baseURL) {
      return `${window.apiConfig.baseURL}${photoUrl}`;
    }
    return photoUrl;
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.userData);
      } catch (error) {
        console.error("Erro ao notificar listener:", error);
      }
    });
  }

  getUserData() {
    return this.userData;
  }

  getUserPhoto() {
    return this.userData?.profilePhotoUrl || this.userData?.avatar || null;
  }

  updateField(field, value) {
    if (this.userData) {
      this.userData[field] = value;
      localStorage.setItem("userData", JSON.stringify(this.userData));
      this.notifyListeners();
    }
  }

  clearUserData() {
    this.userData = null;
    localStorage.removeItem("userData");
    localStorage.removeItem("userProfilePhoto");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("lastPhotoUpdate");
    localStorage.removeItem("currentPhotoUrl");
    this.notifyListeners();
  }

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

window.userService = new GlobalUserService();

function initUserService() {
  if (!window.userService) {
    window.userService = new GlobalUserService();
  }
  return window.userService;
}

function updateUserProfilePhoto(photoUrl, forceRefresh = false) {
  if (window.userService) {
    window.userService.updateProfilePhoto(photoUrl, forceRefresh);
  }
}

function getUserData() {
  return window.userService ? window.userService.getUserData() : null;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GlobalUserService,
    initUserService,
    updateUserProfilePhoto,
    getUserData,
  };
}
