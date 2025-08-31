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

    // Atualizar foto de perfil
    if (window.userService) {
      const photoUrl = userData.profilePhotoUrl || userData.avatar;
      window.userService.updateProfilePhotoEverywhere(photoUrl);
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
      element.textContent = userData.coins || "0";
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

  // Função para carregar foto de perfil em elementos específicos

  // ✅ FUNÇÃO CORRIGIDA: Função para carregar foto de perfil em elementos específicos
  function loadProfilePhotos() {
    const userData = getUserData();
    if (!userData) return;

    const photoUrl = userData.profilePhotoUrl || userData.avatar;
    const imageUrl =
      photoUrl || "https://placehold.co/120x120/00d4ff/ffffff?text=User";

    const profileImages = document.querySelectorAll(
      "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
    );

    profileImages.forEach((img) => {
      // Extrair a URL base da imagem atual (sem o timestamp ?t=...)
      const currentSrcBase = img.src.split("?")[0];

      // Apenas atualiza a imagem se a URL base for diferente
      if (currentSrcBase !== imageUrl) {
        img.src = imageUrl;
        img.onerror = function () {
          this.src = "https://placehold.co/120x120/00d4ff/ffffff?text=User";
        };
      }
    });
  }

  // Função principal de inicialização
  function initGlobal() {
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
        }
      }, 100);
    }
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

  // Função global para forçar atualização
  window.refreshUserInterface = function () {
    initGlobal();
  };

  // Função para debug
  window.debugUserData = function () {
    console.log("UserData:", getUserData());
    console.log("UserService:", window.userService);
  };
})();
