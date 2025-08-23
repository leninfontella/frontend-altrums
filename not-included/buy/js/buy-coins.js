// Variáveis globais para controle do estado neural
let selectedPackage = null;
let selectedPayment = null;
let isProcessing = false;

/**
 * Função para selecionar um pacote de moedas com efeitos neurais
 * @param {HTMLElement} element - Elemento do pacote clicado
 * @param {string} coins - Quantidade de moedas
 * @param {string} price - Preço do pacote
 */
function selectPackage(element, coins, price) {
  if (isProcessing) return;

  // Remove seleção anterior com transição suave
  document.querySelectorAll(".package-card").forEach((card) => {
    card.classList.remove("selected-package", "pulse");
    card.style.transform = "";
  });

  // Adiciona seleção ao pacote clicado com efeito neural
  element.classList.add("selected-package");
  selectedPackage = {
    coins,
    price,
    element: element,
  };

  // Efeito de pulse neural
  element.classList.add("pulse");

  // Feedback visual adicional
  createRippleEffect(element);

  // Atualiza mensagem flutuante
  updateFloatingMessage(`Pacote ${coins} moedas selecionado!`);

  // Remove pulse após animação
  setTimeout(() => {
    element.classList.remove("pulse");
  }, 2000);

  // Se já tem método de pagamento selecionado, inicia processamento
  if (selectedPayment && !isProcessing) {
    setTimeout(() => {
      initiateNeuralPayment();
    }, 800);
  }
}

/**
 * Função para selecionar método de pagamento neural
 * @param {string} method - Método de pagamento selecionado
 */
function selectPayment(method) {
  if (isProcessing) return;

  // Remove seleção anterior
  document.querySelectorAll(".payment-btn").forEach((btn) => {
    btn.classList.remove("selected-payment");
  });

  // Adiciona seleção ao método clicado
  const clickedBtn = event.target.closest(".payment-btn");
  clickedBtn.classList.add("selected-payment");
  selectedPayment = {
    method: method,
    element: clickedBtn,
  };

  // Efeito de ripple
  createRippleEffect(clickedBtn);

  // Atualiza mensagem flutuante
  const paymentNames = {
    pix: "PIX Neural",
    card: "Cartão Quântico",
    paypal: "PayPal Digital",
    crypto: "CryptoNet",
  };

  updateFloatingMessage(`${paymentNames[method]} ativado!`);

  // Se já tem pacote selecionado, inicia processamento
  if (selectedPackage && !isProcessing) {
    setTimeout(() => {
      initiateNeuralPayment();
    }, 800);
  }
}

/**
 * Cria efeito de ripple nos elementos clicados
 * @param {HTMLElement} element - Elemento para aplicar o efeito
 */
