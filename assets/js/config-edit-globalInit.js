// globalInit.js - Inicializador global para todas as páginas - VERSÃO CORRIGIDA

(function () {
  "use strict";

  function loadUserInterface() {
    const userData = getUserData();
    if (!userData) return;

    const nameElements = document.querySelectorAll(
      "[data-user-name], .user-name, .profile-name, .user-fullname"
    );
    nameElements.forEach((element) => {
      element.textContent = userData.name || userData.fullName || "Usuário";
    });

    const emailElements = document.querySelectorAll(
      "[data-user-email], .user-email, .profile-email"
    );
    emailElements.forEach((element) => {
      element.textContent = userData.email || "";
    });

    const phoneElements = document.querySelectorAll(
      "[data-user-phone], .user-phone, .profile-phone"
    );
    phoneElements.forEach((element) => {
      element.textContent = userData.phone || "";
    });

    // CORREÇÃO: Atualizar foto com melhor lógica
    if (window.userService) {
      const photoUrl = userData.profilePhotoUrl || userData.avatar;
      window.userService.updateProfilePhotoEverywhere(photoUrl, false);
    } else {
      loadProfilePhotos();
    }

    updateUserStats(userData);
  }

  function updateUserStats(userData) {
    const coinElements = document.querySelectorAll(
      "[data-user-coins], .user-coins, .coins-count"
    );
    coinElements.forEach((element) => {
      element.textContent = userData.coins || userData.balance || "0";
    });

    const levelElements = document.querySelectorAll(
      "[data-user-level], .user-level, .level-count"
    );
    levelElements.forEach((element) => {
      element.textContent = userData.level || "1";
    });

    const xpElements = document.querySelectorAll(
      "[data-user-xp], .user-xp, .xp-count"
    );
    xpElements.forEach((element) => {
      element.textContent = userData.xp || "0";
    });

    const scoreElements = document.querySelectorAll(
      "[data-user-score], .user-score, .score-count"
    );
    scoreElements.forEach((element) => {
      element.textContent = userData.score || "0";
    });

    updateProgressBars(userData);
  }

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

      const progressText = bar.querySelector(".progress-text");
      if (progressText) {
        progressText.textContent = `${currentXp}/${maxXp} XP`;
      }
    });
  }

  function setupUpdateListeners() {
    if (window.userService) {
      window.userService.addListener((userData) => {
        loadUserInterface();
      });
    }
  }

  function getInitialsPlaceholderUrl(userName) {
    const nameToPass = userName && typeof userName === "string" ? userName : "";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nameToPass
    )}&background=00d4ff&color=fff&size=120`;
  }

  // FUNÇÃO CRÍTICA CORRIGIDA: Sem cache desnecessário
  function loadProfilePhotos(forceRefresh = false) {
    const userData = getUserData();
    if (!userData) return;

    // console.log("Carregando fotos de perfil:", userData.profilePhotoUrl);

    const photoUrl = userData.profilePhotoUrl || userData.avatar;

    let finalUrl;
    if (photoUrl) {
      if (photoUrl.startsWith("http")) {
        finalUrl = photoUrl;
      } else if (
        photoUrl.startsWith("/uploads/") ||
        photoUrl.includes("uploads")
      ) {
        const baseURL = window.apiConfig?.baseURL || "http://localhost:5000";
        finalUrl = `${baseURL}${
          photoUrl.startsWith("/") ? "" : "/"
        }${photoUrl}`;
      } else {
        finalUrl = photoUrl;
      }

      // CACHE BUSTING apenas quando forçado
      if (forceRefresh) {
        const separator = finalUrl.includes("?") ? "&" : "?";
        finalUrl = `${finalUrl}${separator}t=${Date.now()}&mobile=1&v=${Math.random()}`;
        // console.log("Cache busting aplicado em globalInit:", finalUrl);
      }
    } else {
      finalUrl = getInitialsPlaceholderUrl(userData.name || userData.fullName);
    }

    // console.log("URL final da imagem:", finalUrl);

    const profileImages = document.querySelectorAll(
      "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
    );

    profileImages.forEach((img) => {
      img.src = finalUrl;
      img.onerror = function () {
        console.error("Erro ao carregar imagem:", finalUrl);
        this.src = getInitialsPlaceholderUrl(
          userData.name || userData.fullName
        );
      };
      img.style.transition = "opacity 0.3s ease";
      img.style.opacity = "0.7";
      setTimeout(() => {
        img.style.opacity = "1";
      }, 150);
    });

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

  function initializeProfilePhoto() {
    // console.log("Inicializando foto de perfil...");

    setTimeout(() => {
      const userData = getUserData();
      if (userData && userData.profilePhotoUrl) {
        // console.log(
        //   "Foto de perfil encontrada no userData:",
        //   userData.profilePhotoUrl
        // );
        loadProfilePhotos(false);

        window.dispatchEvent(
          new CustomEvent("profilePhotoUpdated", {
            detail: {
              photoUrl: userData.profilePhotoUrl,
              forceRefresh: false,
              source: "globalInit",
            },
          })
        );
      } else {
        // console.log("Nenhuma foto de perfil encontrada no userData");
      }
    }, 100);
  }

  function initGlobal() {
    // console.log("Inicializando sistema global...");

    if (window.userService) {
      loadUserInterface();
      setupUpdateListeners();
      loadProfilePhotos(false);
    } else {
      setTimeout(() => {
        if (window.userService) {
          loadUserInterface();
          setupUpdateListeners();
          loadProfilePhotos(false);
        } else {
          loadUserInterface();
          loadProfilePhotos(false);
        }
      }, 100);
    }

    initializeProfilePhoto();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobal);
  } else {
    initGlobal();
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      initGlobal();
    }
  });

  // LISTENER CRÍTICO CORRIGIDO: Com forceRefresh
  window.addEventListener("profilePhotoUpdated", (event) => {
    // console.log("Evento de foto atualizada recebido:", event.detail);

    const newPhotoUrl = event.detail.photoUrl;
    const forceRefresh = event.detail.forceRefresh || false;
    const source = event.detail.source || "unknown";

    // console.log(`Origem do evento: ${source}, Force refresh: ${forceRefresh}`);

    const userData = getUserData();
    if (userData) {
      userData.profilePhotoUrl = newPhotoUrl;

      if (typeof Auth !== "undefined" && Auth.saveUserData) {
        Auth.saveUserData({ user: userData });
      } else {
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      // console.log("userData atualizado com nova foto:", newPhotoUrl);
    }

    // CRÍTICO: Passar forceRefresh para loadProfilePhotos
    loadProfilePhotos(forceRefresh);

    // Se for atualização de edit-profile, forçar refresh TOTAL
    if (source === "edit-profile" || forceRefresh) {
      setTimeout(() => {
        // console.log("Refresh adicional forçado após 500ms");
        loadProfilePhotos(true);
      }, 500);
    }
  });

  window.addEventListener("profilePhotoRemoved", () => {
    // console.log("Evento de foto removida recebido");

    const userData = getUserData();
    if (userData) {
      userData.profilePhotoUrl = null;

      if (typeof Auth !== "undefined" && Auth.saveUserData) {
        Auth.saveUserData({ user: userData });
      } else {
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      // console.log("Foto removida do userData");
    }

    const profileImages = document.querySelectorAll(
      "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
    );

    profileImages.forEach((img) => {
      img.src = getInitialsPlaceholderUrl(
        userData?.name || userData?.fullName || ""
      );
    });
  });

  // NOVO: Listener para BroadcastChannel (outras abas)
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel("profile_updates");
      channel.onmessage = (event) => {
        if (event.data.type === "PHOTO_UPDATED") {
          // console.log("Broadcast recebido de outra aba/página");
          const photoUrl = event.data.photoUrl;

          // Atualizar localStorage
          const userData = getUserData();
          if (userData) {
            userData.profilePhotoUrl = photoUrl;
            localStorage.setItem("userData", JSON.stringify(userData));
          }

          // Forçar refresh completo
          loadProfilePhotos(true);

          // Disparar evento local
          window.dispatchEvent(
            new CustomEvent("profilePhotoUpdated", {
              detail: {
                photoUrl: photoUrl,
                forceRefresh: true,
                source: "broadcast",
              },
            })
          );
        }
      };
    } catch (e) {
      // console.log("BroadcastChannel não disponível");
    }
  }

  // NOVO: Listener para storage (outras abas)
  window.addEventListener("storage", function (e) {
    if (e.key === "lastPhotoUpdate" || e.key === "currentPhotoUrl") {
      // console.log("Mudança detectada no localStorage de outra aba");
      setTimeout(() => {
        const photoUrl = localStorage.getItem("currentPhotoUrl");
        const userData = getUserData();

        if (userData && photoUrl) {
          userData.profilePhotoUrl = photoUrl;
          localStorage.setItem("userData", JSON.stringify(userData));
        }

        loadProfilePhotos(true);
      }, 100);
    }
  });

  window.refreshUserInterface = function () {
    // console.log("Atualizacao forcada da interface...");
    initGlobal();
  };

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

  window.reloadProfilePhoto = function (forceRefresh = true) {
    // console.log("Recarregamento forcado da foto de perfil...");
    initializeProfilePhoto();
    loadProfilePhotos(forceRefresh);
  };

  // NOVA FUNÇÃO: Forçar refresh completo de fotos (para mobile)
  window.forceRefreshAllPhotos = function () {
    // console.log("Force refresh TOTAL iniciado pelo globalInit");
    const userData = getUserData();
    if (userData && userData.profilePhotoUrl) {
      loadProfilePhotos(true);

      // Disparar evento para outros sistemas
      window.dispatchEvent(
        new CustomEvent("profilePhotoUpdated", {
          detail: {
            photoUrl: userData.profilePhotoUrl,
            forceRefresh: true,
            source: "globalInit-manual",
          },
        })
      );
    }
  };
})();
