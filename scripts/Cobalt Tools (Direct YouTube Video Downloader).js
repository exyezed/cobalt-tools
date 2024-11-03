// ==UserScript==
// @name         Cobalt Tools (Direct YouTube Video Downloader)
// @description  Bypass the download button and provide options to download the video and audio dubs directly from the YouTube page.
// @icon         https://raw.githubusercontent.com/exyezed/cobalt-tools/refs/heads/main/extras/cobalt-tools.png
// @version      1.6
// @author       exyezed
// @namespace    https://github.com/exyezed/cobalt-tools/
// @supportURL   https://github.com/exyezed/cobalt-tools/issues
// @license      MIT
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        GM.xmlHttpRequest
// @connect      exyezed.vercel.app
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const LANGUAGE_MAP = {
        "af": "Afrikaans",
        "am": "አማርኛ",
        "ar": "العربية",
        "as": "Assamese",
        "az": "azərbaycan",
        "be": "Belarusian",
        "bg": "български",
        "bn": "বাংলা",
        "bs": "bosanski",
        "ca": "català",
        "cs": "čeština",
        "da": "dansk",
        "de": "Deutsch",
        "el": "Ελληνικά",
        "en": "English",
        "es": "español",
        "et": "eesti",
        "eu": "Basque",
        "fa": "فارسی",
        "fi": "suomi",
        "fil": "Filipino",
        "fr": "français",
        "gl": "Galician",
        "gu": "ગુજરાતી",
        "hi": "हिन्दी",
        "hr": "hrvatski",
        "hu": "magyar",
        "hy": "Armenian",
        "id": "Indonesia",
        "is": "Icelandic",
        "it": "italiano",
        "iw": "עברית",
        "ja": "日本語",
        "ka": "Georgian",
        "kk": "Kazakh",
        "km": "Khmer",
        "kn": "ಕನ್ನಡ",
        "ko": "한국어",
        "ky": "Kyrgyz",
        "lo": "Lao",
        "lt": "lietuvių",
        "lv": "latviešu",
        "mk": "Macedonian",
        "ml": "മലയാളം",
        "mn": "Mongolian",
        "mr": "मराठी",
        "ms": "Melayu",
        "my": "Burmese",
        "ne": "Nepali",
        "nl": "Nederlands",
        "no": "norsk",
        "or": "Odia",
        "pa": "ਪੰਜਾਬੀ",
        "pl": "polski",
        "pt": "português",
        "ro": "română",
        "ru": "русский",
        "si": "Sinhala",
        "sk": "slovenčina",
        "sl": "slovenščina",
        "sq": "Albanian",
        "sr": "српски",
        "sv": "svenska",
        "sw": "Kiswahili",
        "ta": "தமிழ்",
        "te": "తెలుగు",
        "th": "ไทย",
        "tr": "Türkçe",
        "uk": "українська",
        "ur": "اردو",
        "uz": "o'zbek",
        "vi": "Tiếng Việt",
        "zh-CN": "中文（中国）",
        "zh-HK": "中文（香港）",
        "zh-TW": "中文（台灣）",
        "zu": "Zulu"
    };

    function extractVideoId(url) {
        const urlObj = new URL(url);
        const searchParams = new URLSearchParams(urlObj.search);
        return searchParams.get('v');
    }

    function triggerDirectDownload(url) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    function closeDialog(dialog, backdrop) {
        dialog.remove();
        backdrop.remove();
    }

    function createDownloadDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'yt-download-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #000000;
            color: #e1e1e1;
            border-radius: 12px;
            box-shadow: 0 0 0 1px rgba(225,225,225,.1), 0 2px 4px 1px rgba(225,225,225,.18);
            font-family: 'IBM Plex Mono', 'Noto Sans Mono Variable', 'Noto Sans Mono', monospace;
            width: 360px;
            z-index: 9999;
        `;
    
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');
    
            .quality-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 16px;
            }
    
            .quality-option {
                display: flex;
                align-items: center;
                padding: 8px;
                cursor: pointer;
            }
    
            .quality-option:hover {
                background: #191919;
                border-radius: 6px;
            }
    
            .logo-container {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
            }
    
            .subtitle {
                color: #e1e1e1;
                opacity: 0.7;
                font-size: 12px;
                margin-top: 4px;
            }
    
            .title {
                font-size: 18px;
                font-weight: 700;
            }
    
            .title-link {
                text-decoration: none;
                color: inherit;
                cursor: pointer;
                transition: opacity 0.2s ease;
            }
    
            .title-link:hover {
                opacity: 0.8;
            }
    
            .codec-selector {
                margin-bottom: 16px;
                display: flex;
                gap: 8px;
                justify-content: center;
            }
    
            .codec-button {
                background: transparent;
                border: 1px solid #e1e1e1;
                color: #e1e1e1;
                padding: 6px 12px;
                border-radius: 14px;
                cursor: pointer;
                font-family: inherit;
                font-size: 12px;
                transition: all 0.2s ease;
            }
    
            .codec-button:hover {
                background: #ffffff;
                border-color: #ffffff;
                color: #000000;
            }
    
            .codec-button.selected {
                background: #1ed760;
                border-color: #1ed760;
                color: #000000;
            }
    
            .codec-button.selected:hover {
                background: #1ed760;
                border-color: #1ed760;
                color: #000000;
            }
    
            .download-status {
                text-align: center;
                margin: 16px 0;
                font-size: 12px;
                display: none;
            }
    
            .button-container {
                display: flex;
                justify-content: center;
                gap: 8px;
            }
        `;
        dialog.appendChild(styleElement);
    
        const container = document.createElement('div');
        container.style.padding = '16px';
        dialog.appendChild(container);
    
        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';
        container.appendChild(logoContainer);
    
        const logoDiv = document.createElement('div');
        logoDiv.id = 'cobalt-logo';
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "24");
        svg.setAttribute("height", "16");
        svg.setAttribute("viewBox", "0 0 24 16");
        svg.setAttribute("fill", "none");
        
        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttribute("d", "M0 15.6363L0 12.8594L9.47552 8.293L0 3.14038L0 0.363525L12.8575 7.4908V9.21862L0 15.6363Z");
        path1.setAttribute("fill", "white");
        
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttribute("d", "M11.1425 15.6363V12.8594L20.6181 8.293L11.1425 3.14038V0.363525L24 7.4908V9.21862L11.1425 15.6363Z");
        path2.setAttribute("fill", "white");
        
        svg.appendChild(path1);
        svg.appendChild(path2);
        logoDiv.appendChild(svg);
        logoContainer.appendChild(logoDiv);
    
        const titleContainer = document.createElement('div');
        titleContainer.style.display = 'flex';
        titleContainer.style.flexDirection = 'column';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'title';
        
        const titleLink = document.createElement('a');
        titleLink.href = 'https://instances.cobalt.best/';
        titleLink.target = '_blank';
        titleLink.rel = 'noopener noreferrer';
        titleLink.className = 'title-link';
        titleLink.textContent = 'cobalt.tools';
        
        titleDiv.appendChild(titleLink);
        
        const subtitleDiv = document.createElement('div');
        subtitleDiv.className = 'subtitle';
        subtitleDiv.textContent = 'direct youtube video downloader';

        titleContainer.appendChild(titleDiv);
        titleContainer.appendChild(subtitleDiv);
        logoContainer.appendChild(titleContainer);
    
        const codecSelector = document.createElement('div');
        codecSelector.className = 'codec-selector';
        container.appendChild(codecSelector);
        
        const codecButtons = document.createElement('div');
        codecButtons.style.display = 'flex';
        codecButtons.style.gap = '8px';
        codecSelector.appendChild(codecButtons);
        
        ['h264', 'vp9', 'av1'].forEach(codec => {
            const button = document.createElement('button');
            button.className = 'codec-button';
            button.dataset.codec = codec;
            button.textContent = codec.toUpperCase();
            codecButtons.appendChild(button);
        });
        
        const audioButton = document.createElement('button');
        audioButton.className = 'audio-button';
        audioButton.dataset.type = 'audio';
        audioButton.textContent = 'AUDIO';
        audioButton.style.cssText = `
            background: transparent;
            border: 1px solid #39a9db;
            color: #39a9db;
            padding: 6px 12px;
            border-radius: 14px;
            cursor: pointer;
            font-family: inherit;
            font-size: 12px;
            transition: all 0.2s ease;
        `;
        
        audioButton.addEventListener('mouseover', () => {
            audioButton.style.background = '#39a9db';
            audioButton.style.color = '#000000';
        });
        
        audioButton.addEventListener('mouseout', () => {
            if (!audioButton.classList.contains('selected')) {
                audioButton.style.background = 'transparent';
                audioButton.style.color = '#39a9db';
            }
        });
        
        codecSelector.appendChild(audioButton);
        
        const audioSelector = document.createElement('div');
        audioSelector.className = 'audio-selector';
        audioSelector.style.display = 'none';
        audioSelector.style.margin = '16px 0';
        container.appendChild(audioSelector);
        
        const audioSelect = document.createElement('select');
        audioSelect.className = 'audio-select';
        audioSelect.style.cssText = `
            width: 100%;
            padding: 8px;
            background: #191919;
            color: #e1e1e1;
            border: 1px solid #e1e1e1;
            border-radius: 6px;
            font-family: inherit;
            cursor: pointer;
        `;
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Original Audio';
        audioSelect.appendChild(defaultOption);
        
        Object.entries(LANGUAGE_MAP).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${name} (${code})`;
            audioSelect.appendChild(option);
        });
        
        audioSelector.appendChild(audioSelect);
        
        const qualityOptions = document.createElement('div');
        qualityOptions.id = 'quality-options';
        qualityOptions.className = 'quality-grid';
        container.appendChild(qualityOptions);
        
        const downloadStatus = document.createElement('div');
        downloadStatus.className = 'download-status';
        downloadStatus.id = 'download-status';
        container.appendChild(downloadStatus);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        container.appendChild(buttonContainer);
        
        const cancelButton = document.createElement('button');
        cancelButton.id = 'cancel-button';
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
            background: transparent;
            border: 1px solid #e1e1e1;
            color: #e1e1e1;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 16px;
            cursor: pointer;
            font-family: inherit;
            border-radius: 18px;
        `;
        buttonContainer.appendChild(cancelButton);
        
        const downloadButton = document.createElement('button');
        downloadButton.id = 'download-button';
        downloadButton.textContent = 'Download';
        downloadButton.style.cssText = `
            background: transparent;
            border: 1px solid #e1e1e1;
            color: #e1e1e1;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 16px;
            border-radius: 18px;
            cursor: pointer;
            font-family: inherit;
        `;
        buttonContainer.appendChild(downloadButton);
        
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        `;
        document.body.appendChild(backdrop);
        
        backdrop.addEventListener('click', () => {
            closeDialog(dialog, backdrop);
        });
        
        const savedCodec = localStorage.getItem('cobaltToolsCodec') || 'h264';
        const savedQuality = localStorage.getItem('cobaltToolsQuality') || '1080p';
        const savedAudio = localStorage.getItem('cobaltToolsAudio') || '';
        
        const savedCodecButton = dialog.querySelector(`.codec-button[data-codec="${savedCodec}"]`);
        if (savedCodecButton) {
            savedCodecButton.classList.add('selected');
        }
        
        if (audioSelect) {
            audioSelect.value = savedAudio;
        }
        
        return { dialog, backdrop, savedCodec, savedQuality, savedAudio };
    }

    function updateQualityOptions(dialog, codec, savedQuality) {
        const qualityOptions = dialog.querySelector('#quality-options');
        
        while (qualityOptions.firstChild) {
            qualityOptions.removeChild(qualityOptions.firstChild);
        }
    
        let qualities;
        if (codec === 'h264') {
            qualities = ['144p', '240p', '360p', '480p', '720p', '1080p'];
        } else if (codec === 'vp9') {
            qualities = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '4k'];
        } else {
            qualities = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '4k', '8k+'];
        }
    
        const currentQuality = dialog.querySelector('input[name="quality"]:checked')?.value;
        console.log('Current selected quality:', currentQuality);
        console.log('Saved quality from localStorage:', savedQuality);
    
        qualities.forEach((quality, index) => {
            const option = document.createElement('div');
            option.className = 'quality-option';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.id = `quality-${index}`;
            input.name = 'quality';
            input.value = quality;
            input.style.marginRight = '8px';
            
            const label = document.createElement('label');
            label.htmlFor = `quality-${index}`;
            label.style.fontSize = '14px';
            label.style.cursor = 'pointer';
            label.textContent = quality;
            
            option.appendChild(input);
            option.appendChild(label);
            qualityOptions.appendChild(option);
        });
    
        qualityOptions.addEventListener('click', function(e) {
            const option = e.target.closest('.quality-option');
            if (option) {
                const radioButton = option.querySelector('input[type="radio"]');
                const selectedQuality = radioButton.value;
                
                qualityOptions.querySelectorAll('input[type="radio"]').forEach(rb => {
                    rb.checked = false;
                });
                
                radioButton.checked = true;
                
                console.log('Saving quality to localStorage:', selectedQuality);
                localStorage.setItem('cobaltToolsQuality', selectedQuality);
            }
        });
    
        let qualityToSelect;
        
        if (currentQuality && qualities.includes(currentQuality)) {
            qualityToSelect = currentQuality;
            console.log('Using current quality:', qualityToSelect);
        } else if (savedQuality && qualities.includes(savedQuality)) {
            qualityToSelect = savedQuality;
            console.log('Using saved quality:', qualityToSelect);
        } else {
            qualityToSelect = qualities[qualities.length - 1];
            console.log('Using default highest quality:', qualityToSelect);
        }
    
        const radioToSelect = dialog.querySelector(`input[name="quality"][value="${qualityToSelect}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
            localStorage.setItem('cobaltToolsQuality', qualityToSelect);
            console.log('Selected and saved quality:', qualityToSelect);
        }
    }

    function enableDownloadButton(button) {
        button.classList.remove('yt-spec-button-shape-next--disabled');
        button.classList.add('yt-spec-button-shape-next--mono');
        button.removeAttribute('disabled');
        button.setAttribute('aria-disabled', 'false');
    }
    
    function modifyQualityOptionsAndRemoveElements() {
        const { dialog, backdrop, savedCodec, savedAudio } = createDownloadDialog();
        let currentVideoId = null;
        let selectedCodec = savedCodec;
        let isAudioMode = false;
    
        try {
            const url = window.location.href;
            currentVideoId = extractVideoId(url);
        } catch (error) {
            console.error('Error extracting video ID:', error);
            return;
        }
    
        let currentQuality = localStorage.getItem('cobaltToolsQuality') || '1080p';
        console.log('Initial quality from localStorage:', currentQuality);
    
        const codecButtons = dialog.querySelectorAll('.codec-button');
        const audioButton = dialog.querySelector('.audio-button');
        const audioSelector = dialog.querySelector('.audio-selector');
        const qualityOptions = dialog.querySelector('#quality-options');
        const downloadButton = dialog.querySelector('#download-button');
    
        codecButtons.forEach(button => {
            if (button.dataset.codec === selectedCodec) {
                button.classList.add('selected');
            }
            button.addEventListener('click', () => {
                const currentSelectedQuality = dialog.querySelector('input[name="quality"]:checked')?.value;
                console.log('Quality before codec change:', currentSelectedQuality);
    
                isAudioMode = false;
                codecButtons.forEach(btn => btn.classList.remove('selected'));
                audioButton.classList.remove('selected');
                button.classList.add('selected');
                selectedCodec = button.dataset.codec;
                
                if (audioSelector) {
                    audioSelector.style.display = 'none';
                }
                qualityOptions.style.display = 'grid';
                
                updateQualityOptions(dialog, selectedCodec, currentSelectedQuality || currentQuality);
                localStorage.setItem('cobaltToolsCodec', selectedCodec);
            });
        });
    
        audioButton.addEventListener('click', () => {
            isAudioMode = true;
            codecButtons.forEach(btn => btn.classList.remove('selected'));
            audioButton.classList.add('selected');
            audioButton.style.background = '#39a9db';
            audioButton.style.color = '#000000';
            
            if (audioSelector) {
                audioSelector.style.display = 'block';
            }
            qualityOptions.style.display = 'none';
        });
    
        updateQualityOptions(dialog, selectedCodec, currentQuality);
    
        const audioSelect = dialog.querySelector('.audio-select');
        if (audioSelect) {
            audioSelect.value = savedAudio;
            audioSelect.addEventListener('change', () => {
                localStorage.setItem('cobaltToolsAudio', audioSelect.value);
            });
        }
    
        const cancelButton = dialog.querySelector('#cancel-button');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => closeDialog(dialog, backdrop));
            cancelButton.addEventListener('mouseover', () => {
                cancelButton.style.background = '#f3727f';
                cancelButton.style.borderColor = '#f3727f';
                cancelButton.style.color = '#000000';
            });
            cancelButton.addEventListener('mouseout', () => {
                cancelButton.style.background = 'transparent';
                cancelButton.style.borderColor = '#e1e1e1';
                cancelButton.style.color = '#e1e1e1';
            });
        }
    
        if (downloadButton) {
            downloadButton.addEventListener('click', () => {
                if (isAudioMode) {
                    downloadVideo('audio', currentVideoId, 'audio', dialog, backdrop);
                } else {
                    const selectedQuality = dialog.querySelector('input[name="quality"]:checked');
                    if (selectedQuality && currentVideoId) {
                        downloadVideo(selectedQuality.value, currentVideoId, selectedCodec, dialog, backdrop);
                    }
                }
            });
            downloadButton.addEventListener('mouseover', () => {
                downloadButton.style.background = '#1ed760';
                downloadButton.style.borderColor = '#1ed760';
                downloadButton.style.color = '#000000';
            });
            downloadButton.addEventListener('mouseout', () => {
                downloadButton.style.background = 'transparent';
                downloadButton.style.borderColor = '#e1e1e1';
                downloadButton.style.color = '#e1e1e1';
            });
        }
    
        return dialog;
    }
    
    function downloadVideo(quality, videoId, codec, dialog, backdrop) {
        const statusElement = dialog.querySelector('#download-status');
        statusElement.style.display = 'block';
        statusElement.textContent = 'Preparing download...';
    
        const baseUrl = 'https://exyezed.vercel.app/api/cobalt/video';
        let endpoint;
    
        const audioSelect = dialog.querySelector('.audio-select');
        const selectedAudio = audioSelect ? audioSelect.value : '';
    
        if (codec === 'audio') {
            endpoint = `${baseUrl}/audio/${videoId}`;
            if (selectedAudio) {
                endpoint += `/${selectedAudio}`;
            }
        } else {
            const qualityMap = {
                '144p': '144',
                '240p': '240',
                '360p': '360',
                '480p': '480',
                '720p': '720',
                '1080p': '1080',
                '1440p': '1440',
                '4k': '2160',
                '8k+': '4320'
            };
    
            if (quality === '8k+' || quality === '4320p') {
                endpoint = `${baseUrl}/${codec}/max/${videoId}`;
            } else {
                const mappedQuality = qualityMap[quality] || quality.replace('p', '');
                endpoint = `${baseUrl}/${codec}/${mappedQuality}/${videoId}`;
            }
    
            if (selectedAudio) {
                endpoint += `/${selectedAudio}`;
            }
        }
    
        console.log('Download endpoint:', endpoint);
    
        GM.xmlHttpRequest({
            method: 'GET',
            url: endpoint,
            responseType: 'json',
            onload: function(response) {
                try {
                    if (response.responseText.trim().startsWith('<')) {
                        throw new Error('Received HTML instead of JSON. API endpoint might be down.');
                    }
    
                    const data = JSON.parse(response.responseText);
                    if (data.url) {
                        statusElement.textContent = 'Starting download...';
                        triggerDirectDownload(data.url);
    
                        setTimeout(() => {
                            closeDialog(dialog, backdrop);
                        }, 1000);
                    } else {
                        statusElement.textContent = 'Error: No download URL found';
                        console.error('No URL in response:', data);
                    }
                } catch (error) {
                    statusElement.textContent = 'Error: API service might be temporarily unavailable';
                    console.error('Error processing response:', error.message, 'Codec:', codec, 'Quality:', quality, 'Video ID:', videoId);
                }
            },
            onerror: function(error) {
                statusElement.textContent = 'Network error. Please check your connection.';
                console.error('Network error:', error, 'Codec:', codec, 'Quality:', quality, 'Video ID:', videoId);
            }
        });
    }

    function findAndEnableDownloadButtons() {
        const downloadButtons = document.querySelectorAll('button[aria-label="Download"]');
        downloadButtons.forEach(button => {
            if (button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true') {
                enableDownloadButton(button);
            }
        });
    }

    function interceptDownloadButton() {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        findAndEnableDownloadButtons();

        const callback = function(mutationsList) {
            for(let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const addedNodes = mutation.addedNodes;
                    for(let node of addedNodes) {
                        if(node.nodeType === Node.ELEMENT_NODE) {
                            const disabledButtons = node.querySelectorAll('button[aria-label="Download"][disabled], button[aria-label="Download"][aria-disabled="true"]');
                            disabledButtons.forEach(button => {
                                enableDownloadButton(button);
                            });

                            const downloadDialog = node.querySelector('ytd-download-quality-selector-renderer');
                            if(downloadDialog) {
                                node.remove();
                                const customDialog = modifyQualityOptionsAndRemoveElements();
                                document.body.appendChild(customDialog);
                                return;
                            }
                        }
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);

        setInterval(findAndEnableDownloadButtons, 2000);

        document.addEventListener('click', function(event) {
            if(event.target.closest('button[aria-label="Download"]')) {
                event.stopPropagation();
                event.preventDefault();
                const customDialog = modifyQualityOptionsAndRemoveElements();
                document.body.appendChild(customDialog);
            }
        }, true);
    }

    interceptDownloadButton();
    console.log('Cobalt Tools (Direct YouTube Video Downloader) is running');
})();
