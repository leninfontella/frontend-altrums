document.addEventListener("DOMContentLoaded", () => {
  const levels = {
    1: { min: 0, max: 99, name: "Iniciante", color: "#8B5CF6", icon: "🌱" },
    2: { min: 100, max: 499, name: "Explorador", color: "#06B6D4", icon: "🔍" },
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
    5: { min: 5000, max: 9999, name: "Generoso", color: "#EF4444", icon: "❤️" },
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
    9: { min: 500000, max: 999999, name: "Mito", color: "#F97316", icon: "🔥" },
    10: {
      min: 1000000,
      max: Infinity,
      name: "Divino",
      color: "#FFD700",
      icon: "👑",
    },
  };

  const levelsList = document.getElementById("levels-list");
  const backButton = document.getElementById("back-button");

  // Função para formatar o número com separador de milhares
  const formatNumber = (num) => {
    return num.toLocaleString("pt-BR");
  };

  // Injetar os níveis na página
  Object.values(levels).forEach((level) => {
    const levelItem = document.createElement("div");
    levelItem.classList.add("level-item");

    const iconSpan = document.createElement("span");
    iconSpan.classList.add("level-icon");
    iconSpan.style.color = level.color;
    iconSpan.textContent = level.icon;

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("level-info");

    const nameH2 = document.createElement("h2");
    nameH2.classList.add("level-name");
    nameH2.textContent = level.name;

    const rangeP = document.createElement("p");
    rangeP.classList.add("level-range");
    const maxText = level.max === Infinity ? "e mais" : formatNumber(level.max);
    rangeP.textContent = `${formatNumber(level.min)} - ${maxText} pontos`;

    infoDiv.appendChild(nameH2);
    infoDiv.appendChild(rangeP);

    levelItem.appendChild(iconSpan);
    levelItem.appendChild(infoDiv);

    levelsList.appendChild(levelItem);
  });

  // Funcionalidade do botão de voltar
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.history.back();
    });
  }
});
