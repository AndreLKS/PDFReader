document.addEventListener('DOMContentLoaded', () => {
    const valorParcelaInput = document.getElementById('valorParcela');

    // Obtendo o valor da parcela mensal armazenado
    const valorParcela = localStorage.getItem('valorParcela');
    
    if (valorParcela) {
        valorParcelaInput.value = valorParcela;
    }
});
