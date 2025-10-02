// assets/js/websocket-global.js
// WebSocket que funciona em TODAS as páginas do sistema

class GlobalWebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
    this.isAuthenticated = false;
    this.heartbeatInterval = null;
    this.listeners = new Map();
    this.pendingNotifications = []; // Notificações não visualizadas

    // Carregar notificações pendentes do localStorage
    this.loadPendingNotifications();

    console.log("🌐 WebSocket Global inicializado");
  }

  connect() {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    if (!Auth.checkSession()) {
      console.log("⚠️ Usuário não logado - WebSocket não será iniciado");
      return;
    }

    this.isConnecting = true;

    // Determinar URL do WebSocket baseado no ambiente
    let wsUrl;

    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      // Desenvolvimento local
      wsUrl = "ws://localhost:5000/ws";
    } else {
      // Produção - Render.com
      wsUrl = "wss://api-backend-coins.onrender.com/ws";
    }

    console.log(`🔌 Conectando ao WebSocket Global: ${wsUrl}`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket Global conectado");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.authenticate();
        this.startHeartbeat();
        this.emit("connected");
        this.updateConnectionIndicator("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("❌ Erro ao processar mensagem:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("❌ Erro no WebSocket Global:", error);
        this.emit("error", error);
      };

      this.ws.onclose = (event) => {
        console.log("🔌 WebSocket Global desconectado", event.code);
        this.isConnecting = false;
        this.isAuthenticated = false;
        this.stopHeartbeat();
        this.emit("disconnected");
        this.updateConnectionIndicator("disconnected");
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("❌ Erro ao criar WebSocket Global:", error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  authenticate() {
    const token = Auth.getToken();

    if (!token) {
      console.error("❌ Token não encontrado");
      this.disconnect();
      return;
    }

    this.send({
      type: "auth",
      token: token,
    });
  }

  handleMessage(data) {
    console.log("📨 Mensagem recebida:", data.type);

    switch (data.type) {
      case "authenticated":
        this.isAuthenticated = true;
        console.log("✅ Autenticado no WebSocket Global");
        this.emit("authenticated");
        // Verificar notificações pendentes ao autenticar
        this.checkPendingNotifications();
        break;

      case "donation_received":
        console.log("💰 Doação recebida:", data.data);
        this.handleDonationReceived(data.data);
        break;

      case "pong":
        break;

      case "error":
        console.error("❌ Erro do servidor:", data.message);
        this.emit("error", data.message);
        break;
    }

    this.emit("message", data);
  }

  handleDonationReceived(donationData) {
    // Salvar notificação como pendente
    this.addPendingNotification(donationData);

    // Atualizar saldo local no localStorage/sessionStorage
    if (donationData.newBalance !== undefined) {
      try {
        // Atualizar no userData
        const userData = Auth.getUserData();
        if (userData) {
          userData.coins = donationData.newBalance;

          // Salvar de volta
          const storage = localStorage.getItem("userData")
            ? localStorage
            : sessionStorage;
          storage.setItem("userData", JSON.stringify(userData));

          console.log("✅ Saldo local atualizado:", donationData.newBalance);
        }
      } catch (error) {
        console.error("Erro ao atualizar saldo local:", error);
      }

      // Atualizar UI se disponível
      if (typeof UserSystem !== "undefined") {
        UserSystem.updateBalanceInterface(donationData.newBalance);
      }
    }

    // Mostrar popup imediatamente
    this.showDonationReceivedPopup(donationData);

    // Som de notificação
    this.playNotificationSound();

    // Emitir evento
    this.emit("donation_received", donationData);

    // Atualizar estatísticas
    setTimeout(() => {
      if (typeof UserSystem !== "undefined") {
        UserSystem.loadUserStats();
      }
    }, 1000);
  }

  addPendingNotification(donationData) {
    const notification = {
      id: donationData.donationId || Date.now(),
      ...donationData,
      timestamp: new Date().toISOString(),
      viewed: false,
    };

    this.pendingNotifications.push(notification);
    this.savePendingNotifications();

    console.log("📥 Notificação salva como pendente");
  }

  checkPendingNotifications() {
    const unviewedNotifications = this.pendingNotifications.filter(
      (n) => !n.viewed
    );

    if (unviewedNotifications.length > 0) {
      console.log(
        `📬 ${unviewedNotifications.length} notificações pendentes encontradas`
      );

      // Mostrar a mais recente
      const latest = unviewedNotifications[unviewedNotifications.length - 1];
      this.showDonationReceivedPopup(latest);

      // Marcar como visualizada
      this.markNotificationAsViewed(latest.id);
    }
  }

  markNotificationAsViewed(notificationId) {
    const notification = this.pendingNotifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.viewed = true;
      this.savePendingNotifications();
    }
  }

  loadPendingNotifications() {
    try {
      const stored = localStorage.getItem("pendingDonationNotifications");
      if (stored) {
        this.pendingNotifications = JSON.parse(stored);
        // Remover notificações antigas (mais de 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.pendingNotifications = this.pendingNotifications.filter(
          (n) => new Date(n.timestamp) > oneDayAgo
        );
      }
    } catch (error) {
      console.error("Erro ao carregar notificações pendentes:", error);
      this.pendingNotifications = [];
    }
  }

  savePendingNotifications() {
    try {
      localStorage.setItem(
        "pendingDonationNotifications",
        JSON.stringify(this.pendingNotifications)
      );
    } catch (error) {
      console.error("Erro ao salvar notificações pendentes:", error);
    }
  }

  showDonationReceivedPopup(data) {
    // Remover popup existente
    const existingPopup = document.getElementById("donation-received-popup");
    if (existingPopup) {
      existingPopup.remove();
    }

    const { amount, message, donor, newBalance } = data;

    const popupHTML = `
      <div id="donation-received-popup" class="donation-received-popup">
        <div class="donation-received-backdrop" onclick="GlobalWS.closePopup()"></div>
        <div class="donation-received-content">
          <div class="donation-confetti">
            ${Array(9)
              .fill(0)
              .map(() => '<div class="confetti-piece"></div>')
              .join("")}
          </div>
          
          <div class="donation-received-icon">
            <i class="fas fa-gift"></i>
          </div>
          
          <h2 class="donation-received-title">Você Recebeu uma Doação!</h2>
          
          <p class="donation-received-message">
            ${message || "Alguém acreditou em você e fez uma doação!"}
          </p>
          
          <div class="donation-received-details">
            <div class="donation-received-amount">
              <span class="coin-emoji">🪙</span>
              ${amount.toLocaleString()} moedas
            </div>
            
            <div class="donation-received-new-balance">
              Seu saldo atual é: <strong>${newBalance.toLocaleString()} moedas</strong>
            </div>
            
            <div class="donation-received-donor">
              Doação de <strong>${donor.name}</strong>
              ${donor.username ? ` (@${donor.username})` : ""}
            </div>
          </div>
          
          <button class="donation-received-close" onclick="GlobalWS.closePopup()">
            Continuar
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", popupHTML);

    // Marcar como visualizada
    if (data.donationId || data.id) {
      this.markNotificationAsViewed(data.donationId || data.id);
    }

    // Auto-fechar após 10 segundos
    setTimeout(() => {
      this.closePopup();
    }, 10000);
  }

  closePopup() {
    const popup = document.getElementById("donation-received-popup");
    if (popup) {
      popup.classList.add("closing");
      setTimeout(() => popup.remove(), 400);
    }
  }

  playNotificationSound() {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99];
      let currentTime = audioContext.currentTime;

      notes.forEach((freq) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.1, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.3);

        currentTime += 0.15;
      });
    } catch (error) {
      console.log("⚠️ Som de notificação não disponível");
    }
  }

  updateConnectionIndicator(status) {
    const indicator = document.getElementById("global-ws-indicator");
    if (!indicator) return;

    indicator.className = "global-ws-indicator " + status;

    const statusText =
      {
        connected: "Tempo real ativo",
        disconnected: "Reconectando...",
        offline: "Offline",
      }[status] || "Conectando...";

    const textEl = indicator.querySelector(".ws-status-text");
    if (textEl) textEl.textContent = statusText;

    // Mostrar por 3 segundos se conectado
    if (status === "connected") {
      indicator.classList.add("show");
      setTimeout(() => indicator.classList.remove("show"), 3000);
    } else {
      indicator.classList.add("show");
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error);
        return false;
      }
    }
    return false;
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Máximo de tentativas de reconexão atingido");
      this.updateConnectionIndicator("offline");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(
      `🔄 Reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`
    );

    setTimeout(() => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnecting = false;
    this.isAuthenticated = false;
    this.reconnectAttempts = 0;
  }

  // Sistema de eventos
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erro no callback ${event}:`, error);
        }
      });
    }
  }

  getStatus() {
    return {
      connected: this.ws && this.ws.readyState === WebSocket.OPEN,
      authenticated: this.isAuthenticated,
      reconnectAttempts: this.reconnectAttempts,
      pendingNotifications: this.pendingNotifications.filter((n) => !n.viewed)
        .length,
    };
  }
}

// Instância global - único WebSocket para todo o site
const GlobalWS = new GlobalWebSocketClient();

// Auto-inicializar quando usuário está logado
if (Auth && Auth.checkSession()) {
  // Esperar DOM carregar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => GlobalWS.connect(), 1000);
    });
  } else {
    setTimeout(() => GlobalWS.connect(), 1000);
  }
}

// Reconectar ao voltar para a página
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && Auth.checkSession()) {
    const status = GlobalWS.getStatus();
    if (!status.connected) {
      console.log("🔄 Página ativa - reconectando WebSocket Global...");
      GlobalWS.connect();
    }
  }
});

// Exportar globalmente
window.GlobalWS = GlobalWS;

console.log("✅ WebSocket Global carregado - Funciona em todas as páginas!");
