/**
 * Script principal pour Nettoyeur de Noms de Fichiers
 * Gère le thème, le retour en haut, les fonctionnalités communes.
 * Les fonctions spécifiques aux pages sont appelées selon la page courante.
 */

(function() {
    'use strict';

    // ==================== THÈME CLAIR/SOMBRE ====================
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            if (themeToggle) themeToggle.textContent = '☀️';
        } else {
            body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.textContent = '🌙';
        }
    }

    function toggleTheme() {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (themeToggle) themeToggle.textContent = isDark ? '☀️' : '🌙';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    initTheme();
	
	// ==================== PERSONNALISATION DES CARACTÈRES INTERDITS (global) ====================
const customizeBtn = document.getElementById('customizeCharsBtn');
if (customizeBtn) {
    customizeBtn.addEventListener('click', function() {
        // Récupère la liste actuelle (depuis localStorage ou défaut)
        const currentChars = getForbiddenChars().join('');
        // Demande une nouvelle liste via une boîte de dialogue
        const newChars = prompt('Modifiez la liste des caractères interdits (sans séparateur) :', currentChars);
        if (newChars !== null) {
            // Supprime les éventuels doublons et conserve chaque caractère unique
            const uniqueChars = [...new Set(newChars.split(''))];
            localStorage.setItem('forbiddenChars', JSON.stringify(uniqueChars));
            alert('Liste sauvegardée !');
        }
    });
}

    // ==================== BOUTON RETOUR EN HAUT ====================
    const backBtn = document.getElementById('backToTop');

    function toggleBackToTop() {
        if (window.scrollY > 300) {
            backBtn.classList.add('show');
        } else {
            backBtn.classList.remove('show');
        }
    }

    if (backBtn) {
        window.addEventListener('scroll', toggleBackToTop);
        backBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==================== ANCRES DOUCES ====================
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ==================== FONCTIONS DE NETTOYAGE (communes) ====================

    /**
     * Nettoie un nom de fichier selon les options sélectionnées.
     * @param {string} filename - Nom original
     * @param {object} options - Options de nettoyage
     * @param {string[]} forbiddenChars - Liste des caractères à supprimer
     * @returns {string} Nom nettoyé
     */
        function cleanFilename(filename, options, forbiddenChars) {
        let name = filename;
        const lastDot = filename.lastIndexOf('.');
        let base = lastDot === -1 ? filename : filename.substring(0, lastDot);
        let ext = lastDot === -1 ? '' : filename.substring(lastDot);

        // 1. Remplacer le caractère défini par un espace (si un caractère est spécifié)
        if (options.replaceChar && options.replaceChar.length > 0) {
            // Échapper le caractère pour une utilisation dans une RegExp
            const escapedChar = options.replaceChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedChar, 'g');
            base = base.replace(regex, ' ');
        }

        // 2. Suppression des caractères interdits
        if (forbiddenChars && forbiddenChars.length) {
            const regex = new RegExp('[' + forbiddenChars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + ']', 'g');
            base = base.replace(regex, '');
        }

        // 3. Remplacer les espaces (options originales)
        if (options.replaceSpaces) {
            base = base.replace(/ /g, '_');
        } else if (options.removeSpaces) {
            base = base.replace(/ /g, '');
        }

        // 4. Casse
        if (options.lowercase) {
            base = base.toLowerCase();
            ext = ext.toLowerCase();
        } else if (options.uppercase) {
            base = base.toUpperCase();
            ext = ext.toUpperCase();
        }

        // 5. Préfixe
        if (options.prefix) {
            base = options.prefix + base;
        }

        return base + ext;
    }

    // Exposer les fonctions globalement
    window.CleanFiles = {
        cleanFilename: cleanFilename
    };

    // ==================== INITIALISATION PAR PAGE ====================
    const page = document.body.dataset.page; // On peut mettre un data attribute dans le body

    if (page === 'text') {
        initTextMode();
    } else if (page === 'upload') {
        initUploadMode();
    }

    function initTextMode() {
        console.log('Mode texte initialisé');
        // Récupérer les éléments
        const inputText = document.getElementById('inputText');
        const outputDiv = document.getElementById('output');
        const cleanBtn = document.getElementById('cleanBtn');
        const exportBtn = document.getElementById('exportBtn');
        const exampleBtns = document.querySelectorAll('.example-btn');

        // Charger un exemple par défaut
        if (inputText) {
            inputText.value = `mon fichier.txt\nphoto de vacances (2).jpg\nRAPPORT_FINAL (vrai).docx\n🎉soirée🎈.mp4`;
        }

        // Nettoyage
        if (cleanBtn) {
            cleanBtn.addEventListener('click', function() {
                const lines = inputText.value.split('\n').filter(l => l.trim() !== '');
                const options = getOptions();
                const forbidden = getForbiddenChars();

                const results = lines.map(original => {
                    const cleaned = cleanFilename(original, options, forbidden);
                    return { original, cleaned };
                });

                displayResults(results, outputDiv);
            });
        }

        // Export
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                const lines = outputDiv.innerText.split('\n').filter(l => l.includes('→')).map(l => l.split('→')[1].trim());
                const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'noms_nettoyes.txt';
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        // Exemples
        exampleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const example = this.dataset.example;
                if (example && inputText) {
                    inputText.value = example;
                }
            });
        });
    }

    function initUploadMode() {
        console.log('Mode upload initialisé');
        // Ici on implémenterait la logique de drop, File API, etc.
        // Par souci de concision, on met un placeholder.
        const dropZone = document.querySelector('.drop-zone');
        if (dropZone) {
            dropZone.addEventListener('click', () => alert('Sélection de fichiers (simulation)'));
        }
    }

    function getOptions() {
        return {
            replaceSpaces: document.getElementById('optReplaceSpaces')?.checked || false,
            removeSpaces: document.getElementById('optRemoveSpaces')?.checked || false,
            lowercase: document.getElementById('optLowercase')?.checked || false,
            uppercase: document.getElementById('optUppercase')?.checked || false,
            prefix: document.getElementById('optPrefix')?.value || '',
            suffixDuplicates: document.getElementById('optSuffixDuplicates')?.checked || false,
            suffixFirst: document.getElementById('optSuffixFirst')?.checked || false,
            suffixOnly: document.getElementById('optSuffixOnly')?.checked || false,
            replaceChar: document.getElementById('optReplaceChar')?.value || ''   // Nouvelle option
        };
    }

    function getForbiddenChars() {
        // Pour l'exemple, on retourne une liste par défaut ou depuis localStorage
        const defaultForbidden = ['😀','😁','😂','😃','🎉','🎈','*','?','<','>','|','"',':'];
        const saved = localStorage.getItem('forbiddenChars');
        return saved ? JSON.parse(saved) : defaultForbidden;
    }

    function displayResults(results, container) {
        if (!container) return;
        container.innerHTML = results.map(r => `<div><span class="badge">Original :</span> ${r.original} → <span class="badge">Nettoyé :</span> ${r.cleaned}</div>`).join('');
    }

})();