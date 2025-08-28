// Função para simular o salvamento do perfil
function saveProfile() {
  // Aqui você adicionaria a lógica para enviar os dados para um servidor
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;

  console.log("Salvando dados do perfil:", { name, email, phone });

  // Mostrar mensagem de sucesso
  const messageBox = document.getElementById("message-box");
  messageBox.classList.add("show");

  // Ocultar a mensagem após 3 segundos
  setTimeout(() => {
    messageBox.classList.remove("show");
  }, 3000);
}

// Voltar configurações:

const goBack = document.getElementById("go-back");
goBack.addEventListener("click", () => {
  window.location.href = "../../configuracao/html/index.html";
});

// Pré-visualização da imagem selecionada
const photoInput = document.getElementById("photo-input");
const profileImage = document.getElementById("profile-image");

photoInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profileImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});
