// ==UserScript==
// @name         Cobalt Tools (YouTube Playlist Downloader)
// @description  Adds a cobalt.tools button to YouTube playlists, redirecting users to a playlist download page.
// @icon         https://raw.githubusercontent.com/exyezed/cobalt-tools/refs/heads/main/extras/cobalt-tools.png
// @version      1.0
// @author       exyezed
// @namespace    https://github.com/exyezed/cobalt-tools/
// @supportURL   https://github.com/exyezed/cobalt-tools/issues
// @license      MIT
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    function createSVGElement(tag, attrs) {
        const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [key, value] of Object.entries(attrs)) {
            elem.setAttribute(key, value);
        }
        return elem;
    }

    function getPlaylistId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('list');
    }

    function createCobaltPlaylistBtn() {
        var existingButton = document.getElementById("cobaltPlaylistBtn");
        if (existingButton) {
            return existingButton;
        }

        var button = document.createElement("span");
        button.id = "cobaltPlaylistBtn";
        button.setAttribute("aria-label", "Cobalt Playlist");
        
        var svg = createSVGElement('svg', {
            width: '16',
            height: '12',
            viewBox: '0 0 24 16',
            fill: 'currentColor'
        });

        var path1 = createSVGElement('path', {
            d: 'M0 15.6363L0 12.8594L9.47552 8.293L0 3.14038L0 0.363525L12.8575 7.4908V9.21862L0 15.6363Z'
        });

        var path2 = createSVGElement('path', {
            d: 'M11.1425 15.6363V12.8594L20.6181 8.293L11.1425 3.14038V0.363525L24 7.4908V9.21862L11.1425 15.6363Z'
        });

        svg.appendChild(path1);
        svg.appendChild(path2);
        button.appendChild(svg);
        
        button.style.cssText = `
            cursor: pointer;
            width: 40px;
            height: 40px;
            background-color: transparent;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            padding: 0;
            position: relative;
            transition: background-color 0.1s; /* Updated transition */
            color: var(--yt-spec-text-primary);
        `;

        button.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });

        button.addEventListener('click', function() {
            const playlistId = getPlaylistId();
            if (playlistId) {
                window.open(`https://cobaltapis.vercel.app/playlist/${playlistId}`, '_blank');
            }
        });

        return button;
    }

    function insertButton() {
        var button = createCobaltPlaylistBtn();
        var targetElement = document.querySelector("#secondary #playlist-actions #start-actions #top-level-buttons-computed");
        
        if (targetElement && !targetElement.contains(button)) {
            targetElement.appendChild(button);
            console.log("Cobalt Playlist button successfully inserted.");
        } else if (!targetElement) {
            console.log("Target element not found. Retrying...");
            setTimeout(insertButton, 1000);
        }
    }

    function checkAndInsertButton() {
        var existingButton = document.getElementById("cobaltPlaylistBtn");
        var targetElement = document.querySelector("#secondary #playlist-actions #start-actions #top-level-buttons-computed");
        
        if (!existingButton || (targetElement && !targetElement.contains(existingButton))) {
            insertButton();
        }
    }

    window.addEventListener('load', checkAndInsertButton);

    const observer = new MutationObserver((mutations) => {
        checkAndInsertButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    let lastUrl = location.href; 
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(checkAndInsertButton, 1000);
        }
    }).observe(document, {subtree: true, childList: true});

    setInterval(checkAndInsertButton, 5000);
})();
