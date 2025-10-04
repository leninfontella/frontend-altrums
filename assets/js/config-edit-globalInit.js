// globalInit.js - Inicializador global para todas as páginas
(function () {
  "use strict";

  // Função para carregar e exibir dados do usuário
  function loadUserInterface() {
    const userData = getUserData();
    if (!userData) return;

    // Atualizar nome do usuário
    const nameElements = document.querySelectorAll(
      "[data-user-name], .user-name, .profile-name, .user-fullname"
    );
    nameElements.forEach((element) => {
      element.textContent = userData.name || userData.fullName || "Usuário";
    });

    // Atualizar email do usuário
    const emailElements = document.querySelectorAll(
      "[data-user-email], .user-email, .profile-email"
    );
    emailElements.forEach((element) => {
      element.textContent = userData.email || "";
    });

    // Atualizar telefone do usuário
    const phoneElements = document.querySelectorAll(
      "[data-user-phone], .user-phone, .profile-phone"
    );
    phoneElements.forEach((element) => {
      element.textContent = userData.phone || "";
    });

    // 🔧 CORREÇÃO: Atualizar foto de perfil com melhor lógica
    if (window.userService) {
      const photoUrl = userData.profilePhotoUrl || userData.avatar;
      window.userService.updateProfilePhotoEverywhere(photoUrl);
    } else {
      // Fallback caso userService não esteja disponível
      loadProfilePhotos();
    }

    // Atualizar informações específicas (coins, level, etc.)
    updateUserStats(userData);
  }

  // Função para atualizar estatísticas do usuário
  function updateUserStats(userData) {
    // Atualizar coins
    const coinElements = document.querySelectorAll(
      "[data-user-coins], .user-coins, .coins-count"
    );
    coinElements.forEach((element) => {
      element.textContent = userData.coins || userData.balance || "0";
    });

    // Atualizar level
    const levelElements = document.querySelectorAll(
      "[data-user-level], .user-level, .level-count"
    );
    levelElements.forEach((element) => {
      element.textContent = userData.level || "1";
    });

    // Atualizar XP
    const xpElements = document.querySelectorAll(
      "[data-user-xp], .user-xp, .xp-count"
    );
    xpElements.forEach((element) => {
      element.textContent = userData.xp || "0";
    });

    // Atualizar score
    const scoreElements = document.querySelectorAll(
      "[data-user-score], .user-score, .score-count"
    );
    scoreElements.forEach((element) => {
      element.textContent = userData.score || "0";
    });

    // Atualizar barras de progresso
    updateProgressBars(userData);
  }

  // Função para atualizar barras de progresso
  function updateProgressBars(userData) {
    const progressBars = document.querySelectorAll(
      ".progress-bar, [data-progress]"
    );

    progressBars.forEach((bar) => {
      const maxXp = userData.maxXp || 100;
      const currentXp = userData.xp || 0;
      const percentage = Math.min((currentXp / maxXp) * 100, 100);

      if (bar.style) {
        bar.style.width = `${percentage}%`;
      }

      // Atualizar texto da barra se houver
      const progressText = bar.querySelector(".progress-text");
      if (progressText) {
        progressText.textContent = `${currentXp}/${maxXp} XP`;
      }
    });
  }

  // Função para configurar listeners de atualização
  function setupUpdateListeners() {
    if (window.userService) {
      window.userService.addListener((userData) => {
        loadUserInterface();
      });
    }
  }

  // ✨ FUNÇÃO ADICIONADA: Gerar a URL do placeholder com as iniciais do usuário
  function getInitialsPlaceholderUrl(userName) {
    const nameToPass = userName && typeof userName === "string" ? userName : "";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nameToPass
    )}&background=00d4ff&color=fff&size=120`;
  }

  // ✅ FUNÇÃO CORRIGIDA: Função para carregar foto de perfil em elementos específicos
  function loadProfilePhotos() {
    const userData = getUserData();
    if (!userData) return;

    console.log("🔄 Carregando fotos de perfil:", userData.profilePhotoUrl);

    const photoUrl = userData.profilePhotoUrl || userData.avatar;

    // A URL final deve ser a URL da foto ou o placeholder
    let finalUrl;
    if (photoUrl) {
      if (photoUrl.startsWith("http")) {
        finalUrl = photoUrl;
      } else if (
        photoUrl.startsWith("/uploads/") ||
        photoUrl.includes("uploads")
      ) {
        finalUrl = `http://localhost:5000${
          photoUrl.startsWith("/") ? "" : "/"
        }${photoUrl}`;
      } else {
        finalUrl = photoUrl;
      }
    } else {
      // Usar a nova função de placeholder se não houver foto
      finalUrl = getInitialsPlaceholderUrl(userData.name || userData.fullName);
    }

    // ✅ CORREÇÃO: Remover a lógica que adiciona o ?t=
    console.log("📸 URL final da imagem:", finalUrl);
    const profileImages = document.querySelectorAll(
      "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
    );

    profileImages.forEach((img) => {
      const currentSrcBase = img.src.split("?")[0];
      const newSrcBase = finalUrl.split("?")[0];
      if (currentSrcBase !== newSrcBase) {
        console.log(
          `🔄 Atualizando imagem: ${currentSrcBase} -> ${newSrcBase}`
        );
        img.src = finalUrl;
        img.onerror = function () {
          console.error("❌ Erro ao carregar imagem:", finalUrl);
          this.src = getInitialsPlaceholderUrl(
            userData.name || userData.fullName
          );
        };
        img.style.transition = "opacity 0.3s ease";
        img.style.opacity = "0.7";
        setTimeout(() => {
          img.style.opacity = "1";
        }, 150);
      }
    });

    // 🔧 CORREÇÃO: Atualizar também elementos com background-image
    const profileElements = document.querySelectorAll(
      "[data-user-photo]:not(img), .profile-image:not(img), .user-avatar:not(img), .profile-avatar:not(img)"
    );
    profileElements.forEach((element) => {
      if (element.style) {
        element.style.backgroundImage = `url(${finalUrl})`;
        element.style.backgroundSize = "cover";
        element.style.backgroundPosition = "center";
        element.style.backgroundRepeat = "no-repeat";
      }
    });
  }

  // 🔧 NOVA FUNÇÃO: Inicializar foto de perfil no carregamento da página
  function initializeProfilePhoto() {
    console.log("🔄 Inicializando foto de perfil...");

    // Aguardar um momento para garantir que Auth está carregado
    setTimeout(() => {
      const userData = getUserData();
      if (userData && userData.profilePhotoUrl) {
        console.log(
          "📸 Foto de perfil encontrada no userData:",
          userData.profilePhotoUrl
        );
        loadProfilePhotos();

        // Disparar evento para sincronizar com outras partes do sistema
        window.dispatchEvent(
          new CustomEvent("profilePhotoUpdated", {
            detail: { photoUrl: userData.profilePhotoUrl },
          })
        );
      } else {
        console.log("📷 Nenhuma foto de perfil encontrada no userData");
      }
    }, 100);
  }

  // Função principal de inicialização
  function initGlobal() {
    console.log("🚀 Inicializando sistema global...");

    // Aguardar carregamento do userService
    if (window.userService) {
      loadUserInterface();
      setupUpdateListeners();
      loadProfilePhotos();
    } else {
      // Tentar novamente após um breve delay
      setTimeout(() => {
        if (window.userService) {
          loadUserInterface();
          setupUpdateListeners();
          loadProfilePhotos();
        } else {
          // Fallback sem userService
          loadUserInterface();
          loadProfilePhotos();
        }
      }, 100);
    }

    // 🔧 CORREÇÃO: Sempre inicializar foto de perfil
    initializeProfilePhoto();
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobal);
  } else {
    initGlobal();
  }

  // Re-inicializar quando a página ficar visível (útil para PWAs)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      initGlobal();
    }
  });

  // 🔧 CORREÇÃO: Listener aprimorado para mudanças na foto de perfil
  window.addEventListener("profilePhotoUpdated", (event) => {
    console.log("📸 Evento de foto atualizada recebido:", event.detail);

    const newPhotoUrl = event.detail.photoUrl;

    // Atualizar userData no localStorage
    const userData = getUserData();
    if (userData) {
      userData.profilePhotoUrl = newPhotoUrl;

      // Salvar tanto no localStorage quanto no sessionStorage
      if (typeof Auth !== "undefined" && Auth.saveUserData) {
        Auth.saveUserData({ user: userData });
      } else {
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      console.log("💾 userData atualizado com nova foto:", newPhotoUrl);
    }

    // Recarregar fotos em todos os elementos
    loadProfilePhotos();
  });

  // 🔧 CORREÇÃO: Listener para remoção de foto
  window.addEventListener("profilePhotoRemoved", () => {
    console.log("🗑️ Evento de foto removida recebido");

    // Atualizar userData removendo a foto
    const userData = getUserData();
    if (userData) {
      userData.profilePhotoUrl = null;

      if (typeof Auth !== "undefined" && Auth.saveUserData) {
        Auth.saveUserData({ user: userData });
      } else {
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      console.log("💾 Foto removida do userData");
    }

    // Restaurar imagens padrão
    const profileImages = document.querySelectorAll(
      "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
    );

    profileImages.forEach((img) => {
      img.src = getInitialsPlaceholderUrl(userData.name || userData.fullName);
    });
  });

  // Função global para forçar atualização
  window.refreshUserInterface = function () {
    console.log("🔄 Atualizacao forcada da interface...");
    initGlobal();
  };

  // Função para debug
  window.debugUserData = function () {
    console.log("=== DEBUG USER DATA ===");
    console.log("UserData:", getUserData());
    console.log("UserService:", window.userService);
    console.log("Auth disponível:", typeof Auth !== "undefined");

    const userData = getUserData();
    if (userData) {
      console.log("ProfilePhotoUrl:", userData.profilePhotoUrl);
      console.log("Avatar:", userData.avatar);
    }
    console.log("=======================");
  };

  // 🔧 NOVA FUNÇÃO: Forçar recarregamento da foto de perfil
  window.reloadProfilePhoto = function () {
    console.log("🔄 Recarregamento forçado da foto de perfil...");
    initializeProfilePhoto();
    loadProfilePhotos();
  };
})();
