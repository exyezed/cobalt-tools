// ==UserScript==
// @name         Cobalt Tools (Direct YouTube Audio Downloader)
// @description  Integrate a high-quality 320kbps audio download button before the video title.
// @icon         https://raw.githubusercontent.com/exyezed/cobalt-tools/refs/heads/main/extras/cobalt-tools.png
// @version      1.0
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

    function addMusicIconToTitle() {
        const titleContainer = document.querySelector('h1.style-scope.ytd-watch-metadata');
        const titleElement = titleContainer?.querySelector('yt-formatted-string');
        
        if (!titleContainer || !titleElement) return;
        
        if (titleContainer.querySelector('svg')) return;
        
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("viewBox", "0 0 384 512");
        svgElement.setAttribute("width", "16");
        svgElement.setAttribute("height", "16");
        svgElement.style.marginRight = "8px";
        svgElement.style.transition = "all 0.2s ease";
        svgElement.style.fill = "white";
        svgElement.style.flexShrink = "0";
        svgElement.style.cursor = "pointer";
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zm32 224l0 32 0 128c0 17.7-21.5 32-48 32s-48-14.3-48-32s21.5-32 48-32c5.6 0 11 .6 16 1.8l0-74.7-96 36L160 416c0 17.7-21.5 32-48 32s-48-14.3-48-32s21.5-32 48-32c5.6 0 11 .6 16 1.8l0-81.8 0-32c0-6.7 4.1-12.6 10.4-15l128-48c4.9-1.8 10.4-1.2 14.7 1.8s6.9 7.9 6.9 13.2z");
        svgElement.appendChild(path);

        const successSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        successSvg.setAttribute("viewBox", "0 0 512 512");
        successSvg.setAttribute("width", "16");
        successSvg.setAttribute("height", "16");
        successSvg.style.display = "none";
        successSvg.style.fill = "#1ed760";
        successSvg.style.marginRight = "8px";
        
        const successPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        successPath.setAttribute("d", "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z");
        successSvg.appendChild(successPath);

        const errorSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        errorSvg.setAttribute("viewBox", "0 0 512 512");
        errorSvg.setAttribute("width", "16");
        errorSvg.setAttribute("height", "16");
        errorSvg.style.display = "none";
        errorSvg.style.fill = "#f3727f";
        errorSvg.style.marginRight = "8px";
        
        const errorPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        errorPath.setAttribute("d", "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z");
        errorSvg.appendChild(errorPath);

        const loadingSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        loadingSvg.setAttribute("viewBox", "0 0 512 512");
        loadingSvg.setAttribute("width", "16");
        loadingSvg.setAttribute("height", "16");
        loadingSvg.style.display = "none";
        loadingSvg.style.fill = "white";
        loadingSvg.style.marginRight = "8px";

        const style2 = document.createElementNS("http://www.w3.org/2000/svg", "style");
        style2.textContent = ".fa-secondary{opacity:.4}";
        loadingSvg.appendChild(style2);

        const secondaryPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        secondaryPath.setAttribute("class", "fa-secondary");
        secondaryPath.setAttribute("d", "M0 256C0 114.9 114.1 .5 255.1 0C237.9 .5 224 14.6 224 32c0 17.7 14.3 32 32 32C150 64 64 150 64 256s86 192 192 192c69.7 0 130.7-37.1 164.5-92.6c-3 6.6-3.3 14.8-1 22.2c1.2 3.7 3 7.2 5.4 10.3c1.2 1.5 2.6 3 4.1 4.3c.8 .7 1.6 1.3 2.4 1.9c.4 .3 .8 .6 1.3 .9s.9 .6 1.3 .8c5 2.9 10.6 4.3 16 4.3c11 0 21.8-5.7 27.7-16c-44.3 76.5-127 128-221.7 128C114.6 512 0 397.4 0 256z");
        loadingSvg.appendChild(secondaryPath);

        const primaryPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        primaryPath.setAttribute("class", "fa-primary");
        primaryPath.setAttribute("d", "M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z");
        loadingSvg.appendChild(primaryPath);

        titleContainer.insertBefore(svgElement, titleContainer.firstChild);
        titleContainer.insertBefore(loadingSvg, svgElement.nextSibling);
        titleContainer.insertBefore(successSvg, loadingSvg.nextSibling);
        titleContainer.insertBefore(errorSvg, successSvg.nextSibling);

        function getYouTubeVideoID(url) {
            const urlParams = new URLSearchParams(new URL(url).search);
            return urlParams.get('v');
        }

        function makeRequest(videoId) {
            return new Promise((resolve, reject) => {
                GM.xmlHttpRequest({
                    method: "GET",
                    url: `https://exyezed.vercel.app/api/cobalt/audio/${videoId}`,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    onload: function(response) {
                        try {
                            const data = JSON.parse(response.responseText);
                            resolve(data);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    onerror: function(error) {
                        reject(error);
                    }
                });
            });
        }

        async function cobaltRequest(videoUrl) {
            const videoId = getYouTubeVideoID(videoUrl);

            if (!videoId) {
                showError();
                return;
            }

            try {
                svgElement.style.display = "none";
                loadingSvg.style.display = "block";
                loadingSvg.style.animation = "spin 1s linear infinite";
                
                const data = await makeRequest(videoId);
                
                loadingSvg.style.display = "none";
                loadingSvg.style.animation = "";
                
                if (data.url) {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = data.url;
                    downloadLink.download = titleElement.textContent;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    
                    successSvg.style.display = "block";
                    setTimeout(() => {
                        successSvg.style.display = "none";
                        svgElement.style.display = "block";
                    }, 2000);
                } else {
                    showError();
                }
            } catch (error) {
                showError();
            }
        }

        function showError() {
            loadingSvg.style.display = "none";
            loadingSvg.style.animation = "";
            errorSvg.style.display = "block";
            setTimeout(() => {
                errorSvg.style.display = "none";
                svgElement.style.display = "block";
            }, 2000);
        }
        
        svgElement.addEventListener('click', () => {
            const currentVideoUrl = window.location.href;
            cobaltRequest(currentVideoUrl);
        });
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        svgElement.addEventListener('mouseenter', () => {
            if (loadingSvg.style.display !== "block" && 
                successSvg.style.display !== "block" && 
                errorSvg.style.display !== "block") {
                svgElement.style.fill = "#1ed760";
            }
        });
        
        svgElement.addEventListener('mouseleave', () => {
            if (loadingSvg.style.display !== "block" && 
                successSvg.style.display !== "block" && 
                errorSvg.style.display !== "block") {
                svgElement.style.fill = "white";
            }
        });
        
        titleContainer.style.display = 'flex';
        titleContainer.style.alignItems = 'center';
    }

    if (window.location.pathname === '/watch') {
        const checkExist = setInterval(function() {
            const titleContainer = document.querySelector('h1.style-scope.ytd-watch-metadata');
            if (titleContainer) {
                clearInterval(checkExist);
                addMusicIconToTitle();
            }
        }, 100);
    }

    const observer = new MutationObserver((mutations) => {
        if (window.location.pathname === '/watch') {
            addMusicIconToTitle();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