function createRippleEffect(element) {
  const ripple = document.createElement("div");
  const rect = element.getBoundingClientRect();

  ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(120,119,198,0.3);
        width: 100px;
        height: 100px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
    `;

  element.style.position = "relative";
  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);

  // Adiciona animação CSS se não existir
  if (!document.querySelector("#ripple-styles")) {
    const style = document.createElement("style");
    style.id = "ripple-styles";
    style.textContent = `
            @keyframes ripple {
                to {
                    transform: translate(-50%, -50%) scale(3);
                    opacity: 0;
                }
            }
        `;
    document.head.appendChild(style);
  }
}

/**
 * Atualiza a mensagem flutuante neural
 * @param {string} message - Nova mensagem
 */
function updateFloatingMessage(message) {
  const floatingMsg = document.querySelector(".floating-message");
  if (floatingMsg) {
    floatingMsg.textContent = `⚡ ${message}`;
    floatingMsg.style.animation = "none";

    setTimeout(() => {
      floatingMsg.style.animation = "float 4s ease-in-out infinite";
    }, 100);
  }
}

/**
 * Inicia o processo de pagamento neural
 */
function initiateNeuralPayment() {
  if (!selectedPackage || !selectedPayment || isProcessing) return;

  isProcessing = true;

  // Feedback visual imediato
  updateFloatingMessage("Iniciando transferência neural...");

  // Simula processamento neural com múltiplas etapas
  setTimeout(() => {
    showNeuralProcessing();
  }, 1000);
}

/**
 * Mostra a interface de processamento neural
 */
function showNeuralProcessing() {
  const mainContent = document.querySelector(".main-content");
  const originalContent = mainContent.innerHTML;

  // Interface de processamento futurista
  mainContent.innerHTML = `
        <div class="neural-processing">
            <div class="processing-header">
                <div class="neural-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <h3>Sistema Neural Ativo</h3>
                <p>Processando transferência quântica</p>
            </div>
            
            <div class="transaction-details">
                <div class="detail-row">
                    <span>Pacote Selecionado:</span>
                    <div class="coin-display">
                        <div class="coin-icon small">Ð</div>
                        <span>${selectedPackage.coins}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <span>Valor Total:</span>
                    <span class="price-display">R$ ${
                      selectedPackage.price
                    }</span>
                </div>
                <div class="detail-row">
                    <span>Método:</span>
                    <span class="method-display">${getPaymentDisplayName(
                      selectedPayment.method
                    )}</span>
                </div>
            </div>

            <div class="neural-progress">
                <div class="progress-stages">
                    <div class="stage active" data-stage="1">
                        <div class="stage-icon"><i class="fas fa-satellite-dish"></i></div>
                        <span>Conectando</span>
                    </div>
                    <div class="stage" data-stage="2">
                        <div class="stage-icon"><i class="fas fa-shield-alt"></i></div>
                        <span>Validando</span>
                    </div>
                    <div class="stage" data-stage="3">
                        <div class="stage-icon"><i class="fas fa-exchange-alt"></i></div>
                        <span>Transferindo</span>
                    </div>
                    <div class="stage" data-stage="4">
                        <div class="stage-icon"><i class="fas fa-check-circle"></i></div>
                        <span>Concluído</span>
                    </div>
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-bar" id="neural-progress-bar"></div>
                    <div class="progress-glow"></div>
                </div>
                
                <div class="processing-text" id="processing-status">
                    Estabelecendo conexão neural...
                </div>
            </div>
        </div>
    `;

  // Inicia sequência de processamento
  startNeuralSequence();
}

/**
 * Executa a sequência de processamento neural
 */
function startNeuralSequence() {
  const stages = [
    {
      duration: 1500,
      progress: 25,
      text: "Estabelecendo conexão neural...",
      stage: 1,
    },
    {
      duration: 1200,
      progress: 50,
      text: "Validando dados biométricos...",
      stage: 2,
    },
    {
      duration: 1800,
      progress: 85,
      text: "Transferindo moedas digitais...",
      stage: 3,
    },
    {
      duration: 800,
      progress: 100,
      text: "Transferência neural concluída!",
      stage: 4,
    },
  ];

  let currentStage = 0;

  function executeStage() {
    if (currentStage >= stages.length) {
      setTimeout(() => {
        showNeuralSuccess();
      }, 1000);
      return;
    }

    const stage = stages[currentStage];

    // Atualiza indicador visual de estágio
    document.querySelectorAll(".stage").forEach((el, index) => {
      el.classList.remove("active", "completed");
      if (index < stage.stage) {
        el.classList.add("completed");
      } else if (index === stage.stage - 1) {
        el.classList.add("active");
      }
    });

    // Atualiza barra de progresso
    const progressBar = document.getElementById("neural-progress-bar");
    const statusText = document.getElementById("processing-status");

    if (progressBar && statusText) {
      progressBar.style.width = stage.progress + "%";
      statusText.textContent = stage.text;
    }

    // Atualiza mensagem flutuante
    updateFloatingMessage(stage.text);

    currentStage++;
    setTimeout(executeStage, stage.duration);
  }

  executeStage();
}

/**
 * Mostra a tela de sucesso neural
 */
function showNeuralSuccess() {
  const mainContent = document.querySelector(".main-content");

  mainContent.innerHTML = `
        <div class="neural-success">
            <div class="success-animation">
                <div class="success-circle">
                    <div class="success-icon">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                <div class="success-particles"></div>
            </div>
            
            <div class="success-content">
                <h2>Transferência Neural Concluída!</h2>
                <p>Suas moedas digitais foram creditadas</p>
                
                <div class="success-details">
                    <div class="coins-received">
                        <div class="coin-icon large">Ð</div>
                        <span class="amount">${selectedPackage.coins}</span>
                        <span class="label">moedas recebidas</span>
                    </div>
                </div>
                
                <div class="success-actions">
                    <button class="neural-btn primary" onclick="resetNeuralInterface()">
                        <i class="fas fa-rocket"></i>
                        Comprar Mais
                    </button>
                    <button class="neural-btn secondary" onclick="goToWallet()">
                        <i class="fas fa-wallet"></i>
                        Ver Carteira
                    </button>
                </div>
            </div>
        </div>
    `;

  // Atualiza saldo de moedas
  updateCoinsBalance();

  // Cria efeito de partículas
  createSuccessParticles();

  // Atualiza mensagem flutuante
  updateFloatingMessage("Sistema neural operacional!");
}

/**
 * Cria efeito de partículas de sucesso
 */
function createSuccessParticles() {
  const container = document.querySelector(".success-particles");
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #7877C6;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            animation: particle-float ${
              1 + Math.random() * 2
            }s ease-out forwards;
            animation-delay: ${Math.random() * 0.5}s;
            opacity: 0;
        `;

    container.appendChild(particle);
  }

  // Adiciona animação CSS se não existir
  if (!document.querySelector("#particle-styles")) {
    const style = document.createElement("style");
    style.id = "particle-styles";
    style.textContent = `
            @keyframes particle-float {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(0);
                }
                50% {
                    opacity: 0.8;
                    transform: translate(-50%, -50%) scale(1) translate(${
                      Math.random() * 200 - 100
                    }px, ${Math.random() * 200 - 100}px);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0) translate(${
                      Math.random() * 300 - 150
                    }px, ${Math.random() * 300 - 150}px);
                }
            }
        `;
    document.head.appendChild(style);
  }
}

