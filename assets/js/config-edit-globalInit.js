// globalInit.js - Inicializador global para todas as páginas - Otimizado para Mobile
(function () {
  "use strict";

  // Detectar dispositivos móveis
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  // Flag para controlar se é mobile
  const IS_MOBILE = isMobileDevice();

  // Log inicial do tipo de dispositivo
  if (IS_MOBILE) {
    console.log("📱 Dispositivo móvel detectado - aplicando otimizações");
  }

  // Função para carregar e exibir dados do usuário
  function loadUserInterface() {
    const userData = getUserData();
    if (!userData) return;

    console.log("🔄 Carregando interface do usuário...");

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

    // Atualizar foto de perfil com otimizações específicas
    if (IS_MOBILE) {
      loadProfilePhotosMobile(userData);
    } else {
      // Desktop: método tradicional
      if (window.userService) {
        const photoUrl = userData.profilePhotoUrl || userData.avatar;
        window.userService.updateProfilePhotoEverywhere(photoUrl);
      } else {
        loadProfilePhotos();
      }
    }

    // Atualizar informações específicas (coins, level, etc.)
    updateUserStats(userData);
  }

  // Carregamento otimizado de fotos para mobile
  function loadProfilePhotosMobile(userData) {
    console.log(
      "📱 Carregando fotos de perfil para mobile:",
      userData.profilePhotoUrl
    );

    const photoUrl = userData.profilePhotoUrl || userData.avatar;
    let finalUrl;

    if (photoUrl) {
      if (photoUrl.startsWith("http")) {
        finalUrl = photoUrl;
      } else if (
        photoUrl.startsWith("/uploads/") ||
        photoUrl.includes("uploads")
      ) {
        // Use a base URL do apiConfig se disponível
        const baseURL = window.apiConfig?.baseURL || "http://localhost:5000";
        finalUrl = `${baseURL}${
          photoUrl.startsWith("/") ? "" : "/"
        }${photoUrl}`;
      } else {
        finalUrl = photoUrl;
      }

      // Cache busting para garantir atualização
      const separator = finalUrl.includes("?") ? "&" : "?";
      finalUrl = `${finalUrl}${separator}t=${Date.now()}&mobile=1`;
    } else {
      // Usar placeholder com iniciais
      finalUrl = getInitialsPlaceholderUrl(userData.name || userData.fullName);
    }

    console.log("📱 Mobile - URL final da imagem:", finalUrl);

    // Selecionar todas as imagens de perfil
    const profileImages = document.querySelectorAll(
      "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
    );

    // Atualizar com delay escalonado para evitar sobrecarga
    profileImages.forEach((img, index) => {
      const delay = index * 100; // 100ms entre cada imagem

      setTimeout(() => {
        const currentSrcBase = img.src.split("?")[0];
        const newSrcBase = finalUrl.split("?")[0];

        if (currentSrcBase !== newSrcBase || photoUrl) {
          console.log(`📱 Mobile - Atualizando imagem ${index + 1}:`, finalUrl);

          // Pré-carregar a imagem antes de definir
          const preloadImg = new Image();
          preloadImg.onload = function () {
            img.src = finalUrl;

            // Efeito visual otimizado para mobile
            img.style.transition = "opacity 0.3s ease";
            img.style.opacity = "0.7";
            setTimeout(() => {
              img.style.opacity = "1";
            }, 150);
          };

          preloadImg.onerror = function () {
            console.error("📱 Erro ao carregar imagem:", finalUrl);
            img.src = getInitialsPlaceholderUrl(
              userData.name || userData.fullName
            );
          };

          preloadImg.src = finalUrl;
        }
      }, delay);
    });

    // Atualizar elementos com background-image
    const profileElements = document.querySelectorAll(
      "[data-user-photo]:not(img), .profile-image:not(img), .user-avatar:not(img), .profile-avatar:not(img)"
    );

    profileElements.forEach((element, index) => {
      const delay = (profileImages.length + index) * 100;

      setTimeout(() => {
        if (element.style) {
          element.style.backgroundImage = `url(${finalUrl})`;
          element.style.backgroundSize = "cover";
          element.style.backgroundPosition = "center";
          element.style.backgroundRepeat = "no-repeat";
        }
      }, delay);
    });

    // Usar UserService se disponível
    if (window.userService && window.userService.isMobile) {
      setTimeout(() => {
        window.userService.forceUpdateAllPhotos();
      }, 500);
    }
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

  // Função para gerar URL do placeholder com iniciais
  function getInitialsPlaceholderUrl(userName) {
    const nameToPass = userName && typeof userName === "string" ? userName : "";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nameToPass
    )}&background=00d4ff&color=fff&size=120`;
  }

  // Função para carregar foto de perfil (fallback para desktop)
  function loadProfilePhotos() {
    const userData = getUserData();
    if (!userData) return;

    console.log("🔄 Carregando fotos de perfil:", userData.profilePhotoUrl);

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
    } else {
      finalUrl = getInitialsPlaceholderUrl(userData.name || userData.fullName);
    }

    console.log("🔗 URL final da imagem:", finalUrl);

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

    // Atualizar elementos com background-image
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

  // Inicializar foto de perfil com otimizações mobile
  function initializeProfilePhoto() {
    console.log("🔄 Inicializando foto de perfil...");

    // Aguardar um momento para garantir que Auth está carregado
    const delay = IS_MOBILE ? 200 : 100;

    setTimeout(() => {
      const userData = getUserData();
      if (userData && userData.profilePhotoUrl) {
        console.log(
          "📷 Foto de perfil encontrada no userData:",
          userData.profilePhotoUrl
        );

        if (IS_MOBILE) {
          loadProfilePhotosMobile(userData);
        } else {
          loadProfilePhotos();
        }

        // Disparar evento para sincronização
        window.dispatchEvent(
          new CustomEvent("profilePhotoUpdated", {
            detail: { photoUrl: userData.profilePhotoUrl },
          })
        );
      } else {
        console.log("📷 Nenhuma foto de perfil encontrada no userData");
      }
    }, delay);
  }

  // Configurações específicas para mobile
  function setupMobileOptimizations() {
    if (!IS_MOBILE) return;

    console.log("📱 Configurando otimizações para mobile...");

    // Listener para mudanças de orientação
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        console.log("📱 Orientação mudou - recarregando interface");
        loadUserInterface();
      }, 500);
    });

    // Listener para quando a página volta ao foco
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        setTimeout(() => {
          console.log("📱 Página focada - verificando interface");
          const userData = getUserData();
          if (userData) {
            loadProfilePhotosMobile(userData);
          }
        }, 200);
      }
    });

    // Listener para resize (pode acontecer em mobile)
    window.addEventListener(
      "resize",
      debounce(() => {
        console.log("📱 Resize detectado - atualizando interface");
        loadUserInterface();
      }, 300)
    );

    // Eventos específicos para mobile
    window.addEventListener("mobileProfileUpdated", (event) => {
      console.log("📱 Evento mobileProfileUpdated recebido:", event.detail);
      setTimeout(() => {
        loadUserInterface();
      }, 100);
    });

    window.addEventListener("mobilePhotoLoaded", (event) => {
      console.log("📱 Foto carregada em mobile:", event.detail);
    });
  }

  // Função utilitária de debounce
  function debounce(func, wait) {
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

  // Função principal de inicialização
  function initGlobal() {
    console.log("🚀 Inicializando sistema global...");

    if (IS_MOBILE) {
      console.log("📱 Modo mobile ativado");
    }

    // Aguardar carregamento do userService
    if (window.userService) {
      loadUserInterface();
      setupUpdateListeners();

      if (IS_MOBILE) {
        // Mobile: usar método otimizado
        const userData = getUserData();
        if (userData) {
          loadProfilePhotosMobile(userData);
        }
      } else {
        // Desktop: método tradicional
        loadProfilePhotos();
      }
    } else {
      // Tentar novamente após delay
      const retryDelay = IS_MOBILE ? 200 : 100;

      setTimeout(() => {
        if (window.userService) {
          loadUserInterface();
          setupUpdateListeners();

          if (IS_MOBILE) {
            const userData = getUserData();
            if (userData) {
              loadProfilePhotosMobile(userData);
            }
          } else {
            loadProfilePhotos();
          }
        } else {
          // Fallback sem userService
          loadUserInterface();

          if (IS_MOBILE) {
            const userData = getUserData();
            if (userData) {
              loadProfilePhotosMobile(userData);
            }
          } else {
            loadProfilePhotos();
          }
        }
      }, retryDelay);
    }

    // Sempre inicializar foto de perfil
    initializeProfilePhoto();

    // Configurar otimizações específicas
    if (IS_MOBILE) {
      setupMobileOptimizations();
    }
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobal);
  } else {
    initGlobal();
  }

  // Re-inicializar quando a página ficar visível
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      // Delay maior para economizar processamento
      const delay = IS_MOBILE ? 300 : 100;
      setTimeout(() => {
        initGlobal();
      }, delay);
    }
  });

  // Listener aprimorado para mudanças na foto de perfil
  window.addEventListener("profilePhotoUpdated", (event) => {
    console.log("📷 Evento de foto atualizada recebido:", event.detail);

    const newPhotoUrl = event.detail.photoUrl;

    // Atualizar userData no localStorage
    const userData = getUserData();
    if (userData) {
      userData.profilePhotoUrl = newPhotoUrl;

      // Salvar dados atualizados
      if (typeof Auth !== "undefined" && Auth.saveUserData) {
        Auth.saveUserData({ user: userData });
      } else {
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      console.log("💾 userData atualizado com nova foto:", newPhotoUrl);
    }

    // Mobile: usar método otimizado
    if (IS_MOBILE && userData) {
      setTimeout(() => {
        loadProfilePhotosMobile(userData);
      }, 100);
    } else {
      // Desktop: recarregar fotos normalmente
      loadProfilePhotos();
    }
  });

  // Listener para remoção de foto
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

    const placeholderUrl = getInitialsPlaceholderUrl(
      userData?.name || userData?.fullName
    );

    profileImages.forEach((img, index) => {
      // Delay escalonado
      const delay = IS_MOBILE ? index * 50 : 0;

      setTimeout(() => {
        img.src = placeholderUrl;
      }, delay);
    });
  });

  // Listener para eventos específicos de mobile
  if (IS_MOBILE) {
    window.addEventListener("mobilePhotoRemoved", (event) => {
      console.log("📱 Evento mobile de foto removida:", event.detail);

      setTimeout(() => {
        loadUserInterface();
      }, 200);
    });

    window.addEventListener("forcePhotoUpdate", () => {
      console.log("📱 Forçando atualização da foto...");

      const userData = getUserData();
      if (userData) {
        loadProfilePhotosMobile(userData);
      }
    });
  }

  // Função global para forçar atualização
  window.refreshUserInterface = function () {
    console.log("🔄 Atualização forçada da interface...");
    initGlobal();
  };

  // Função para debug
  window.debugUserData = function () {
    console.log("=== DEBUG USER DATA ===");
    console.log("UserData:", getUserData());
    console.log("UserService:", window.userService);
    console.log("Auth disponível:", typeof Auth !== "undefined");
    console.log("É Mobile:", IS_MOBILE);

    const userData = getUserData();
    if (userData) {
      console.log("ProfilePhotoUrl:", userData.profilePhotoUrl);
      console.log("Avatar:", userData.avatar);
    }
    console.log("=======================");
  };

  // Forçar recarregamento da foto de perfil com otimizações mobile
  window.reloadProfilePhoto = function () {
    console.log("🔄 Recarregamento forçado da foto de perfil...");

    const userData = getUserData();
    if (userData) {
      if (IS_MOBILE) {
        loadProfilePhotosMobile(userData);
      } else {
        loadProfilePhotos();
      }
    }

    initializeProfilePhoto();
  };

  // Forçar sincronização mobile
  window.forceMobileSync = function () {
    if (!IS_MOBILE) {
      console.log("⚠️ Esta função é apenas para dispositivos móveis");
      return;
    }

    console.log("📱 Forçando sincronização mobile...");

    // Recarregar dados
    const userData = getUserData();
    if (userData) {
      loadProfilePhotosMobile(userData);
    }

    // Notificar UserService
    if (window.userService && window.userService.mobileRefreshProfile) {
      window.userService.mobileRefreshProfile();
    }

    // Disparar eventos
    window.dispatchEvent(new CustomEvent("forcePhotoUpdate"));
    window.dispatchEvent(
      new CustomEvent("mobileProfileUpdated", {
        detail: {
          userData,
          forced: true,
          timestamp: Date.now(),
        },
      })
    );
  };

  // Limpar cache de imagens mobile
  window.clearMobileImageCache = function () {
    if (!IS_MOBILE) return;

    console.log("📱 Limpando cache de imagens mobile...");

    const profileImages = document.querySelectorAll(
      "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
    );

    profileImages.forEach((img, index) => {
      setTimeout(() => {
        const originalSrc = img.src;
        img.src =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 transparent gif

        setTimeout(() => {
          img.src = originalSrc;
        }, 50);
      }, index * 20);
    });
  };

  // Verificar conectividade mobile
  window.checkMobileConnectivity = function () {
    if (!IS_MOBILE) return { status: "not-mobile" };

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const isOnline = navigator.onLine;

    return {
      isOnline,
      connectionType: connection?.effectiveType || "unknown",
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
      isMobile: IS_MOBILE,
    };
  };

  // Otimizar performance para mobile
  window.optimizeMobilePerformance = function () {
    if (!IS_MOBILE) return;

    console.log("📱 Otimizando performance para mobile...");

    // Reduzir qualidade de imagens se conexão lenta
    const connectivity = window.checkMobileConnectivity();
    if (
      connectivity.connectionType === "2g" ||
      connectivity.connectionType === "slow-2g"
    ) {
      console.log("📱 Conexão lenta detectada - aplicando otimizações");

      // Aplicar otimizações específicas para conexão lenta
      document.querySelectorAll("img").forEach((img) => {
        if (img.src && img.src.includes("ui-avatars.com")) {
          // Reduzir tamanho dos avatars para conexões lentas
          img.src = img.src.replace("size=120", "size=80");
        }
      });
    }

    // Pausar animações desnecessárias
    if (connectivity.saveData) {
      document.documentElement.style.setProperty(
        "--animation-duration",
        "0.1s"
      );
    }
  };

  // Listener para mudanças na conectividade
  if (IS_MOBILE && navigator.connection) {
    navigator.connection.addEventListener("change", () => {
      console.log("📱 Conectividade mudou:", window.checkMobileConnectivity());
      window.optimizeMobilePerformance();
    });
  }

  // Listeners de conectividade
  if (IS_MOBILE) {
    window.addEventListener("online", () => {
      console.log("📱 Voltou online - sincronizando...");
      setTimeout(() => {
        window.refreshUserInterface();
      }, 1000);
    });

    window.addEventListener("offline", () => {
      console.log("📱 Ficou offline - modo economia ativado");
    });
  }

  // Verificar e atualizar foto periodicamente (só mobile)
  if (IS_MOBILE) {
    let photoCheckInterval;

    window.startMobilePhotoSync = function (intervalMs = 30000) {
      // 30 segundos
      if (photoCheckInterval) {
        clearInterval(photoCheckInterval);
      }

      photoCheckInterval = setInterval(() => {
        if (!document.hidden && navigator.onLine) {
          const userData = getUserData();
          if (userData && userData.profilePhotoUrl) {
            console.log("📱 Verificação periódica da foto...");
            loadProfilePhotosMobile(userData);
          }
        }
      }, intervalMs);

      console.log(
        `📱 Sincronização automática da foto iniciada (${intervalMs}ms)`
      );
    };

    window.stopMobilePhotoSync = function () {
      if (photoCheckInterval) {
        clearInterval(photoCheckInterval);
        photoCheckInterval = null;
        console.log("📱 Sincronização automática da foto parada");
      }
    };

    // Iniciar sincronização automática apenas se estiver online
    if (navigator.onLine) {
      window.startMobilePhotoSync(60000); // 1 minuto
    }
  }

  // Reset completo para mobile
  window.resetMobileProfile = function () {
    if (!IS_MOBILE) return;

    console.log("📱 Reset completo do perfil mobile...");

    // Parar sincronização
    if (window.stopMobilePhotoSync) {
      window.stopMobilePhotoSync();
    }

    // Limpar cache
    window.clearMobileImageCache?.();

    // Recarregar tudo
    setTimeout(() => {
      window.refreshUserInterface();

      // Reiniciar sincronização
      if (window.startMobilePhotoSync && navigator.onLine) {
        window.startMobilePhotoSync();
      }
    }, 500);
  };

  // Detectar mudanças drásticas no viewport (rotação, teclado virtual)
  if (IS_MOBILE) {
    let lastViewportHeight = window.innerHeight;

    window.addEventListener(
      "resize",
      debounce(() => {
        const currentHeight = window.innerHeight;
        const heightDifference = Math.abs(lastViewportHeight - currentHeight);

        // Se a mudança for significativa (>150px), provavelmente é teclado virtual ou rotação
        if (heightDifference > 150) {
          console.log("📱 Mudança significativa no viewport detectada");
          setTimeout(() => {
            window.refreshUserInterface();
          }, 300);
        }

        lastViewportHeight = currentHeight;
      }, 250)
    );
  }

  // Debug completo para mobile
  window.debugMobileProfile = function () {
    if (!IS_MOBILE) {
      console.log("⚠️ Esta função é específica para dispositivos móveis");
      return;
    }

    console.log("=== DEBUG MOBILE PROFILE ===");
    console.log("Dispositivo:", {
      userAgent: navigator.userAgent,
      isMobile: IS_MOBILE,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      orientation: screen.orientation?.type || "desconhecida",
    });

    console.log("Conectividade:", window.checkMobileConnectivity());

    console.log("UserData:", getUserData());

    console.log("UserService:", {
      available: !!window.userService,
      isMobile: window.userService?.isMobile,
      userData: window.userService?.getUserData(),
    });

    console.log("Imagens de perfil na página:");
    document
      .querySelectorAll(
        "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
      )
      .forEach((img, index) => {
        console.log(`  ${index + 1}:`, {
          src: img.src,
          id: img.id,
          className: img.className,
          loaded: img.complete && img.naturalHeight !== 0,
        });
      });

    console.log("==========================");
  };

  // Quando a página está totalmente carregada (mobile)
  if (IS_MOBILE) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        console.log("📱 Página totalmente carregada - verificação final");
        window.optimizeMobilePerformance();

        // Verificar se todas as imagens carregaram corretamente
        const userData = getUserData();
        if (userData && userData.profilePhotoUrl) {
          const profileImages = document.querySelectorAll(
            "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
          );

          let loadedImages = 0;
          profileImages.forEach((img) => {
            if (img.complete && img.naturalHeight !== 0) {
              loadedImages++;
            }
          });

          console.log(
            `📱 Imagens carregadas: ${loadedImages}/${profileImages.length}`
          );

          // Se algumas imagens não carregaram, forçar reload
          if (loadedImages < profileImages.length) {
            console.log("📱 Algumas imagens não carregaram - forçando reload");
            setTimeout(() => {
              loadProfilePhotosMobile(userData);
            }, 1000);
          }
        }
      }, 1000);
    });
  }

  // Exportar funções úteis para o escopo global
  window.mobileProfileUtils = {
    isMobile: IS_MOBILE,
    loadProfilePhotosMobile: IS_MOBILE ? loadProfilePhotosMobile : null,
    setupMobileOptimizations: IS_MOBILE ? setupMobileOptimizations : null,
    checkConnectivity: window.checkMobileConnectivity,
    optimizePerformance: window.optimizeMobilePerformance,
    forceMobileSync: window.forceMobileSync,
    debugMobile: window.debugMobileProfile,
    resetProfile: window.resetMobileProfile,
    startPhotoSync: IS_MOBILE ? window.startMobilePhotoSync : null,
    stopPhotoSync: IS_MOBILE ? window.stopMobilePhotoSync : null,
    clearImageCache: window.clearMobileImageCache,
  };

  // Função específica para debug mobile
  window.debugMobile = function () {
    console.log("=== DEBUG MOBILE ===");
    console.log("É Mobile:", IS_MOBILE);
    console.log("User Agent:", navigator.userAgent);
    console.log("Orientação:", screen.orientation?.type || "desconhecida");
    console.log("Viewport:", {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    console.log("UserService Mobile:", window.userService?.isMobile);
    console.log("Conectividade:", window.checkMobileConnectivity());
    console.log("===================");
  };

  // Sistema de monitoramento de performance mobile
  if (IS_MOBILE) {
    let performanceMetrics = {
      photoUpdates: 0,
      failedLoads: 0,
      cacheHits: 0,
      syncAttempts: 0,
    };

    window.getMobileMetrics = function () {
      return { ...performanceMetrics };
    };

    window.resetMobileMetrics = function () {
      performanceMetrics = {
        photoUpdates: 0,
        failedLoads: 0,
        cacheHits: 0,
        syncAttempts: 0,
      };
      console.log("📊 Métricas mobile resetadas");
    };

    // Interceptar atualizações para coletar métricas
    const originalLoadProfilePhotosMobile = loadProfilePhotosMobile;
    loadProfilePhotosMobile = function (userData) {
      performanceMetrics.photoUpdates++;
      try {
        return originalLoadProfilePhotosMobile(userData);
      } catch (error) {
        performanceMetrics.failedLoads++;
        throw error;
      }
    };
  }

  // Sistema de health check para mobile
  window.healthCheckMobile = function () {
    if (!IS_MOBILE) return { status: "not-mobile" };

    const userData = getUserData();
    const connectivity = window.checkMobileConnectivity();
    const hasUserService = !!window.userService;
    const hasAuth = typeof Auth !== "undefined";

    const profileImages = document.querySelectorAll(
      "img[data-user-photo], img.profile-image, img.user-avatar, img.profile-avatar, img#profile-image, img.user-profile-image"
    );

    let loadedImages = 0;
    profileImages.forEach((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        loadedImages++;
      }
    });

    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      checks: {
        userData: !!userData,
        userService: hasUserService,
        auth: hasAuth,
        connectivity: connectivity.isOnline,
        profilePhoto: !!userData?.profilePhotoUrl,
        imagesLoaded: `${loadedImages}/${profileImages.length}`,
        apiConfig: !!window.apiConfig,
      },
      metrics: IS_MOBILE ? window.getMobileMetrics?.() : null,
      connectivity: connectivity,
    };

    // Determinar status geral
    if (!connectivity.isOnline) {
      health.status = "offline";
    } else if (!userData || !hasAuth) {
      health.status = "auth-error";
    } else if (loadedImages < profileImages.length) {
      health.status = "partial-load";
    }

    console.log("📋 Health Check Mobile:", health);
    return health;
  };

  // Auto-recovery system para mobile
  if (IS_MOBILE) {
    let recoveryAttempts = 0;
    const maxRecoveryAttempts = 3;

    window.autoRecoverMobile = function () {
      if (recoveryAttempts >= maxRecoveryAttempts) {
        console.log("🚨 Máximo de tentativas de recovery atingido");
        return false;
      }

      recoveryAttempts++;
      console.log(
        `🔧 Tentativa de auto-recovery ${recoveryAttempts}/${maxRecoveryAttempts}`
      );

      const health = window.healthCheckMobile();

      if (health.status === "partial-load" || health.status === "auth-error") {
        // Tentar recarregar dados
        setTimeout(() => {
          window.resetMobileProfile();
        }, 1000);
        return true;
      }

      return false;
    };

    // Executar health check periodicamente
    setInterval(() => {
      if (navigator.onLine && !document.hidden) {
        const health = window.healthCheckMobile();

        if (health.status !== "ok" && health.status !== "offline") {
          console.log("⚠️ Problema detectado, iniciando auto-recovery");
          window.autoRecoverMobile();
        }
      }
    }, 120000); // 2 minutos
  }

  // Listener para mudanças críticas no sistema
  window.addEventListener("error", (event) => {
    if (IS_MOBILE && event.filename?.includes("profile")) {
      console.error("🚨 Erro crítico relacionado ao perfil:", event.error);

      // Tentar recovery automático
      setTimeout(() => {
        window.autoRecoverMobile?.();
      }, 2000);
    }
  });

  // Preventivo: limpar listeners órfãos
  window.addEventListener("beforeunload", () => {
    if (IS_MOBILE && window.stopMobilePhotoSync) {
      window.stopMobilePhotoSync();
    }
  });

  console.log("🚀 GlobalInit.js carregado completamente");
  if (IS_MOBILE) {
    console.log(
      "📱 Sistema mobile inicializado com:",
      Object.keys(window.mobileProfileUtils)
    );
    console.log("📱 Health check disponível em: window.healthCheckMobile()");
    console.log("📱 Métricas disponíveis em: window.getMobileMetrics()");
    console.log("📱 Debug mobile em: window.debugMobile()");
  }
})();
