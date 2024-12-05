// ==UserScript==
// @name         Cobalt Tools (SoundCloud Direct Downloader)
// @description  Integrate a download button for SoundCloud tracks and open original cover art.
// @icon         https://raw.githubusercontent.com/exyezed/cobalt-tools/refs/heads/main/extras/cobalt-tools.png
// @version      1.3
// @author       exyezed
// @namespace    https://github.com/exyezed/cobalt-tools/
// @supportURL   https://github.com/exyezed/cobalt-tools/issues
// @license      MIT
// @match        https://soundcloud.com/*
// @grant        GM.xmlHttpRequest
// @connect      exyezed.vercel.app
// @require      https://cdn.jsdelivr.net/npm/browser-id3-writer@4.4.0/dist/browser-id3-writer.min.js
// ==/UserScript==

(function() {
    'use strict';

    function isDiscoverPage() {
        return window.location.pathname === '/discover';
    }

    function isSetUrl(url) {
        return /\/[^\/]+\/sets\//.test(url);
    }

    function isSetUrlForListenArtwork(url) {
        return /\/sets\//.test(url) && !url.includes('?in=');
    }

    function createSvgElement(color, size = 16) {
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("viewBox", "0 0 448 512");
        svgElement.setAttribute("width", size.toString());
        svgElement.setAttribute("height", size.toString());
        svgElement.style.transition = "0.2s";
        svgElement.style.fill = color;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M378.1 198.6L249.5 341.4c-6.1 6.7-14.7 10.6-23.8 10.6l-3.5 0c-9.1 0-17.7-3.8-23.8-10.6L69.9 198.6c-3.8-4.2-5.9-9.8-5.9-15.5C64 170.4 74.4 160 87.1 160l72.9 0 0-128c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 128 72.9 0c12.8 0 23.1 10.4 23.1 23.1c0 5.7-2.1 11.2-5.9 15.5zM64 352l0 64c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 64c0 53-43 96-96 96L96 512c-53 0-96-43-96-96l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32z");
        svgElement.appendChild(path);

        return svgElement;
    }

    function addDownloadIcon() {
        if (isDiscoverPage()) return;

        const volumeControl = document.querySelector('.playControls__volume');
        if (!volumeControl || document.querySelector('.playControls__cobalt')) return;

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'playControls__cobalt playControls__control';
        iconWrapper.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            cursor: pointer;
        `;

        const svgElement = createSvgElement("#333", 16);
        iconWrapper.appendChild(svgElement);
        volumeControl.parentNode.insertBefore(iconWrapper, volumeControl.nextSibling);

        iconWrapper.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDownload(svgElement);
        });

        iconWrapper.addEventListener('mouseenter', () => {
            svgElement.style.fill = "#f50";
        });

        iconWrapper.addEventListener('mouseleave', () => {
            svgElement.style.fill = "#333";
        });
    }

    function addDownloadIconToTiles() {
        if (isDiscoverPage()) return;

        const tiles = document.querySelectorAll('.playableTile__artwork');
        tiles.forEach(tile => {
            if (!tile.querySelector('.playableTile__cobalt')) {
                const artworkLink = tile.querySelector('.playableTile__artworkLink');
                if (artworkLink) {
                    const href = artworkLink.getAttribute('href');
                    if (isSetUrl(href)) return;

                    const iconWrapper = document.createElement('div');
                    iconWrapper.className = 'playableTile__cobalt';
                    iconWrapper.style.cssText = `
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 3;
                        cursor: pointer;
                        padding: 4px;
                        background-color: rgba(0, 0, 0, 0.9);
                        border-radius: 4px;
                    `;

                    const svgElement = createSvgElement("#ffffff", 14);
                    iconWrapper.appendChild(svgElement);
                    tile.appendChild(iconWrapper);

                    iconWrapper.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const artworkLink = tile.querySelector('.playableTile__artworkLink');
                        if (artworkLink) {
                            const href = artworkLink.getAttribute('href');
                            const trackUrl = href.startsWith('http') ? href : `https://soundcloud.com${href}`;
                            handleDownload(svgElement, trackUrl);
                        }
                    });

                    iconWrapper.addEventListener('mouseenter', () => {
                        svgElement.style.fill = "#f50";
                    });

                    iconWrapper.addEventListener('mouseleave', () => {
                        svgElement.style.fill = "#ffffff";
                    });
                }
            }
        });
    }

    function addDownloadIconToSoundCoverArt() {
        if (isDiscoverPage()) return;

        const coverArts = document.querySelectorAll('.sound__coverArt');
        coverArts.forEach(coverArt => {
            if (!coverArt.querySelector('.sound__coverArt__cobalt')) {
                const href = coverArt.getAttribute('href');
                if (isSetUrl(href)) return;

                const iconWrapper = document.createElement('div');
                iconWrapper.className = 'sound__coverArt__cobalt';
                iconWrapper.style.cssText = `
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    z-index: 3;
                    cursor: pointer;
                    padding: 4px;
                    background-color: rgba(0, 0, 0, 0.9);
                    border-radius: 4px;
                `;

                const svgElement = createSvgElement("#ffffff", 14);
                iconWrapper.appendChild(svgElement);
                coverArt.appendChild(iconWrapper);

                iconWrapper.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const href = coverArt.getAttribute('href');
                    const trackUrl = href.startsWith('http') ? href : `https://soundcloud.com${href}`;
                    handleDownload(svgElement, trackUrl);
                });

                iconWrapper.addEventListener('mouseenter', () => {
                    svgElement.style.fill = "#f50";
                });

                iconWrapper.addEventListener('mouseleave', () => {
                    svgElement.style.fill = "#ffffff";
                });
            }
        });
    }

    function addDownloadIconToListenArtwork() {
        if (isDiscoverPage()) return;
    
        const artworkWrapper = document.querySelector('.listenArtworkWrapper__artwork');
        if (!artworkWrapper) return;
    
        const isSetUrl = isSetUrlForListenArtwork(window.location.href);
        const hasDownloadButton = !isSetUrl;
    
        addOriginalArtButton(artworkWrapper, hasDownloadButton);
    
        if (hasDownloadButton && !artworkWrapper.querySelector('.listenArtworkWrapper__cobalt')) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'listenArtworkWrapper__cobalt';
            iconWrapper.style.cssText = `
                position: absolute;
                top: 12px;
                right: 12px;
                z-index: 3;
                cursor: pointer;
                padding: 6px;
                background-color: rgba(0, 0, 0, 0.9);
                border-radius: 4px;
            `;
    
            const svgElement = createSvgElement("#ffffff", 18);
            iconWrapper.appendChild(svgElement);
            artworkWrapper.appendChild(iconWrapper);
    
            iconWrapper.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadURL(svgElement);
            });
    
            iconWrapper.addEventListener('mouseenter', () => {
                svgElement.style.fill = "#f50";
            });
    
            iconWrapper.addEventListener('mouseleave', () => {
                svgElement.style.fill = "#ffffff";
            });
        }
    }

    function addOriginalArtButton(artworkWrapper, hasDownloadButton) {
        if (artworkWrapper.querySelector('.listenArtworkWrapper__originalCoverArt')) return;
    
        const originalArtWrapper = document.createElement('div');
        originalArtWrapper.className = 'listenArtworkWrapper__originalCoverArt';
        originalArtWrapper.style.cssText = `
            position: absolute;
            top: 12px;
            right: ${hasDownloadButton ? '54px' : '12px'};
            z-index: 4;
            cursor: pointer;
            padding: 6px;
            background-color: rgba(0, 0, 0, 0.9);
            border-radius: 4px;
        `;
    
        const originalArtSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        originalArtSvg.setAttribute("viewBox", "0 0 512 512");
        originalArtSvg.setAttribute("width", "18");
        originalArtSvg.setAttribute("height", "18");
        originalArtSvg.style.fill = "#ffffff";
    
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z");
        originalArtSvg.appendChild(path);
    
        originalArtWrapper.appendChild(originalArtSvg);
        artworkWrapper.appendChild(originalArtWrapper);
    
        originalArtWrapper.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openOriginalCoverArt();
        });
    
        originalArtWrapper.addEventListener('mouseenter', () => {
            originalArtSvg.style.fill = "#f50";
        });
    
        originalArtWrapper.addEventListener('mouseleave', () => {
            originalArtSvg.style.fill = "#ffffff";
        });
    }

    function formatDateForID3(dateString) {
        const date = new Date(dateString);
        return {
            year: date.getFullYear(),
            date: `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}`
        };
    }

    async function handleDownload(svgElement, trackUrl) {
        let fullUrl;
    
        if (trackUrl) {
            fullUrl = trackUrl;
        } else {
            const trackLink = document.querySelector('a.playbackSoundBadge__titleLink');
            if (!trackLink) {
                showError(svgElement);
                return;
            }
            const href = trackLink.getAttribute('href');
            fullUrl = href.startsWith('http') ? href : `https://soundcloud.com${href}`;
        }
    
        showLoading(svgElement);
    
        try {
            const [audioResponse, metadataResponse] = await Promise.all([
                new Promise((resolve, reject) => {
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: `https://exyezed.vercel.app/api/cobalt/soundcloud/${encodeURIComponent(fullUrl)}`,
                        onload: resolve,
                        onerror: reject
                    });
                }),
                new Promise((resolve, reject) => {
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: `https://exyezed.vercel.app/api/cobalt/soundcloud/metadata/${encodeURIComponent(fullUrl)}`,
                        onload: resolve,
                        onerror: reject
                    });
                })
            ]);
    
            const audioData = JSON.parse(audioResponse.responseText);
            const metadata = JSON.parse(metadataResponse.responseText);
    
            if (!audioData.url) {
                throw new Error('Download URL not found in the response');
            }
    
            const audioBlob = await fetch(audioData.url).then(r => r.blob());
            const arrayBuffer = await new Response(audioBlob).arrayBuffer();
            const writer = new ID3Writer(arrayBuffer);
            writer.removeTag();
    
            if (metadata.pubdate) {
                const { year, date } = formatDateForID3(metadata.pubdate);
                writer
                    .setFrame('TYER', year.toString())
                    .setFrame('TDAT', date);
            }
    
            writer
                .setFrame('TIT2', metadata.title)
                .setFrame('TPE1', [metadata.artist]);
    
            if (metadata.cover) {
                const coverResponse = await fetch(metadata.cover);
                const coverArrayBuffer = await coverResponse.arrayBuffer();
                writer.setFrame('APIC', {
                    type: 3,
                    data: coverArrayBuffer,
                    description: 'Cover'
                });
            }
    
            writer.addTag();
            const taggedArrayBuffer = writer.arrayBuffer;
            const finalBlob = new Blob([taggedArrayBuffer], { type: 'audio/mpeg' });
    
            showSuccess(svgElement);
            setTimeout(() => {
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(finalBlob);
                let fileName = metadata.title && metadata.artist ? 
                    `${metadata.title} - ${metadata.artist}` : 
                    metadata.title || audioData.title || 'soundcloud_track';
                fileName = fileName.replace(/[<>:"/\\|?*]/g, '-');
                if (!fileName.toLowerCase().endsWith('.mp3')) {
                    fileName += '.mp3';
                }
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(downloadLink.href);
            }, 1000);
    
        } catch (error) {
            showError(svgElement);
        }
    }
    
    async function handleDownloadURL(svgElement) {
        const currentURL = window.location.href;
        showLoading(svgElement);
    
        try {
            const [audioResponse, metadataResponse] = await Promise.all([
                new Promise((resolve, reject) => {
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: `https://exyezed.vercel.app/api/cobalt/soundcloud/${encodeURIComponent(currentURL)}`,
                        onload: resolve,
                        onerror: reject
                    });
                }),
                new Promise((resolve, reject) => {
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: `https://exyezed.vercel.app/api/cobalt/soundcloud/metadata/${encodeURIComponent(currentURL)}`,
                        onload: resolve,
                        onerror: reject
                    });
                })
            ]);
    
            const audioData = JSON.parse(audioResponse.responseText);
            const metadata = JSON.parse(metadataResponse.responseText);
    
            if (!audioData.url) {
                throw new Error('Download URL not found in the response');
            }
    
            const audioBlob = await fetch(audioData.url).then(r => r.blob());
            const arrayBuffer = await new Response(audioBlob).arrayBuffer();
            const writer = new ID3Writer(arrayBuffer);
            writer.removeTag();
    
            if (metadata.pubdate) {
                const { year, date } = formatDateForID3(metadata.pubdate);
                writer
                    .setFrame('TYER', year.toString())
                    .setFrame('TDAT', date);
            }
    
            writer
                .setFrame('TIT2', metadata.title)
                .setFrame('TPE1', [metadata.artist]);
    
            if (metadata.cover) {
                const coverResponse = await fetch(metadata.cover);
                const coverArrayBuffer = await coverResponse.arrayBuffer();
                writer.setFrame('APIC', {
                    type: 3,
                    data: coverArrayBuffer,
                    description: 'Cover'
                });
            }
    
            writer.addTag();
            const taggedArrayBuffer = writer.arrayBuffer;
            const finalBlob = new Blob([taggedArrayBuffer], { type: 'audio/mpeg' });
    
            showSuccess(svgElement);
            setTimeout(() => {
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(finalBlob);
                let fileName = metadata.title && metadata.artist ? 
                    `${metadata.title} - ${metadata.artist}` : 
                    metadata.title || audioData.title || 'soundcloud_track';
                fileName = fileName.replace(/[<>:"/\\|?*]/g, '-');
                if (!fileName.toLowerCase().endsWith('.mp3')) {
                    fileName += '.mp3';
                }
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(downloadLink.href);
            }, 1000);
    
        } catch (error) {
            showError(svgElement);
        }
    }

    function openOriginalCoverArt() {
        const selectors = [
            '.fullHero__artwork .image__full',
            '.listenArtworkWrapper__artwork .image__full',
            '.listenArtworkWrapper__artwork .sc-artwork'
        ];

        let artworkElement = null;
        for (const selector of selectors) {
            artworkElement = document.querySelector(selector);
            if (artworkElement) break;
        }

        if (artworkElement) {
            console.log('Artwork element found:', artworkElement);

            let backgroundImage = window.getComputedStyle(artworkElement).backgroundImage;
            
            if (!backgroundImage || backgroundImage === 'none') {
                backgroundImage = artworkElement.getAttribute('src');
                console.log('Using src attribute:', backgroundImage);
            } else {
                console.log('Using background-image:', backgroundImage);
            }

            let originalUrl = extractAndCleanUrl(backgroundImage);

            if (originalUrl) {
                console.log('Opening URL:', originalUrl);
                window.open(originalUrl, '_blank');
            } else {
                console.error('Could not extract cover art URL from:', backgroundImage);
            }
        } else {
            console.error('Could not find artwork element. Tried selectors:', selectors);
        }
    }

    function extractAndCleanUrl(input) {
        const urlMatch = input.match(/https?:\/\/[^"']*?sndcdn\.com\/[^"')]+/);
        
        if (urlMatch) {
            let url = urlMatch[0];
            
            url = url.split('?')[0];
            
            url = url.replace(/-t\d+x\d+/, '-original');
            
            if (!/\.(jpg|jpeg|png|gif)$/i.test(url)) {
                url += '.jpg';
            }
            
            return url;
        }
        
        return null;
    }

    function showLoading(svgElement) {
        while (svgElement.firstChild) {
            svgElement.removeChild(svgElement.firstChild);
        }
        svgElement.setAttribute("viewBox", "0 0 512 512");
        const originalColor = svgElement.style.fill;
        svgElement.style.fill = originalColor === "#ffffff" ? "#ffffff" : "#f50";

        const secondaryPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        secondaryPath.setAttribute("d", "M0 256C0 114.9 114.1 .5 255.1 0C237.9 .5 224 14.6 224 32c0 17.7 14.3 32 32 32C150 64 64 150 64 256s86 192 192 192c69.7 0 130.7-37.1 164.5-92.6c-3 6.6-3.3 14.8-1 22.2c1.2 3.7 3 7.2 5.4 10.3c1.2 1.5 2.6 3 4.1 4.3c.8 .7 1.6 1.3 2.4 1.9c.4 .3 .8 .6 1.3 .9s.9 .6 1.3 .8c5 2.9 10.6 4.3 16 4.3c11 0 21.8-5.7 27.7-16c-44.3 76.5-127 128-221.7 128C114.6 512 0 397.4 0 256z");
        secondaryPath.style.opacity = "0.4";
        svgElement.appendChild(secondaryPath);

        const primaryPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        primaryPath.setAttribute("d", "M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z");
        svgElement.appendChild(primaryPath);

        svgElement.style.animation = 'spin 1s linear infinite';
    }

    function showSuccess(svgElement) {
        while (svgElement.firstChild) {
            svgElement.removeChild(svgElement.firstChild);
        }
        svgElement.style.animation = '';
        const originalColor = svgElement.style.fill;
        svgElement.style.fill = originalColor === "#ffffff" ? "#ffffff" : "#f50";
        svgElement.setAttribute("viewBox", "0 0 512 512");
        const successPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        successPath.setAttribute("d", "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z");
        svgElement.appendChild(successPath);
        setTimeout(() => resetIcon(svgElement), 2000);
    }

    function showError(svgElement) {
        while (svgElement.firstChild) {
            svgElement.removeChild(svgElement.firstChild);
        }
        svgElement.style.animation = '';
        const originalColor = svgElement.style.fill;
        svgElement.style.fill = originalColor === "#ffffff" ? "#ffffff" : "#333";
        svgElement.setAttribute("viewBox", "0 0 512 512");
        const errorPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        errorPath.setAttribute("d", "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z");
        svgElement.appendChild(errorPath);
        setTimeout(() => resetIcon(svgElement), 2000);
    }

    function resetIcon(svgElement) {
        while (svgElement.firstChild) {
            svgElement.removeChild(svgElement.firstChild);
        }
        const originalColor = svgElement.getAttribute('data-original-color') || "#333";
        svgElement.style.fill = originalColor;
        svgElement.setAttribute("viewBox", "0 0 448 512");
        svgElement.style.animation = '';
        const originalPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        originalPath.setAttribute("d", "M378.1 198.6L249.5 341.4c-6.1 6.7-14.7 10.6-23.8 10.6l-3.5 0c-9.1 0-17.7-3.8-23.8-10.6L69.9 198.6c-3.8-4.2-5.9-9.8-5.9-15.5C64 170.4 74.4 160 87.1 160l72.9 0 0-128c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 128 72.9 0c12.8 0 23.1 10.4 23.1 23.1c0 5.7-2.1 11.2-5.9 15.5zM64 352l0 64c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 64c0 53-43 96-96 96L96 512c-53 0-96-43-96-96l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32z");
        svgElement.appendChild(originalPath);
    }

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .sc-classic .playControls__control, .sc-classic  .playControls__control:not(:first-child) {
            margin-right: 12px;
        }
        .playableTile__cobalt, .listenArtworkWrapper__cobalt, .listenArtworkWrapper__originalCoverArt {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .playableTile__cobalt:hover, .listenArtworkWrapper__cobalt:hover, .listenArtworkWrapper__originalCoverArt:hover {
            background-color: rgba(0, 0, 0, 0.9);
        }
        .playableTile__cobalt:hover svg, .listenArtworkWrapper__cobalt:hover svg, .listenArtworkWrapper__originalCoverArt:hover svg {
            fill: #f50 !important;
        }
        .playableTile__cobalt svg, .listenArtworkWrapper__cobalt svg, .listenArtworkWrapper__originalCoverArt svg {
            fill: #ffffff !important;
        }
        .playControls__cobalt svg {
            width: 16px;
            height: 16px;
        }
        .playableTile__cobalt svg {
            width: 14px;
            height: 14px;
        }
        .listenArtworkWrapper__cobalt svg, .listenArtworkWrapper__originalCoverArt svg {
            width: 18px;
            height: 18px;
        }
        .sound__coverArt__cobalt {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .sound__coverArt__cobalt:hover {
            background-color: rgba(0, 0, 0, 0.9);
        }
        .sound__coverArt__cobalt:hover svg {
            fill: #f50 !important;
        }
        .sound__coverArt__cobalt svg {
            fill: #ffffff !important;
            width: 14px;
            height: 14px;
        }
    `;
    document.head.appendChild(styleSheet);

    if (!isDiscoverPage()) {
        addDownloadIcon();
        addDownloadIconToTiles();
        addDownloadIconToSoundCoverArt();
        addDownloadIconToListenArtwork();
    }

    const observer = new MutationObserver((mutations) => {
        if (!isDiscoverPage()) {
            for (let mutation of mutations) {
                if (mutation.type === 'childList') {
                    addDownloadIcon();
                    addDownloadIconToTiles();
                    addDownloadIconToSoundCoverArt();
                    addDownloadIconToListenArtwork();
                }
            }
        }
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
            if (isDiscoverPage()) {
                document.querySelectorAll('.playableTile__cobalt, .playControls__cobalt, .sound__coverArt__cobalt, .listenArtworkWrapper__cobalt').forEach(el => el.remove());
            } else {
                addDownloadIcon();
                addDownloadIconToTiles();
                addDownloadIconToSoundCoverArt();
                addDownloadIconToListenArtwork();
            }
        }
    }).observe(document, {subtree: true, childList: true});

    console.log('Cobalt Tools (SoundCloud Direct Downloader) is running');
})();
