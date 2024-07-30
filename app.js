const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const app = express();
const port = 3000;

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const extractAndSumValues = (text) => {
    const regex = /217EMPÊSTIMO SOBRE A RMC\s*R\$\s*([\d.,]+)/g;
    let match;
    let totalSum = 0;

    while ((match = regex.exec(text)) !== null) {
        const valueStr = match[1].replace(/\./g, '').replace(/,/g, '.');
        const value = parseFloat(valueStr);
        if (!isNaN(value)) {
            totalSum += value;
        }
    }

    return totalSum;
};

app.post('/upload', upload.single('pdf'), async (req, res) => {
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const total = extractAndSumValues(data.text);
    fs.unlinkSync(filePath); // Remove o arquivo após o processamento
    res.json({ total: total.toFixed(2) });
});

app.post('/generate-doc', async (req, res) => {
    const substitutions = req.body;
    const templatePath = path.join(__dirname, 'uploads', 'template.docx'); // Atualize o caminho para o seu template
    const templateBuffer = fs.readFileSync(templatePath);

    try {
        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Substituir as palavras "SUBSTITUIÇÃO" pelo valor do formulário
        doc.setData(substitutions);

        try {
            doc.render();
        } catch (error) {
            console.error('Error rendering document', error);
            res.status(500).send('Error processing document');
            return;
        }

        const buf = doc.getZip().generate({ type: 'nodebuffer' });

        res.set({
            'Content-Disposition': 'attachment; filename=peticao_atualizada.docx',
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        res.send(buf);
    } catch (error) {
        console.error('Error loading template', error);
        res.status(500).send('Error loading template');
    }
});

app.post('/enviar-peticao', upload.none(), (req, res) => {
    const { vara, contrato, valorParcela, dataInicio, nacionalidade, cpf } = req.body;

    // Ler o arquivo template.docx
    const templatePath = path.join(__dirname, 'uploads', 'template.docx');
    const content = fs.readFileSync(templatePath, 'binary');

    try {
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Substituir as palavras "SUBSTITUIÇÃO" pelo valor do formulário
        doc.setData({
            'SUBSTITUIÇÃO1': vara,
            'SUBSTITUIÇÃO2': contrato,
            'SUBSTITUIÇÃO3': valorParcela,
            'SUBSTITUIÇÃO4': dataInicio,
            'SUBSTITUIÇÃO5': nacionalidade,
            'SUBSTITUIÇÃO6': cpf
        });

        try {
            doc.render();
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao processar o documento');
            return;
        }

        const buf = doc.getZip().generate({ type: 'nodebuffer' });

        // Salvar o arquivo gerado
        const outputPath = path.join(__dirname, `uploads/peticao_${Date.now()}.docx`);
        fs.writeFileSync(outputPath, buf);

        res.download(outputPath, 'peticao.docx', (err) => {
            if (err) {
                console.error(err);
            }
            fs.unlinkSync(outputPath); // Excluir o arquivo após o download
        });
    } catch (error) {
        console.error('Error processing petition', error);
        res.status(500).send('Error processing petition');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
