const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({
    origin: '*'
}));

const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
if (!fs.existsSync('outputs')) {
    fs.mkdirSync('outputs');
}

app.post('/api/convert', upload.single('video'), (req, res) => {
    const inputPath = req.file.path;
    const outputFileName = `${Date.now()}_short.mp4`;
    const outputPath = path.join('outputs', outputFileName);

    console.log("Starting conversion for: " + req.file.originalname);

    const ffmpegCmd = `ffmpeg -i ${inputPath} -vf "crop=in_h*9/16:in_h" -c:a copy ${outputPath}`;

    exec(ffmpegCmd, (error) => {
        fs.unlinkSync(inputPath);

        if (error) {
            console.error('Conversion failed:', error);
            return res.status(500).send('Video processing failed.');
        }

        console.log("Conversion successful! Sending: " + outputFileName);
        res.download(outputPath, outputFileName, (err) => {
            if (err) console.log("Error sending file:", err);
            fs.unlinkSync(outputPath);
        });
    });
});

app.get('/', (req, res) => {
    res.send('Video Shorts Converter Backend is Running!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
