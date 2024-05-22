document.querySelectorAll('.operate-btn').forEach(button => {
    button.addEventListener('click', () => {
        const operation = button.getAttribute('data-operation');
        const fileInput = document.getElementById(`${operation}-input`);
        const outputDiv = document.getElementById(`${operation}-output`);
        const downloadBtn = document.getElementById(`${operation}-download`);

        /* Check Files is Empty */
        if (fileInput.files.length === 0) {
            alert('Please select files first.');
            return;
        }

        const files = Array.from(fileInput.files);

        /* Distribution of Tasks */
        
        if (operation === 'compress-jpg') {
            compressJpg(files, outputDiv, downloadBtn);
        } else if (operation === 'combine-images') {
            combineImagesToPdf(files, outputDiv, downloadBtn);
        } else if (operation === 'pdf-to-jpg') {
            pdfToJpg(files, outputDiv, downloadBtn);
        } else if (operation === 'jpg-to-pdf') {
            jpgToPdf(files, outputDiv, downloadBtn);
        }
    });
});

/* Compress JPG Function */

function compressJpg(files, outputDiv, downloadBtn) {
    outputDiv.innerHTML = '';

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const width = img.width;
                const height = img.height;
                canvas.width = width;
                canvas.height = height;

                context.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);

                const compressedImg = document.createElement('img');
                compressedImg.src = compressedDataUrl;
                outputDiv.appendChild(compressedImg);

                const downloadLink = document.createElement('a');
                downloadLink.href = compressedDataUrl;
                downloadLink.download = 'compressed-' + file.name;
                downloadLink.textContent = 'Download ' + file.name;
                outputDiv.appendChild(downloadLink);
                outputDiv.appendChild(document.createElement('br'));
            };
        };
        reader.readAsDataURL(file);
    });
}

/* Combine Images Function */

function combineImagesToPdf(files, outputDiv, downloadBtn) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let imagesLoaded = 0;

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function() {
                const width = doc.internal.pageSize.getWidth();
                const height = (img.height * width) / img.width;

                if (index > 0) doc.addPage();
                doc.addImage(img, 'JPEG', 0, 0, width, height);

                imagesLoaded++;
                if (imagesLoaded === files.length) {
                    const pdfBlob = doc.output('blob');
                    const objectUrl = URL.createObjectURL(pdfBlob);

                    const embed = document.createElement('embed');
                    embed.src = objectUrl;
                    embed.width = '100%';
                    embed.height = '500px';
                    outputDiv.innerHTML = '';
                    outputDiv.appendChild(embed);

                    downloadBtn.href = objectUrl;
                    downloadBtn.download = 'combined-images.pdf';
                    downloadBtn.style.display = 'inline-block';
                }
            };
        };
        reader.readAsDataURL(file);
    });
}

/* PDF to JPG Function */

function pdfToJpg(files, outputDiv, downloadBtn) {
    outputDiv.innerHTML = '';

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const loadingTask = pdfjsLib.getDocument({ data: e.target.result });
            loadingTask.promise.then(pdf => {
                for (let i = 1; i <= pdf.numPages; i++) {
                    pdf.getPage(i).then(page => {
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        const renderTask = page.render({ canvasContext: context, viewport: viewport });
                        renderTask.promise.then(() => {
                            const img = document.createElement('img');
                            img.src = canvas.toDataURL('image/jpeg');
                            outputDiv.appendChild(img);

                            const downloadLink = document.createElement('a');
                            downloadLink.href = img.src;
                            downloadLink.download = `page-${i}.jpg`;
                            downloadLink.textContent = `Download Page ${i}`;
                            outputDiv.appendChild(downloadLink);
                            outputDiv.appendChild(document.createElement('br'));
                        });
                    });
                }
            });
        };
        reader.readAsArrayBuffer(file);
    });
}


/* JPG to PDF Function */

function jpgToPdf(files, outputDiv, downloadBtn) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let imagesLoaded = 0;

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function() {
                const width = doc.internal.pageSize.getWidth();
                const height = (img.height * width) / img.width;

                if (index > 0) doc.addPage();
                doc.addImage(img, 'JPEG', 0, 0, width, height);

                imagesLoaded++;
                if (imagesLoaded === files.length) {
                    const pdfBlob = doc.output('blob');
                    const objectUrl = URL.createObjectURL(pdfBlob);

                    const embed = document.createElement('embed');
                    embed.src = objectUrl;
                    embed.width = '100%';
                    embed.height = '500px';
                    outputDiv.innerHTML = '';
                    outputDiv.appendChild(embed);

                    downloadBtn.href = objectUrl;
                    downloadBtn.download = 'images-to-pdf.pdf';
                    downloadBtn.style.display = 'inline-block';
                }
            };
        };
        reader.readAsDataURL(file);
    });
}
