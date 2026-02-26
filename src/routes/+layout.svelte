<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { MetaTags } from 'svelte-meta-tags';

	let { children } = $props();
	const title = 'Toyota Visualization';
	const desc = 'Fun and interactive Visualization for multiple grading score';
	const og = 'https://krist7599555.github.io/toyota-visualize/screenshot.jpg';
	const url = 'https://krist7599555.github.io/toyota-visualize';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<MetaTags
	{title}
	titleTemplate="%s | {title}"
	description={desc}
	openGraph={{
		url: url,
		title,
		description: desc,
		images: [{ url: og, width: 2642, height: 1748, alt: title }],
		siteName: title
	}}
	twitter={{
		site: '@site',
		cardType: 'summary_large_image',
		title: title,
		description: desc,
		image: og,
		imageAlt: title
	}}
/>
{@render children()}
