<script>
    export let title = 'Home page';

    import rombertus from "$lib/assets/images/rombertus.gif";
    import r_icon from "$lib/assets/icons/r-icon.gif";

    import minimize from "$lib/assets/icons/minimize.svg";
    import maximize from "$lib/assets/icons/maximize.svg";
    import close from "$lib/assets/icons/close.svg";
</script>

<style>
    :root {
        --white:#F5F5F5;
        --white-select: #E0E0E0;
        --black: #111111;

        --taskbar-height: 2.5em;
    }

    .main {
		cursor: url($lib/assets/images/flamesword.png), auto !important;
        background-image: url($lib/assets/images/background.gif);
        
        height: 100%;
        width: 100%;
    }

    .content {
        height: calc(100% - var(--taskbar-height));
        width: min(1280px, 98vw);
        gap: max(8px, 1vh);
        margin: 0 auto;
        padding: 8px 0;

        display: flex;
        flex-direction: column;
    }

    /* header */

    .header {
        display: flex;
        justify-content: center;
    }

    .header img {
        max-width: min(90%, 600px);
    }

    /* window */

    .window {
        width: 100%;
        height: 90%;
        padding: 2px;

        background-color: var(--white);
        font-family: ms gothic, courier;
        font-size: medium;
    }

    .title-bar {
        font-weight: bold;
        color: var(--white);

        background: linear-gradient(90deg, rgb(4, 129, 0), var(--black));
        height: 26px;

        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-bar-text {
        padding-left: 8px;
        padding-top: 2px;
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

    .window-body {
        padding: 8px;
        overflow: auto;
    }

    /* Taskbar */

    .taskbar {
        height: var(--taskbar-height);
        width: 100%;

        background-color: var(--black);

        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .taskbar img {
        padding-left: 8px;
        height: 85%;
    }
</style>

<svelte:head>
    <link rel="icon" type="image/gif" href="{r_icon}" />
    <title>Rombertus | {title}</title>
</svelte:head>

<div class="main">
    <div class="content">
    <div class="header">
        <div class="header">
            <img src="{rombertus}" alt="Rombertus" />
        </div>
    </div>
    <div class="window">
        <div class="title-bar">
            <div class="title-bar-text">
                {title}
            </div>
            <div class="title-bar-controls">
                <button class="Minimize">
                    <img src="{minimize}" alt="Minimize" />
                </button>
                <button class="Maximize">
                    <img src="{maximize}" alt="Minimize" />
                </button>
                <button class="Close">
                    <img src="{close}" alt="Minimize" />
                </button>
            </div>
        </div>
        <div class="window-body">
            <slot></slot>
        </div>
    </div>
    </div>

    <div class="taskbar">
        <img src="{r_icon}" alt="R icon">

    </div>
</div>

