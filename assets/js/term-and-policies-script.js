// Aguarda o carregamento completo do documento HTML
document.addEventListener("DOMContentLoaded", () => {
  // Obtém referências para a caixa de seleção, o botão e o modal
  const agreeCheckbox = document.getElementById("agree-terms");
  const agreeButton = document.getElementById("agree-button");
  const customCheckbox = document.getElementById("agree-custom-checkbox");
  const modal = document.getElementById("confirmation-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const continueBtn = document.getElementById("continue-btn");

  // Inicialmente, desabilita o botão de concordar
  agreeButton.disabled = true;

  // Adiciona um ouvinte de evento para a mudança na caixa de seleção
  // A função é executada toda vez que a caixa é marcada ou desmarcada
  agreeCheckbox.addEventListener("change", () => {
    // Habilita o botão se a caixa estiver marcada; caso contrário, desabilita
    agreeButton.disabled = !agreeCheckbox.checked;
  });

  // Adiciona um ouvinte de evento de clique ao elemento visual do checkbox
  // Isso permite que o usuário clique diretamente na caixa para ativá-la
  customCheckbox.addEventListener("click", () => {
    // Altera o estado 'checked' da caixa de seleção real (o input)
    agreeCheckbox.checked = !agreeCheckbox.checked;

    // Dispara o evento 'change' manualmente para atualizar o estado do botão
    agreeCheckbox.dispatchEvent(new Event("change"));
  });

  // Adiciona um ouvinte de evento para o clique no botão
  agreeButton.addEventListener("click", () => {
    // Verifica se a caixa de seleção está marcada
    if (agreeCheckbox.checked) {
      // Se estiver, mostra o modal (janela pop-up) de confirmação
      modal.style.display = "flex";
    }
  });

  // Adiciona ouvintes para fechar o modal
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Ação para o botão 'OK' do modal
  continueBtn.addEventListener("click", () => {
    // Redireciona para a página de signup
    // Ajuste o caminho conforme necessário para o seu projeto
    window.location.href = "/pages/register/html/signup.html";
  });

  // Fecha o modal se o usuário clicar fora dele
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});
