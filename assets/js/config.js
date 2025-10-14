// Configuração global da API - Living Coins
const CONFIG = {
  // URL base da API - altere conforme seu ambiente
  API_BASE: "http://localhost:5000/api",

  // Endpoints da API
  ENDPOINTS: {
    // Autenticação
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh",

    // Usuário
    profile: "/user/profile",
    updateProfile: "/user/profile",
    balance: "/user/balance",
    updateBalance: "/user/update-balance",
    stats: "/user/stats",

    // Transações
    transactions: "/transactions",
    sendCoins: "/transactions/send",
    requestCoins: "/transactions/request",

    // Outros
    leaderboard: "/leaderboard",
    notifications: "/notifications",
  },

  // Configurações de autenticação
  AUTH: {
    tokenKey: "authToken",
    userDataKey: "userData",
    loginStatusKey: "isLoggedIn",
    rememberMeKey: "rememberMe",
    rememberedEmailKey: "rememberedEmail",
  },

  // Configurações de moedas
  COINS: {
    // Níveis baseados no saldo de moedas
    levels: {
      1: { min: 0, max: 199, name: "Iniciante", color: "#8B5CF6", icon: "🌱" },
      2: {
        min: 200,
        max: 499,
        name: "Explorador",
        color: "#06B6D4",
        icon: "🔍",
      },
      3: {
        min: 500,
        max: 999,
        name: "Aventureiro",
        color: "#10B981",
        icon: "🎒",
      },
      4: {
        min: 1000,
        max: 4999,
        name: "Benfeitor",
        color: "#F59E0B",
        icon: "🤝",
      },
      5: {
        min: 5000,
        max: 9999,
        name: "Generoso",
        color: "#EF4444",
        icon: "❤️",
      },
      6: {
        min: 10000,
        max: 49999,
        name: "Filantropo",
        color: "#EC4899",
        icon: "🏆",
      },
      7: {
        min: 50000,
        max: 99999,
        name: "Magnata",
        color: "#8B5CF6",
        icon: "💎",
      },
      8: {
        min: 100000,
        max: 499999,
        name: "Lenda",
        color: "#06B6D4",
        icon: "⭐",
      },
      9: {
        min: 500000,
        max: 999999,
        name: "Mito",
        color: "#F97316",
        icon: "🔥",
      },
      10: {
        min: 1000000,
        max: Infinity,
        name: "Divino",
        color: "#FFD700",
        icon: "👑",
      },
    },

    // Recompensas
    // rewards: {
    //   register: 100,
    //   dailyLogin: 10,
    //   firstDonation: 50,
    // },
  },

  // Configurações da interface
  UI: {
    // Tempos de feedback (em millisegundos)
    loadingDelay: 500,
    successFeedbackDuration: 3000,
    errorFeedbackDuration: 5000,
    redirectDelay: 2000,

    // Animações
    animationDuration: 300,
    particleCount: 9,

    // Páginas
    pages: {
      login: "/index.html",
      register: "/pages/register/html/signup.html",
      dashboard: "/pages/home/html/index.html",
      profile: "/profile/pages/profile.html",
      forgotPassword: "/forgot-password/html/forgot-password.html",
    },
  },

  // Configurações de validação
  VALIDATION: {
    email: {
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Por favor, digite um e-mail válido",
    },
    password: {
      minLength: 6,
      message: "A senha deve ter pelo menos 6 caracteres",
    },
    name: {
      minLength: 2,
      message: "O nome deve ter pelo menos 2 caracteres",
    },
  },
};

// Função para obter URL completa do endpoint
CONFIG.getEndpointURL = function (endpoint) {
  return this.API_BASE + this.ENDPOINTS[endpoint];
};

// Função para calcular nível baseado no saldo
CONFIG.calculateLevel = function (balance) {
  for (let level = 1; level <= 10; level++) {
    const levelInfo = this.COINS.levels[level];
    if (balance >= levelInfo.min && balance <= levelInfo.max) {
      return {
        level: level,
        ...levelInfo,
      };
    }
  }
  return { level: 1, ...this.COINS.levels[1] };
};

// Função para formatar números de moedas
CONFIG.formatCoins = function (amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + "M";
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + "K";
  }
  return amount.toString();
};

// Função para obter cor do nível
CONFIG.getLevelColor = function (level) {
  return this.COINS.levels[level]?.color || this.COINS.levels[1].color;
};

// Função para obter nome do nível
CONFIG.getLevelName = function (level) {
  return this.COINS.levels[level]?.name || this.COINS.levels[1].name;
};

// Validar se todas as configurações estão corretas
CONFIG.validate = function () {
  console.log("🔧 Configurações carregadas:", {
    API_BASE: this.API_BASE,
    endpoints: Object.keys(this.ENDPOINTS).length,
    levels: Object.keys(this.COINS.levels).length,
  });

  // Verificar se a API está respondendo
  return fetch(this.API_BASE + "/api/health")
    .then((response) => {
      if (response.ok) {
        console.log("✅ API conectada com sucesso");
        return true;
      } else {
        console.warn("⚠️ API respondendo, mas com status:", response.status);
        return false;
      }
    })
    .catch((error) => {
      console.error("❌ Erro ao conectar com a API:", error.message);
      return false;
    });
};

// Exportar configuração para outros arquivos
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
