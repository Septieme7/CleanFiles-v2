document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileListDiv = document.getElementById('fileList');
    const statsDiv = document.getElementById('stats');
    const cleanAllBtn = document.getElementById('cleanAllBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const archiveBtn = document.getElementById('archiveBtn');
    const archiveModal = document.getElementById('archiveModal');
    const closeModal = document.getElementById('closeModal');
    const createZipBtn = document.getElementById('createZipBtn');

    // Vérifier que les éléments existent (évite les erreurs si on est sur la mauvaise page)
    if (!dropZone) return;

    // Stockage des fichiers
    let files = []; // Chaque élément : { file: File, cleanedName: string }

    // ========== CHARGEMENT DES FICHIERS ==========
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFiles);

    dropZone.addEventListener('dragover', (e) => e.preventDefault());
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        handleFiles({ target: { files: e.dataTransfer.files } });
    });

    function handleFiles(event) {
        const newFiles = Array.from(event.target.files);
        const MAX_FILES = 500;
        const MAX_SIZE_PER_FILE = 2 * 1024 * 1024 * 1024; // 2 Go
        const MAX_TOTAL_SIZE = 10 * 1024 * 1024 * 1024; // 10 Go

        let totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

        for (let f of newFiles) {
            if (files.length >= MAX_FILES) {
                alert(`Maximum ${MAX_FILES} fichiers atteint.`);
                break;
            }
            if (f.size > MAX_SIZE_PER_FILE) {
                alert(`Le fichier ${f.name} dépasse 2 Go. Ignoré.`);
                continue;
            }
            if (totalSize + f.size > MAX_TOTAL_SIZE) {
                alert(`Taille totale maximum (10 Go) dépassée. Arrêt.`);
                break;
            }
            files.push({ file: f, cleanedName: f.name });
            totalSize += f.size;
        }
        // Réinitialiser l'input pour permettre de re-sélectionner les mêmes fichiers
        fileInput.value = '';
        updateFileList();
    }

    // ========== MISE À JOUR DE LA LISTE ==========
    function updateFileList() {
        if (files.length === 0) {
            fileListDiv.innerHTML = '<p class="text-muted">Aucun fichier chargé.</p>';
            statsDiv.textContent = 'Fichiers : 0 | Taille totale : 0 o';
            return;
        }

        let totalSize = 0;
        let html = '';
        files.forEach((item, index) => {
            totalSize += item.file.size;
            html += `
                <div class="file-item">
                    <div style="flex:1; min-width:0;">
                        <div><strong>Original :</strong> ${item.file.name}</div>
                        <div><strong>Nettoyé :</strong> ${item.cleanedName}</div>
                    </div>
                    <div class="file-actions">
                        <button class="download-one" data-index="${index}" title="Télécharger ce fichier">⬇️</button>
                        <button class="delete-one" data-index="${index}" title="Supprimer">🗑️</button>
                    </div>
                </div>
            `;
        });
        fileListDiv.innerHTML = html;
        statsDiv.textContent = `Fichiers : ${files.length} | Taille totale : ${formatBytes(totalSize)}`;

        // Événements individuels
        document.querySelectorAll('.download-one').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                downloadSingleFile(idx);
            });
        });

        document.querySelectorAll('.delete-one').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                files.splice(idx, 1);
                updateFileList();
            });
        });
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 o';
        const k = 1024;
        const sizes = ['o', 'Ko', 'Mo', 'Go'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ========== TÉLÉCHARGEMENT INDIVIDUEL ==========
    function downloadSingleFile(index) {
        const item = files[index];
        const blob = item.file.slice(0, item.file.size, item.file.type);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.cleanedName;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ========== NETTOYAGE (APPLICATION DES OPTIONS) ==========
    function cleanAllFiles() {
        const options = window.getOptions();
        const forbidden = window.getForbiddenChars();

        // Première passe : calculer les noms nettoyés sans suffixe doublon
        files.forEach(item => {
            const original = item.file.name;
            const cleaned = window.cleanFilename(original, options, forbidden);
            item.cleanedName = cleaned;
        });

        // Gestion des doublons (suffixe numérique)
        if (options.suffixDuplicates) {
            const counter = new Map();
            files.forEach(item => {
                const name = item.cleanedName;
                counter.set(name, (counter.get(name) || 0) + 1);
            });

            const suffixCount = new Map();
            files.forEach(item => {
                const name = item.cleanedName;
                if (counter.get(name) > 1) {
                    const count = (suffixCount.get(name) || 0) + 1;
                    suffixCount.set(name, count);

                    const lastDot = name.lastIndexOf('.');
                    let base = lastDot === -1 ? name : name.substring(0, lastDot);
                    let ext = lastDot === -1 ? '' : name.substring(lastDot);

                    if (options.suffixFirst || count > 1) {
                        if (options.suffixOnly) {
                            const prefix = options.prefix || 'fichier';
                            base = prefix;
                        }
                        item.cleanedName = base + count + ext;
                    }
                }
            });
        }

        // Gestion de la numérotation de tous les fichiers (option numberAll)
        if (options.numberAll) {
            let counter = options.numberStart;
            files.forEach(item => {
                const name = item.cleanedName;
                const lastDot = name.lastIndexOf('.');
                let base = lastDot === -1 ? name : name.substring(0, lastDot);
                let ext = lastDot === -1 ? '' : name.substring(lastDot);
                item.cleanedName = base + counter + ext;
                counter++;
            });
        }

        updateFileList();
    }

    // ========== ACTIONS GLOBALES ==========
    cleanAllBtn.addEventListener('click', cleanAllFiles);

    downloadAllBtn.addEventListener('click', async function() {
        if (files.length === 0) {
            alert('Aucun fichier à télécharger.');
            return;
        }

        const zip = new JSZip();
        for (let item of files) {
            zip.file(item.cleanedName, item.file);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fichiers_nettoyes.zip';
        a.click();
        URL.revokeObjectURL(url);
    });

    clearAllBtn.addEventListener('click', () => {
        files = [];
        updateFileList();
    });

    // ========== MODAL ARCHIVE ==========
    archiveBtn.addEventListener('click', () => {
        archiveModal.classList.add('show');
    });

    closeModal.addEventListener('click', () => {
        archiveModal.classList.remove('show');
    });

    createZipBtn.addEventListener('click', async () => {
        if (files.length === 0) {
            alert('Aucun fichier à archiver.');
            archiveModal.classList.remove('show');
            return;
        }
        const zip = new JSZip();
        for (let item of files) {
            zip.file(item.cleanedName, item.file);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'archive.zip';
        a.click();
        URL.revokeObjectURL(url);
        archiveModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === archiveModal) {
            archiveModal.classList.remove('show');
        }
    });
});