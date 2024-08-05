document.addEventListener('DOMContentLoaded', async () => {
    const estadoSelect = document.getElementById('estado');
    const cidadeSelect = document.getElementById('cidade');

    // Função para buscar estados
    async function loadEstados() {
        try {
            const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
            const estados = await response.json();

            // Ordenar estados alfabeticamente
            estados.sort((a, b) => a.nome.localeCompare(b.nome));

            // Limpar as opções existentes
            estadoSelect.innerHTML = '<option value="" disabled selected>Selecione um estado</option>';

            // Adicionar as opções de estados
            estados.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.sigla;
                option.textContent = estado.nome;
                estadoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao buscar estados:', error);
        }
    }

    // Função para buscar cidades
    async function loadCidades(estado) {
        try {
            const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
            const cidades = await response.json();

            // Ordenar cidades alfabeticamente
            cidades.sort((a, b) => a.nome.localeCompare(b.nome));

            // Limpar as opções existentes
            cidadeSelect.innerHTML = '<option value="" disabled selected>Selecione uma cidade</option>';

            // Adicionar as opções de cidades
            cidades.forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.id;
                option.textContent = cidade.nome;
                cidadeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao buscar cidades:', error);
        }
    }

    // Carregar estados ao iniciar a página
    await loadEstados();

    // Adicionar evento para carregar cidades quando o estado mudar
    estadoSelect.addEventListener('change', () => {
        const estado = estadoSelect.value;
        if (estado) {
            loadCidades(estado);
        }
    });

    // Manipulador do envio do formulário
    document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(this);

        try {
            const response = await fetch('/replace', {
                method: 'POST',
                body: formData
            });
            const result = await response.blob();
            const downloadUrl = window.URL.createObjectURL(result);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'updated_peticao.docx';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('result').innerText = 'Erro ao processar o arquivo.';
        }
    });
});
