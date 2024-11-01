// ==UserScript==
// @name         Cobalt Tools (Direct YouTube Video Downloader)
// @description  Bypass the download button and display options to download the video directly from the YouTube page.
// @icon         https://raw.githubusercontent.com/exyezed/cobalt-tools/refs/heads/main/extras/cobalt-tools.png
// @version      1.2
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
 
    function downloadVideo(quality, videoId, dialog, backdrop) {
        const statusElement = dialog.querySelector('#download-status');
        statusElement.style.display = 'block';
        statusElement.textContent = 'Preparing download...';
 
        const baseUrl = 'https://exyezed.vercel.app/api/cobalt/video';
        const endpoint = `${baseUrl}/${quality.replace('p', '')}/${videoId}`;
 
        GM.xmlHttpRequest({
            method: 'GET',
            url: endpoint,
            responseType: 'json',
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    if (data.url) {
                        const videoTitle = getVideoTitle();
                        const filename = `${videoTitle} (${quality}).mp4`;
                        
                        statusElement.textContent = 'Starting download...';
                        triggerDirectDownload(data.url, filename);
                        
                        setTimeout(() => {
                            closeDialog(dialog, backdrop);
                        }, 1000);
                    } else {
                        statusElement.textContent = 'Error: No download URL found';
                    }
                } catch (error) {
                    statusElement.textContent = 'Error processing download';
                    console.error('Error parsing response:', error);
                }
            },
            onerror: function(error) {
                statusElement.textContent = 'Error downloading video';
                console.error('Error downloading video:', error);
            }
        });
    }
 
    function modifyQualityOptionsAndRemoveElements() {
        const { dialog, backdrop } = createDownloadDialog();
        const qualityOptions = dialog.querySelector('#quality-options');
        let currentVideoId = null;
 
        try {
            const url = window.location.href;
            currentVideoId = extractVideoId(url);
        } catch (error) {
            console.error('Error extracting video ID:', error);
            return;
        }
 
        if (qualityOptions) {
            const newQualities = [
                '144p', '240p', '360p',
                '480p', '720p', '1080p'
            ];
 
            newQualities.forEach((quality, index) => {
                const option = document.createElement('div');
                option.className = 'quality-option';
                option.innerHTML = `
                    <input type="radio" id="quality-${index}" name="quality" value="${quality}" style="margin-right: 8px;">
                    <label for="quality-${index}" style="font-size: 14px; cursor: pointer;">${quality}</label>
                `;
                qualityOptions.appendChild(option);
 
                const radioButton = option.querySelector('input[type="radio"]');
                radioButton.addEventListener('click', function() {
                    qualityOptions.querySelectorAll('input[type="radio"]').forEach(rb => {
                        if (rb !== this) {
                            rb.checked = false;
                        }
                    });
                    this.checked = true;
                });
 
                if (quality === '1080p') {
                    radioButton.checked = true;
                }
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
                const selectedQuality = dialog.querySelector('input[name="quality"]:checked');
                if (selectedQuality && currentVideoId) {
                    downloadVideo(selectedQuality.value, currentVideoId, dialog, backdrop);
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
            if(event.target.closest('button[aria-label="Download"]')) {
                event.stopPropagation();
                event.preventDefault();
                const customDialog = modifyQualityOptionsAndRemoveElements();
                document.body.appendChild(customDialog);
            }
        }, true);
    }
 
    interceptDownloadButton();
    console.log('Cobalt Tools userscript is running');
})();
