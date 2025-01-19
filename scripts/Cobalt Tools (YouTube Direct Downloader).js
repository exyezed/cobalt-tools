// ==UserScript==
// @name         Cobalt Tools (YouTube Direct Downloader)
// @description  Bypass the download button and provide options to download the video, video dubs, or audio directly from the YouTube page.
// @icon         https://raw.githubusercontent.com/exyezed/cobalt-tools/refs/heads/main/extras/cobalt-tools.png
// @version      1.6
// @author       exyezed
// @namespace    https://github.com/exyezed/cobalt-tools/
// @supportURL   https://github.com/exyezed/cobalt-tools/issues
// @license      MIT
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        GM.xmlHttpRequest
// @connect      c.blahaj.ca
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
            width: 400px;
            z-index: 9999;
        `;

        const dialogContent = document.createElement('div');
        dialogContent.style.padding = '16px';

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
                background: #808080;
                color: #000000;
            }

            .codec-button.selected {
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

            .switch-container {
                position: absolute;
                top: 16px;
                right: 16px;
                display: flex;
                align-items: center;
            }
            .switch-button {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 4px;
                transition: all 0.2s ease;
            }
            .switch-button svg {
                width: 20px;
                height: 20px;
                fill: #e1e1e1;
                transition: all 0.2s ease;
            }
            .switch-button:hover svg {
                fill: #1ed760;
            }
            .audio-options {
                display: none;
                margin-bottom: 16px;
            }
            .audio-options.active {
                display: block;
            }
            .dub-selector {
                margin-top: 16px;
                margin-bottom: 16px;
                display: none;
            }
            .dub-select {
                width: 80%;
                margin: 0 auto;
                display: block;
            }
            .dub-button {
                background: transparent;
                border: 1px solid #39a9db;
                color: #39a9db;
            }
            .dub-button:hover {
                background: #39a9db;
                color: #000000;
            }
            .dub-button.selected {
                background: #39a9db;
                border-color: #39a9db;
                color: #000000;
            }
        `;
        dialog.appendChild(styleElement);

        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';

        const logoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        logoSvg.setAttribute('width', '24');
        logoSvg.setAttribute('height', '16');
        logoSvg.setAttribute('viewBox', '0 0 24 16');
        logoSvg.setAttribute('fill', 'none');

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M0 15.6363L0 12.8594L9.47552 8.293L0 3.14038L0 0.363525L12.8575 7.4908V9.21862L0 15.6363Z');
        path1.setAttribute('fill', 'white');

        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M11.1425 15.6363V12.8594L20.6181 8.293L11.1425 3.14038V0.363525L24 7.4908V9.21862L11.1425 15.6363Z');
        path2.setAttribute('fill', 'white');

        logoSvg.appendChild(path1);
        logoSvg.appendChild(path2);

        const logoDiv = document.createElement('div');
        logoDiv.id = 'cobalt-logo';
        logoDiv.appendChild(logoSvg);

        logoContainer.appendChild(logoDiv);

        const titleContainer = document.createElement('div');
        const titleLink = document.createElement('a');
        titleLink.href = 'https://greasyfork.org/en/users/1382928';
        titleLink.target = '_blank';
        titleLink.rel = 'noopener noreferrer';
        titleLink.className = 'title-link';

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = 'cobalt.tools';

        titleLink.appendChild(title);
        titleContainer.appendChild(titleLink);

        const subtitle = document.createElement('div');
        subtitle.className = 'subtitle';
        subtitle.textContent = 'youtube direct downloader';

        titleContainer.appendChild(subtitle);
        logoContainer.appendChild(titleContainer);

        dialogContent.appendChild(logoContainer);

        const switchContainer = document.createElement('div');
        switchContainer.className = 'switch-container';

        const switchButton = document.createElement('button');
        switchButton.className = 'switch-button';
        switchButton.id = 'mode-switch';

        const switchSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        switchSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        switchSvg.setAttribute('viewBox', '0 0 384 512');

        const switchPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        switchPath.setAttribute('d', 'M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM64 288c0-17.7 14.3-32 32-32l96 0c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32l0-96zM300.9 397.9L256 368l0-64 44.9-29.9c2-1.3 4.4-2.1 6.8-2.1c6.8 0 12.3 5.5 12.3 12.3l0 103.4c0 6.8-5.5 12.3-12.3 12.3c-2.4 0-4.8-.7-6.8-2.1z');

        switchSvg.appendChild(switchPath);
        switchButton.appendChild(switchSvg);
        switchContainer.appendChild(switchButton);

        dialogContent.appendChild(switchContainer);

        const videoOptions = document.createElement('div');
        videoOptions.id = 'video-options';

        const videoCodecSelector = document.createElement('div');
        videoCodecSelector.className = 'codec-selector';

        ['h264', 'vp9', 'av1'].forEach(codec => {
            const button = document.createElement('button');
            button.className = 'codec-button';
            button.dataset.codec = codec;
            button.textContent = codec.toUpperCase();
            videoCodecSelector.appendChild(button);
        });

        const dubButton = document.createElement('button');
        dubButton.className = 'codec-button dub-button';
        dubButton.dataset.codec = 'dub';
        dubButton.textContent = 'DUB';
        videoCodecSelector.appendChild(dubButton);

        videoOptions.appendChild(videoCodecSelector);

        const qualityOptions = document.createElement('div');
        qualityOptions.id = 'quality-options';
        qualityOptions.className = 'quality-grid';
        videoOptions.appendChild(qualityOptions);

        const dubSelector = document.createElement('div');
        dubSelector.className = 'dub-selector';
        dubSelector.style.display = 'none';

        const dubSelect = document.createElement('select');
        dubSelect.className = 'dub-select';
        dubSelect.style.cssText = `
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
        dubSelect.appendChild(defaultOption);

        Object.entries(LANGUAGE_MAP).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${name} (${code})`;
            dubSelect.appendChild(option);
        });

        dubSelector.appendChild(dubSelect);
        videoOptions.appendChild(dubSelector);

        dialogContent.appendChild(videoOptions);

        const audioOptions = document.createElement('div');
        audioOptions.id = 'audio-options';
        audioOptions.className = 'audio-options';

        const audioCodecSelector = document.createElement('div');
        audioCodecSelector.className = 'codec-selector';

        ['mp3', 'ogg', 'opus', 'wav'].forEach(codec => {
            const button = document.createElement('button');
            button.className = 'codec-button';
            button.dataset.codec = codec;
            button.textContent = codec.toUpperCase();
            audioCodecSelector.appendChild(button);
        });

        audioOptions.appendChild(audioCodecSelector);

        const bitrateOptions = document.createElement('div');
        bitrateOptions.id = 'bitrate-options';
        bitrateOptions.className = 'quality-grid';
        audioOptions.appendChild(bitrateOptions);

        dialogContent.appendChild(audioOptions);

        const downloadStatus = document.createElement('div');
        downloadStatus.className = 'download-status';
        downloadStatus.id = 'download-status';
        dialogContent.appendChild(downloadStatus);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

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

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(downloadButton);

        dialogContent.appendChild(buttonContainer);

        dialog.appendChild(dialogContent);

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
        const savedMode = localStorage.getItem('cobaltToolsMode') || 'video';
        const savedAudioCodec = localStorage.getItem('cobaltToolsAudioCodec') || 'mp3';
        const savedDub = localStorage.getItem('cobaltToolsDub') || '';

        return { dialog, backdrop, savedCodec, savedQuality, savedMode, savedAudioCodec, savedDub };
    }

    function closeDialog(dialog, backdrop) {
        dialog.remove();
        backdrop.remove();
    }

    function extractVideoId(url) {
        const urlObj = new URL(url);
        const searchParams = new URLSearchParams(urlObj.search);
        return searchParams.get('v');
    }

    function downloadVideo(quality, videoId, codec, dialog, backdrop) {
        const statusElement = dialog.querySelector('#download-status');
        statusElement.style.display = 'block';
        statusElement.textContent = 'Preparing download...';

        const dubSelect = dialog.querySelector('.dub-select');
        const selectedDub = dubSelect ? dubSelect.value : '';

        const payload = {
            url: `https://www.youtube.com/watch?v=${videoId}`,
            downloadMode: "auto",
            filenameStyle: "basic",
            videoQuality: quality.replace('p', ''),
            youtubeVideoCodec: codec,
            youtubeDubLang: selectedDub ? selectedDub : 'original'
        };

        GM.xmlHttpRequest({
            method: 'POST',
            url: 'https://c.blahaj.ca/',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            data: JSON.stringify(payload),
            responseType: 'json',
            onload: function(response) {
                try {
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
                    console.error('Error processing response:', error);
                }
            },
            onerror: function(error) {
                statusElement.textContent = 'Network error. Please check your connection.';
                console.error('Network error:', error);
            }
        });
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

            option.addEventListener('click', function() {
                const radioButton = this.querySelector('input[type="radio"]');
                qualityOptions.querySelectorAll('input[type="radio"]').forEach(rb => {
                    rb.checked = false;
                });
                radioButton.checked = true;

                localStorage.setItem('cobaltToolsQuality', quality);
            });
        });

        const defaultQuality = qualities.includes(savedQuality) ? savedQuality : qualities[qualities.length - 1];
        const defaultRadio = dialog.querySelector(`input[name="quality"][value="${defaultQuality}"]`);
        if (defaultRadio) {
            defaultRadio.checked = true;
        }
    }

    function updateAudioOptions(dialog, codec, savedBitrate) {
        const bitrateOptions = dialog.querySelector('#bitrate-options');
        while (bitrateOptions.firstChild) {
            bitrateOptions.removeChild(bitrateOptions.firstChild);
        }

        if (codec === 'wav') {
            return;
        }

        const bitrates = ['8', '64', '96', '128', '256', '320'];

        bitrates.forEach((bitrate, index) => {
            const option = document.createElement('div');
            option.className = 'quality-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.id = `bitrate-${index}`;
            input.name = 'bitrate';
            input.value = bitrate;
            input.style.marginRight = '8px';

            const label = document.createElement('label');
            label.htmlFor = `bitrate-${index}`;
            label.style.fontSize = '14px';
            label.style.cursor = 'pointer';
            label.textContent = `${bitrate} kb/s`;

            option.appendChild(input);
            option.appendChild(label);
            bitrateOptions.appendChild(option);

            option.addEventListener('click', function() {
                const radioButton = this.querySelector('input[type="radio"]');
                bitrateOptions.querySelectorAll('input[type="radio"]').forEach(rb => {
                    rb.checked = false;
                });
                radioButton.checked = true;

                localStorage.setItem('cobaltToolsBitrate', bitrate);
            });
        });

        const defaultBitrate = bitrates.includes(savedBitrate) ? savedBitrate : bitrates[bitrates.length - 1];
        const defaultRadio = dialog.querySelector(`input[name="bitrate"][value="${defaultBitrate}"]`);
        if (defaultRadio) {
            defaultRadio.checked = true;
        }
    }

    function downloadAudio(format, bitrate, videoId, dialog, backdrop) {
        const statusElement = dialog.querySelector('#download-status');
        statusElement.style.display = 'block';
        statusElement.textContent = 'Preparing audio download...';

        let payload;
        if (format === 'wav') {
            payload = {
                url: `https://www.youtube.com/watch?v=${videoId}`,
                downloadMode: "audio",
                filenameStyle: "basic",
                audioFormat: "wav"
            };
        } else {
            payload = {
                url: `https://www.youtube.com/watch?v=${videoId}`,
                downloadMode: "audio",
                filenameStyle: "basic",
                audioFormat: format,
                audioBitrate: bitrate
            };
        }

        GM.xmlHttpRequest({
            method: 'POST',
            url: 'https://c.blahaj.ca/',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            data: JSON.stringify(payload),
            responseType: 'json',
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    if (data.url) {
                        statusElement.textContent = 'Starting audio download...';
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
                    console.error('Error processing response:', error);
                }
            },
            onerror: function(error) {
                statusElement.textContent = 'Network error. Please check your connection.';
                console.error('Network error:', error);
            }
        });
    }

    function updateModeSwitch(modeSwitch, isAudioMode) {
        while (modeSwitch.firstChild) {
            modeSwitch.removeChild(modeSwitch.firstChild);
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('viewBox', '0 0 384 512');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        if (isAudioMode) {
            path.setAttribute('d', 'M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zm2 226.3c37.1 22.4 62 63.1 62 109.7s-24.9 87.3-62 109.7c-7.6 4.6-17.4 2.1-22-5.4s-2.1-17.4 5.4-22C269.4 401.5 288 370.9 288 336s-18.6-65.5-46.5-82.3c-7.6-4.6-10-14.4-5.4-22s14.4-10 22-5.4zm-91.9 30.9c6 2.5 9.9 8.3 9.9 14.8l0 128c0 6.5-3.9 12.3-9.9 14.8s-12.9 1.1-17.4-3.5L113.4 376 80 376c-8.8 0-16-7.2-16-16l0-48c0-8.8 7.2-16 16-16l33.4 0 35.3-35.3c4.6-4.6 11.5-5.9 17.4-3.5zm51 34.9c6.6-5.9 16.7-5.3 22.6 1.3C249.8 304.6 256 319.6 256 336s-6.2 31.4-16.3 42.7c-5.9 6.6-16 7.1-22.6 1.3s-7.1-16-1.3-22.6c5.1-5.7 8.1-13.1 8.1-21.3s-3.1-15.7-8.1-21.3c-5.9-6.6-5.3-16.7 1.3-22.6z');
        } else {
            path.setAttribute('d', 'M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM64 288c0-17.7 14.3-32 32-32l96 0c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32l0-96zM300.9 397.9L256 368l0-64 44.9-29.9c2-1.3 4.4-2.1 6.8-2.1c6.8 0 12.3 5.5 12.3 12.3l0 103.4c0 6.8-5.5 12.3-12.3 12.3c-2.4 0-4.8-.7-6.8-2.1z');
        }

        svg.appendChild(path);
        modeSwitch.appendChild(svg);
    }

    function modifyQualityOptionsAndRemoveElements() {
        const { dialog, backdrop, savedCodec, savedMode, savedAudioCodec, savedDub } = createDownloadDialog();
        let currentVideoId = null;
        let selectedVideoCodec = savedCodec;
        let selectedAudioCodec = savedAudioCodec;
        let isAudioMode = savedMode === 'audio';

        try {
            const url = window.location.href;
            currentVideoId = extractVideoId(url);
        } catch (error) {
            console.error('Error extracting video ID:', error);
            return;
        }

        const modeSwitch = dialog.querySelector('#mode-switch');
        const videoOptions = dialog.querySelector('#video-options');
        const audioOptions = dialog.querySelector('#audio-options');
        const dubSelector = dialog.querySelector('.dub-selector');

        function updateModeSwitchAndOptions() {
            updateModeSwitch(modeSwitch, isAudioMode);
            if (isAudioMode) {
                audioOptions.style.display = 'block';
                videoOptions.style.display = 'none';
            } else {
                videoOptions.style.display = 'block';
                audioOptions.style.display = 'none';
            }
        }

        updateModeSwitchAndOptions();

        modeSwitch.addEventListener('click', () => {
            isAudioMode = !isAudioMode;
            updateModeSwitchAndOptions();
            localStorage.setItem('cobaltToolsMode', isAudioMode ? 'audio' : 'video');
            updateCodecButtons();
        });

        function updateCodecButtons() {
            const videoCodecButtons = videoOptions.querySelectorAll('.codec-button');
            const audioCodecButtons = audioOptions.querySelectorAll('.codec-button');

            videoCodecButtons.forEach(button => {
                button.classList.remove('selected');
                if (button.dataset.codec === selectedVideoCodec) {
                    button.classList.add('selected');
                }
            });

            audioCodecButtons.forEach(button => {
                button.classList.remove('selected');
                if (button.dataset.codec === selectedAudioCodec) {
                    button.classList.add('selected');
                }
            });

            if (isAudioMode) {
                updateAudioOptions(dialog, selectedAudioCodec, localStorage.getItem('cobaltToolsBitrate') || '320');
            } else {
                updateQualityOptions(dialog, selectedVideoCodec, localStorage.getItem('cobaltToolsQuality') || '1080p');
            }

            if (selectedVideoCodec === 'dub') {
                dubSelector.style.display = 'block';
                dialog.querySelector('#quality-options').style.display = 'none';
            } else {
                dubSelector.style.display = 'none';
                dialog.querySelector('#quality-options').style.display = 'grid';
            }
        }

        const codecButtons = dialog.querySelectorAll('.codec-button');
        codecButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (isAudioMode) {
                    selectedAudioCodec = button.dataset.codec;
                    localStorage.setItem('cobaltToolsAudioCodec', selectedAudioCodec);
                } else {
                    selectedVideoCodec = button.dataset.codec;
                    localStorage.setItem('cobaltToolsCodec', selectedVideoCodec);
                }
                updateCodecButtons();
            });
        });

        updateCodecButtons();

        const dubSelect = dialog.querySelector('.dub-select');
        if (dubSelect) {
            dubSelect.value = savedDub;
            dubSelect.addEventListener('change', () => {
                localStorage.setItem('cobaltToolsDub', dubSelect.value);
            });
        }

        const cancelButton = dialog.querySelector('#cancel-button');
        const downloadButton = dialog.querySelector('#download-button');

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
                    const selectedFormat = selectedAudioCodec;
                    const selectedBitrate = selectedFormat === 'wav' ? 'WAV' : dialog.querySelector('input[name="bitrate"]:checked')?.value || '320';
                    if (selectedFormat && currentVideoId) {
                        downloadAudio(selectedFormat, selectedBitrate, currentVideoId, dialog, backdrop);
                    }
                } else {
                    if (selectedVideoCodec === 'dub') {
                        downloadVideo('dub', currentVideoId, 'dub', dialog, backdrop);
                    } else {
                        const selectedQuality = dialog.querySelector('input[name="quality"]:checked');
                        if (selectedQuality && currentVideoId) {
                            downloadVideo(selectedQuality.value, currentVideoId, selectedVideoCodec, dialog, backdrop);
                        }
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

    function enableDownloadButton(button) {
        button.classList.remove('yt-spec-button-shape-next--disabled');
        button.classList.add('yt-spec-button-shape-next--mono');
        button.removeAttribute('disabled');
        button.setAttribute('aria-disabled', 'false');
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

        const callback = function(mutationsList, observer) {
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
            if(event.target.closest('ytd-menu-service-item-download-renderer')) {
                event.stopPropagation();
                event.preventDefault();
                const customDialog = modifyQualityOptionsAndRemoveElements();
                document.body.appendChild(customDialog);
            }
        }, true);
    }

    interceptDownloadButton();
    console.log('Cobalt Tools (YouTube Direct Downloader) is running');
})();
