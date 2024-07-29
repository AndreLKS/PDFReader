document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    const pdfFile = document.getElementById('pdfFile').files[0];
    formData.append('pdf', pdfFile);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    localStorage.setItem('valorParcela', result.total);

    // Redireciona para a página de petição
    window.location.href = 'peticao.html';
});

document.addEventListener('DOMContentLoaded', () => {
    const valorParcelaInput = document.getElementById('valorParcela');

    // Obtendo o valor da parcela mensal armazenado
    const valorParcela = localStorage.getItem('valorParcela');
    
    if (valorParcela) {
        valorParcelaInput.value = valorParcela;

        // Criando e exibindo o balão de notificação
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = `A soma total dos valores é: R$ ${valorParcela}`;
        document.body.appendChild(notification);

        // Remover o balão de notificação após alguns segundos
        setTimeout(() => {
            document.body.removeChild(notification);
            localStorage.removeItem('valorParcela');
        }, 5000);
    }
});

