document.addEventListener('DOMContentLoaded', () => {
    const valorParcelaInput = document.getElementById('valorParcela');

    // Obtendo o valor da parcela mensal armazenado
    const valorParcela = localStorage.getItem('valorParcela');
    
    if (valorParcela) {
        valorParcelaInput.value = valorParcela;
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const sexoSelect = document.getElementById('sexo');
    const nacionalidadeInput = document.getElementById('nacionalidade');

    sexoSelect.addEventListener('change', function () {
        if (sexoSelect.value === 'masculino') {
            nacionalidadeInput.value = 'Brasileiro';
        } else if (sexoSelect.value === 'feminino') {
            nacionalidadeInput.value = 'Brasileira';
        } else {
            nacionalidadeInput.value = '';
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const valorParcelaInput = document.getElementById('valorParcela');
    const sexoSelect = document.getElementById('sexo');
    const nacionalidadeInput = document.getElementById('nacionalidade');
    const numeroVaraInput = document.getElementById('vara');
    const numeroContratoInput = document.getElementById('contrato');
    const dataInicioInput = document.getElementById('dataInicio');
    const nomeInput = document.getElementById('nome');
    const cpfInput = document.getElementById('cpf');
    const valorCausaInput = document.getElementById('valorCausa');
    const beneficioInput = document.getElementById('beneficio');
    const dataNascimentoInput = document.getElementById('dataNascimento');
    const submitButton = document.getElementById('submitBtn');

    const valorParcela = localStorage.getItem('valorParcela');
    if (valorParcela) {
        valorParcelaInput.value = valorParcela;
    }

    sexoSelect.addEventListener('change', () => {
        if (sexoSelect.value === 'masculino') {
            nacionalidadeInput.value = 'Brasileiro';
        } else if (sexoSelect.value === 'feminino') {
            nacionalidadeInput.value = 'Brasileira';
        } else {
            nacionalidadeInput.value = '';
        }
    });

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const substitutions = {
            '[SUBSTITUIÇÃO1]': numeroContratoInput.value,
            'SUBSTITUIÇÃO2': `R$ ${valorParcelaInput.value}`,
            'SUBSTITUIÇÃO3': dataInicioInput.value,
            'SUBSTITUIÇÃO4': nomeInput.value,
            'SUBSTITUIÇÃO5': cpfInput.value,
            'SUBSTITUIÇÃO6': valorCausaInput.value,
            'SUBSTITUIÇÃO7': beneficioInput.value,
            'SUBSTITUIÇÃO8': nacionalidadeInput.value,
            'SUBSTITUIÇÃO9': dataNascimentoInput.value,
            'SUBSTITUIÇÃO10': numeroVaraInput.value,
        };

        const response = await fetch('/generate-doc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(substitutions)
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'peticao_atualizada.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            console.error('Error generating document');
        }
    });
});
