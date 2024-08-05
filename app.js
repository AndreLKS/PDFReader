const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');

const app = express();
const port = 3000;

// Configuração do multer para upload de arquivos PDF
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
    const regex = /217EMPRESTIMO SOBRE A RMC\s*R\$[\s]*([\d.,]+)/g;
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

app.post('/replace', upload.single('fileUpload'), async (req, res) => {
    const { data, filePath } = req.body;
    const templatePath = path.join(__dirname, 'template/template.docx');
    const outputPath = path.join(__dirname, 'uploads/updated_peticao.docx');
    
    // Ler o template
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip);

    // Substituir os placeholders
    doc.setData(data);
    try {
        doc.render();
    } catch (error) {
        console.error('Error rendering docx:', error);
        return res.status(500).json({ error: 'Error processing the template.' });
    }

    // Gerar o arquivo atualizado
    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, buf);

    res.download(outputPath, 'updated_peticao.docx', (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error sending file.');
        }
        fs.unlinkSync(outputPath); // Remove o arquivo após o envio
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