/**
 * Atualiza o saldo de moedas com animação
 */
function updateCoinsBalance() {
  const coinsElement = document.querySelector(".coins-amount");
  if (!coinsElement) return;

  const currentCoins = parseInt(coinsElement.textContent.replace(/[^\d]/g, ""));
  const newCoins = currentCoins + parseInt(selectedPackage.coins);

  // Animação de incremento
  let startCount = currentCoins;
  const increment = Math.ceil((newCoins - currentCoins) / 50);

  const countUp = setInterval(() => {
    startCount += increment;
    if (startCount >= newCoins) {
      startCount = newCoins;
      clearInterval(countUp);
    }
    coinsElement.textContent = startCount.toLocaleString("pt-BR");
  }, 30);
}

/**
 * Reseta a interface neural para nova compra
 */
function resetNeuralInterface() {
  isProcessing = false;
  selectedPackage = null;
  selectedPayment = null;

  // Recarrega a página com efeito
  const mainContent = document.querySelector(".main-content");
  mainContent.style.opacity = "0";
  mainContent.style.transform = "translateY(20px)";

  setTimeout(() => {
    location.reload();
  }, 300);
}

/**
 * Navega para a carteira (placeholder)
 */
function goToWallet() {
  updateFloatingMessage("Acessando carteira neural...");
  // Implementar navegação para carteira
  console.log("Navegando para carteira...");
}

/**
 * Retorna nome de exibição para método de pagamento
 * @param {string} method - Método de pagamento
 * @returns {string} Nome de exibição
 */
function getPaymentDisplayName(method) {
  const names = {
    pix: "PIX Neural",
    card: "Cartão Quântico",
    paypal: "PayPal Digital",
    crypto: "CryptoNet",
  };
  return names[method] || method;
}

/**
 * Adiciona estilos CSS para as novas interfaces
 */
