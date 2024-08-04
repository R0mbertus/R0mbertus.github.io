<script>
    import { onMount } from 'svelte';
    let time = '';

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        time = `${hours}:${minutes}:${seconds}`;
    }

    onMount(() => {
        updateClock(); // Initial call to display clock immediately
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    });
</script>

<style>
    .clock {
        font-size: 2em;
        font-family: monospace;
        color: var(--white);
    }
</style>

<div class="clock-container">
    <div class="clock">{time}</div>
</div>
