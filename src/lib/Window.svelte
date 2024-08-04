<script>
    export let title = 'Home page';

    import rombertus from "$lib/assets/images/rombertus.gif";
    import r_icon from "$lib/assets/icons/r-icon.gif";

    import minimize from "$lib/assets/icons/minimize.svg";
    import maximize from "$lib/assets/icons/maximize.svg";
    import close from "$lib/assets/icons/close.svg";
    import home from "$lib/assets/icons/home.svg";

    import Clock from "$lib/Clock.svelte";
</script>

<style>
    :root {
        --white:#F5F5F5;
        --white-select: #E0E0E0;
        --black: #111111;
        --gray: #5c5c5c;

        --taskbar-height: 2.5em;
        --header-height: 5em;
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
        box-sizing: padding-box;
        -moz-box-sizing: padding-box;
        -webkit-box-sizing: padding-box;

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
        align-items: center;

        height: var(--header-height);
    }

    .header > img {
        height: 96%;
    }

    /* window */

    .window {
        width: 100%;
        height: calc(100% - var(--header-height));
        padding: 2px;

        background-color: var(--white);
        font-family: ms gothic, courier;
        font-size: medium;
        overflow: hidden;
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
        height: calc(100% - 26px);
        padding: 8px;
        overflow-y: scroll;
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

    .left-icons, .right-icons {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 0 10px;
    }

    .left-icons > img {
        padding-left: 8px;
        height: 85%;
    }

    .divider {
        width: 1px;
        height: 80%;
        background-color: var(--gray);
    }

    .windows {
        height: 100%;
        width: 100%;
        gap: 8px;

        display: flex;
        align-items: center;

    }

    .windows > button {
        width: 12%;
        height: 85%;

        background-color: var(--black);
        color: var(--white);

        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 4px;
    }

    .windows > button:hover {
        background-color: var(--white);
        color: var(--black);
    }

    .windows > button:active {
        background-color: #000000;
        color: var(--white);
    }

    .windows > button > img {
        height: 80%;
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
        <div class="left-icons">
            <img src="{r_icon}" alt="R icon">
            <div class="divider"></div>
        </div>
        
        <div class="windows">
            <button>
                <img src="{home}" alt="R icon">
                <p>Home Page</p>
                <div></div>
            </button>
            <button></button>
        </div>

        <div class="right-icons">
            <div class="divider"></div>
            <Clock />
        </div>
    </div>
</div>