function injectNeuralStyles() {
  if (document.querySelector("#neural-styles")) return;

  const style = document.createElement("style");
  style.id = "neural-styles";
  style.textContent = `
        .neural-processing,
        .neural-success {
            text-align: center;
            padding: 40px 20px;
            color: white;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .processing-header {
            margin-bottom: 40px;
        }
        
        .neural-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #7877C6 0%, #5B5A9F 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 36px;
            color: white;
            box-shadow: 0 16px 40px rgba(120,119,198,0.4);
            animation: pulse 2s infinite;
        }
        
        .processing-header h3 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .processing-header p {
            color: #888888;
            font-size: 14px;
        }
        
        .transaction-details {
            background: rgba(255,255,255,0.03);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 40px;
            border: 1px solid rgba(255,255,255,0.08);
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            font-size: 14px;
        }
        
        .detail-row:last-child {
            margin-bottom: 0;
        }
        
        .coin-display {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #7877C6;
            font-weight: 600;
        }
        
        .coin-icon.small {
            width: 20px;
            height: 20px;
            font-size: 12px;
        }
        
        .price-display {
            color: #7877C6;
            font-weight: 600;
        }
        
        .method-display {
            color: #7877C6;
            font-weight: 600;
        }
        
        .progress-stages {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .stage {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            opacity: 0.3;
            transition: all 0.3s ease;
        }
        
        .stage.active {
            opacity: 1;
            transform: scale(1.1);
        }
        
        .stage.completed {
            opacity: 0.8;
            color: #7877C6;
        }
        
        .stage-icon {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .stage.active .stage-icon {
            background: linear-gradient(135deg, #7877C6 0%, #5B5A9F 100%);
            box-shadow: 0 8px 16px rgba(120,119,198,0.3);
        }
        
        .stage span {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .progress-bar-container {
            position: relative;
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #7877C6, #5B5A9F);
            border-radius: 3px;
            transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        
        .progress-glow {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(120,119,198,0.5), transparent);
            animation: glow-move 2s ease-in-out infinite;
        }
        
        @keyframes glow-move {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .processing-text {
            color: #888888;
            font-size: 14px;
            font-weight: 500;
        }
        
        .success-animation {
            position: relative;
            margin-bottom: 40px;
        }
        
        .success-circle {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #7877C6 0%, #5B5A9F 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            box-shadow: 0 20px 60px rgba(120,119,198,0.4);
            animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .success-icon {
            font-size: 48px;
            color: white;
            animation: checkmark 0.6s ease 0.8s both;
        }
        
        @keyframes checkmark {
            0% { transform: scale(0) rotate(-45deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        
        .success-content h2 {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
            background: linear-gradient(135deg, #7877C6, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .success-content p {
            color: #888888;
            margin-bottom: 40px;
            font-size: 16px;
        }
        
        .coins-received {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-bottom: 40px;
            padding: 30px;
            background: rgba(255,255,255,0.03);
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.08);
        }
        
        .coin-icon.large {
            width: 60px;
            height: 60px;
            font-size: 28px;
        }
        
        .coins-received .amount {
            font-size: 36px;
            font-weight: 800;
            color: #7877C6;
            letter-spacing: -0.02em;
        }
        
        .coins-received .label {
            color: #888888;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .success-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
        }
        
        .neural-btn {
            padding: 16px 24px;
            border-radius: 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
        }
        
        .neural-btn.primary {
            background: linear-gradient(135deg, #7877C6 0%, #5B5A9F 100%);
            color: white;
            box-shadow: 0 8px 32px rgba(120,119,198,0.3);
        }
        
        .neural-btn.primary:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 12px 40px rgba(120,119,198,0.4);
        }
        
        .neural-btn.secondary {
            background: rgba(255,255,255,0.03);
            color: #7877C6;
            border: 1px solid rgba(120,119,198,0.3);
        }
        
        .neural-btn.secondary:hover {
            background: rgba(120,119,198,0.1);
            transform: translateY(-2px) scale(1.05);
        }
        
        .success-particles {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 1px;
            height: 1px;
            pointer-events: none;
        }
    `;

  document.head.appendChild(style);
}

/**
 * Função para voltar à página anterior
 */
function goBack() {
  if (isProcessing) return;

  updateFloatingMessage("Desconectando sistema neural...");

  setTimeout(() => {
    window.location.href = "../../profile/pages/profile.html";
  }, 500);
}

/**
 * Inicialização quando o DOM carrega
 */
document.addEventListener("DOMContentLoaded", function () {
  // Injeta estilos neurais
  injectNeuralStyles();

  // Event listener para o botão de voltar
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", goBack);
  }

  // Animação inicial neural
  setTimeout(() => {
    initializeNeuralAnimations();
  }, 500);
});

/**
 * Animações neurais iniciais
 */
function initializeNeuralAnimations() {
  const cards = document.querySelectorAll(".package-card");
  const paymentBtns = document.querySelectorAll(".payment-btn");

  // Animação escalonada dos pacotes
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px) scale(0.9)";

    setTimeout(() => {
      card.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
      card.style.opacity = "1";
      card.style.transform = "translateY(0) scale(1)";
    }, index * 150);
  });

  // Animação dos botões de pagamento
  setTimeout(() => {
    paymentBtns.forEach((btn, index) => {
      btn.style.opacity = "0";
      btn.style.transform = "translateY(20px)";

      setTimeout(() => {
        btn.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        btn.style.opacity = "1";
        btn.style.transform = "translateY(0)";
      }, index * 100);
    });
  }, cards.length * 150);

  // Atualiza mensagem flutuante inicial
  updateFloatingMessage("Sistema neural operacional!");
}
