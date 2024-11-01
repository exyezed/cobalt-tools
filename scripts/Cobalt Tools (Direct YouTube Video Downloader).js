// ==UserScript==
// @name         Cobalt Tools (Direct YouTube Video Downloader)
// @description  Bypass the download button and display options to download the video directly from the YouTube page.
// @icon         https://raw.githubusercontent.com/exyezed/cobalt-tools/refs/heads/main/extras/cobalt-tools.png
// @version      1.3
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

    function triggerDirectDownload(url, filename) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename || 'video.mp4';
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
            width: 360px;
            z-index: 9999;
        `;
        dialog.innerHTML = `
            <style>
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
            </style>
            <div style="padding: 16px;">
                <div class="logo-container">
                    <div id="cobalt-logo">
                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 15.6363L0 12.8594L9.47552 8.293L0 3.14038L0 0.363525L12.8575 7.4908V9.21862L0 15.6363Z" fill="white"></path>
                            <path d="M11.1425 15.6363V12.8594L20.6181 8.293L11.1425 3.14038V0.363525L24 7.4908V9.21862L11.1425 15.6363Z" fill="white"></path>
                        </svg>
                    </div>
                    <div>
                        <a href="https://instances.cobalt.best/" target="_blank" rel="noopener noreferrer" class="title-link">
                            <div class="title">cobalt.tools</div>
                        </a>
                        <div class="subtitle">direct youtube video downloader</div>
                    </div>
                </div>
                <div class="codec-selector">
                    <button class="codec-button selected" data-codec="h264">H.264</button>
                    <button class="codec-button" data-codec="vp9">VP9</button>
                    <button class="codec-button" data-codec="av1">AV1</button>
                </div>
                <div id="quality-options" class="quality-grid"></div>
                <div class="download-status" id="download-status"></div>
                <div class="button-container">
                    <button id="cancel-button" style="background: transparent; border: 1px solid #e1e1e1; color: #e1e1e1; font-size: 14px; font-weight: 500; padding: 8px 16px; cursor: pointer; font-family: inherit; border-radius: 18px;">Cancel</button>
                    <button id="download-button" style="background: transparent; border: 1px solid #e1e1e1; color: #e1e1e1; font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 18px; cursor: pointer; font-family: inherit;">Download</button>
                </div>
            </div>
        `;

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

        return { dialog, backdrop };
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

    function getVideoTitle() {
        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer');
        return titleElement ? titleElement.textContent.trim() : 'youtube-video';
    }

    function downloadVideo(quality, videoId, codec, dialog, backdrop) {
        const statusElement = dialog.querySelector('#download-status');
        statusElement.style.display = 'block';
        statusElement.textContent = 'Preparing download...';

        const baseUrl = 'https://exyezed.vercel.app/api/cobalt/video';
        let endpoint;

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
                        const videoTitle = getVideoTitle();
                        const filename = `${videoTitle} (${quality}-${codec}).mp4`;

                        statusElement.textContent = 'Starting download...';
                        triggerDirectDownload(data.url, filename);

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

    function updateQualityOptions(dialog, codec) {
        const qualityOptions = dialog.querySelector('#quality-options');
        qualityOptions.innerHTML = '';

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
            option.innerHTML = `
                <input type="radio" id="quality-${index}" name="quality" value="${quality}" style="margin-right: 8px;">
                <label for="quality-${index}" style="font-size: 14px; cursor: pointer;">${quality}</label>
            `;
            qualityOptions.appendChild(option);

            option.addEventListener('click', function() {
                const radioButton = this.querySelector('input[type="radio"]');
                qualityOptions.querySelectorAll('input[type="radio"]').forEach(rb => {
                    rb.checked = false;
                });
                radioButton.checked = true;
            });
        });

        const defaultQuality = qualities.includes('1080p') ? '1080p' : qualities[qualities.length - 1];
        const defaultRadio = dialog.querySelector(`input[name="quality"][value="${defaultQuality}"]`);
        if (defaultRadio) {
            defaultRadio.checked = true;
        }
    }

    function modifyQualityOptionsAndRemoveElements() {
        const { dialog, backdrop } = createDownloadDialog();
        let currentVideoId = null;
        let selectedCodec = 'h264';

        try {
            const url = window.location.href;
            currentVideoId = extractVideoId(url);
        } catch (error) {
            console.error('Error extracting video ID:', error);
            return;
        }

        const codecButtons = dialog.querySelectorAll('.codec-button');
        codecButtons.forEach(button => {
            if (button.dataset.codec === selectedCodec) {
                button.classList.add('selected');
            }
            button.addEventListener('click', () => {
                codecButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                selectedCodec = button.dataset.codec;
                updateQualityOptions(dialog, selectedCodec);
            });
        });

        updateQualityOptions(dialog, selectedCodec);

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
                const selectedQuality = dialog.querySelector('input[name="quality"]:checked');
                if (selectedQuality && currentVideoId) {
                    downloadVideo(selectedQuality.value, currentVideoId, selectedCodec, dialog, backdrop);
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
                downloadButton.style.color =

 '#e1e1e1';
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
            if(event.target.closest('button[aria-label="Download"]')) {
                event.stopPropagation();
                event.preventDefault();
                const customDialog = modifyQualityOptionsAndRemoveElements();
                document.body.appendChild(customDialog);
            }
        }, true);
    }

    interceptDownloadButton();
    console.log('Cobalt Tools userscript v1.8 is running');
})();
