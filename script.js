/*
treePhorge
A Markdown/ASCII tree diagram and structure generator. Designed and tested for AI readability.
Website: https://code.oldmanumby.com

author = "B.A. Umberger (Old Man Umby)"
copyright = "Copyright 2026, B.A. Umberger"
credits = ["B.A. Umberger"]
license = "GPL-3.0"
version = "1.0.0"
maintainer = "B.A. Umberger"
status = "Production"
*/

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const copyBtn = document.getElementById('copy');
    const exportBtn = document.getElementById('export');
    const darkModeToggle = document.getElementById('darkMode');
    const preserveNumberingToggle = document.getElementById('preserveNumbering');
    const showFolderSlashToggle = document.getElementById('showFolderSlash');
    const connectedRootsToggle = document.getElementById('connectedRoots');
    const showFolderIconsToggle = document.getElementById('showFolderIcons');
    const showFileIconsToggle = document.getElementById('showFileIcons');
    const useUpperCaseToggle = document.getElementById('useUpperCase');
    const includeCommentsToggle = document.getElementById('includeComments');
    const includeOriginalInputToggle = document.getElementById('includeOriginalInput');
    const includeConvertedOutputToggle = document.getElementById('includeConvertedOutput');
    const fileFormatRadios = document.getElementsByName('fileFormat');
    const addFindReplaceBtn = document.getElementById('addFindReplace');
    const clearAllRulesBtn = document.getElementById('clearAllRules');
    const findReplaceRulesContainer = document.getElementById('findReplaceRules');
    const presetButtons = document.querySelectorAll('.preset-btn');

    // Initialize settings from localStorage or defaults
    const settings = {
        // All switches default to OFF
        darkMode: localStorage.getItem('darkMode') === 'true',
        preserveNumbering: localStorage.getItem('preserveNumbering') === 'true',
        showFolderSlash: localStorage.getItem('showFolderSlash') === 'true',
        connectedRoots: localStorage.getItem('connectedRoots') === 'true',
        includeComments: localStorage.getItem('includeComments') === 'true',
        showFolderIcons: localStorage.getItem('showFolderIcons') === 'true',
        showFileIcons: localStorage.getItem('showFileIcons') === 'true',
        useUpperCase: localStorage.getItem('useUpperCase') === 'true',
        includeOriginalInput: localStorage.getItem('includeOriginalInput') === 'true',
        includeConvertedOutput: localStorage.getItem('includeConvertedOutput') === 'true',

        findReplaceRules: JSON.parse(localStorage.getItem('findReplaceRules') || '[]'),
        fileFormat: localStorage.getItem('fileFormat') || 'txt'
    };

    // Update UI to match settings
    darkModeToggle.checked = settings.darkMode;
    showFolderIconsToggle.checked = settings.showFolderIcons;
    showFileIconsToggle.checked = settings.showFileIcons;
    connectedRootsToggle.checked = settings.connectedRoots;
    preserveNumberingToggle.checked = settings.preserveNumbering;
    showFolderSlashToggle.checked = settings.showFolderSlash;
    useUpperCaseToggle.checked = settings.useUpperCase;
    includeCommentsToggle.checked = settings.includeComments;
    includeOriginalInputToggle.checked = settings.includeOriginalInput;
    includeConvertedOutputToggle.checked = settings.includeConvertedOutput;

    // Apply dark mode if enabled
    if (settings.darkMode) {
        document.documentElement.classList.add('dark-mode');
    }

    // Icons (using simple ASCII characters)
    const ICONS = {
        folder: '📁 ',
        file: '📄 '
    };

    function processLines(lines, settings) {
        let result = '';
        const indentSize = 2;

        // First pass: find the maximum length of the tree structure (excluding comments)
        let maxLength = 0;
        const processedLines = [];
        const normalizedLines = normalizeIndentation(lines);

        normalizedLines.forEach((line, index) => {
            const level = (line.match(/^\s*/)[0].length) / 2;
            let [name, comment] = line.trim().split('#').map(s => s.trim());
            const isFolderItem = isFolder(normalizedLines, index);

            // Transform name based on settings
            let displayName = name;
            if (!settings.preserveNumbering) {
                // Handle both numbered (1., 2.) and lettered (a., b.) ordering
                displayName = displayName.replace(/^(?:\d+|[a-zA-Z])\.\s+/, '');
            }
            // Apply find & replace rules
            displayName = applyFindReplaceRules(displayName, settings.findReplaceRules);
            if (settings.useUpperCase) {
                displayName = displayName.toUpperCase();
            }

            // Calculate prefix length
            const prefixLength = 4 * level; // Each level adds 4 characters (│   or    )
            const iconLength = isFolderItem ?
                (settings.showFolderIcons ? ICONS.folder.length : 0) :
                (settings.showFileIcons ? ICONS.file.length : 0);
            const nameLength = iconLength + displayName.length + (isFolderItem && !comment && settings.showFolderSlash ? 1 : 0);
            const totalLength = prefixLength + nameLength;
            maxLength = Math.max(maxLength, totalLength);

            processedLines.push({
                level,
                name,
                displayName,
                comment,
                isFolder: isFolderItem
            });
        });

        // Add padding for comments
        const commentPadding = 4;

        // Find root items to help determine tree boundaries
        const rootIndices = processedLines
            .map((item, index) => item.level === 1 ? index : -1)
            .filter(index => index !== -1);

        // Second pass: generate the tree with aligned comments
        processedLines.forEach((item, index) => {
            const { level, displayName, comment, isFolder } = item;

            // If it's a root level item (level 1) and not the first one
            if (level === 1 && index > 0 && !settings.connectedRoots) {
                // Don't add extra newline
            }

            let prefix = '';

            // Track parent levels
            let parentLevels = new Set();
            let currentLevel = level;
            let currentIndex = index;

            // Find the current root's boundary
            let currentRootIndex = rootIndices.find(rootIndex => rootIndex <= index);
            let nextRootIndex = rootIndices.find(rootIndex => rootIndex > index) ?? processedLines.length;

            while (currentLevel > 1) {
                for (let i = currentIndex - 1; i >= 0; i--) {
                    if (!processedLines[i]) continue;
                    if (processedLines[i].level < currentLevel) {
                        parentLevels.add(processedLines[i].level);
                        currentLevel = processedLines[i].level;
                        currentIndex = i;
                        break;
                    }
                }
            }

            // If it's a root level item
            if (level === 1) {
                prefix = '';
            } else {
                for (let i = 1; i <= level; i++) {
                    if (i === level) {
                        const nextSibling = findNextAtLevel(normalizedLines, index, level);
                        // Only show sibling connector if it's before the next root
                        const showSibling = nextSibling !== -1 &&
                            (!settings.connectedRoots ? nextSibling < nextRootIndex : true);
                        prefix += showSibling ? '├── ' : '└── ';
                    } else {
                        let showLine = false;
                        if (parentLevels.has(i)) {
                            const nextAtLevel = findNextAtLevel(normalizedLines, index, i);
                            // Only show vertical line if it's before the next root
                            showLine = nextAtLevel !== -1 &&
                                (!settings.connectedRoots ? nextAtLevel < nextRootIndex : true);
                        }
                        prefix += showLine ? '│   ' : '    ';
                    }
                }
            }

            // Build the line with aligned comments
            let line = prefix;

            // Add appropriate icon
            if (isFolder && settings.showFolderIcons) {
                line += ICONS.folder;
            } else if (!isFolder && settings.showFileIcons) {
                line += ICONS.file;
            }

            line += displayName;

            if (comment) {
                const padding = maxLength - (prefix.length + displayName.length +
                    (isFolder && settings.showFolderIcons ? ICONS.folder.length : 0) +
                    (!isFolder && settings.showFileIcons ? ICONS.file.length : 0)) + commentPadding;
                line += ' '.repeat(padding) + '# ' + comment;
            } else if (isFolder && settings.showFolderSlash) {
                line += '/';
            }

            result += line + '\n';
        });

        return result;
    }

    // Generate the tree when input changes
    function generateTree() {
        let inputText = input.value;

        // If input contains markdown, convert it for processing but don't modify the input field
        if (detectMarkdown(inputText)) {
            inputText = convertMarkdownToTree(inputText);
        }

        const lines = inputText.split('\n');
        output.textContent = processLines(lines, settings);
    }

    // Event Listeners
    input.addEventListener('input', generateTree);
    copyBtn.addEventListener('click', copyToClipboard);

    darkModeToggle.addEventListener('change', (e) => {
        settings.darkMode = e.target.checked;
        if (e.target.checked) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', e.target.checked);
    });

    preserveNumberingToggle.addEventListener('change', (e) => {
        settings.preserveNumbering = e.target.checked;
        localStorage.setItem('preserveNumbering', e.target.checked);

        // Simply regenerate the tree with the new setting
        // Don't try to convert the input - just change how it's displayed
        generateTree();
    });

    showFolderSlashToggle.addEventListener('change', (e) => {
        settings.showFolderSlash = e.target.checked;
        localStorage.setItem('showFolderSlash', e.target.checked);
        generateTree();
    });
    connectedRootsToggle.addEventListener('change', (e) => {
        settings.connectedRoots = e.target.checked;
        localStorage.setItem('connectedRoots', e.target.checked);
        generateTree();
    });
    showFolderIconsToggle.addEventListener('change', (e) => {
        settings.showFolderIcons = e.target.checked;
        localStorage.setItem('showFolderIcons', e.target.checked);
        generateTree();
    });
    showFileIconsToggle.addEventListener('change', (e) => {
        settings.showFileIcons = e.target.checked;
        localStorage.setItem('showFileIcons', e.target.checked);
        generateTree();
    });
    useUpperCaseToggle.addEventListener('change', (e) => {
        settings.useUpperCase = e.target.checked;
        localStorage.setItem('useUpperCase', e.target.checked);
        generateTree();
    });
    // Initialize find & replace UI
    initializeFindReplace();

    fileFormatRadios.forEach(radio => {
        // Set initial state
        if (radio.value === settings.fileFormat) {
            radio.checked = true;
        }

        radio.addEventListener('change', (e) => {
            settings.fileFormat = e.target.value;
            localStorage.setItem('fileFormat', e.target.value);
        });
    });

    includeCommentsToggle.addEventListener('change', (e) => {
        settings.includeComments = e.target.checked;
        localStorage.setItem('includeComments', e.target.checked);
    });

    includeOriginalInputToggle.addEventListener('change', (e) => {
        settings.includeOriginalInput = e.target.checked;
        localStorage.setItem('includeOriginalInput', e.target.checked);
    });

    includeConvertedOutputToggle.addEventListener('change', (e) => {
        settings.includeConvertedOutput = e.target.checked;
        localStorage.setItem('includeConvertedOutput', e.target.checked);
    });

    function findNextAtLevel(lines, startIndex, targetLevel) {
        for (let i = startIndex + 1; i < lines.length; i++) {
            const level = (lines[i].match(/^\s*/)[0].length) / 2;
            if (level < targetLevel) return -1;
            if (level === targetLevel) return i;
        }
        return -1;
    }

    function isFolder(lines, index) {
        if (index >= lines.length - 1) return false;

        const currentLevel = (lines[index].match(/^\s*/)[0].length) / 2;

        // Look for the next non-empty line
        for (let i = index + 1; i < lines.length; i++) {
            const nextLine = lines[i];
            if (!nextLine.trim()) continue; // Skip empty lines

            const nextLevel = (nextLine.match(/^\s*/)[0].length) / 2;
            return nextLevel > currentLevel;
        }

        return false;
    }

    function normalizeIndentation(lines) {
        const indentSize = 2;
        const result = [];
        const levelMap = new Map();

        lines.forEach((line, index) => {
            if (!line.trim()) return;

            const originalLevel = (line.match(/^\s*/)[0].length) / 2;
            let normalizedLevel;

            if (originalLevel === 0) {
                normalizedLevel = 1;
            } else {
                let parentLevel = -1;
                for (let i = index - 1; i >= 0; i--) {
                    if (!lines[i].trim()) continue;
                    const prevLevel = (lines[i].match(/^\s*/)[0].length) / 2;
                    if (prevLevel < originalLevel) {
                        parentLevel = prevLevel;
                        break;
                    }
                }

                if (parentLevel === -1) {
                    normalizedLevel = 1;
                } else {
                    const normalizedParentLevel = levelMap.get(parentLevel);
                    normalizedLevel = normalizedParentLevel + 1;
                }
            }

            levelMap.set(originalLevel, normalizedLevel);
            const spaces = ' '.repeat(normalizedLevel * indentSize);
            result.push(spaces + line.trim());
        });

        return result;
    }

    async function exportFiles() {
        const zip = new JSZip();

        // Use the same conversion logic as generateTree()
        let inputText = input.value;

        // If input contains markdown, convert it for processing
        if (detectMarkdown(inputText)) {
            inputText = convertMarkdownToTree(inputText);
        }

        const lines = normalizeIndentation(inputText.split('\n'));
        const stack = [{ path: '', folder: zip }];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            const level = (line.match(/^\s*/)[0].length) / 2;
            let [name, comment] = line.trim().split('#').map(s => s.trim());

            // Apply preserve numbering setting (same as in processLines)
            if (!settings.preserveNumbering) {
                // Handle both numbered (1., 2.) and lettered (a., b.) ordering
                name = name.replace(/^(?:\d+|[a-zA-Z])\.\s+/, '');
            }

            // Apply find & replace rules
            name = applyFindReplaceRules(name, settings.findReplaceRules);

            // Apply case transformation if needed
            if (settings.useUpperCase) {
                name = name.toUpperCase();
            }

            // Trim the stack to the current level's parent
            while (stack.length > level) {
                stack.pop();
            }

            const parentPath = stack[stack.length - 1].path;
            const fullPath = parentPath ? `${parentPath}/${name}` : name;

            // Check if this is a folder by looking at the next line's indentation
            const isFolderItem = isFolder(lines, i);

            if (isFolderItem) {
                // Create folder
                const newFolder = zip.folder(fullPath);
                stack.push({ path: fullPath, folder: newFolder });

                // If folder has a comment and comments are enabled, create a comment file inside it
                if (comment && settings.includeComments) {
                    const commentFileName = name + '_comments.txt';
                    newFolder.file(commentFileName, comment);
                }
            } else {
                // Handle file extension based on settings
                let fileName = name;
                const hasExtension = /\.[^/.]+$/.test(name);
                const selectedFormat = settings.fileFormat || 'txt';

                if (selectedFormat === 'keep') {
                    // Keep original format - don't modify the name at all
                    fileName = name;
                } else if (hasExtension) {
                    // Replace extension with selected format
                    fileName = `${name.split('.')[0]}.${selectedFormat}`;
                } else {
                    // No extension - add the selected format
                    fileName = `${name}.${selectedFormat}`;
                }

                // Create empty file with appropriate content based on file type
                let content = '';
                const ext = fileName.split('.').pop().toLowerCase();

                switch (ext) {
                    case 'html':
                        content = '<!DOCTYPE html>\n<html>\n<head>\n    <title>' + name + '</title>\n</head>\n<body>\n\n</body>\n</html>';
                        break;
                    case 'md':
                        content = '# ' + name + '\n';
                        break;
                    default:
                        content = '';
                        break;
                }

                // Use the parent folder to create the file
                const parentFolder = stack[stack.length - 1].folder;
                parentFolder.file(fileName, content, { binary: false });

                // If file has a comment and comments are enabled, create a comment file next to it
                if (comment && settings.includeComments) {
                    // Get the name without extension for the comment file
                    const baseName = name.split('.')[0];
                    const commentFileName = baseName + '_comments.txt';
                    parentFolder.file(commentFileName, comment, { binary: false });
                }
            }
        }

        // Add original input file if enabled
        if (settings.includeOriginalInput && input.value.trim()) {
            zip.file('_original-input.txt', input.value);
        }

        // Add converted output file if enabled
        if (settings.includeConvertedOutput && output.textContent.trim()) {
            zip.file('_converted-output.txt', output.textContent);
        }

        try {
            const content = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 9
                }
            });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tree-export.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error creating zip file:', error);
            alert('Error creating zip file. Please try again.');
        }
    }

    exportBtn.addEventListener('click', exportFiles);

    async function copyToClipboard() {
        try {
            // Use modern Clipboard API if available
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(output.textContent);
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = output.textContent;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy text: ', error);
            copyBtn.textContent = 'Copy Failed';
            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
            }, 2000);
        }
    }

    function detectMarkdown(text) {
        const markdownPatterns = [
            /^#{1,6}\s+.+$/m,  // Headers
            /^[-*+]\s+.+$/m,   // Unordered lists
            /^\d+\.\s+.+$/m    // Ordered lists
        ];
        return markdownPatterns.some(pattern => pattern.test(text));
    }

    function removeNumbering(text) {
        // Remove leading numbers from the format "1. " or "1) "
        return text.replace(/^\d+[\.\)]\s+/, '');
    }

    function convertMarkdownToTree(markdown) {
        const lines = markdown.split('\n');
        let result = [];
        let currentHeaderLevel = 0;
        let lastHeaderIndent = 0;

        lines.forEach((line, index) => {
            const originalLine = line;
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            // Calculate the original indentation level of the line
            const originalIndent = originalLine.length - originalLine.trimStart().length;

            // Handle headers (# Root, ## Folder, etc.)
            const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
            if (headerMatch) {
                currentHeaderLevel = headerMatch[1].length - 1;
                lastHeaderIndent = currentHeaderLevel * 2;

                // Check if header starts with a number
                const headerContent = headerMatch[2];
                const numberedHeaderMatch = headerContent.match(/^(\d+\.\s*)(.+)$/);

                let finalContent;
                if (numberedHeaderMatch) {
                    finalContent = settings.preserveNumbering ?
                        numberedHeaderMatch[1] + numberedHeaderMatch[2] :
                        numberedHeaderMatch[2];
                } else {
                    finalContent = headerContent;
                }

                result.push('  '.repeat(currentHeaderLevel) + finalContent);
                return;
            }

            // Handle list items with proper indentation
            const bulletMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);
            const numberMatch = trimmedLine.match(/^(\d+\.\s+)(.+)$/);
            if (bulletMatch || numberMatch) {
                let content;
                if (numberMatch) {
                    content = settings.preserveNumbering ?
                        numberMatch[1] + numberMatch[2] :
                        numberMatch[2];
                } else {
                    content = bulletMatch[1];
                }

                // Calculate proper indentation: header level + original markdown indentation
                const listIndentLevel = Math.floor(originalIndent / 2); // Convert spaces to indent levels
                const totalIndent = currentHeaderLevel + 1 + listIndentLevel; // Header + 1 level + list nesting
                result.push('  '.repeat(totalIndent) + content);
            }
        });

        return result.join('\n');
    }

    // Paste events now handled naturally - markdown will be converted for display only

    // Enter key now works naturally - no automatic conversion of input

    // Generate tree on initial load if there's content
    if (input.value) {
        generateTree();
    }

    // Find & Replace Functions
    function applyFindReplaceRules(text, rules) {
        let result = text;
        rules.forEach((rule, index) => {
            if (rule.find && rule.find.trim() !== '') {
                // Use global replace for all occurrences
                const findText = rule.find;
                const replaceText = rule.replace || '';

                // Escape special regex characters in the find text
                const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedFind, 'g');
                const beforeReplace = result;
                result = result.replace(regex, replaceText);

                // Optional: Debug logging for development
                // if (beforeReplace !== result) {
                //     console.log(`Rule ${index + 1}: "${findText}" → "${replaceText}" | "${beforeReplace}" → "${result}"`);
                // }
            }
        });
        return result;
    }

    function initializeFindReplace() {
        // Load existing rules
        renderFindReplaceRules();

        // Add rule button
        addFindReplaceBtn.addEventListener('click', () => {
            addFindReplaceRule('', '');
        });

        // Clear all rules button
        clearAllRulesBtn.addEventListener('click', () => {
            settings.findReplaceRules = [];
            saveFindReplaceRules();
            renderFindReplaceRules();
            generateTree();
        });

        // Preset buttons
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const find = btn.dataset.find;
                const replace = btn.dataset.replace;
                addFindReplaceRule(find, replace);
            });
        });
    }

    function addFindReplaceRule(find = '', replace = '') {
        const rule = { find, replace };
        settings.findReplaceRules.push(rule);
        saveFindReplaceRules();
        renderFindReplaceRules();
        generateTree();
    }

    function removeFindReplaceRule(index) {
        settings.findReplaceRules.splice(index, 1);
        saveFindReplaceRules();
        renderFindReplaceRules();
        generateTree();
    }

    function updateFindReplaceRule(index, field, value) {
        if (settings.findReplaceRules[index]) {
            settings.findReplaceRules[index][field] = value;
            saveFindReplaceRules();
            // Use a small delay to avoid too many rapid updates
            clearTimeout(window.findReplaceUpdateTimeout);
            window.findReplaceUpdateTimeout = setTimeout(() => {
                generateTree();
            }, 300);
        }
    }

    function saveFindReplaceRules() {
        localStorage.setItem('findReplaceRules', JSON.stringify(settings.findReplaceRules));
    }

    function renderFindReplaceRules() {
        findReplaceRulesContainer.innerHTML = '';

        settings.findReplaceRules.forEach((rule, index) => {
            const ruleElement = document.createElement('div');
            ruleElement.className = 'find-replace-rule';

            ruleElement.innerHTML = `
                <input type="text"
                       placeholder="Find..."
                       value="${rule.find || ''}"
                       data-index="${index}"
                       data-field="find">
                <span class="rule-arrow">→</span>
                <input type="text"
                       placeholder="Replace with..."
                       value="${rule.replace || ''}"
                       data-index="${index}"
                       data-field="replace">
                <button type="button"
                        class="remove-rule-btn"
                        data-index="${index}">×</button>
            `;

            findReplaceRulesContainer.appendChild(ruleElement);
        });

        // Add event listeners to the new elements using event delegation
        // Remove any existing listeners first
        findReplaceRulesContainer.removeEventListener('input', handleRuleInput);
        findReplaceRulesContainer.removeEventListener('click', handleRuleClick);

        // Add new listeners
        findReplaceRulesContainer.addEventListener('input', handleRuleInput);
        findReplaceRulesContainer.addEventListener('click', handleRuleClick);
    }

    function handleRuleInput(e) {
        if (e.target.tagName === 'INPUT') {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            if (!isNaN(index) && field) {
                updateFindReplaceRule(index, field, e.target.value);
            }
        }
    }

    function handleRuleClick(e) {
        if (e.target.classList.contains('remove-rule-btn')) {
            const index = parseInt(e.target.dataset.index);
            if (!isNaN(index)) {
                removeFindReplaceRule(index);
            }
        }
    }
});