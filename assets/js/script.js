/**
 * Script principal pour Nettoyeur de Noms de Fichiers
 * Gère le thème, le retour en haut, les fonctionnalités communes et le mode texte.
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

    // ==================== PERSONNALISATION DES CARACTÈRES INTERDITS ====================
    const customizeBtn = document.getElementById('customizeCharsBtn');
    if (customizeBtn) {
        customizeBtn.addEventListener('click', function() {
            const currentChars = getForbiddenChars().join('');
            const newChars = prompt('Modifiez la liste des caractères interdits (sans séparateur) :', currentChars);
            if (newChars !== null) {
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

    // ==================== FONCTIONS DE NETTOYAGE ====================

    /**
     * Récupère les options depuis les éléments du DOM
     */
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
            replaceChar: document.getElementById('optReplaceChar')?.value || '',
            removeAccents: document.getElementById('optRemoveAccents')?.checked || false,
            replaceSpecialByDash: document.getElementById('optReplaceSpecialByDash')?.checked || false,
            maxLength: parseInt(document.getElementById('optMaxLength')?.value) || 0,
            addDateTime: document.getElementById('optAddDateTime')?.value || 'none',
            removeKeywords: document.getElementById('optRemoveKeywords')?.value || '',
            numberAll: document.getElementById('optNumberAll')?.checked || false,
            numberStart: parseInt(document.getElementById('optNumberStart')?.value) || 1,
            replaceDotsByDash: document.getElementById('optReplaceDotsByDash')?.checked || false,
            caseStyle: document.getElementById('optCaseStyle')?.value || 'none',
            normalizeSpaces: document.getElementById('optNormalizeSpaces')?.checked || false
        };
    }

    /**
     * Récupère la liste des caractères interdits (depuis localStorage ou défaut)
     */
    function getForbiddenChars() {
        const defaultForbidden = ['😀','😁','😂','😃','🎉','🎈','*','?','<','>','|','"',':'];
        const saved = localStorage.getItem('forbiddenChars');
        return saved ? JSON.parse(saved) : defaultForbidden;
    }

    // Fonction pour enlever les accents
    function removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Fonction pour supprimer les mots-clés
    function removeKeywords(str, keywords) {
        if (!keywords) return str;
        const words = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
        let result = str;
        words.forEach(word => {
            const regex = new RegExp(word, 'gi');
            result = result.replace(regex, '');
        });
        return result;
    }

    // Fonction pour convertir en camelCase, snake_case, etc.
    function convertCase(str, style) {
        if (style === 'none') return str;
        const words = str.split(/[^a-zA-Z0-9]+/).filter(w => w.length > 0);
        if (style === 'camelCase') {
            return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        } else if (style === 'PascalCase') {
            return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        } else if (style === 'snake_case') {
            return words.map(w => w.toLowerCase()).join('_');
        } else if (style === 'kebab-case') {
            return words.map(w => w.toLowerCase()).join('-');
        }
        return str;
    }

    /**
     * Nettoie un nom de fichier selon les options et la liste de caractères interdits
     */
    function cleanFilename(filename, options, forbiddenChars) {
        const lastDot = filename.lastIndexOf('.');
        let base = lastDot === -1 ? filename : filename.substring(0, lastDot);
        let ext = lastDot === -1 ? '' : filename.substring(lastDot);

        // 1. Remplacer les caractères définis par un espace
        if (options.replaceChar) {
            const chars = options.replaceChar.split('');
            const escapedChars = chars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
            const regex = new RegExp(`[${escapedChars}]`, 'g');
            base = base.replace(regex, ' ');
        }

        // 2. Supprimer les accents
        if (options.removeAccents) {
            base = removeAccents(base);
        }

        // 3. Supprimer les mots-clés
        if (options.removeKeywords) {
            base = removeKeywords(base, options.removeKeywords);
        }

        // 4. Remplacer les points par des tirets (sauf dernier)
        if (options.replaceDotsByDash) {
            base = base.replace(/\./g, '-');
        }

        // 5. Remplacer les caractères spéciaux par un tiret (tout sauf lettres, chiffres, espace)
        if (options.replaceSpecialByDash) {
            base = base.replace(/[^a-zA-Z0-9\s]/g, '-');
        }

        // 6. Normaliser les espaces (espaces multiples -> un seul)
        if (options.normalizeSpaces) {
            base = base.replace(/\s+/g, ' ');
        }

        // 7. Gestion des espaces (options originales)
        if (options.replaceSpaces) {
            base = base.replace(/ /g, '_');
        } else if (options.removeSpaces) {
            base = base.replace(/ /g, '');
        }

        // 8. Casse (lowercase/uppercase)
        if (options.lowercase) {
            base = base.toLowerCase();
            ext = ext.toLowerCase();
        } else if (options.uppercase) {
            base = base.toUpperCase();
            ext = ext.toUpperCase();
        }

        // 9. Conversion camelCase/snake_case (après la casse de base)
        if (options.caseStyle !== 'none') {
            base = convertCase(base, options.caseStyle);
        }

        // 10. Préfixe
        if (options.prefix) {
            base = options.prefix + base;
        }

        // 11. Ajout date/heure (préfixe ou suffixe)
        if (options.addDateTime !== 'none') {
            const now = new Date();
            const dateStr = now.toISOString().replace(/[-:]/g, '').substring(0, 15); // ex: 20250310T1430
            if (options.addDateTime === 'prefix') {
                base = dateStr + '_' + base;
            } else if (options.addDateTime === 'suffix') {
                base = base + '_' + dateStr;
            }
        }

        // 12. Limiter la longueur (tronquer)
        if (options.maxLength > 0 && base.length > options.maxLength) {
            base = base.substring(0, options.maxLength);
        }

        return base + ext;
    }

    // Exposer les fonctions nécessaires globalement pour upload.js
    window.getOptions = getOptions;
    window.getForbiddenChars = getForbiddenChars;
    window.cleanFilename = cleanFilename;

    // ==================== MODE TEXTE ====================
    if (document.body.dataset.page === 'text') {
        initTextMode();
    }

    function initTextMode() {
        const inputText = document.getElementById('inputText');
        const outputDiv = document.getElementById('output');
        const cleanBtn = document.getElementById('cleanBtn');
        const exportBtn = document.getElementById('exportBtn');
        const exampleBtns = document.querySelectorAll('.example-btn');

        if (inputText) {
            inputText.value = `mon fichier.txt\nphoto de vacances (2).jpg\nRAPPORT_FINAL (vrai).docx\n🎉soirée🎈.mp4`;
        }

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

        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                // Récupérer les noms nettoyés depuis l'affichage
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

        exampleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const example = this.dataset.example;
                if (example && inputText) {
                    inputText.value = example.replace(/\\n/g, '\n');
                }
            });
        });

        function displayResults(results, container) {
            if (!container) return;
            container.innerHTML = results.map(r => `<div><span class="badge">Original :</span> ${r.original} → <span class="badge">Nettoyé :</span> ${r.cleaned}</div>`).join('');
        }
    }
})();