<script lang="ts">
    let userText: string;
</script>

<h1>User input example</h1>

<label>
    Enter your text here:
    <input type="text" bind:value={userText} />
</label>

<p>{userText || ""}</p>
