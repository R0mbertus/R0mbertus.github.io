<script>
    import {onMount} from "svelte";

    export let title = '';

    import rombertus from "$lib/assets/images/rombertus.gif";
    import r_icon from "$lib/assets/icons/r-icon.gif";

    import close from "$lib/assets/icons/close.svg";


    onMount(() => {
        const url = new URL(window.location.href);
        const buttons = document.getElementsByClassName('nav-button');

        console.log(buttons)

        for (const button of buttons) {
            console.log(button)
            if (button.parentElement?.getAttribute("href") === url.pathname) {
                button.style.borderStyle = "inset"
                button.style.backgroundColor = "var(--white-select)"
            }
        }
    });
</script>

<style>
    :root {
        --white:#F5F5F5;
        --white-select: #E0E0E0;
        --black: #111111;
        --light-gray: #D3D3D3;
        --gray: #5c5c5c;

        --header-height: 5em;
        --title-height: 26px;
    }

    .main {
		cursor: url($lib/assets/images/flamesword.png), auto !important;
        background-image: url($lib/assets/images/background.gif);
        
        height: 100%;
        width: 100%;

        display: flex;
        flex-direction: column;
    }

    .content {
        height: 100%;
        width: min(1280px, 98vw);
        gap: max(8px, 1vh);
        margin: 0 auto;
        padding-top: 8px;

        display: flex;
        flex-direction: column;
    }

    /* header */

    .header {
        display: flex;
        justify-content: center;
        align-items: center;

        height: var(--header-height);
    }

    .header > img {
        height: 96%;
    }

    /* window */

    .windows {  
        height: calc(100% - var(--header-height) - 1em);
        padding-bottom: 8px;
        gap: 8px;
        display: flex;

        width: 100%;
    }

    .window {
        height: 100%;
        padding: 2px;

        background-color: var(--white);
        font-family: ms gothic, courier;
        font-size: medium;
        overflow: hidden;
    }

    #content-window {
        order: 2;
        width: 75%;
    }

    #nav-window {
        order: 1;
        width: 25%;
    }

    .window-body {
        height: calc(100% - 26px);
        padding: 8px;
        overflow-y: scroll;
    }

    #nav-window .window-body {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    #nav-window .buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    #nav-window .nav-button {
        width: 100%;
        height: 32px;

        background-color: var(--white);

        display: flex;
        align-items: center;
        justify-content: center;
    }

    #nav-window .nav-button:hover {
        background-color: var(--white-select);
    }

    .title-bar {
        font-weight: bold;
        color: var(--white);

        background: linear-gradient(90deg, rgb(4, 129, 0), var(--black));
        height: var(--title-height);

        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-bar-text {
        padding-left: 8px;
        padding-top: 5px;
        font-size: 24px;
    }

    .title-bar-controls {
        display: flex;
        gap: 2px;
        padding-right: 4px;
    }

    .title-bar-controls button {
        vertical-align: middle;
        background-color: var(--white);
        color: var(--black);

        width: 32px;
        height: 20px;
    }

    .title-bar-controls button:hover {
        background-color: var(--white-select);
    }

    .title-bar-controls button img {
        width: 16px;
        height: 16px;
    }

    @media (max-width: 820px) {
        .windows {
            flex-direction: column;
            height: max(fit-content, 100%);
        }

        /* TODO: fix nav window height */

        .window {
            width: 100% !important;
        }
    }
</style>

<svelte:head>
    <link rel="icon" type="image/gif" href="{r_icon}" />
    <title>Rombertus | {title}</title>
</svelte:head>

<div class="main">
    <div class="content">
    <div class="header">
        <img src="{rombertus}" alt="Rombertus" />
    </div>
    <div class="windows">
        <div class="window" id="content-window">
            <div class="title-bar">
                <div class="title-bar-text">
                    {title}
                </div>
                <div class="title-bar-controls">
                    <button class="Close">
                        <img src="{close}" alt="Minimize" />
                    </button>
                </div>
            </div>
            <div class="window-body">
                <slot></slot>
            </div>
        </div>
        <div class="window" id="nav-window">
            <div class="title-bar">
                <div class="title-bar-text">
                    Navigation
                </div>
                <div class="title-bar-controls">
                    <button class="Close">
                        <img src="{close}" alt="Minimize" />
                    </button>
                </div>
            </div>
            <div class="window-body">
                <div class="buttons">
                    <a href="/"><button class="nav-button">Home</button></a>
                    <a href="/about"><button class="nav-button">About</button></a>
                </div>
                <div class="banners"></div>
            </div>
        </div>
    </div>
    </div>
</div>

